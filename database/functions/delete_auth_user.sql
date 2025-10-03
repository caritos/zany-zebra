-- Function to delete auth user directly
-- This bypasses the Auth API constraints
CREATE OR REPLACE FUNCTION delete_auth_user(target_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = auth, public
AS $$
BEGIN
  -- Delete from auth.users
  DELETE FROM auth.users WHERE id = target_user_id;

  RETURN json_build_object(
    'success', true,
    'message', 'Auth user deleted successfully'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Failed to delete auth user: ' || SQLERRM
    );
END;
$$;

-- Grant execute permission to service role
GRANT EXECUTE ON FUNCTION delete_auth_user(UUID) TO service_role;

COMMENT ON FUNCTION delete_auth_user(UUID) IS 'Deletes user from auth.users table directly. Only callable by service role.';
