-- Migration: Fix player count trigger and ensure it fires correctly
-- Date: 2025-09-24
-- Description: Ensures the player count trigger fires correctly on insert

-- First, manually update all club counts to be accurate
UPDATE public.clubs c
SET active_players_count = COALESCE((
  SELECT COUNT(*)
  FROM public.club_users cu
  WHERE cu.club_id = c.id
), 0);

-- Drop the existing trigger and function
DROP TRIGGER IF EXISTS update_club_player_count_trigger ON public.club_users;
DROP FUNCTION IF EXISTS update_club_player_count() CASCADE;

-- Create a simpler, more reliable trigger function
CREATE OR REPLACE FUNCTION update_club_player_count()
RETURNS TRIGGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Handle INSERT
  IF TG_OP = 'INSERT' THEN
    SELECT COUNT(*) INTO v_count
    FROM public.club_users
    WHERE club_id = NEW.club_id;

    UPDATE public.clubs
    SET active_players_count = v_count
    WHERE id = NEW.club_id;

    RAISE NOTICE 'Updated club % player count to %', NEW.club_id, v_count;
    RETURN NEW;

  -- Handle DELETE
  ELSIF TG_OP = 'DELETE' THEN
    SELECT COUNT(*) INTO v_count
    FROM public.club_users
    WHERE club_id = OLD.club_id;

    UPDATE public.clubs
    SET active_players_count = v_count
    WHERE id = OLD.club_id;

    RAISE NOTICE 'Updated club % player count to %', OLD.club_id, v_count;
    RETURN OLD;

  -- Handle UPDATE
  ELSIF TG_OP = 'UPDATE' THEN
    -- If club_id changed, update both old and new clubs
    IF OLD.club_id IS DISTINCT FROM NEW.club_id THEN
      -- Update old club
      SELECT COUNT(*) INTO v_count
      FROM public.club_users
      WHERE club_id = OLD.club_id;

      UPDATE public.clubs
      SET active_players_count = v_count
      WHERE id = OLD.club_id;

      -- Update new club
      SELECT COUNT(*) INTO v_count
      FROM public.club_users
      WHERE club_id = NEW.club_id;

      UPDATE public.clubs
      SET active_players_count = v_count
      WHERE id = NEW.club_id;
    END IF;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger with AFTER timing to ensure the row exists
CREATE TRIGGER update_club_player_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.club_users
  FOR EACH ROW
  EXECUTE FUNCTION update_club_player_count();

-- Drop existing function if it exists (in case of re-running migration)
DROP FUNCTION IF EXISTS refresh_all_club_counts();

-- Also create a function to manually refresh all club counts (for debugging)
CREATE OR REPLACE FUNCTION refresh_all_club_counts()
RETURNS TABLE (
  out_club_id BIGINT,
  out_club_name TEXT,
  out_old_count INTEGER,
  out_new_count INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH count_updates AS (
    SELECT
      c.id,
      c.name,
      c.active_players_count as old_count,
      COALESCE((
        SELECT COUNT(*)::INTEGER
        FROM public.club_users cu
        WHERE cu.club_id = c.id
      ), 0) as new_count
    FROM public.clubs c
  )
  SELECT
    cu.id,
    cu.name,
    cu.old_count,
    cu.new_count
  FROM count_updates cu
  WHERE cu.old_count != cu.new_count;

  -- Update all incorrect counts
  UPDATE public.clubs c
  SET active_players_count = COALESCE((
    SELECT COUNT(*)
    FROM public.club_users cu
    WHERE cu.club_id = c.id
  ), 0)
  WHERE c.active_players_count != COALESCE((
    SELECT COUNT(*)
    FROM public.club_users cu
    WHERE cu.club_id = c.id
  ), 0);
END;
$$;

-- Drop and recreate the create_club_with_member function with new return type
DROP FUNCTION IF EXISTS create_club_with_member(TEXT, TEXT, TEXT, TEXT, FLOAT, FLOAT, TEXT, INTEGER);

-- Update the create_club_with_member function to be more explicit
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
  out_club_id BIGINT,
  out_success BOOLEAN,
  out_message TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  new_club_id BIGINT;
  v_user_id UUID;
  v_member_count INTEGER;
BEGIN
  -- Get the current user ID
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RETURN QUERY SELECT NULL::BIGINT as out_club_id, FALSE as out_success, 'User not authenticated'::TEXT as out_message;
    RETURN;
  END IF;

  -- Check if a club with this name already exists in this zip code
  IF club_name_exists_in_zip(club_name, zip) THEN
    RETURN QUERY SELECT NULL::BIGINT as out_club_id, FALSE as out_success, 'A club with this name already exists in this zip code'::TEXT as out_message;
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
    1  -- Set to 1 since we're adding the creator
  )
  RETURNING id INTO new_club_id;

  -- Add creator as a member
  INSERT INTO public.club_users (club_id, user_id)
  VALUES (new_club_id, v_user_id);

  -- Verify the count is correct (this should be 1)
  SELECT COUNT(*) INTO v_member_count
  FROM public.club_users
  WHERE club_id = new_club_id;

  -- Force update the count if it's not 1
  IF v_member_count != 1 THEN
    UPDATE public.clubs
    SET active_players_count = v_member_count
    WHERE id = new_club_id;

    RAISE WARNING 'Club % created with unexpected member count: %', new_club_id, v_member_count;
  END IF;

  RETURN QUERY SELECT new_club_id as out_club_id, TRUE as out_success, 'Club created successfully! You are now a member.'::TEXT as out_message;
END;
$$;

-- Run a final check to ensure all counts are correct
DO $$
DECLARE
  incorrect_count INTEGER;
  club_record RECORD;
BEGIN
  -- Fix all counts one more time
  UPDATE public.clubs c
  SET active_players_count = COALESCE((
    SELECT COUNT(*)
    FROM public.club_users cu
    WHERE cu.club_id = c.id
  ), 0);

  -- Check if any are still incorrect
  SELECT COUNT(*)
  INTO incorrect_count
  FROM public.clubs c
  WHERE c.active_players_count != COALESCE((
    SELECT COUNT(*)
    FROM public.club_users cu
    WHERE cu.club_id = c.id
  ), 0);

  IF incorrect_count > 0 THEN
    RAISE WARNING 'Still found % clubs with incorrect player counts', incorrect_count;

    -- List them
    FOR club_record IN
      SELECT
        c.id,
        c.name,
        c.active_players_count as shown_count,
        (SELECT COUNT(*) FROM public.club_users cu WHERE cu.club_id = c.id) as actual_count
      FROM public.clubs c
      WHERE c.active_players_count != (
        SELECT COUNT(*) FROM public.club_users cu WHERE cu.club_id = c.id
      )
    LOOP
      RAISE WARNING 'Club % (%) shows % players but has % members',
        club_record.id, club_record.name, club_record.shown_count, club_record.actual_count;
    END LOOP;
  ELSE
    RAISE NOTICE 'All club player counts are now correct!';
  END IF;
END;
$$;