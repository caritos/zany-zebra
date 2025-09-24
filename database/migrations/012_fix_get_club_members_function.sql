-- Migration: Fix get_club_members_with_ratings function
-- Date: 2025-09-24
-- Description: Simplify the function to avoid structure mismatch errors

-- Drop the existing function
DROP FUNCTION IF EXISTS get_club_members_with_ratings(BIGINT);

-- Create a simpler version without auth.users access
CREATE OR REPLACE FUNCTION get_club_members_with_ratings(p_club_id BIGINT)
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  display_name TEXT,
  elo_rating INTEGER,
  matches_played INTEGER,
  matches_won INTEGER,
  matches_lost INTEGER,
  win_rate FLOAT,
  peak_rating INTEGER,
  last_match_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is a member of the club
  IF NOT EXISTS (
    SELECT 1 FROM public.club_users
    WHERE club_id = p_club_id AND user_id = auth.uid()
  ) THEN
    RETURN; -- Return empty result set
  END IF;

  RETURN QUERY
  SELECT
    cu.user_id,
    -- For now, use user_id as email since we can't access auth.users easily
    cu.user_id::TEXT as email,
    -- Use a default display name for now
    COALESCE('Player ' || SUBSTRING(cu.user_id::TEXT, 1, 8), 'Anonymous') as display_name,
    COALESCE(ur.elo_rating, 1200),
    COALESCE(ur.matches_played, 0),
    COALESCE(ur.matches_won, 0),
    COALESCE(ur.matches_lost, 0),
    CASE
      WHEN COALESCE(ur.matches_played, 0) > 0 THEN
        (COALESCE(ur.matches_won, 0)::FLOAT / ur.matches_played * 100)
      ELSE 0::FLOAT
    END,
    COALESCE(ur.peak_rating, 1200),
    ur.last_match_at,
    cu.joined_at
  FROM public.club_users cu
  LEFT JOIN public.user_ratings ur ON ur.user_id = cu.user_id AND ur.club_id = cu.club_id
  WHERE cu.club_id = p_club_id
  ORDER BY COALESCE(ur.elo_rating, 1200) DESC, cu.joined_at;
END;
$$;

-- Create a view to get user display info (can be used later if needed)
CREATE OR REPLACE VIEW public.user_display_info AS
SELECT
  u.id as user_id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'display_name', u.email) as display_name
FROM auth.users u;

-- Grant permissions on the view
GRANT SELECT ON public.user_display_info TO authenticated;

-- Alternative: Create a function that gets user display info with proper permissions
CREATE OR REPLACE FUNCTION get_user_display_name(p_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_display_name TEXT;
BEGIN
  SELECT COALESCE(raw_user_meta_data->>'display_name', email, 'Player ' || SUBSTRING(id::TEXT, 1, 8))
  INTO v_display_name
  FROM auth.users
  WHERE id = p_user_id;

  RETURN COALESCE(v_display_name, 'Anonymous');
END;
$$;

-- Now create the proper version using the helper function
DROP FUNCTION IF EXISTS get_club_members_with_ratings(BIGINT);

CREATE OR REPLACE FUNCTION get_club_members_with_ratings(p_club_id BIGINT)
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  display_name TEXT,
  elo_rating INTEGER,
  matches_played INTEGER,
  matches_won INTEGER,
  matches_lost INTEGER,
  win_rate FLOAT,
  peak_rating INTEGER,
  last_match_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if user is a member of the club
  IF NOT EXISTS (
    SELECT 1 FROM public.club_users
    WHERE club_id = p_club_id AND user_id = auth.uid()
  ) THEN
    RETURN; -- Return empty result set
  END IF;

  RETURN QUERY
  SELECT
    cu.user_id,
    get_user_display_name(cu.user_id) as email,  -- Using display name as email for now
    get_user_display_name(cu.user_id) as display_name,
    COALESCE(ur.elo_rating, 1200),
    COALESCE(ur.matches_played, 0),
    COALESCE(ur.matches_won, 0),
    COALESCE(ur.matches_lost, 0),
    CASE
      WHEN COALESCE(ur.matches_played, 0) > 0 THEN
        ROUND((COALESCE(ur.matches_won, 0)::NUMERIC * 100.0 / ur.matches_played), 1)::FLOAT
      ELSE 0.0::FLOAT
    END,
    COALESCE(ur.peak_rating, 1200),
    ur.last_match_at,
    cu.joined_at
  FROM public.club_users cu
  LEFT JOIN public.user_ratings ur ON ur.user_id = cu.user_id AND ur.club_id = cu.club_id
  WHERE cu.club_id = p_club_id
  ORDER BY COALESCE(ur.elo_rating, 1200) DESC, cu.joined_at;
END;
$$;