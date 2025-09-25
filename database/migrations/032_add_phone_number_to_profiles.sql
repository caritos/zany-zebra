-- Migration: Add phone number to profiles table
-- Date: 2025-09-25
-- Description: Add optional phone number field to user profiles

-- Add phone_number column to profiles table
ALTER TABLE public.profiles
ADD COLUMN phone_number TEXT;

-- Create index for phone number search (optional, for future use)
CREATE INDEX IF NOT EXISTS idx_profiles_phone_number ON public.profiles(phone_number) WHERE phone_number IS NOT NULL;