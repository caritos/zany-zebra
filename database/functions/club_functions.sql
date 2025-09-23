-- Function to find clubs near a user's location
CREATE OR REPLACE FUNCTION get_clubs_near_location(
  user_lat FLOAT,
  user_long FLOAT,
  max_distance_km FLOAT DEFAULT 25
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
  WHERE extensions.st_dwithin(
    c.location,
    extensions.st_point(user_long, user_lat)::extensions.geography,
    max_distance_km * 1000
  )
  ORDER BY distance_meters ASC;
$$;

-- Function to find the nearest club to a location
CREATE OR REPLACE FUNCTION get_nearest_club(
  user_lat FLOAT,
  user_long FLOAT
)
RETURNS TABLE (
  club_id BIGINT,
  club_name TEXT,
  distance_km FLOAT
)
LANGUAGE SQL
AS $$
  SELECT
    c.id,
    c.name,
    ROUND((extensions.st_distance(
      c.location,
      extensions.st_point(user_long, user_lat)::extensions.geography
    ) / 1000)::numeric, 2) as distance_km
  FROM public.clubs c
  ORDER BY c.location <-> extensions.st_point(user_long, user_lat)::extensions.geography
  LIMIT 1;
$$;

-- Function to find clubs by zip code (exact match)
CREATE OR REPLACE FUNCTION get_clubs_by_zip_code(zip TEXT)
RETURNS TABLE (
  club_id BIGINT,
  club_name TEXT,
  description TEXT,
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
    c.city,
    c.state,
    c.active_players_count
  FROM public.clubs c
  WHERE c.zip_code = zip
  ORDER BY c.active_players_count DESC, c.name;
$$;

-- Function to search clubs by name or city
CREATE OR REPLACE FUNCTION search_clubs(search_term TEXT)
RETURNS TABLE (
  club_id BIGINT,
  club_name TEXT,
  description TEXT,
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
    c.active_players_count
  FROM public.clubs c
  WHERE
    c.name ILIKE '%' || search_term || '%' OR
    c.city ILIKE '%' || search_term || '%' OR
    c.description ILIKE '%' || search_term || '%'
  ORDER BY c.active_players_count DESC, c.name;
$$;

-- Function to check if a club name already exists in a zip code
CREATE OR REPLACE FUNCTION club_name_exists_in_zip(club_name TEXT, zip TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.clubs
    WHERE name = club_name AND zip_code = zip
  );
$$;

-- Function to create a club with geocoded location
-- Note: This function assumes you'll handle geocoding on the client side
CREATE OR REPLACE FUNCTION create_club(
  club_name TEXT,
  zip TEXT,
  city_name TEXT,
  state_name TEXT,
  latitude FLOAT,
  longitude FLOAT,
  club_description TEXT DEFAULT NULL,
  radius_m INTEGER DEFAULT 3000
)
RETURNS TABLE (
  club_id BIGINT,
  success BOOLEAN,
  message TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  new_club_id BIGINT;
BEGIN
  -- Check if a club with the same name already exists in this zip code
  IF club_name_exists_in_zip(club_name, zip) THEN
    RETURN QUERY SELECT NULL::BIGINT, FALSE, 'A club with this name already exists in this zip code'::TEXT;
    RETURN;
  END IF;

  -- Insert the new club
  INSERT INTO public.clubs (
    name,
    description,
    zip_code,
    city,
    state,
    location,
    radius_meters
  )
  VALUES (
    club_name,
    club_description,
    zip,
    city_name,
    state_name,
    extensions.st_point(longitude, latitude)::extensions.geography,
    radius_m
  )
  RETURNING id INTO new_club_id;

  RETURN QUERY SELECT new_club_id, TRUE, 'Club created successfully'::TEXT;
END;
$$;