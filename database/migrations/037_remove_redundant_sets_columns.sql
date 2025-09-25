-- Migration: Remove redundant team1_sets and team2_sets columns
-- Date: 2025-09-25
-- Description: Remove team1_sets and team2_sets columns since this data is now stored in game_scores JSONB

-- Remove the redundant sets columns since we now store detailed scores in game_scores JSONB
ALTER TABLE public.match_records DROP COLUMN IF EXISTS team1_sets;
ALTER TABLE public.match_records DROP COLUMN IF EXISTS team2_sets;