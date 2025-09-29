-- Migration: Add support for reverting ELO changes when matches are deleted
-- Date: 2025-09-29
-- Description: Adds elo_changes column to match_records and trigger to revert ELO on deletion

-- Add column to store ELO changes for each match
ALTER TABLE public.match_records
ADD COLUMN IF NOT EXISTS elo_changes JSONB DEFAULT '{}';

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_match_records_elo_changes ON public.match_records USING GIN (elo_changes);

-- Function to revert ELO changes when a match is deleted
CREATE OR REPLACE FUNCTION revert_match_elo()
RETURNS TRIGGER AS $$
DECLARE
  v_elo_changes JSONB;
BEGIN
  -- Get the ELO changes from the match record
  v_elo_changes := OLD.elo_changes;

  -- Only proceed if we have ELO changes to revert
  IF v_elo_changes IS NOT NULL AND v_elo_changes != '{}'::JSONB THEN

    -- For singles matches, revert player ratings
    IF OLD.match_type = 'singles' THEN
      -- Revert player 1's rating (if not a guest)
      IF OLD.team1_player1_user_id IS NOT NULL AND (v_elo_changes->>'player1_change') IS NOT NULL THEN
        UPDATE public.user_ratings
        SET
          elo_rating = elo_rating - (v_elo_changes->>'player1_change')::INTEGER,
          matches_played = GREATEST(0, matches_played - 1),
          matches_won = CASE
            WHEN OLD.winner = 1 THEN GREATEST(0, matches_won - 1)
            ELSE matches_won
          END,
          matches_lost = CASE
            WHEN OLD.winner = 2 THEN GREATEST(0, matches_lost - 1)
            ELSE matches_lost
          END
        WHERE user_id = OLD.team1_player1_user_id
          AND club_id = OLD.club_id;
      END IF;

      -- Revert player 2's rating (if not a guest)
      IF OLD.team2_player1_user_id IS NOT NULL AND (v_elo_changes->>'player2_change') IS NOT NULL THEN
        UPDATE public.user_ratings
        SET
          elo_rating = elo_rating - (v_elo_changes->>'player2_change')::INTEGER,
          matches_played = GREATEST(0, matches_played - 1),
          matches_won = CASE
            WHEN OLD.winner = 2 THEN GREATEST(0, matches_won - 1)
            ELSE matches_won
          END,
          matches_lost = CASE
            WHEN OLD.winner = 1 THEN GREATEST(0, matches_lost - 1)
            ELSE matches_lost
          END
        WHERE user_id = OLD.team2_player1_user_id
          AND club_id = OLD.club_id;
      END IF;
    END IF;

    -- For doubles matches (when implemented), add reversal logic here

  END IF;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically revert ELO when a match is deleted
DROP TRIGGER IF EXISTS revert_elo_on_match_delete ON public.match_records;
CREATE TRIGGER revert_elo_on_match_delete
  BEFORE DELETE ON public.match_records
  FOR EACH ROW
  EXECUTE FUNCTION revert_match_elo();

-- Update the record_match_with_elo function to store ELO changes
DROP FUNCTION IF EXISTS record_match_with_elo(bigint,text,uuid,text,uuid,text,uuid,text,uuid,text,integer,jsonb,text,date);

CREATE OR REPLACE FUNCTION record_match_with_elo(
  p_club_id BIGINT,
  p_match_type TEXT,
  p_team1_player1_user_id UUID,
  p_team1_player1_guest_name TEXT,
  p_team1_player2_user_id UUID,
  p_team1_player2_guest_name TEXT,
  p_team2_player1_user_id UUID,
  p_team2_player1_guest_name TEXT,
  p_team2_player2_user_id UUID,
  p_team2_player2_guest_name TEXT,
  p_winner INTEGER,
  p_sets JSONB,
  p_notes TEXT DEFAULT NULL,
  p_match_date DATE DEFAULT CURRENT_DATE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_match_id BIGINT;
  v_scores_text TEXT;
  v_rating_changes JSONB := '{}';
  v_rating_result RECORD;
  v_doubles_result RECORD;
BEGIN
  -- Validate user permissions
  IF NOT EXISTS (
    SELECT 1 FROM public.club_users
    WHERE club_id = p_club_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'User not authorized to record matches in this club';
  END IF;

  -- Start transaction
  BEGIN
    -- Convert sets to text for ELO calculation
    IF p_sets IS NOT NULL THEN
      SELECT string_agg(
        (set_info->>'team1_games') || '-' || (set_info->>'team2_games'),
        ','
        ORDER BY (set_info->>'set_number')::INTEGER
      )
      INTO v_scores_text
      FROM jsonb_array_elements(p_sets) AS set_info;
    END IF;

    -- ELO rating calculations for singles matches (including guest players)
    IF p_match_type = 'singles' THEN
      DECLARE
        v_p1_rating INTEGER;
        v_p1_matches INTEGER;
        v_p2_rating INTEGER;
        v_p2_matches INTEGER;
        v_k_factor INTEGER;
        v_p1_expected NUMERIC;
        v_score_multiplier NUMERIC;
        v_p1_actual NUMERIC;
        v_p1_new_rating INTEGER;
        v_p2_new_rating INTEGER;
        v_p1_change INTEGER;
        v_p2_change INTEGER;
      BEGIN

        -- Ensure registered players have ratings records, get ratings for all players
        IF p_team1_player1_user_id IS NOT NULL THEN
          INSERT INTO public.user_ratings (user_id, club_id, elo_rating)
          VALUES (p_team1_player1_user_id, p_club_id, get_initial_rating())
          ON CONFLICT (user_id, club_id) DO NOTHING;

          SELECT elo_rating, matches_played INTO v_p1_rating, v_p1_matches
          FROM public.user_ratings
          WHERE user_id = p_team1_player1_user_id AND club_id = p_club_id;
        ELSE
          -- Guest player: use default rating
          v_p1_rating := get_initial_rating();
          v_p1_matches := 0;
        END IF;

        IF p_team2_player1_user_id IS NOT NULL THEN
          INSERT INTO public.user_ratings (user_id, club_id, elo_rating)
          VALUES (p_team2_player1_user_id, p_club_id, get_initial_rating())
          ON CONFLICT (user_id, club_id) DO NOTHING;

          SELECT elo_rating, matches_played INTO v_p2_rating, v_p2_matches
          FROM public.user_ratings
          WHERE user_id = p_team2_player1_user_id AND club_id = p_club_id;
        ELSE
          -- Guest player: use default rating
          v_p2_rating := get_initial_rating();
          v_p2_matches := 0;
        END IF;

        -- Calculate ELO components
        v_k_factor := get_k_factor(GREATEST(v_p1_matches, v_p2_matches));
        v_p1_expected := get_expected_score(v_p1_rating, v_p2_rating);
        v_score_multiplier := get_score_differential_multiplier(v_scores_text);
        v_p1_actual := CASE WHEN p_winner = 1 THEN 1.0 ELSE 0.0 END;

        -- Calculate new ratings and changes
        v_p1_change := ROUND(v_k_factor * v_score_multiplier * (v_p1_actual - v_p1_expected))::INTEGER;
        v_p2_change := ROUND(v_k_factor * v_score_multiplier * ((1.0 - v_p1_actual) - (1.0 - v_p1_expected)))::INTEGER;
        v_p1_new_rating := v_p1_rating + v_p1_change;
        v_p2_new_rating := v_p2_rating + v_p2_change;

        -- Update player 1 ratings (only if registered user)
        IF p_team1_player1_user_id IS NOT NULL THEN
          UPDATE public.user_ratings
          SET
            elo_rating = v_p1_new_rating,
            matches_played = matches_played + 1,
            matches_won = matches_won + CASE WHEN p_winner = 1 THEN 1 ELSE 0 END,
            matches_lost = matches_lost + CASE WHEN p_winner = 2 THEN 1 ELSE 0 END,
            peak_rating = GREATEST(peak_rating, v_p1_new_rating),
            last_match_at = NOW()
          WHERE user_id = p_team1_player1_user_id AND club_id = p_club_id;
        END IF;

        -- Update player 2 ratings (only if registered user)
        IF p_team2_player1_user_id IS NOT NULL THEN
          UPDATE public.user_ratings
          SET
            elo_rating = v_p2_new_rating,
            matches_played = matches_played + 1,
            matches_won = matches_won + CASE WHEN p_winner = 2 THEN 1 ELSE 0 END,
            matches_lost = matches_lost + CASE WHEN p_winner = 1 THEN 1 ELSE 0 END,
            peak_rating = GREATEST(peak_rating, v_p2_new_rating),
            last_match_at = NOW()
          WHERE user_id = p_team2_player1_user_id AND club_id = p_club_id;
        END IF;

        -- Build rating changes object to store in database
        v_rating_changes := jsonb_build_object(
          'type', 'singles',
          'player1_change', CASE WHEN p_team1_player1_user_id IS NOT NULL THEN v_p1_change ELSE 0 END,
          'player2_change', CASE WHEN p_team2_player1_user_id IS NOT NULL THEN v_p2_change ELSE 0 END,
          'player1_is_guest', p_team1_player1_user_id IS NULL,
          'player2_is_guest', p_team2_player1_user_id IS NULL,
          'player1_old_rating', v_p1_rating,
          'player2_old_rating', v_p2_rating,
          'player1_new_rating', v_p1_new_rating,
          'player2_new_rating', v_p2_new_rating,
          'message', 'Singles match recorded with ELO updates'
        );

      EXCEPTION
        WHEN OTHERS THEN
          -- If ELO calculation fails, just record without updates
          v_rating_changes := jsonb_build_object(
            'type', p_match_type,
            'error', SQLERRM,
            'message', 'Match recorded but ELO calculation failed'
          );
      END;

    ELSE
      -- For doubles matches, just record without ELO updates for now
      v_rating_changes := jsonb_build_object(
        'type', p_match_type,
        'message', 'Match recorded (ELO only calculated for singles matches)'
      );
    END IF;

    -- Insert match record with ELO changes
    INSERT INTO public.match_records (
      club_id, match_type,
      team1_player1_user_id, team1_player1_guest_name,
      team1_player2_user_id, team1_player2_guest_name,
      team2_player1_user_id, team2_player1_guest_name,
      team2_player2_user_id, team2_player2_guest_name,
      winner, notes, recorded_by, match_date, elo_changes
    ) VALUES (
      p_club_id, p_match_type,
      p_team1_player1_user_id, p_team1_player1_guest_name,
      p_team1_player2_user_id, p_team1_player2_guest_name,
      p_team2_player1_user_id, p_team2_player1_guest_name,
      p_team2_player2_user_id, p_team2_player2_guest_name,
      p_winner, p_notes, auth.uid(), p_match_date, v_rating_changes
    ) RETURNING id INTO v_match_id;

    -- Insert match sets from sets data
    IF p_sets IS NOT NULL THEN
      INSERT INTO public.match_sets (
        match_id, set_number, team1_games, team2_games,
        team1_tiebreak_points, team2_tiebreak_points, winner
      )
      SELECT
        v_match_id,
        (set_info->>'set_number')::INTEGER,
        (set_info->>'team1_games')::INTEGER,
        (set_info->>'team2_games')::INTEGER,
        (set_info->>'team1_tiebreak_points')::INTEGER,
        (set_info->>'team2_tiebreak_points')::INTEGER,
        CASE WHEN (set_info->>'team1_games')::INTEGER > (set_info->>'team2_games')::INTEGER
             THEN 1 ELSE 2 END
      FROM jsonb_array_elements(p_sets) AS set_info;
    END IF;

    -- Return success with details
    RETURN jsonb_build_object(
      'success', true,
      'match_id', v_match_id,
      'rating_changes', v_rating_changes,
      'message', 'Match recorded successfully'
    );

  EXCEPTION
    WHEN OTHERS THEN
      -- Roll back transaction and return error
      RAISE EXCEPTION 'Failed to record match: %', SQLERRM;
  END;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION record_match_with_elo(BIGINT, TEXT, UUID, TEXT, UUID, TEXT, UUID, TEXT, UUID, TEXT, INTEGER, JSONB, TEXT, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION revert_match_elo() TO authenticated;

-- Add helpful comments
COMMENT ON FUNCTION record_match_with_elo(BIGINT, TEXT, UUID, TEXT, UUID, TEXT, UUID, TEXT, UUID, TEXT, INTEGER, JSONB, TEXT, DATE) IS 'Records tennis match with ELO updates and stores changes for potential reversal';
COMMENT ON FUNCTION revert_match_elo() IS 'Automatically reverts ELO rating changes when a match is deleted';
COMMENT ON COLUMN public.match_records.elo_changes IS 'Stores ELO rating changes for this match to enable reversal on deletion';