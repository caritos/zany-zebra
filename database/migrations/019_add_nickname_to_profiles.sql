-- Migration: Add nickname field to user profiles
-- Date: 2025-09-25
-- Description: Add optional nickname field to profiles for searchable display names

-- Add nickname column to profiles table
ALTER TABLE public.profiles
ADD COLUMN nickname TEXT;

-- Create index for nickname search
CREATE INDEX IF NOT EXISTS idx_profiles_nickname ON public.profiles(nickname) WHERE nickname IS NOT NULL;

-- Update the trigger function to handle nickname updates
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, username, nickname)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'display_name', new.email),
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'nickname' -- Allow nickname from user metadata
  );
  RETURN new;
END;
$$;