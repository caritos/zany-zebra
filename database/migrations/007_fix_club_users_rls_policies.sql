-- Migration: Fix infinite recursion in club_users RLS policies
-- Date: 2025-09-23
-- Description: Fixes the circular dependency in club_users RLS policies

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view members in their clubs" ON public.club_users;

-- Create a simpler policy that doesn't cause recursion
-- Users can view their own club memberships
CREATE POLICY "Users can view their own memberships"
  ON public.club_users FOR SELECT
  USING (auth.uid() = user_id);

-- Note: If you need users to see other members in their clubs,
-- this should be handled through database functions with SECURITY DEFINER
-- rather than RLS policies to avoid recursion.