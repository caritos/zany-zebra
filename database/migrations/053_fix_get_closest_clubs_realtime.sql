-- Migration: Fix get_closest_clubs to use real-time member counts
-- Date: 2025-09-26
-- Description: Ensure get_closest_clubs calculates member counts dynamically

-- Force drop and recreate get_closest_clubs with real-time counts
DROP FUNCTION IF EXISTS get_closest_clubs(FLOAT, FLOAT, INTEGER) CASCADE;

CREATE FUNCTION get_closest_clubs(
  user_lat FLOAT,
  user_long FLOAT,
  limit_count INTEGER DEFAULT 5
)
RETURNS TABLE (
  club_id BIGINT,
  club_name TEXT,
  description TEXT,
  zip_code TEXT,
  city TEXT,
  state TEXT,
  distance_km FLOAT,
  distance_meters FLOAT,
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
    ROUND((extensions.st_distance(
      c.location,
      extensions.st_point(user_long, user_lat)::extensions.geography
    ) / 1000)::numeric, 2) as distance_km,
    extensions.st_distance(
      c.location,
      extensions.st_point(user_long, user_lat)::extensions.geography
    ) as distance_meters,
    (
      SELECT COUNT(*)::INTEGER
      FROM public.club_users cu
      WHERE cu.club_id = c.id
    ) as active_players_count,  -- Calculate dynamically, real-time count
    extensions.st_y(c.location::extensions.geometry) as club_lat,
    extensions.st_x(c.location::extensions.geometry) as club_long
  FROM public.clubs c
  ORDER BY extensions.st_distance(
    c.location,
    extensions.st_point(user_long, user_lat)::extensions.geography
  ) ASC
  LIMIT limit_count;
$$;