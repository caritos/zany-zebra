-- Migration: Fix ELO reversal to handle out-of-order deletions
-- Date: 2025-09-29
-- Description: Replaces simple reversal with full recalculation of subsequent matches

-- Drop the old trigger first
DROP TRIGGER IF EXISTS revert_elo_on_match_delete ON public.match_records;

-- Function to recalculate all ELO ratings for a club from scratch
CREATE OR REPLACE FUNCTION recalculate_club_elo_ratings(p_club_id BIGINT)
RETURNS VOID AS $$
DECLARE
  v_match RECORD;
  v_p1_rating INTEGER;
  v_p2_rating INTEGER;
  v_p1_matches INTEGER;
  v_p2_matches INTEGER;
  v_k_factor INTEGER;
  v_p1_expected NUMERIC;
  v_score_multiplier NUMERIC;
  v_p1_actual NUMERIC;
  v_p1_change INTEGER;
  v_p2_change INTEGER;
  v_scores_text TEXT;
BEGIN
  -- Reset all ratings for this club to initial values
  UPDATE public.user_ratings
  SET
    elo_rating = get_initial_rating(),
    matches_played = 0,
    matches_won = 0,
    matches_lost = 0,
    peak_rating = get_initial_rating(),
    last_match_at = NULL
  WHERE club_id = p_club_id;

  -- Process all matches in chronological order
  FOR v_match IN
    SELECT
      mr.*,
      string_agg(
        ms.team1_games::TEXT || '-' || ms.team2_games::TEXT,
        ','
        ORDER BY ms.set_number
      ) as scores_text
    FROM public.match_records mr
    LEFT JOIN public.match_sets ms ON ms.match_id = mr.id
    WHERE mr.club_id = p_club_id
      AND mr.match_type = 'singles'  -- Only process singles for now
    GROUP BY mr.id, mr.club_id, mr.match_type, mr.team1_player1_user_id,
             mr.team1_player1_guest_name, mr.team1_player2_user_id,
             mr.team1_player2_guest_name, mr.team2_player1_user_id,
             mr.team2_player1_guest_name, mr.team2_player2_user_id,
             mr.team2_player2_guest_name, mr.winner, mr.notes,
             mr.recorded_by, mr.match_date, mr.created_at, mr.elo_changes
    ORDER BY mr.match_date, mr.created_at
  LOOP
    v_scores_text := v_match.scores_text;

    -- Get current ratings for player 1
    IF v_match.team1_player1_user_id IS NOT NULL THEN
      SELECT elo_rating, matches_played
      INTO v_p1_rating, v_p1_matches
      FROM public.user_ratings
      WHERE user_id = v_match.team1_player1_user_id AND club_id = p_club_id;
    ELSE
      -- Guest player
      v_p1_rating := get_initial_rating();
      v_p1_matches := 0;
    END IF;

    -- Get current ratings for player 2
    IF v_match.team2_player1_user_id IS NOT NULL THEN
      SELECT elo_rating, matches_played
      INTO v_p2_rating, v_p2_matches
      FROM public.user_ratings
      WHERE user_id = v_match.team2_player1_user_id AND club_id = p_club_id;
    ELSE
      -- Guest player
      v_p2_rating := get_initial_rating();
      v_p2_matches := 0;
    END IF;

    -- Calculate ELO changes
    v_k_factor := get_k_factor(GREATEST(v_p1_matches, v_p2_matches));
    v_p1_expected := get_expected_score(v_p1_rating, v_p2_rating);
    v_score_multiplier := get_score_differential_multiplier(v_scores_text);
    v_p1_actual := CASE WHEN v_match.winner = 1 THEN 1.0 ELSE 0.0 END;

    v_p1_change := ROUND(v_k_factor * v_score_multiplier * (v_p1_actual - v_p1_expected))::INTEGER;
    v_p2_change := -v_p1_change;  -- Zero-sum game

    -- Update player 1 (if not guest)
    IF v_match.team1_player1_user_id IS NOT NULL THEN
      UPDATE public.user_ratings
      SET
        elo_rating = elo_rating + v_p1_change,
        matches_played = matches_played + 1,
        matches_won = matches_won + CASE WHEN v_match.winner = 1 THEN 1 ELSE 0 END,
        matches_lost = matches_lost + CASE WHEN v_match.winner = 2 THEN 1 ELSE 0 END,
        peak_rating = GREATEST(peak_rating, elo_rating + v_p1_change),
        last_match_at = v_match.created_at
      WHERE user_id = v_match.team1_player1_user_id AND club_id = p_club_id;
    END IF;

    -- Update player 2 (if not guest)
    IF v_match.team2_player1_user_id IS NOT NULL THEN
      UPDATE public.user_ratings
      SET
        elo_rating = elo_rating + v_p2_change,
        matches_played = matches_played + 1,
        matches_won = matches_won + CASE WHEN v_match.winner = 2 THEN 1 ELSE 0 END,
        matches_lost = matches_lost + CASE WHEN v_match.winner = 1 THEN 1 ELSE 0 END,
        peak_rating = GREATEST(peak_rating, elo_rating + v_p2_change),
        last_match_at = v_match.created_at
      WHERE user_id = v_match.team2_player1_user_id AND club_id = p_club_id;
    END IF;

    -- Update the match record with the new ELO changes
    UPDATE public.match_records
    SET elo_changes = jsonb_build_object(
      'type', 'singles',
      'player1_change', CASE WHEN v_match.team1_player1_user_id IS NOT NULL THEN v_p1_change ELSE 0 END,
      'player2_change', CASE WHEN v_match.team2_player1_user_id IS NOT NULL THEN v_p2_change ELSE 0 END,
      'player1_is_guest', v_match.team1_player1_user_id IS NULL,
      'player2_is_guest', v_match.team2_player1_user_id IS NULL,
      'player1_old_rating', v_p1_rating,
      'player2_old_rating', v_p2_rating,
      'player1_new_rating', v_p1_rating + v_p1_change,
      'player2_new_rating', v_p2_rating + v_p2_change
    )
    WHERE id = v_match.id;

  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- New trigger function that recalculates everything after a deletion
CREATE OR REPLACE FUNCTION recalculate_elo_after_delete()
RETURNS TRIGGER AS $$
BEGIN
  -- Recalculate all ELO ratings for the club
  PERFORM recalculate_club_elo_ratings(OLD.club_id);
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the new trigger
CREATE TRIGGER recalculate_elo_on_match_delete
  AFTER DELETE ON public.match_records
  FOR EACH ROW
  EXECUTE FUNCTION recalculate_elo_after_delete();

-- Also create a trigger for updates (in case match results are edited)
CREATE OR REPLACE FUNCTION recalculate_elo_after_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Only recalculate if important fields changed
  IF OLD.winner != NEW.winner OR
     OLD.team1_player1_user_id IS DISTINCT FROM NEW.team1_player1_user_id OR
     OLD.team2_player1_user_id IS DISTINCT FROM NEW.team2_player1_user_id OR
     OLD.match_date != NEW.match_date THEN
    PERFORM recalculate_club_elo_ratings(NEW.club_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER recalculate_elo_on_match_update
  AFTER UPDATE ON public.match_records
  FOR EACH ROW
  EXECUTE FUNCTION recalculate_elo_after_update();

-- Function to manually trigger recalculation (useful for debugging)
CREATE OR REPLACE FUNCTION manually_recalculate_club_elo(p_club_id BIGINT)
RETURNS TEXT AS $$
BEGIN
  -- Check permissions
  IF NOT EXISTS (
    SELECT 1 FROM public.club_users
    WHERE club_id = p_club_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'User not authorized for this club';
  END IF;

  PERFORM recalculate_club_elo_ratings(p_club_id);
  RETURN 'ELO ratings recalculated successfully for club ' || p_club_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION recalculate_club_elo_ratings(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION recalculate_elo_after_delete() TO authenticated;
GRANT EXECUTE ON FUNCTION recalculate_elo_after_update() TO authenticated;
GRANT EXECUTE ON FUNCTION manually_recalculate_club_elo(BIGINT) TO authenticated;

-- Add comments
COMMENT ON FUNCTION recalculate_club_elo_ratings(BIGINT) IS 'Recalculates all ELO ratings for a club from scratch based on match history';
COMMENT ON FUNCTION recalculate_elo_after_delete() IS 'Trigger function to recalculate ELO after match deletion';
COMMENT ON FUNCTION recalculate_elo_after_update() IS 'Trigger function to recalculate ELO after match update';
COMMENT ON FUNCTION manually_recalculate_club_elo(BIGINT) IS 'Manually trigger ELO recalculation for a club (for debugging/fixing)';