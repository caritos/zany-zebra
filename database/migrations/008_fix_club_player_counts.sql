-- Migration: Fix club player counts and ensure trigger works correctly
-- Date: 2025-09-24
-- Description: Ensures club player counts are accurate and trigger functions properly

-- First, let's fix any existing clubs that have incorrect player counts
UPDATE public.clubs c
SET active_players_count = (
  SELECT COUNT(*)
  FROM public.club_users cu
  WHERE cu.club_id = c.id
)
WHERE c.active_players_count != (
  SELECT COUNT(*)
  FROM public.club_users cu
  WHERE cu.club_id = c.id
);

-- Drop and recreate the trigger function to ensure it works correctly
DROP TRIGGER IF EXISTS update_club_player_count_trigger ON public.club_users;
DROP FUNCTION IF EXISTS update_club_player_count();

-- Create an improved trigger function that handles all cases properly
CREATE OR REPLACE FUNCTION update_club_player_count()
RETURNS TRIGGER AS $$
BEGIN
  -- For INSERT and UPDATE operations
  IF TG_OP IN ('INSERT', 'UPDATE') THEN
    -- Update the count for the new club
    UPDATE public.clubs
    SET active_players_count = (
      SELECT COUNT(*)
      FROM public.club_users
      WHERE club_id = NEW.club_id
    )
    WHERE id = NEW.club_id;

    -- If UPDATE and club_id changed, update the old club too
    IF TG_OP = 'UPDATE' AND OLD.club_id != NEW.club_id THEN
      UPDATE public.clubs
      SET active_players_count = (
        SELECT COUNT(*)
        FROM public.club_users
        WHERE club_id = OLD.club_id
      )
      WHERE id = OLD.club_id;
    END IF;

    RETURN NEW;

  -- For DELETE operations
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.clubs
    SET active_players_count = (
      SELECT COUNT(*)
      FROM public.club_users
      WHERE club_id = OLD.club_id
    )
    WHERE id = OLD.club_id;

    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER update_club_player_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.club_users
  FOR EACH ROW
  EXECUTE FUNCTION update_club_player_count();

-- Also ensure the create_club_with_member function properly updates the count
-- by adding an explicit count update at the end
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

  -- Insert the new club with initial count of 0
  INSERT INTO public.clubs (
    name,
    description,
    zip_code,
    city,
    state,
    location,
    radius_meters,
    active_players_count
  )
  VALUES (
    club_name,
    club_description,
    zip,
    city_name,
    state_name,
    extensions.st_point(longitude, latitude)::extensions.geography,
    radius_m,
    0  -- Start with 0, will be updated by trigger
  )
  RETURNING id INTO new_club_id;

  -- Add creator as a member
  INSERT INTO public.club_users (club_id, user_id)
  VALUES (new_club_id, v_user_id);

  -- The trigger should have updated the count, but let's ensure it's correct
  -- This is a safety measure in case the trigger didn't fire for some reason
  UPDATE public.clubs
  SET active_players_count = 1
  WHERE id = new_club_id AND active_players_count = 0;

  RETURN QUERY SELECT new_club_id, TRUE, 'Club created successfully! You are now a member.'::TEXT;
END;
$$;

-- Verify all counts are correct after migration
DO $$
DECLARE
  incorrect_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO incorrect_count
  FROM public.clubs c
  WHERE c.active_players_count != (
    SELECT COUNT(*)
    FROM public.club_users cu
    WHERE cu.club_id = c.id
  );

  IF incorrect_count > 0 THEN
    RAISE WARNING 'Found % clubs with incorrect player counts after migration', incorrect_count;
  ELSE
    RAISE NOTICE 'All club player counts are correct!';
  END IF;
END;
$$;