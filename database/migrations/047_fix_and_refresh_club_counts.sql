-- Migration: Fix and refresh all club member counts
-- Date: 2025-09-26
-- Description: Ensures all club counts are accurate and trigger is working

-- First, let's check what the actual counts should be
DO $$
DECLARE
  club_record RECORD;
  actual_count INTEGER;
BEGIN
  FOR club_record IN SELECT id, name, active_players_count FROM public.clubs
  LOOP
    SELECT COUNT(*) INTO actual_count
    FROM public.club_users
    WHERE club_id = club_record.id;

    RAISE NOTICE 'Club % (%) - Current count: %, Actual count: %',
      club_record.name, club_record.id, club_record.active_players_count, actual_count;
  END LOOP;
END;
$$;

-- Force update all club counts to their actual values
UPDATE public.clubs c
SET active_players_count = COALESCE((
  SELECT COUNT(*)
  FROM public.club_users cu
  WHERE cu.club_id = c.id
), 0)
WHERE active_players_count != COALESCE((
  SELECT COUNT(*)
  FROM public.club_users cu
  WHERE cu.club_id = c.id
), 0);

-- Recreate the trigger function to ensure it's working
DROP TRIGGER IF EXISTS update_club_player_count_trigger ON public.club_users;
DROP FUNCTION IF EXISTS update_club_player_count() CASCADE;

CREATE OR REPLACE FUNCTION update_club_player_count()
RETURNS TRIGGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Handle INSERT
  IF TG_OP = 'INSERT' THEN
    SELECT COUNT(*) INTO v_count
    FROM public.club_users
    WHERE club_id = NEW.club_id;

    UPDATE public.clubs
    SET active_players_count = v_count
    WHERE id = NEW.club_id;

    RETURN NEW;

  -- Handle DELETE
  ELSIF TG_OP = 'DELETE' THEN
    SELECT COUNT(*) INTO v_count
    FROM public.club_users
    WHERE club_id = OLD.club_id;

    UPDATE public.clubs
    SET active_players_count = v_count
    WHERE id = OLD.club_id;

    RETURN OLD;

  -- Handle UPDATE (if club_id changes)
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.club_id IS DISTINCT FROM NEW.club_id THEN
      -- Update old club
      SELECT COUNT(*) INTO v_count
      FROM public.club_users
      WHERE club_id = OLD.club_id;

      UPDATE public.clubs
      SET active_players_count = v_count
      WHERE id = OLD.club_id;

      -- Update new club
      SELECT COUNT(*) INTO v_count
      FROM public.club_users
      WHERE club_id = NEW.club_id;

      UPDATE public.clubs
      SET active_players_count = v_count
      WHERE id = NEW.club_id;
    END IF;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER update_club_player_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.club_users
  FOR EACH ROW
  EXECUTE FUNCTION update_club_player_count();

-- Create a helper function to check club member counts
CREATE OR REPLACE FUNCTION check_club_counts()
RETURNS TABLE (
  club_id BIGINT,
  club_name TEXT,
  stored_count INTEGER,
  actual_count BIGINT,
  is_correct BOOLEAN
)
LANGUAGE SQL
AS $$
  SELECT
    c.id,
    c.name,
    c.active_players_count,
    COUNT(cu.user_id),
    c.active_players_count = COUNT(cu.user_id)
  FROM public.clubs c
  LEFT JOIN public.club_users cu ON c.id = cu.club_id
  GROUP BY c.id, c.name, c.active_players_count
  ORDER BY c.id;
$$;

-- Run the check to show the results
SELECT * FROM check_club_counts();