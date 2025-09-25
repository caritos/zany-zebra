-- Migration: Final fix for ambiguous user_id with explicit table prefixes
-- Date: 2025-09-25
-- Description: Use explicit table prefixes for ALL columns to eliminate any ambiguity

-- Drop the existing function
DROP FUNCTION IF EXISTS get_club_members_with_ratings(BIGINT);

-- Create completely unambiguous function with explicit table prefixes
CREATE OR REPLACE FUNCTION get_club_members_with_ratings(p_club_id BIGINT)
RETURNS TABLE (
  user_id UUID,
  email TEXT,
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
  -- Check if user is a member of the club (explicit table prefix)
  IF NOT EXISTS (
    SELECT 1 FROM public.club_users check_membership
    WHERE check_membership.club_id = p_club_id AND check_membership.user_id = auth.uid()
  ) THEN
    RETURN; -- Return empty result set
  END IF;

  RETURN QUERY
  SELECT
    main_club_users.user_id,
    main_profiles.email,
    main_profiles.nickname,
    COALESCE(main_user_ratings.elo_rating, 1200),
    COALESCE(main_user_ratings.matches_played, 0),
    COALESCE(main_user_ratings.matches_won, 0),
    COALESCE(main_user_ratings.matches_lost, 0),
    CASE
      WHEN COALESCE(main_user_ratings.matches_played, 0) > 0 THEN
        ROUND((COALESCE(main_user_ratings.matches_won, 0)::NUMERIC * 100.0 / main_user_ratings.matches_played), 1)::FLOAT
      ELSE 0.0::FLOAT
    END,
    COALESCE(main_user_ratings.peak_rating, 1200),
    main_user_ratings.last_match_at,
    main_club_users.joined_at
  FROM public.club_users AS main_club_users
  LEFT JOIN public.profiles AS main_profiles ON main_profiles.id = main_club_users.user_id
  LEFT JOIN public.user_ratings AS main_user_ratings ON main_user_ratings.user_id = main_club_users.user_id AND main_user_ratings.club_id = main_club_users.club_id
  WHERE main_club_users.club_id = p_club_id
  ORDER BY COALESCE(main_user_ratings.elo_rating, 1200) DESC, main_club_users.joined_at;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_club_members_with_ratings(BIGINT) TO authenticated;