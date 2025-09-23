-- Add zip_code column to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS zip_code TEXT;

-- Add index for zip code lookups
CREATE INDEX IF NOT EXISTS idx_profiles_zip_code ON public.profiles(zip_code);

-- Add a function to update user's zip code
CREATE OR REPLACE FUNCTION update_user_zip_code(new_zip_code TEXT)
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

  -- Validate zip code format (US zip code)
  IF new_zip_code IS NOT NULL AND NOT (new_zip_code ~ '^\d{5}(-\d{4})?$') THEN
    RETURN QUERY SELECT FALSE, 'Please enter a valid zip code (e.g., 12345 or 12345-6789)'::TEXT;
    RETURN;
  END IF;

  -- Update the user's zip code
  UPDATE public.profiles
  SET zip_code = new_zip_code, updated_at = NOW()
  WHERE id = v_user_id;

  -- Check if the update was successful
  IF FOUND THEN
    RETURN QUERY SELECT TRUE, 'Zip code updated successfully'::TEXT;
  ELSE
    -- If profile doesn't exist, create it
    INSERT INTO public.profiles (id, zip_code, email, created_at, updated_at)
    VALUES (v_user_id, new_zip_code, auth.email(), NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET
      zip_code = new_zip_code,
      updated_at = NOW();

    RETURN QUERY SELECT TRUE, 'Zip code updated successfully'::TEXT;
  END IF;
END;
$$;

-- Function to get user's zip code
CREATE OR REPLACE FUNCTION get_user_zip_code()
RETURNS TEXT
LANGUAGE SQL
AS $$
  SELECT zip_code
  FROM public.profiles
  WHERE id = auth.uid();
$$;