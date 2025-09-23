-- Migration: Update club name validation to allow multiple clubs per zip code
-- Date: 2025-09-23
-- Description: Updates the club_name_exists_in_zip function to only prevent
-- duplicate club names within the same zip code, allowing multiple clubs
-- with different names in the same zip code.

-- Update function to only check for duplicate club names within the same zip code
CREATE OR REPLACE FUNCTION club_name_exists_in_zip(club_name TEXT, zip TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.clubs
    WHERE name = club_name AND zip_code = zip
  );
$$;