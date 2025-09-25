-- Migration: Add username column to profiles table
-- Date: 2025-09-25
-- Description: Add missing username column to profiles table

-- Add username column to profiles table (if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='profiles' AND column_name='username') THEN
        ALTER TABLE public.profiles ADD COLUMN username TEXT;
    END IF;
END $$;

-- Update existing profiles to have username derived from email
UPDATE public.profiles
SET username = split_part(email, '@', 1)
WHERE username IS NULL AND email IS NOT NULL;

-- Create index for username search (if it doesn't exist)
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username) WHERE username IS NOT NULL;