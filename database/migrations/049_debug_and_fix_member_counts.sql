-- Migration: Debug and permanently fix club member counts
-- Date: 2025-09-26
-- Description: Diagnose count issues and ensure counts stay accurate

-- First, let's see what's actually in the database
SELECT
  c.id,
  c.name as club_name,
  c.active_players_count as stored_count,
  COUNT(cu.user_id) as actual_count,
  c.active_players_count = COUNT(cu.user_id) as count_is_correct,
  array_agg(cu.user_id) as member_ids
FROM public.clubs c
LEFT JOIN public.club_users cu ON c.id = cu.club_id
GROUP BY c.id, c.name, c.active_players_count
ORDER BY c.name;

-- Force update all counts to be accurate
UPDATE public.clubs c
SET active_players_count = (
  SELECT COUNT(*)
  FROM public.club_users cu
  WHERE cu.club_id = c.id
);

-- Drop and recreate the trigger with better logging
DROP TRIGGER IF EXISTS update_club_player_count_trigger ON public.club_users;
DROP FUNCTION IF EXISTS update_club_player_count() CASCADE;

-- Create an improved trigger function with SECURITY DEFINER
CREATE OR REPLACE FUNCTION update_club_player_count()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_club_id BIGINT;
  v_new_count INTEGER;
BEGIN
  -- Determine which club ID to update
  IF TG_OP = 'INSERT' THEN
    v_club_id := NEW.club_id;
  ELSIF TG_OP = 'DELETE' THEN
    v_club_id := OLD.club_id;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Update both old and new club if changed
    IF OLD.club_id IS DISTINCT FROM NEW.club_id THEN
      -- Update old club first
      UPDATE public.clubs
      SET active_players_count = (
        SELECT COUNT(*) FROM public.club_users WHERE club_id = OLD.club_id
      )
      WHERE id = OLD.club_id;
    END IF;
    v_club_id := NEW.club_id;
  END IF;

  -- Calculate the new count
  SELECT COUNT(*) INTO v_new_count
  FROM public.club_users
  WHERE club_id = v_club_id;

  -- Update the club with the new count
  UPDATE public.clubs
  SET active_players_count = v_new_count
  WHERE id = v_club_id;

  -- Return appropriate value
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER update_club_player_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.club_users
  FOR EACH ROW
  EXECUTE FUNCTION update_club_player_count();

-- Create a function to get real-time member count (as backup)
CREATE OR REPLACE FUNCTION get_club_member_count_realtime(p_club_id BIGINT)
RETURNS INTEGER
LANGUAGE SQL
STABLE
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.club_users
  WHERE club_id = p_club_id;
$$;

-- Verify the counts after update
SELECT
  c.id,
  c.name as club_name,
  c.active_players_count as count_after_update,
  get_club_member_count_realtime(c.id) as realtime_count
FROM public.clubs c
ORDER BY c.name;