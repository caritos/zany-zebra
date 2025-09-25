-- Migration: Update get_club_members_with_ratings to include nickname and username
-- Date: 2025-09-25
-- Description: Add nickname and username fields to club members query for better player search

-- Drop the existing function
DROP FUNCTION IF EXISTS get_club_members_with_ratings(BIGINT);

-- Create updated function that includes nickname and username from profiles table
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
    COALESCE(p.email, au.email, 'Unknown') as email,
    COALESCE(p.display_name, au.raw_user_meta_data->>'display_name', au.email, 'Player ' || SUBSTRING(cu.user_id::TEXT, 1, 8)) as display_name,
    p.username,
    p.nickname,
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
  LEFT JOIN public.profiles p ON p.id = cu.user_id
  LEFT JOIN auth.users au ON au.id = cu.user_id
  WHERE cu.club_id = p_club_id
  ORDER BY COALESCE(ur.elo_rating, 1200) DESC, cu.joined_at;
END;
$$;