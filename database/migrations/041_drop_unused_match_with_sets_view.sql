-- Migration: Drop unused match_with_sets view
-- Date: 2025-09-26
-- Description: Remove the match_with_sets view since it's not being used in the application

-- Check if the view exists first
DO $$
DECLARE
  view_exists BOOLEAN := FALSE;
BEGIN
  -- Check if view exists
  SELECT EXISTS (
    SELECT FROM information_schema.views
    WHERE table_schema = 'public'
    AND table_name = 'match_with_sets'
  ) INTO view_exists;

  IF view_exists THEN
    RAISE NOTICE 'Found match_with_sets view, dropping it...';
  ELSE
    RAISE NOTICE 'match_with_sets view does not exist, nothing to drop';
  END IF;
END;
$$;

-- Drop the unused view
DROP VIEW IF EXISTS public.match_with_sets CASCADE;

-- Revoke any permissions that were granted to the view
-- (This should happen automatically with CASCADE, but being explicit)
DO $$
BEGIN
  -- Try to revoke permissions, but don't fail if they don't exist
  BEGIN
    REVOKE SELECT ON public.match_with_sets FROM authenticated;
  EXCEPTION
    WHEN undefined_table THEN
      -- View doesn't exist, nothing to revoke
      NULL;
  END;

  RAISE NOTICE 'Dropped match_with_sets view and cleaned up permissions';
END;
$$;

-- Show remaining match-related objects for verification
SELECT
  'Remaining match-related objects:' as info,
  schemaname,
  tablename as name,
  'table' as type
FROM pg_tables
WHERE schemaname = 'public'
AND tablename LIKE '%match%'

UNION ALL

SELECT
  'Remaining match-related objects:' as info,
  schemaname,
  viewname as name,
  'view' as type
FROM pg_views
WHERE schemaname = 'public'
AND viewname LIKE '%match%'

ORDER BY type, name;