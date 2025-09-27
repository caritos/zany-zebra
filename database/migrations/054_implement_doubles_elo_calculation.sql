-- Migration: Implement proper doubles ELO calculation
-- Date: 2025-09-26
-- Description: Add full ELO calculation logic for doubles matches

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
  p_game_scores JSONB,
  p_notes TEXT DEFAULT NULL
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
  v_team1_rating INTEGER;
  v_team1_games INTEGER;
  v_team2_rating INTEGER;
  v_team2_games INTEGER;
  v_winner_user_id UUID;
  v_loser_user_id UUID;
  -- Doubles specific variables
  v_team1_p1_rating INTEGER;
  v_team1_p1_games INTEGER;
  v_team1_p2_rating INTEGER;
  v_team1_p2_games INTEGER;
  v_team2_p1_rating INTEGER;
  v_team2_p1_games INTEGER;
  v_team2_p2_rating INTEGER;
  v_team2_p2_games INTEGER;
  v_team1_avg_rating INTEGER;
  v_team2_avg_rating INTEGER;
  v_team1_avg_games INTEGER;
  v_team2_avg_games INTEGER;
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
    -- Insert match record
    INSERT INTO public.match_records (
      club_id, match_type,
      team1_player1_user_id, team1_player1_guest_name,
      team1_player2_user_id, team1_player2_guest_name,
      team2_player1_user_id, team2_player1_guest_name,
      team2_player2_user_id, team2_player2_guest_name,
      winner, game_scores, notes, recorded_by, match_date
    ) VALUES (
      p_club_id, p_match_type,
      p_team1_player1_user_id, p_team1_player1_guest_name,
      p_team1_player2_user_id, p_team1_player2_guest_name,
      p_team2_player1_user_id, p_team2_player1_guest_name,
      p_team2_player2_user_id, p_team2_player2_guest_name,
      p_winner, p_game_scores, p_notes, auth.uid(), NOW()
    ) RETURNING id INTO v_match_id;

    -- Convert game scores to text for ELO calculation
    IF p_game_scores IS NOT NULL THEN
      SELECT string_agg(
        (set_info->>'team1_games') || '-' || (set_info->>'team2_games'),
        ','
        ORDER BY (set_info->>'set_number')::INTEGER
      )
      INTO v_scores_text
      FROM jsonb_array_elements(p_game_scores->'sets') AS set_info;
    END IF;

    -- Update ELO ratings for singles matches
    IF p_match_type = 'singles' THEN
      -- At least one player must be a registered user to calculate ELO
      IF p_team1_player1_user_id IS NOT NULL OR p_team2_player1_user_id IS NOT NULL THEN

        -- Get team 1 player rating (use 1200 for guests)
        IF p_team1_player1_user_id IS NOT NULL THEN
          SELECT COALESCE(ur.elo_rating, 1200), COALESCE(ur.matches_played, 0)
          INTO v_team1_rating, v_team1_games
          FROM public.user_ratings ur
          WHERE ur.club_id = p_club_id AND ur.user_id = p_team1_player1_user_id;

          -- If no rating record exists, use defaults
          IF v_team1_rating IS NULL THEN
            v_team1_rating := 1200;
            v_team1_games := 0;
          END IF;
        ELSE
          -- Guest player gets default rating
          v_team1_rating := 1200;
          v_team1_games := 20; -- Treat guests as established players (lower K-factor)
        END IF;

        -- Get team 2 player rating (use 1200 for guests)
        IF p_team2_player1_user_id IS NOT NULL THEN
          SELECT COALESCE(ur.elo_rating, 1200), COALESCE(ur.matches_played, 0)
          INTO v_team2_rating, v_team2_games
          FROM public.user_ratings ur
          WHERE ur.club_id = p_club_id AND ur.user_id = p_team2_player1_user_id;

          -- If no rating record exists, use defaults
          IF v_team2_rating IS NULL THEN
            v_team2_rating := 1200;
            v_team2_games := 0;
          END IF;
        ELSE
          -- Guest player gets default rating
          v_team2_rating := 1200;
          v_team2_games := 20; -- Treat guests as established players (lower K-factor)
        END IF;

        -- Calculate ELO changes
        IF p_winner = 1 THEN
          -- Team 1 won
          SELECT * INTO v_rating_result
          FROM calculate_elo_ratings(
            v_team1_rating, v_team1_games,
            v_team2_rating, v_team2_games,
            v_scores_text
          );
          v_winner_user_id := p_team1_player1_user_id;
          v_loser_user_id := p_team2_player1_user_id;
        ELSE
          -- Team 2 won
          SELECT * INTO v_rating_result
          FROM calculate_elo_ratings(
            v_team2_rating, v_team2_games,
            v_team1_rating, v_team1_games,
            v_scores_text
          );
          v_winner_user_id := p_team2_player1_user_id;
          v_loser_user_id := p_team1_player1_user_id;
        END IF;

        -- Update winner rating (only if not a guest)
        IF v_winner_user_id IS NOT NULL THEN
          INSERT INTO public.user_ratings (user_id, club_id, elo_rating, matches_played, matches_won, peak_rating)
          VALUES (
            v_winner_user_id, p_club_id,
            v_rating_result.winner_new_rating,
            1, 1, v_rating_result.winner_new_rating
          )
          ON CONFLICT (user_id, club_id)
          DO UPDATE SET
            elo_rating = v_rating_result.winner_new_rating,
            matches_played = user_ratings.matches_played + 1,
            matches_won = user_ratings.matches_won + 1,
            peak_rating = GREATEST(user_ratings.peak_rating, v_rating_result.winner_new_rating),
            last_match_at = NOW(),
            updated_at = NOW();
        END IF;

        -- Update loser rating (only if not a guest)
        IF v_loser_user_id IS NOT NULL THEN
          INSERT INTO public.user_ratings (user_id, club_id, elo_rating, matches_played, matches_lost, peak_rating)
          VALUES (
            v_loser_user_id, p_club_id,
            v_rating_result.loser_new_rating,
            1, 1, 1200
          )
          ON CONFLICT (user_id, club_id)
          DO UPDATE SET
            elo_rating = v_rating_result.loser_new_rating,
            matches_played = user_ratings.matches_played + 1,
            matches_lost = user_ratings.matches_lost + 1,
            last_match_at = NOW(),
            updated_at = NOW();
        END IF;

        v_rating_changes := jsonb_build_object(
          'type', 'singles',
          'winner_change', v_rating_result.winner_rating_change,
          'loser_change', v_rating_result.loser_rating_change,
          'winner_new_rating', v_rating_result.winner_new_rating,
          'loser_new_rating', v_rating_result.loser_new_rating,
          'guest_involved', (v_winner_user_id IS NULL OR v_loser_user_id IS NULL)
        );
      END IF;

    -- DOUBLES MATCH ELO CALCULATION
    ELSIF p_match_type = 'doubles' THEN
      -- Need at least 2 registered players to calculate ELO (can have guests)
      IF (p_team1_player1_user_id IS NOT NULL OR p_team1_player2_user_id IS NOT NULL) AND
         (p_team2_player1_user_id IS NOT NULL OR p_team2_player2_user_id IS NOT NULL) THEN

        -- Get Team 1 Player 1 rating
        IF p_team1_player1_user_id IS NOT NULL THEN
          SELECT COALESCE(ur.elo_rating, 1200), COALESCE(ur.matches_played, 0)
          INTO v_team1_p1_rating, v_team1_p1_games
          FROM public.user_ratings ur
          WHERE ur.club_id = p_club_id AND ur.user_id = p_team1_player1_user_id;
          IF v_team1_p1_rating IS NULL THEN
            v_team1_p1_rating := 1200; v_team1_p1_games := 0;
          END IF;
        ELSE
          v_team1_p1_rating := 1200; v_team1_p1_games := 20; -- Guest
        END IF;

        -- Get Team 1 Player 2 rating
        IF p_team1_player2_user_id IS NOT NULL THEN
          SELECT COALESCE(ur.elo_rating, 1200), COALESCE(ur.matches_played, 0)
          INTO v_team1_p2_rating, v_team1_p2_games
          FROM public.user_ratings ur
          WHERE ur.club_id = p_club_id AND ur.user_id = p_team1_player2_user_id;
          IF v_team1_p2_rating IS NULL THEN
            v_team1_p2_rating := 1200; v_team1_p2_games := 0;
          END IF;
        ELSE
          v_team1_p2_rating := 1200; v_team1_p2_games := 20; -- Guest
        END IF;

        -- Get Team 2 Player 1 rating
        IF p_team2_player1_user_id IS NOT NULL THEN
          SELECT COALESCE(ur.elo_rating, 1200), COALESCE(ur.matches_played, 0)
          INTO v_team2_p1_rating, v_team2_p1_games
          FROM public.user_ratings ur
          WHERE ur.club_id = p_club_id AND ur.user_id = p_team2_player1_user_id;
          IF v_team2_p1_rating IS NULL THEN
            v_team2_p1_rating := 1200; v_team2_p1_games := 0;
          END IF;
        ELSE
          v_team2_p1_rating := 1200; v_team2_p1_games := 20; -- Guest
        END IF;

        -- Get Team 2 Player 2 rating
        IF p_team2_player2_user_id IS NOT NULL THEN
          SELECT COALESCE(ur.elo_rating, 1200), COALESCE(ur.matches_played, 0)
          INTO v_team2_p2_rating, v_team2_p2_games
          FROM public.user_ratings ur
          WHERE ur.club_id = p_club_id AND ur.user_id = p_team2_player2_user_id;
          IF v_team2_p2_rating IS NULL THEN
            v_team2_p2_rating := 1200; v_team2_p2_games := 0;
          END IF;
        ELSE
          v_team2_p2_rating := 1200; v_team2_p2_games := 20; -- Guest
        END IF;

        -- Calculate team averages for ELO calculation
        v_team1_avg_rating := (v_team1_p1_rating + v_team1_p2_rating) / 2;
        v_team2_avg_rating := (v_team2_p1_rating + v_team2_p2_rating) / 2;
        v_team1_avg_games := (v_team1_p1_games + v_team1_p2_games) / 2;
        v_team2_avg_games := (v_team2_p1_games + v_team2_p2_games) / 2;

        -- Calculate ELO changes using team averages
        IF p_winner = 1 THEN
          -- Team 1 won
          SELECT * INTO v_rating_result
          FROM calculate_elo_ratings(
            v_team1_avg_rating, v_team1_avg_games,
            v_team2_avg_rating, v_team2_avg_games,
            v_scores_text
          );
        ELSE
          -- Team 2 won
          SELECT * INTO v_rating_result
          FROM calculate_elo_ratings(
            v_team2_avg_rating, v_team2_avg_games,
            v_team1_avg_rating, v_team1_avg_games,
            v_scores_text
          );
        END IF;

        -- Update ratings for all registered players
        -- Team 1 players
        IF p_team1_player1_user_id IS NOT NULL THEN
          INSERT INTO public.user_ratings (user_id, club_id, elo_rating, matches_played, matches_won, matches_lost, peak_rating)
          VALUES (
            p_team1_player1_user_id, p_club_id,
            CASE WHEN p_winner = 1 THEN v_rating_result.winner_new_rating ELSE v_rating_result.loser_new_rating END,
            1,
            CASE WHEN p_winner = 1 THEN 1 ELSE 0 END,
            CASE WHEN p_winner = 1 THEN 0 ELSE 1 END,
            CASE WHEN p_winner = 1 THEN v_rating_result.winner_new_rating ELSE v_rating_result.loser_new_rating END
          )
          ON CONFLICT (user_id, club_id)
          DO UPDATE SET
            elo_rating = CASE WHEN p_winner = 1 THEN v_rating_result.winner_new_rating ELSE v_rating_result.loser_new_rating END,
            matches_played = user_ratings.matches_played + 1,
            matches_won = user_ratings.matches_won + CASE WHEN p_winner = 1 THEN 1 ELSE 0 END,
            matches_lost = user_ratings.matches_lost + CASE WHEN p_winner = 1 THEN 0 ELSE 1 END,
            peak_rating = GREATEST(user_ratings.peak_rating, CASE WHEN p_winner = 1 THEN v_rating_result.winner_new_rating ELSE v_rating_result.loser_new_rating END),
            last_match_at = NOW(),
            updated_at = NOW();
        END IF;

        IF p_team1_player2_user_id IS NOT NULL THEN
          INSERT INTO public.user_ratings (user_id, club_id, elo_rating, matches_played, matches_won, matches_lost, peak_rating)
          VALUES (
            p_team1_player2_user_id, p_club_id,
            CASE WHEN p_winner = 1 THEN v_rating_result.winner_new_rating ELSE v_rating_result.loser_new_rating END,
            1,
            CASE WHEN p_winner = 1 THEN 1 ELSE 0 END,
            CASE WHEN p_winner = 1 THEN 0 ELSE 1 END,
            CASE WHEN p_winner = 1 THEN v_rating_result.winner_new_rating ELSE v_rating_result.loser_new_rating END
          )
          ON CONFLICT (user_id, club_id)
          DO UPDATE SET
            elo_rating = CASE WHEN p_winner = 1 THEN v_rating_result.winner_new_rating ELSE v_rating_result.loser_new_rating END,
            matches_played = user_ratings.matches_played + 1,
            matches_won = user_ratings.matches_won + CASE WHEN p_winner = 1 THEN 1 ELSE 0 END,
            matches_lost = user_ratings.matches_lost + CASE WHEN p_winner = 1 THEN 0 ELSE 1 END,
            peak_rating = GREATEST(user_ratings.peak_rating, CASE WHEN p_winner = 1 THEN v_rating_result.winner_new_rating ELSE v_rating_result.loser_new_rating END),
            last_match_at = NOW(),
            updated_at = NOW();
        END IF;

        -- Team 2 players
        IF p_team2_player1_user_id IS NOT NULL THEN
          INSERT INTO public.user_ratings (user_id, club_id, elo_rating, matches_played, matches_won, matches_lost, peak_rating)
          VALUES (
            p_team2_player1_user_id, p_club_id,
            CASE WHEN p_winner = 2 THEN v_rating_result.winner_new_rating ELSE v_rating_result.loser_new_rating END,
            1,
            CASE WHEN p_winner = 2 THEN 1 ELSE 0 END,
            CASE WHEN p_winner = 2 THEN 0 ELSE 1 END,
            CASE WHEN p_winner = 2 THEN v_rating_result.winner_new_rating ELSE v_rating_result.loser_new_rating END
          )
          ON CONFLICT (user_id, club_id)
          DO UPDATE SET
            elo_rating = CASE WHEN p_winner = 2 THEN v_rating_result.winner_new_rating ELSE v_rating_result.loser_new_rating END,
            matches_played = user_ratings.matches_played + 1,
            matches_won = user_ratings.matches_won + CASE WHEN p_winner = 2 THEN 1 ELSE 0 END,
            matches_lost = user_ratings.matches_lost + CASE WHEN p_winner = 2 THEN 0 ELSE 1 END,
            peak_rating = GREATEST(user_ratings.peak_rating, CASE WHEN p_winner = 2 THEN v_rating_result.winner_new_rating ELSE v_rating_result.loser_new_rating END),
            last_match_at = NOW(),
            updated_at = NOW();
        END IF;

        IF p_team2_player2_user_id IS NOT NULL THEN
          INSERT INTO public.user_ratings (user_id, club_id, elo_rating, matches_played, matches_won, matches_lost, peak_rating)
          VALUES (
            p_team2_player2_user_id, p_club_id,
            CASE WHEN p_winner = 2 THEN v_rating_result.winner_new_rating ELSE v_rating_result.loser_new_rating END,
            1,
            CASE WHEN p_winner = 2 THEN 1 ELSE 0 END,
            CASE WHEN p_winner = 2 THEN 0 ELSE 1 END,
            CASE WHEN p_winner = 2 THEN v_rating_result.winner_new_rating ELSE v_rating_result.loser_new_rating END
          )
          ON CONFLICT (user_id, club_id)
          DO UPDATE SET
            elo_rating = CASE WHEN p_winner = 2 THEN v_rating_result.winner_new_rating ELSE v_rating_result.loser_new_rating END,
            matches_played = user_ratings.matches_played + 1,
            matches_won = user_ratings.matches_won + CASE WHEN p_winner = 2 THEN 1 ELSE 0 END,
            matches_lost = user_ratings.matches_lost + CASE WHEN p_winner = 2 THEN 0 ELSE 1 END,
            peak_rating = GREATEST(user_ratings.peak_rating, CASE WHEN p_winner = 2 THEN v_rating_result.winner_new_rating ELSE v_rating_result.loser_new_rating END),
            last_match_at = NOW(),
            updated_at = NOW();
        END IF;

        v_rating_changes := jsonb_build_object(
          'type', 'doubles',
          'team1_avg_rating', v_team1_avg_rating,
          'team2_avg_rating', v_team2_avg_rating,
          'winner_change', v_rating_result.winner_rating_change,
          'loser_change', v_rating_result.loser_rating_change,
          'winner_new_rating', v_rating_result.winner_new_rating,
          'loser_new_rating', v_rating_result.loser_new_rating
        );
      END IF;
    END IF;

    -- Insert match sets from game_scores
    IF p_game_scores IS NOT NULL AND p_game_scores ? 'sets' THEN
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
      FROM jsonb_array_elements(p_game_scores->'sets') AS set_info;
    END IF;

    -- Return success with details
    RETURN jsonb_build_object(
      'success', true,
      'match_id', v_match_id,
      'rating_changes', v_rating_changes,
      'message', 'Match recorded and ELO ratings updated successfully'
    );

  EXCEPTION
    WHEN OTHERS THEN
      -- Roll back transaction and return error
      RAISE EXCEPTION 'Failed to record match: %', SQLERRM;
  END;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION record_match_with_elo(BIGINT, TEXT, UUID, TEXT, UUID, TEXT, UUID, TEXT, UUID, TEXT, INTEGER, JSONB, TEXT) TO authenticated;

-- Add comment
COMMENT ON FUNCTION record_match_with_elo(BIGINT, TEXT, UUID, TEXT, UUID, TEXT, UUID, TEXT, UUID, TEXT, INTEGER, JSONB, TEXT) IS 'Records match and updates ELO ratings atomically. Now supports both singles and doubles matches with full ELO calculation.';

DO $$
BEGIN
  RAISE NOTICE 'ELO system updated with full doubles support!';
  RAISE NOTICE 'Doubles matches now calculate team average ratings and update all registered players.';
END;
$$;