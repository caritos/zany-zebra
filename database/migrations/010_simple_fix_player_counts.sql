-- Migration: Simple fix for player counts
-- Date: 2025-09-24
-- Description: Just fix the counts without changing function signatures

-- Update all club counts to match actual member counts
UPDATE public.clubs c
SET active_players_count = (
  SELECT COUNT(*)
  FROM public.club_users cu
  WHERE cu.club_id = c.id
);

-- Verify the counts are correct
DO $$
DECLARE
  club_record RECORD;
BEGIN
  FOR club_record IN
    SELECT
      c.id,
      c.name,
      c.active_players_count as shown_count,
      (SELECT COUNT(*) FROM public.club_users cu WHERE cu.club_id = c.id) as actual_count
    FROM public.clubs c
  LOOP
    RAISE NOTICE 'Club % (%) has % members and shows % players',
      club_record.id, club_record.name, club_record.actual_count, club_record.shown_count;
  END LOOP;
END;
$$;