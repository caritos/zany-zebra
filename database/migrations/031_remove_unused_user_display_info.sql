-- Migration: Remove unused user_display_info view
-- Date: 2025-09-25
-- Description: Clean up unused view and function that were never actually used

-- Drop unused view
DROP VIEW IF EXISTS public.user_display_info;

-- Drop unused function (also never used)
DROP FUNCTION IF EXISTS get_user_display_name(UUID);