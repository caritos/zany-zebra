-- Migration: Drop check constraint that prevents null winners
-- Date: 2025-09-25
-- Description: Remove check constraint that requires winner to be non-null

-- Drop the check constraint that prevents null winners
ALTER TABLE public.match_records DROP CONSTRAINT IF EXISTS match_records_check4;