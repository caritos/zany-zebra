-- Function to revert ELO changes when a match is deleted
-- This function should be called before deleting a match record

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

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION revert_match_elo() TO authenticated;

-- Add helpful comment
COMMENT ON FUNCTION revert_match_elo() IS 'Automatically reverts ELO rating changes when a match is deleted';