-- Migration: Fix null match dates
-- Date: 2025-09-29
-- Description: Updates match_records with null match_date to use created_at date

-- Update any matches with null match_date to use their created_at date
UPDATE public.match_records
SET match_date = created_at::date
WHERE match_date IS NULL;

-- Make match_date NOT NULL going forward (if not already)
ALTER TABLE public.match_records
ALTER COLUMN match_date SET NOT NULL;

-- Add comment
COMMENT ON COLUMN public.match_records.match_date IS 'Date when the match was played (required field)';