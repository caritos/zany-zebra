-- Migration: Force update get_my_clubs function with real-time counts
-- Date: 2025-09-26
-- Description: Ensures get_my_clubs calculates member counts dynamically

-- Force drop the existing function
DROP FUNCTION IF EXISTS get_my_clubs() CASCADE;

-- Recreate with dynamic count calculation
CREATE FUNCTION get_my_clubs()
RETURNS TABLE (
  club_id BIGINT,
  club_name TEXT,
  club_description TEXT,
  zip_code TEXT,
  city TEXT,
  state TEXT,
  joined_at TIMESTAMPTZ,
  active_players_count INTEGER,
  club_lat FLOAT,
  club_long FLOAT
)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    c.id,
    c.name,
    c.description,
    c.zip_code,
    c.city,
    c.state,
    cu.created_at as joined_at,
    (
      SELECT COUNT(*)::INTEGER
      FROM public.club_users cu2
      WHERE cu2.club_id = c.id
    ) as active_players_count,  -- Calculate dynamically, no COALESCE needed
    extensions.st_y(c.location::extensions.geometry) as club_lat,
    extensions.st_x(c.location::extensions.geometry) as club_long
  FROM public.club_users cu
  JOIN public.clubs c ON c.id = cu.club_id
  WHERE cu.user_id = auth.uid()
  ORDER BY cu.created_at DESC;
$$;