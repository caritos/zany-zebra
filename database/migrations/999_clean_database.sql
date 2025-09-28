-- Migration: Clean all user data from database
-- Date: 2025-01-28
-- Description: Removes all user-generated content while preserving schema structure

-- Disable triggers temporarily to avoid constraint issues
SET session_replication_role = replica;

-- Clean all user data in dependency order (children first, then parents)

-- 1. Clean match-related data first
TRUNCATE TABLE IF EXISTS public.match_sets CASCADE;
TRUNCATE TABLE IF EXISTS public.match_records CASCADE;

-- 2. Clean guest players
TRUNCATE TABLE IF EXISTS public.guest_players CASCADE;

-- 3. Clean club memberships (this will trigger club player count updates)
TRUNCATE TABLE IF EXISTS public.club_users CASCADE;

-- 4. Clean clubs
TRUNCATE TABLE IF EXISTS public.clubs CASCADE;

-- 5. Clean user profiles (but keep auth.users intact for authentication)
TRUNCATE TABLE IF EXISTS public.profiles CASCADE;

-- 6. Reset any sequences to start fresh
ALTER SEQUENCE IF EXISTS public.clubs_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS public.club_users_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS public.match_records_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS public.match_sets_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS public.guest_players_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS public.profiles_id_seq RESTART WITH 1;

-- Re-enable triggers
SET session_replication_role = DEFAULT;

-- Log the cleanup
INSERT INTO public.migration_log (migration_name, executed_at)
VALUES ('999_clean_database', NOW())
ON CONFLICT DO NOTHING;

-- Success message
SELECT 'Database successfully cleaned! All user data has been removed.' AS result;