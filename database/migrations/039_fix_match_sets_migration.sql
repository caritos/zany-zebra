-- Migration: Fix match_sets migration with better parsing
-- Date: 2025-09-26
-- Description: Re-migrate game_scores data to match_sets table with improved parsing and debugging

-- Skip if match_sets table doesn't exist (migration 038 wasn't run)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'match_sets') THEN
        RAISE EXCEPTION 'match_sets table does not exist. Please run migration 038 first.';
    END IF;
END;
$$;

-- Drop and recreate the migration function with better debugging
CREATE OR REPLACE FUNCTION migrate_game_scores_to_sets()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  match_record RECORD;
  set_data JSONB;
  set_num INTEGER;
  team1_g INTEGER;
  team2_g INTEGER;
  team1_tb INTEGER;
  team2_tb INTEGER;
  set_winner INTEGER;
  array_element JSONB;
BEGIN
  -- First, delete existing migrated sets to avoid duplicates
  DELETE FROM public.match_sets;

  -- Loop through all matches with game_scores
  FOR match_record IN
    SELECT id, game_scores, winner
    FROM public.match_records
    WHERE game_scores IS NOT NULL
  LOOP
    BEGIN
      RAISE NOTICE 'Processing match % with game_scores: %', match_record.id, match_record.game_scores;

      -- Try to parse as new format {"sets": [...]}
      IF match_record.game_scores ? 'sets' THEN
        RAISE NOTICE 'Found sets format';
        FOR set_num IN 1..jsonb_array_length(match_record.game_scores->'sets')
        LOOP
          set_data := (match_record.game_scores->'sets')->(set_num - 1);
          team1_g := COALESCE((set_data->>'team1_games')::INTEGER, 0);
          team2_g := COALESCE((set_data->>'team2_games')::INTEGER, 0);

          -- Check for tiebreaker
          IF set_data ? 'tie_breaker' AND set_data->'tie_breaker' IS NOT NULL THEN
            team1_tb := (set_data->'tie_breaker'->>'team1_points')::INTEGER;
            team2_tb := (set_data->'tie_breaker'->>'team2_points')::INTEGER;
          ELSE
            team1_tb := NULL;
            team2_tb := NULL;
          END IF;

          -- Determine winner
          IF team1_g > team2_g THEN
            set_winner := 1;
          ELSE
            set_winner := 2;
          END IF;

          RAISE NOTICE 'Inserting set %: %-%% (winner: %)', set_num, team1_g, team2_g, set_winner;

          -- Insert the set
          INSERT INTO public.match_sets (
            match_id, set_number, team1_games, team2_games,
            team1_tiebreak_points, team2_tiebreak_points, winner
          ) VALUES (
            match_record.id, set_num, team1_g, team2_g,
            team1_tb, team2_tb, set_winner
          );
        END LOOP;

      -- Try to parse as simple array format [[6,4], [7,6]]
      ELSIF jsonb_typeof(match_record.game_scores) = 'array' THEN
        RAISE NOTICE 'Found simple array format with % elements', jsonb_array_length(match_record.game_scores);
        FOR set_num IN 0..(jsonb_array_length(match_record.game_scores) - 1)
        LOOP
          array_element := match_record.game_scores->set_num;
          RAISE NOTICE 'Processing array element %: %', set_num, array_element;

          IF jsonb_typeof(array_element) = 'array' AND jsonb_array_length(array_element) = 2 THEN
            team1_g := (array_element->>0)::INTEGER;
            team2_g := (array_element->>1)::INTEGER;

            -- Check if it's a tiebreak set (7-6 or 6-7)
            IF (team1_g = 7 AND team2_g = 6) OR (team1_g = 6 AND team2_g = 7) THEN
              team1_tb := NULL;
              team2_tb := NULL;
            ELSE
              team1_tb := NULL;
              team2_tb := NULL;
            END IF;

            -- Determine winner
            IF team1_g > team2_g THEN
              set_winner := 1;
            ELSE
              set_winner := 2;
            END IF;

            RAISE NOTICE 'Inserting set %: %-%% (winner: %)', set_num + 1, team1_g, team2_g, set_winner;

            -- Insert the set
            INSERT INTO public.match_sets (
              match_id, set_number, team1_games, team2_games,
              team1_tiebreak_points, team2_tiebreak_points, winner
            ) VALUES (
              match_record.id, set_num + 1, team1_g, team2_g,
              team1_tb, team2_tb, set_winner
            );
          END IF;
        END LOOP;
      ELSE
        RAISE NOTICE 'Unknown game_scores format for match %, type: %', match_record.id, jsonb_typeof(match_record.game_scores);
      END IF;

    EXCEPTION
      WHEN OTHERS THEN
        -- Log error and continue with next match
        RAISE NOTICE 'Failed to migrate match %: %', match_record.id, SQLERRM;
    END;
  END LOOP;

  -- For matches without game_scores, create a basic set based on the winner
  FOR match_record IN
    SELECT id, winner
    FROM public.match_records
    WHERE game_scores IS NULL
    AND NOT EXISTS (
      SELECT 1 FROM public.match_sets WHERE match_id = match_records.id
    )
  LOOP
    -- Create a single placeholder set
    INSERT INTO public.match_sets (
      match_id, set_number, team1_games, team2_games,
      team1_tiebreak_points, team2_tiebreak_points, winner
    ) VALUES (
      match_record.id, 1,
      CASE WHEN match_record.winner = 1 THEN 6 ELSE 4 END, -- Team 1 games
      CASE WHEN match_record.winner = 2 THEN 6 ELSE 4 END, -- Team 2 games
      NULL, NULL, match_record.winner
    ) ON CONFLICT (match_id, set_number) DO NOTHING;
  END LOOP;

  -- Show summary
  RAISE NOTICE 'Migration complete. Created % sets for % matches',
    (SELECT COUNT(*) FROM public.match_sets),
    (SELECT COUNT(DISTINCT match_id) FROM public.match_sets);
END;
$$;

-- Run the migration
SELECT migrate_game_scores_to_sets();

-- Show the results
DO $$
BEGIN
  RAISE NOTICE '=== MIGRATION RESULTS ===';
  RAISE NOTICE 'Matches with sets: %', (SELECT COUNT(DISTINCT match_id) FROM public.match_sets);
  RAISE NOTICE 'Total sets created: %', (SELECT COUNT(*) FROM public.match_sets);
END;
$$;

-- Display sample results for verification
SELECT
  ms.match_id,
  ms.set_number,
  ms.team1_games || '-' || ms.team2_games as score,
  CASE
    WHEN ms.team1_tiebreak_points IS NOT NULL
    THEN '(TB: ' || ms.team1_tiebreak_points || '-' || ms.team2_tiebreak_points || ')'
    ELSE ''
  END as tiebreak,
  'Winner: Team ' || ms.winner as winner_info,
  mr.match_date
FROM match_sets ms
JOIN match_records mr ON mr.id = ms.match_id
ORDER BY ms.match_id DESC, ms.set_number
LIMIT 20;