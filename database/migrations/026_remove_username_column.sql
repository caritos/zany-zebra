-- Migration: Remove username column and fix function
-- Date: 2025-09-25
-- Description: Remove username from profiles table and update function accordingly

-- Remove username column from profiles table (if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_name='profiles' AND column_name='username') THEN
        ALTER TABLE public.profiles DROP COLUMN username;
    END IF;
END $$;

-- Drop the existing function
DROP FUNCTION IF EXISTS get_club_members_with_ratings(BIGINT);

-- Create clean function without username
CREATE OR REPLACE FUNCTION get_club_members_with_ratings(p_club_id BIGINT)
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  display_name TEXT,
  username TEXT,
  nickname TEXT,
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
    SELECT 1 FROM public.club_users club_users
    WHERE club_users.club_id = p_club_id AND club_users.user_id = auth.uid()
  ) THEN
    RETURN; -- Return empty result set
  END IF;

  RETURN QUERY
  SELECT
    club_users.user_id,
    COALESCE(profiles.email, auth_users.email, 'Unknown'),
    COALESCE(profiles.email, auth_users.email, 'Unknown'), -- display_name = email
    split_part(COALESCE(profiles.email, auth_users.email), '@', 1), -- username derived from email
    profiles.nickname,
    COALESCE(user_ratings.elo_rating, 1200),
    COALESCE(user_ratings.matches_played, 0),
    COALESCE(user_ratings.matches_won, 0),
    COALESCE(user_ratings.matches_lost, 0),
    CASE
      WHEN COALESCE(user_ratings.matches_played, 0) > 0 THEN
        ROUND((COALESCE(user_ratings.matches_won, 0)::NUMERIC * 100.0 / user_ratings.matches_played), 1)::FLOAT
      ELSE 0.0::FLOAT
    END,
    COALESCE(user_ratings.peak_rating, 1200),
    user_ratings.last_match_at,
    club_users.joined_at
  FROM public.club_users
  LEFT JOIN public.user_ratings ON user_ratings.user_id = club_users.user_id AND user_ratings.club_id = club_users.club_id
  LEFT JOIN public.profiles ON profiles.id = club_users.user_id
  LEFT JOIN auth.users AS auth_users ON auth_users.id = club_users.user_id
  WHERE club_users.club_id = p_club_id
  ORDER BY COALESCE(user_ratings.elo_rating, 1200) DESC, club_users.joined_at;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_club_members_with_ratings(BIGINT) TO authenticated;