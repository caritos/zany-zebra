-- Migration: Add function to get closest clubs regardless of distance
-- Date: 2025-09-26
-- Description: Creates a function that returns the N closest clubs without distance filtering

-- Function to get the closest N clubs regardless of distance
CREATE OR REPLACE FUNCTION get_closest_clubs(
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
    c.active_players_count,
    extensions.st_y(c.location::extensions.geometry) as club_lat,
    extensions.st_x(c.location::extensions.geometry) as club_long
  FROM public.clubs c
  ORDER BY extensions.st_distance(
    c.location,
    extensions.st_point(user_long, user_lat)::extensions.geography
  ) ASC
  LIMIT limit_count;
$$;