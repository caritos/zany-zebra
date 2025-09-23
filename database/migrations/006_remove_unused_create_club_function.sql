-- Migration: Remove unused create_club function and fix validation
-- Date: 2025-09-23
-- Description: Removes the unused create_club function and ensures
-- create_club_with_member allows multiple clubs per zip code

-- Drop the unused create_club function
DROP FUNCTION IF EXISTS create_club(TEXT, TEXT, TEXT, TEXT, FLOAT, FLOAT, TEXT);

-- Ensure the validation function is correct
CREATE OR REPLACE FUNCTION club_name_exists_in_zip(club_name TEXT, zip TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.clubs
    WHERE name = club_name AND zip_code = zip
  );
$$;

-- Update the create_club_with_member function to use correct validation
CREATE OR REPLACE FUNCTION create_club_with_member(
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
  v_user_id UUID;
BEGIN
  -- Get the current user ID
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RETURN QUERY SELECT NULL::BIGINT, FALSE, 'User not authenticated'::TEXT;
    RETURN;
  END IF;

  -- Check if a club with this name already exists in this zip code
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

  -- Add creator as a member
  INSERT INTO public.club_users (club_id, user_id)
  VALUES (new_club_id, v_user_id);

  RETURN QUERY SELECT new_club_id, TRUE, 'Club created successfully! You are now a member.'::TEXT;
END;
$$;