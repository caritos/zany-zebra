-- Migration: Remove practice match type
-- Date: 2025-09-25
-- Description: Remove practice match type and simplify to only singles/doubles

-- Update the check constraint to only allow 'singles' and 'doubles'
ALTER TABLE public.match_records
DROP CONSTRAINT IF EXISTS match_records_match_type_check;

ALTER TABLE public.match_records
ADD CONSTRAINT match_records_match_type_check
CHECK (match_type IN ('singles', 'doubles'));

-- Update the doubles constraint to remove practice condition
ALTER TABLE public.match_records
DROP CONSTRAINT IF EXISTS match_records_check1;

ALTER TABLE public.match_records
ADD CONSTRAINT match_records_check1 CHECK (
  (match_type = 'singles' AND team1_player2_user_id IS NULL AND team1_player2_guest_name IS NULL AND team2_player2_user_id IS NULL AND team2_player2_guest_name IS NULL) OR
  (match_type = 'doubles' AND
    ((team1_player2_user_id IS NOT NULL AND team1_player2_guest_name IS NULL) OR (team1_player2_user_id IS NULL AND team1_player2_guest_name IS NOT NULL)) AND
    ((team2_player2_user_id IS NOT NULL AND team2_player2_guest_name IS NULL) OR (team2_player2_user_id IS NULL AND team2_player2_guest_name IS NOT NULL))
  )
);