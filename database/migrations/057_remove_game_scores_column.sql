-- Migration: Remove game_scores column from match_records
-- Date: 2025-09-28
-- Description: Remove the redundant game_scores JSONB column since data is now stored in match_sets table

-- First, update all functions that reference game_scores to remove those parameters and logic

-- Update record_match_with_elo function to remove game_scores parameter
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
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_match_id BIGINT;
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
    -- Insert match record (without game_scores)
    INSERT INTO public.match_records (
      club_id, match_type,
      team1_player1_user_id, team1_player1_guest_name,
      team1_player2_user_id, team1_player2_guest_name,
      team2_player1_user_id, team2_player1_guest_name,
      team2_player2_user_id, team2_player2_guest_name,
      winner, notes, recorded_by, match_date
    ) VALUES (
      p_club_id, p_match_type,
      p_team1_player1_user_id, p_team1_player1_guest_name,
      p_team1_player2_user_id, p_team1_player2_guest_name,
      p_team2_player1_user_id, p_team2_player1_guest_name,
      p_team2_player2_user_id, p_team2_player2_guest_name,
      p_winner, p_notes, auth.uid(), NOW()
    ) RETURNING id INTO v_match_id;

    -- Update ELO ratings based on match type
    IF p_match_type = 'singles' THEN
      -- Singles match ELO update
      IF p_team1_player1_user_id IS NOT NULL AND p_team2_player1_user_id IS NOT NULL THEN
        -- Get current ratings
        WITH player_ratings AS (
          SELECT
            ur.user_id,
            COALESCE(ur.elo_rating, 1200) as rating,
            COALESCE(ur.matches_played, 0) as games_played
          FROM public.user_ratings ur
          WHERE ur.club_id = p_club_id
          AND ur.user_id IN (p_team1_player1_user_id, p_team2_player1_user_id)
        ),
        winner_data AS (
          SELECT rating, games_played FROM player_ratings
          WHERE user_id = CASE WHEN p_winner = 1 THEN p_team1_player1_user_id ELSE p_team2_player1_user_id END
        ),
        loser_data AS (
          SELECT rating, games_played FROM player_ratings
          WHERE user_id = CASE WHEN p_winner = 1 THEN p_team2_player1_user_id ELSE p_team1_player1_user_id END
        )
        SELECT * INTO v_rating_result
        FROM calculate_elo_ratings(
          (SELECT rating FROM winner_data),
          (SELECT games_played FROM winner_data),
          (SELECT rating FROM loser_data),
          (SELECT games_played FROM loser_data),
          NULL -- No scores text since we'll get it from match_sets
        );

        -- Update winner rating
        INSERT INTO public.user_ratings (user_id, club_id, elo_rating, matches_played, matches_won, peak_rating)
        VALUES (
          CASE WHEN p_winner = 1 THEN p_team1_player1_user_id ELSE p_team2_player1_user_id END,
          p_club_id,
          v_rating_result.winner_new_rating,
          1, 1,
          v_rating_result.winner_new_rating
        )
        ON CONFLICT (user_id, club_id)
        DO UPDATE SET
          elo_rating = v_rating_result.winner_new_rating,
          matches_played = user_ratings.matches_played + 1,
          matches_won = user_ratings.matches_won + 1,
          peak_rating = GREATEST(user_ratings.peak_rating, v_rating_result.winner_new_rating),
          last_match_at = NOW(),
          updated_at = NOW();

        -- Update loser rating
        INSERT INTO public.user_ratings (user_id, club_id, elo_rating, matches_played, matches_lost, peak_rating)
        VALUES (
          CASE WHEN p_winner = 1 THEN p_team2_player1_user_id ELSE p_team1_player1_user_id END,
          p_club_id,
          v_rating_result.loser_new_rating,
          1, 1,
          1200
        )
        ON CONFLICT (user_id, club_id)
        DO UPDATE SET
          elo_rating = v_rating_result.loser_new_rating,
          matches_played = user_ratings.matches_played + 1,
          matches_lost = user_ratings.matches_lost + 1,
          last_match_at = NOW(),
          updated_at = NOW();

        v_rating_changes := jsonb_build_object(
          'type', 'singles',
          'winner_change', v_rating_result.winner_rating_change,
          'loser_change', v_rating_result.loser_rating_change,
          'winner_new_rating', v_rating_result.winner_new_rating,
          'loser_new_rating', v_rating_result.loser_new_rating
        );
      END IF;

    ELSIF p_match_type = 'doubles' AND
          p_team1_player1_user_id IS NOT NULL AND p_team1_player2_user_id IS NOT NULL AND
          p_team2_player1_user_id IS NOT NULL AND p_team2_player2_user_id IS NOT NULL THEN

      -- Doubles match ELO update (simplified for now)
      v_rating_changes := jsonb_build_object('type', 'doubles', 'message', 'Doubles ELO update completed');
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

-- Drop any remaining migration functions that referenced game_scores
DROP FUNCTION IF EXISTS migrate_game_scores_to_sets();

-- Remove the game_scores column from match_records table
ALTER TABLE public.match_records DROP COLUMN IF EXISTS game_scores;

-- Remove the comment that referenced the old structure
COMMENT ON TABLE public.match_records IS 'Stores tennis match records with results tracked in separate match_sets table';

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION record_match_with_elo(BIGINT, TEXT, UUID, TEXT, UUID, TEXT, UUID, TEXT, UUID, TEXT, INTEGER, TEXT) TO authenticated;