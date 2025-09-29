-- Migration: Simple ELO reversal (pragmatic approach)
-- Date: 2025-09-29
-- Description: Just reverses stored ELO changes - not perfectly accurate but performant

-- Drop previous triggers
DROP TRIGGER IF EXISTS recalculate_elo_on_match_delete ON public.match_records;
DROP TRIGGER IF EXISTS recalculate_elo_on_match_update ON public.match_records;
DROP TRIGGER IF EXISTS revert_elo_on_match_delete ON public.match_records;

-- Simple reversal function (accepts inaccuracy for performance)
CREATE OR REPLACE FUNCTION simple_elo_reversal()
RETURNS TRIGGER AS $$
DECLARE
  v_elo_changes JSONB;
BEGIN
  v_elo_changes := OLD.elo_changes;

  -- Only process if we have ELO changes and it's a singles match
  IF v_elo_changes IS NOT NULL AND
     v_elo_changes != '{}'::JSONB AND
     OLD.match_type = 'singles' THEN

    -- Revert player 1's rating (if not a guest)
    IF OLD.team1_player1_user_id IS NOT NULL AND
       (v_elo_changes->>'player1_change') IS NOT NULL THEN
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
      WHERE user_id = OLD.team1_player1_user_id AND club_id = OLD.club_id;
    END IF;

    -- Revert player 2's rating (if not a guest)
    IF OLD.team2_player1_user_id IS NOT NULL AND
       (v_elo_changes->>'player2_change') IS NOT NULL THEN
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
      WHERE user_id = OLD.team2_player1_user_id AND club_id = OLD.club_id;
    END IF;

    -- Log the reversal for audit purposes
    RAISE NOTICE 'ELO reversal: Match % deleted, changes reverted (may cause slight inaccuracy)', OLD.id;
  END IF;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply simple reversal on delete
CREATE TRIGGER simple_elo_reversal_on_delete
  BEFORE DELETE ON public.match_records
  FOR EACH ROW
  EXECUTE FUNCTION simple_elo_reversal();

-- Optional: Add a canceled flag instead of deleting
ALTER TABLE public.match_records
ADD COLUMN IF NOT EXISTS canceled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS canceled_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS canceled_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS cancel_reason TEXT;

-- Function to cancel a match (alternative to deletion)
CREATE OR REPLACE FUNCTION cancel_match(p_match_id BIGINT, p_reason TEXT DEFAULT NULL)
RETURNS JSONB AS $$
DECLARE
  v_match RECORD;
  v_elo_changes JSONB;
BEGIN
  -- Get match details
  SELECT * INTO v_match
  FROM public.match_records
  WHERE id = p_match_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Match not found');
  END IF;

  -- Check permissions
  IF NOT EXISTS (
    SELECT 1 FROM public.club_users
    WHERE club_id = v_match.club_id AND user_id = auth.uid()
  ) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Not authorized');
  END IF;

  -- If already canceled, return
  IF v_match.canceled THEN
    RETURN jsonb_build_object('success', false, 'message', 'Match already canceled');
  END IF;

  -- Mark as canceled
  UPDATE public.match_records
  SET
    canceled = TRUE,
    canceled_at = NOW(),
    canceled_by = auth.uid(),
    cancel_reason = p_reason
  WHERE id = p_match_id;

  -- Revert ELO changes
  v_elo_changes := v_match.elo_changes;

  IF v_elo_changes IS NOT NULL AND
     v_elo_changes != '{}'::JSONB AND
     v_match.match_type = 'singles' THEN

    -- Revert player 1
    IF v_match.team1_player1_user_id IS NOT NULL AND
       (v_elo_changes->>'player1_change') IS NOT NULL THEN
      UPDATE public.user_ratings
      SET
        elo_rating = elo_rating - (v_elo_changes->>'player1_change')::INTEGER,
        matches_played = GREATEST(0, matches_played - 1),
        matches_won = CASE
          WHEN v_match.winner = 1 THEN GREATEST(0, matches_won - 1)
          ELSE matches_won
        END,
        matches_lost = CASE
          WHEN v_match.winner = 2 THEN GREATEST(0, matches_lost - 1)
          ELSE matches_lost
        END
      WHERE user_id = v_match.team1_player1_user_id AND club_id = v_match.club_id;
    END IF;

    -- Revert player 2
    IF v_match.team2_player1_user_id IS NOT NULL AND
       (v_elo_changes->>'player2_change') IS NOT NULL THEN
      UPDATE public.user_ratings
      SET
        elo_rating = elo_rating - (v_elo_changes->>'player2_change')::INTEGER,
        matches_played = GREATEST(0, matches_played - 1),
        matches_won = CASE
          WHEN v_match.winner = 2 THEN GREATEST(0, matches_won - 1)
          ELSE matches_won
        END,
        matches_lost = CASE
          WHEN v_match.winner = 1 THEN GREATEST(0, matches_lost - 1)
          ELSE matches_lost
        END
      WHERE user_id = v_match.team2_player1_user_id AND club_id = v_match.club_id;
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Match canceled and ELO changes reverted',
    'note', 'ELO reversal may cause slight inaccuracies if many matches played after this one'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to restore a canceled match
CREATE OR REPLACE FUNCTION restore_match(p_match_id BIGINT)
RETURNS JSONB AS $$
DECLARE
  v_match RECORD;
  v_elo_changes JSONB;
BEGIN
  -- Get match details
  SELECT * INTO v_match
  FROM public.match_records
  WHERE id = p_match_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Match not found');
  END IF;

  -- Check permissions
  IF NOT EXISTS (
    SELECT 1 FROM public.club_users
    WHERE club_id = v_match.club_id AND user_id = auth.uid()
  ) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Not authorized');
  END IF;

  -- If not canceled, return
  IF NOT v_match.canceled THEN
    RETURN jsonb_build_object('success', false, 'message', 'Match is not canceled');
  END IF;

  -- Restore match
  UPDATE public.match_records
  SET
    canceled = FALSE,
    canceled_at = NULL,
    canceled_by = NULL,
    cancel_reason = NULL
  WHERE id = p_match_id;

  -- Reapply ELO changes
  v_elo_changes := v_match.elo_changes;

  IF v_elo_changes IS NOT NULL AND
     v_elo_changes != '{}'::JSONB AND
     v_match.match_type = 'singles' THEN

    -- Reapply to player 1
    IF v_match.team1_player1_user_id IS NOT NULL AND
       (v_elo_changes->>'player1_change') IS NOT NULL THEN
      UPDATE public.user_ratings
      SET
        elo_rating = elo_rating + (v_elo_changes->>'player1_change')::INTEGER,
        matches_played = matches_played + 1,
        matches_won = CASE
          WHEN v_match.winner = 1 THEN matches_won + 1
          ELSE matches_won
        END,
        matches_lost = CASE
          WHEN v_match.winner = 2 THEN matches_lost + 1
          ELSE matches_lost
        END,
        peak_rating = GREATEST(peak_rating, elo_rating + (v_elo_changes->>'player1_change')::INTEGER)
      WHERE user_id = v_match.team1_player1_user_id AND club_id = v_match.club_id;
    END IF;

    -- Reapply to player 2
    IF v_match.team2_player1_user_id IS NOT NULL AND
       (v_elo_changes->>'player2_change') IS NOT NULL THEN
      UPDATE public.user_ratings
      SET
        elo_rating = elo_rating + (v_elo_changes->>'player2_change')::INTEGER,
        matches_played = matches_played + 1,
        matches_won = CASE
          WHEN v_match.winner = 2 THEN matches_won + 1
          ELSE matches_won
        END,
        matches_lost = CASE
          WHEN v_match.winner = 1 THEN matches_lost + 1
          ELSE matches_lost
        END,
        peak_rating = GREATEST(peak_rating, elo_rating + (v_elo_changes->>'player2_change')::INTEGER)
      WHERE user_id = v_match.team2_player1_user_id AND club_id = v_match.club_id;
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Match restored and ELO changes reapplied'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update queries to exclude canceled matches
CREATE OR REPLACE VIEW active_matches AS
SELECT * FROM public.match_records
WHERE canceled = FALSE OR canceled IS NULL;

-- Grant permissions
GRANT EXECUTE ON FUNCTION simple_elo_reversal() TO authenticated;
GRANT EXECUTE ON FUNCTION cancel_match(BIGINT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION restore_match(BIGINT) TO authenticated;
GRANT SELECT ON active_matches TO authenticated;

-- Comments
COMMENT ON FUNCTION cancel_match(BIGINT, TEXT) IS 'Cancel a match and revert ELO changes (may cause slight inaccuracy)';
COMMENT ON FUNCTION restore_match(BIGINT) IS 'Restore a canceled match and reapply ELO changes';
COMMENT ON COLUMN public.match_records.canceled IS 'Whether this match has been canceled (ELO reverted)';