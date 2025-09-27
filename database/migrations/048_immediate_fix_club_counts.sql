-- Migration: Immediate fix for club member counts
-- Date: 2025-09-26
-- Description: Forces all club counts to be accurate immediately

-- Force update all club counts to their actual values
UPDATE public.clubs c
SET active_players_count = COALESCE((
  SELECT COUNT(*)
  FROM public.club_users cu
  WHERE cu.club_id = c.id
), 0);

-- Show the results of what was updated
SELECT
  c.id,
  c.name as club_name,
  c.active_players_count as member_count,
  c.zip_code,
  c.city,
  c.state
FROM public.clubs c
ORDER BY c.name;