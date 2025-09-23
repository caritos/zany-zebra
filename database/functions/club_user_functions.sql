-- Function to join a club
CREATE OR REPLACE FUNCTION join_club(p_club_id BIGINT)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT,
  membership_id BIGINT
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_user_id UUID;
  v_membership_id BIGINT;
BEGIN
  -- Get the current user ID
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RETURN QUERY SELECT FALSE, 'User not authenticated'::TEXT, NULL::BIGINT;
    RETURN;
  END IF;

  -- Check if user is already a member
  IF EXISTS (
    SELECT 1 FROM public.club_users
    WHERE club_id = p_club_id AND user_id = v_user_id
  ) THEN
    RETURN QUERY SELECT FALSE, 'You are already a member of this club'::TEXT, NULL::BIGINT;
    RETURN;
  END IF;

  -- Check if club exists
  IF NOT EXISTS (SELECT 1 FROM public.clubs WHERE id = p_club_id) THEN
    RETURN QUERY SELECT FALSE, 'Club not found'::TEXT, NULL::BIGINT;
    RETURN;
  END IF;

  -- Create new membership
  INSERT INTO public.club_users (club_id, user_id)
  VALUES (p_club_id, v_user_id)
  RETURNING id INTO v_membership_id;

  RETURN QUERY SELECT TRUE, 'Successfully joined the club!'::TEXT, v_membership_id;
END;
$$;

-- Function to leave a club
CREATE OR REPLACE FUNCTION leave_club(p_club_id BIGINT)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Get the current user ID
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RETURN QUERY SELECT FALSE, 'User not authenticated'::TEXT;
    RETURN;
  END IF;

  -- Check if user is a member
  IF NOT EXISTS (
    SELECT 1 FROM public.club_users
    WHERE club_id = p_club_id AND user_id = v_user_id
  ) THEN
    RETURN QUERY SELECT FALSE, 'You are not a member of this club'::TEXT;
    RETURN;
  END IF;

  -- Delete membership
  DELETE FROM public.club_users
  WHERE club_id = p_club_id AND user_id = v_user_id;

  RETURN QUERY SELECT TRUE, 'You have left the club'::TEXT;
END;
$$;

-- Function to get user's clubs
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
    cu.joined_at,
    c.active_players_count,
    extensions.st_y(c.location::extensions.geometry) as club_lat,
    extensions.st_x(c.location::extensions.geometry) as club_long
  FROM public.club_users cu
  JOIN public.clubs c ON cu.club_id = c.id
  WHERE cu.user_id = auth.uid()
  ORDER BY cu.joined_at DESC;
$$;

-- Function to get members of a club
CREATE OR REPLACE FUNCTION get_club_members(p_club_id BIGINT)
RETURNS TABLE (
  user_id UUID,
  joined_at TIMESTAMPTZ,
  last_active_at TIMESTAMPTZ
)
LANGUAGE SQL
AS $$
  SELECT
    cu.user_id,
    cu.joined_at,
    cu.last_active_at
  FROM public.club_users cu
  WHERE cu.club_id = p_club_id
    AND (
      -- User can see members if they are in the same club
      p_club_id IN (
        SELECT club_id FROM public.club_users
        WHERE user_id = auth.uid()
      )
    )
  ORDER BY cu.joined_at;
$$;

-- Function to check if user is a member of a club
CREATE OR REPLACE FUNCTION is_club_member(p_club_id BIGINT)
RETURNS BOOLEAN
LANGUAGE SQL
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.club_users
    WHERE club_id = p_club_id
    AND user_id = auth.uid()
  );
$$;

-- Function to create a club and automatically add creator as member
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

-- Function to get club member count
CREATE OR REPLACE FUNCTION get_club_member_count(p_club_id BIGINT)
RETURNS INTEGER
LANGUAGE SQL
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.club_users
  WHERE club_id = p_club_id;
$$;