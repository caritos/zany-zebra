-- Migration: Fix club functions to use real-time counts (avoiding function signature conflicts)
-- Date: 2025-09-26
-- Description: Update club query functions to calculate member counts dynamically

-- Update the get_closest_clubs function to calculate counts dynamically
DROP FUNCTION IF EXISTS get_closest_clubs(FLOAT, FLOAT, INTEGER);

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
    COALESCE((
      SELECT COUNT(*)::INTEGER
      FROM public.club_users cu
      WHERE cu.club_id = c.id
    ), 0) as active_players_count,  -- Calculate dynamically
    extensions.st_y(c.location::extensions.geometry) as club_lat,
    extensions.st_x(c.location::extensions.geometry) as club_long
  FROM public.clubs c
  ORDER BY extensions.st_distance(
    c.location,
    extensions.st_point(user_long, user_lat)::extensions.geography
  ) ASC
  LIMIT limit_count;
$$;

-- Update get_my_clubs to calculate counts dynamically
DROP FUNCTION IF EXISTS get_my_clubs();

CREATE OR REPLACE FUNCTION get_my_clubs()
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
AS $$
  SELECT
    c.id,
    c.name,
    c.description,
    c.zip_code,
    c.city,
    c.state,
    cu.created_at as joined_at,
    COALESCE((
      SELECT COUNT(*)::INTEGER
      FROM public.club_users cu2
      WHERE cu2.club_id = c.id
    ), 0) as active_players_count,  -- Calculate dynamically
    extensions.st_y(c.location::extensions.geometry) as club_lat,
    extensions.st_x(c.location::extensions.geometry) as club_long
  FROM public.club_users cu
  JOIN public.clubs c ON c.id = cu.club_id
  WHERE cu.user_id = auth.uid()
  ORDER BY cu.created_at DESC;
$$;

-- Create a new search function with a different name to avoid conflicts
CREATE OR REPLACE FUNCTION search_clubs_realtime(search_term TEXT)
RETURNS TABLE (
  club_id BIGINT,
  club_name TEXT,
  club_description TEXT,
  zip_code TEXT,
  city TEXT,
  state TEXT,
  active_players_count INTEGER
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
    COALESCE((
      SELECT COUNT(*)::INTEGER
      FROM public.club_users cu
      WHERE cu.club_id = c.id
    ), 0) as active_players_count  -- Calculate dynamically
  FROM public.clubs c
  WHERE
    c.name ILIKE '%' || search_term || '%' OR
    c.city ILIKE '%' || search_term || '%' OR
    c.zip_code ILIKE '%' || search_term || '%'
  ORDER BY c.name;
$$;

-- Drop the old search function more aggressively
DO $$
BEGIN
  -- Try multiple variations to drop the old function
  EXECUTE 'DROP FUNCTION IF EXISTS search_clubs CASCADE';
  EXECUTE 'DROP FUNCTION IF EXISTS public.search_clubs CASCADE';
  EXECUTE 'DROP FUNCTION IF EXISTS search_clubs(text) CASCADE';
  EXECUTE 'DROP FUNCTION IF EXISTS search_clubs(varchar) CASCADE';
  EXECUTE 'DROP FUNCTION IF EXISTS search_clubs(character varying) CASCADE';
EXCEPTION
  WHEN OTHERS THEN
    -- Ignore errors if function doesn't exist or can't be dropped
    NULL;
END $$;

-- Now create the new search function with the original name
CREATE OR REPLACE FUNCTION search_clubs(search_term TEXT)
RETURNS TABLE (
  club_id BIGINT,
  club_name TEXT,
  club_description TEXT,
  zip_code TEXT,
  city TEXT,
  state TEXT,
  active_players_count INTEGER
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
    COALESCE((
      SELECT COUNT(*)::INTEGER
      FROM public.club_users cu
      WHERE cu.club_id = c.id
    ), 0) as active_players_count  -- Calculate dynamically
  FROM public.clubs c
  WHERE
    c.name ILIKE '%' || search_term || '%' OR
    c.city ILIKE '%' || search_term || '%' OR
    c.zip_code ILIKE '%' || search_term || '%'
  ORDER BY c.name;
$$;