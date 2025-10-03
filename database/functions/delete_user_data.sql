-- Function to delete user account data
-- This is required for App Store compliance with Guideline 5.1.1(v)
-- Note: The actual auth.users deletion is handled client-side via admin API

CREATE OR REPLACE FUNCTION delete_user_data(target_user_id UUID DEFAULT NULL)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID;
BEGIN
  -- If target_user_id is provided, use it (for admin/service role calls)
  -- Otherwise, get the current authenticated user's ID
  IF target_user_id IS NOT NULL THEN
    current_user_id := target_user_id;
  ELSE
    current_user_id := auth.uid();
  END IF;

  -- Check if user ID is valid
  IF current_user_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'message', 'User not authenticated'
    );
  END IF;

  -- Anonymize user in match records by converting to guest player
  -- This preserves the match history while removing the user's identity
  -- Note: All matches use team naming (team1_player1, etc.) even for singles

  -- Anonymize user in team1_player1 position
  UPDATE public.match_records
  SET team1_player1_user_id = NULL,
      team1_player1_guest_name = 'Deleted User'
  WHERE team1_player1_user_id = current_user_id;

  -- Anonymize user in team1_player2 position
  UPDATE public.match_records
  SET team1_player2_user_id = NULL,
      team1_player2_guest_name = 'Deleted User'
  WHERE team1_player2_user_id = current_user_id;

  -- Anonymize user in team2_player1 position
  UPDATE public.match_records
  SET team2_player1_user_id = NULL,
      team2_player1_guest_name = 'Deleted User'
  WHERE team2_player1_user_id = current_user_id;

  -- Anonymize user in team2_player2 position
  UPDATE public.match_records
  SET team2_player2_user_id = NULL,
      team2_player2_guest_name = 'Deleted User'
  WHERE team2_player2_user_id = current_user_id;

  -- Update recorded_by for matches where this user was the recorder
  -- Set it to one of the remaining players in the match
  UPDATE public.match_records
  SET recorded_by = COALESCE(
    team1_player1_user_id,
    team1_player2_user_id,
    team2_player1_user_id,
    team2_player2_user_id
  )
  WHERE recorded_by = current_user_id
    AND (team1_player1_user_id IS NOT NULL
      OR team1_player2_user_id IS NOT NULL
      OR team2_player1_user_id IS NOT NULL
      OR team2_player2_user_id IS NOT NULL);

  -- Delete matches recorded by this user where all players are guests
  -- (no registered users to reassign recorded_by to)
  DELETE FROM public.match_records
  WHERE recorded_by = current_user_id;

  -- Delete all user ratings (ELO scores specific to this user)
  DELETE FROM public.user_ratings
  WHERE user_id = current_user_id;

  -- Delete all club memberships
  -- Note: Clubs are owned collectively by all members, not by individuals
  -- Removing one member (even the creator) doesn't delete the club itself
  -- This preserves the community for remaining and future members
  DELETE FROM public.club_users
  WHERE user_id = current_user_id;

  -- Delete user profile
  DELETE FROM public.profiles
  WHERE id = current_user_id;

  -- Return success - auth.users deletion will be handled separately
  RETURN json_build_object(
    'success', true,
    'message', 'User data deleted successfully'
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Failed to delete user data: ' || SQLERRM
    );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_user_data() TO authenticated;

-- Add comment
COMMENT ON FUNCTION delete_user_data() IS 'Deletes all user-associated data. Auth deletion is handled separately via admin API. Required for App Store compliance.';
