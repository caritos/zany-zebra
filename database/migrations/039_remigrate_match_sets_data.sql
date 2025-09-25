-- Migration: Re-migrate match_sets data with better parsing
-- Date: 2025-09-26
-- Description: Fix the data migration for match_sets with improved debugging

-- Create improved migration function
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
  -- Clear existing migrated sets
  DELETE FROM public.match_sets;
  RAISE NOTICE 'Cleared existing match_sets data';

  -- Loop through all matches with game_scores
  FOR match_record IN
    SELECT id, game_scores, winner
    FROM public.match_records
    WHERE game_scores IS NOT NULL
    ORDER BY id
  LOOP
    BEGIN
      RAISE NOTICE 'Processing match % with game_scores: %', match_record.id, match_record.game_scores;

      -- Try to parse as new format {"sets": [...]}
      IF match_record.game_scores ? 'sets' THEN
        RAISE NOTICE 'Found sets format with % sets', jsonb_array_length(match_record.game_scores->'sets');

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

          -- Determine set winner
          IF team1_g > team2_g THEN
            set_winner := 1;
          ELSE
            set_winner := 2;
          END IF;

          RAISE NOTICE 'Inserting set %: %-% (winner: team %)', set_num, team1_g, team2_g, set_winner;

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
        RAISE NOTICE 'Found array format with % sets', jsonb_array_length(match_record.game_scores);

        FOR set_num IN 0..(jsonb_array_length(match_record.game_scores) - 1)
        LOOP
          array_element := match_record.game_scores->set_num;
          RAISE NOTICE 'Processing array element %: %', set_num, array_element;

          IF jsonb_typeof(array_element) = 'array' AND jsonb_array_length(array_element) = 2 THEN
            team1_g := (array_element->>0)::INTEGER;
            team2_g := (array_element->>1)::INTEGER;
            team1_tb := NULL;
            team2_tb := NULL;

            IF team1_g > team2_g THEN
              set_winner := 1;
            ELSE
              set_winner := 2;
            END IF;

            RAISE NOTICE 'Inserting set %: %-% (winner: team %)', set_num + 1, team1_g, team2_g, set_winner;

            INSERT INTO public.match_sets (
              match_id, set_number, team1_games, team2_games,
              team1_tiebreak_points, team2_tiebreak_points, winner
            ) VALUES (
              match_record.id, set_num + 1, team1_g, team2_g,
              team1_tb, team2_tb, set_winner
            );
          END IF;
        END LOOP;

      -- Handle other formats or log unknown format
      ELSE
        RAISE NOTICE 'Unknown game_scores format for match %, type: %, value: %',
          match_record.id, jsonb_typeof(match_record.game_scores), match_record.game_scores;
      END IF;

    EXCEPTION
      WHEN OTHERS THEN
        RAISE NOTICE 'ERROR migrating match %: %', match_record.id, SQLERRM;
    END;
  END LOOP;

  -- For matches without game_scores, create placeholder sets
  FOR match_record IN
    SELECT id, winner
    FROM public.match_records
    WHERE game_scores IS NULL
    AND NOT EXISTS (SELECT 1 FROM public.match_sets WHERE match_id = match_records.id)
  LOOP
    RAISE NOTICE 'Creating placeholder set for match % (winner: team %)', match_record.id, match_record.winner;

    INSERT INTO public.match_sets (
      match_id, set_number, team1_games, team2_games,
      team1_tiebreak_points, team2_tiebreak_points, winner
    ) VALUES (
      match_record.id, 1,
      CASE WHEN match_record.winner = 1 THEN 6 ELSE 4 END,
      CASE WHEN match_record.winner = 2 THEN 6 ELSE 4 END,
      NULL, NULL, match_record.winner
    );
  END LOOP;

  -- Show final summary
  RAISE NOTICE '=== MIGRATION COMPLETE ===';
  RAISE NOTICE 'Total matches processed: %', (SELECT COUNT(*) FROM public.match_records);
  RAISE NOTICE 'Matches with game_scores: %', (SELECT COUNT(*) FROM public.match_records WHERE game_scores IS NOT NULL);
  RAISE NOTICE 'Matches with sets created: %', (SELECT COUNT(DISTINCT match_id) FROM public.match_sets);
  RAISE NOTICE 'Total sets created: %', (SELECT COUNT(*) FROM public.match_sets);
END;
$$;

-- Run the migration
SELECT migrate_game_scores_to_sets();

-- Show results
SELECT
  'Results:' as info,
  ms.match_id,
  COUNT(ms.id) as sets_count,
  string_agg(ms.team1_games || '-' || ms.team2_games, ', ' ORDER BY ms.set_number) as all_scores
FROM match_sets ms
GROUP BY ms.match_id
ORDER BY ms.match_id DESC
LIMIT 10;