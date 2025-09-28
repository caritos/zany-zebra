-- ELO Rating System Helper Functions
-- These functions support the advanced ELO rating calculations for tennis matches

-- Function to get K-factor based on games played (experience level)
CREATE OR REPLACE FUNCTION get_k_factor(games_played INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  -- New players have higher K-factor for faster rating adjustments
  IF games_played < 10 THEN
    RETURN 40; -- K_FACTOR_NEW
  ELSIF games_played < 30 THEN
    RETURN 30; -- K_FACTOR_MID
  ELSE
    RETURN 20; -- K_FACTOR_ESTABLISHED
  END IF;
END;
$$;

-- Function to calculate expected score for ELO
CREATE OR REPLACE FUNCTION get_expected_score(player_rating INTEGER, opponent_rating INTEGER)
RETURNS NUMERIC(10, 6)
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  -- Expected score is the probability of winning (0 to 1)
  RETURN 1.0 / (1 + POWER(10, (opponent_rating - player_rating)::NUMERIC / 400));
END;
$$;

-- Function to calculate score differential multiplier based on match scores
-- This rewards dominant victories and reduces points for close matches
CREATE OR REPLACE FUNCTION get_score_differential_multiplier(scores TEXT)
RETURNS NUMERIC(4, 2)
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  sets TEXT[];
  set_score TEXT;
  total_winner_games INTEGER := 0;
  total_loser_games INTEGER := 0;
  tiebreaks INTEGER := 0;
  total_games INTEGER;
  game_differential INTEGER;
  differential_ratio NUMERIC;
  multiplier NUMERIC := 1.0;
  winner_games INTEGER;
  loser_games INTEGER;
BEGIN
  -- Handle null or empty scores
  IF scores IS NULL OR scores = '' THEN
    RETURN 1.0;
  END IF;

  BEGIN
    -- Split scores by comma to get individual sets
    sets := string_to_array(scores, ',');

    -- Process each set
    FOREACH set_score IN ARRAY sets LOOP
      set_score := trim(set_score);

      -- Check for tiebreak notation
      IF set_score ~ '\(' THEN
        tiebreaks := tiebreaks + 1;
        -- Remove tiebreak notation like (7-5)
        set_score := regexp_replace(set_score, '\([^)]*\)', '', 'g');
      END IF;

      -- Parse games (format: "6-4" or "7-6")
      IF set_score ~ '^[0-9]+-[0-9]+$' THEN
        winner_games := (regexp_split_to_array(set_score, '-'))[1]::INTEGER;
        loser_games := (regexp_split_to_array(set_score, '-'))[2]::INTEGER;

        -- Assume winner has more games (this function is called after determining winner)
        IF winner_games < loser_games THEN
          -- Swap if needed
          total_winner_games := total_winner_games + loser_games;
          total_loser_games := total_loser_games + winner_games;
        ELSE
          total_winner_games := total_winner_games + winner_games;
          total_loser_games := total_loser_games + loser_games;
        END IF;
      END IF;
    END LOOP;

    -- Calculate differential ratio
    total_games := total_winner_games + total_loser_games;
    IF total_games > 0 THEN
      game_differential := total_winner_games - total_loser_games;
      differential_ratio := game_differential::NUMERIC / total_games;

      -- Determine multiplier based on dominance
      -- Dominant victories (6-0, 6-1 type scores)
      IF differential_ratio > 0.6 THEN
        multiplier := 1.5; -- 50% bonus for dominant wins
      -- Strong victories (6-2, 6-3 type scores)
      ELSIF differential_ratio > 0.4 THEN
        multiplier := 1.25; -- 25% bonus
      -- Normal victories (6-4, 6-4 type scores)
      ELSIF differential_ratio > 0.2 THEN
        multiplier := 1.1; -- 10% bonus
      -- Close victories (7-6, 6-4 or matches with tiebreaks)
      ELSIF tiebreaks > 0 OR differential_ratio < 0.15 THEN
        multiplier := 0.75; -- Reduced points for very close matches
      END IF;
    END IF;

  EXCEPTION
    WHEN OTHERS THEN
      -- If parsing fails, return neutral multiplier
      multiplier := 1.0;
  END;

  RETURN multiplier;
END;
$$;

-- Function to get rating tier/division
CREATE OR REPLACE FUNCTION get_rating_tier(rating INTEGER)
RETURNS TABLE (tier TEXT, color TEXT)
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF rating >= 1600 THEN
    tier := 'Elite';
    color := '#FFD700'; -- Gold
  ELSIF rating >= 1400 THEN
    tier := 'Advanced';
    color := '#C0C0C0'; -- Silver
  ELSIF rating >= 1200 THEN
    tier := 'Intermediate';
    color := '#CD7F32'; -- Bronze
  ELSIF rating >= 1000 THEN
    tier := 'Beginner';
    color := '#4CAF50'; -- Green
  ELSE
    tier := 'New Player';
    color := '#2196F3'; -- Blue
  END IF;

  RETURN NEXT;
END;
$$;

-- Function to get initial rating for new players
CREATE OR REPLACE FUNCTION get_initial_rating()
RETURNS INTEGER
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  RETURN 1200; -- Default starting rating
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_k_factor(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_expected_score(INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_score_differential_multiplier(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_rating_tier(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_initial_rating() TO authenticated;

-- Comments for documentation
COMMENT ON FUNCTION get_score_differential_multiplier(TEXT) IS 'Calculates multiplier based on match dominance: 1.5x for dominant wins (6-0), 0.75x for close wins (7-6)';
COMMENT ON FUNCTION get_k_factor(INTEGER) IS 'Returns K-factor for ELO calculations based on player experience (40 for new, 20 for established)';
COMMENT ON FUNCTION get_expected_score(INTEGER, INTEGER) IS 'Calculates expected probability of winning based on ELO ratings';
COMMENT ON FUNCTION get_rating_tier(INTEGER) IS 'Returns tier name and color for a given ELO rating';