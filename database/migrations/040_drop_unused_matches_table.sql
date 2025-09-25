-- Migration: Drop unused matches table
-- Date: 2025-09-26
-- Description: Remove the old matches table that was replaced by match_records and match_sets

-- First check if the table exists and if it has any data
DO $$
DECLARE
  table_exists BOOLEAN := FALSE;
  record_count INTEGER := 0;
BEGIN
  -- Check if table exists
  SELECT EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'matches'
  ) INTO table_exists;

  IF table_exists THEN
    -- Count records in the table
    SELECT COUNT(*) FROM public.matches INTO record_count;

    RAISE NOTICE 'Found matches table with % records', record_count;

    IF record_count > 0 THEN
      RAISE NOTICE 'WARNING: matches table contains data. You may want to migrate this data first.';
      RAISE NOTICE 'Current match_records table has % records', (SELECT COUNT(*) FROM public.match_records);
    ELSE
      RAISE NOTICE 'matches table is empty, safe to drop';
    END IF;
  ELSE
    RAISE NOTICE 'matches table does not exist, nothing to drop';
  END IF;
END;
$$;

-- Drop the matches table and all its dependencies
DO $$
BEGIN
  DROP TABLE IF EXISTS public.matches CASCADE;

  -- Drop any functions that might reference the old matches table
  DROP FUNCTION IF EXISTS record_match CASCADE;
  DROP FUNCTION IF EXISTS get_club_matches CASCADE;

  -- Clean up any orphaned indexes that might have been left behind
  -- (These should be dropped automatically with CASCADE, but just in case)
  DROP INDEX IF EXISTS idx_matches_club_date;
  DROP INDEX IF EXISTS idx_matches_player1;
  DROP INDEX IF EXISTS idx_matches_player2;

  RAISE NOTICE 'Dropped matches table and related objects';
END;
$$;

-- Show current table structure for verification
SELECT
  'Remaining match-related tables:' as info,
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_name LIKE '%match%'
ORDER BY table_name;