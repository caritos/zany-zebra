-- Migration: Document game_scores JSONB structure for sets and tie breakers
-- Date: 2025-09-25
-- Description: Document the expected JSON structure for storing detailed tennis scores

-- The game_scores JSONB field should store match details in this format:
-- {
--   "sets": [
--     {
--       "team1_games": 6,
--       "team2_games": 4,
--       "tie_breaker": null
--     },
--     {
--       "team1_games": 7,
--       "team2_games": 6,
--       "tie_breaker": {
--         "team1_points": 6,
--         "team2_points": 4
--       }
--     },
--     {
--       "team1_games": 6,
--       "team2_games": 3,
--       "tie_breaker": null
--     }
--   ],
--   "match_format": "best_of_3"  // or "best_of_5"
-- }

-- Add a comment to the table to document this structure
COMMENT ON COLUMN public.match_records.game_scores IS
'JSONB storing detailed set-by-set scores including tie breaker information. Format: {"sets": [{"team1_games": 6, "team2_games": 4, "tie_breaker": {"team1_points": 7, "team2_points": 5}}], "match_format": "best_of_3"}';

-- No actual schema changes needed - just documentation