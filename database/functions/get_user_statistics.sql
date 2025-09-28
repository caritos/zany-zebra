-- Function to get comprehensive user match statistics
-- Updated: 2025-09-28
-- Description: Fix the get_user_statistics function to count matches correctly, not sets

CREATE OR REPLACE FUNCTION get_user_statistics(p_user_id UUID)
RETURNS TABLE (
  total_matches INTEGER,
  total_wins INTEGER,
  total_losses INTEGER,
  win_rate NUMERIC,
  singles_wins INTEGER,
  singles_losses INTEGER,
  doubles_wins INTEGER,
  doubles_losses INTEGER,
  total_sets_won INTEGER,
  total_sets_lost INTEGER,
  total_games_won INTEGER,
  total_games_lost INTEGER,
  current_elo_rating INTEGER,
  peak_elo_rating INTEGER,
  matches_played INTEGER
)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  WITH match_stats AS (
    -- Get all matches where user participated
    SELECT
      mr.id,
      mr.match_type,
      mr.winner,
      CASE
        WHEN mr.team1_player1_user_id = p_user_id OR mr.team1_player2_user_id = p_user_id THEN 1
        WHEN mr.team2_player1_user_id = p_user_id OR mr.team2_player2_user_id = p_user_id THEN 2
        ELSE NULL
      END as user_team,
      CASE
        WHEN (mr.team1_player1_user_id = p_user_id OR mr.team1_player2_user_id = p_user_id) AND mr.winner = 1 THEN 1
        WHEN (mr.team2_player1_user_id = p_user_id OR mr.team2_player2_user_id = p_user_id) AND mr.winner = 2 THEN 1
        ELSE 0
      END as is_win
    FROM public.match_records mr
    WHERE mr.team1_player1_user_id = p_user_id
       OR mr.team1_player2_user_id = p_user_id
       OR mr.team2_player1_user_id = p_user_id
       OR mr.team2_player2_user_id = p_user_id
  ),
  set_stats AS (
    -- Get set statistics for user matches
    SELECT
      ms.match_id,
      ms.winner as set_winner,
      m.user_team,
      CASE
        WHEN ms.winner = m.user_team THEN 1
        ELSE 0
      END as user_won_set,
      ms.team1_games,
      ms.team2_games,
      CASE
        WHEN m.user_team = 1 THEN ms.team1_games
        ELSE ms.team2_games
      END as user_games,
      CASE
        WHEN m.user_team = 1 THEN ms.team2_games
        ELSE ms.team1_games
      END as opponent_games
    FROM public.match_sets ms
    JOIN match_stats m ON ms.match_id = m.id
  ),
  elo_stats AS (
    -- Get current ELO statistics across all clubs
    SELECT
      COALESCE(MAX(ur.elo_rating), 1200) as max_elo,
      COALESCE(MAX(ur.peak_rating), 1200) as peak_elo,
      COALESCE(SUM(ur.matches_played), 0) as total_matches_played
    FROM public.user_ratings ur
    WHERE ur.user_id = p_user_id
  ),
  aggregated_stats AS (
    -- Aggregate set stats per match to avoid duplicating match counts
    SELECT
      ss.match_id,
      SUM(ss.user_won_set) as sets_won,
      COUNT(ss.*) as total_sets,
      SUM(ss.user_games) as games_won,
      SUM(ss.opponent_games) as games_lost
    FROM set_stats ss
    GROUP BY ss.match_id
  )
  SELECT
    -- Total match statistics - count distinct matches, not sets
    COALESCE(COUNT(DISTINCT ms.id)::INTEGER, 0) as total_matches,
    COALESCE(SUM(ms.is_win)::INTEGER, 0) as total_wins,
    COALESCE(COUNT(DISTINCT ms.id) - SUM(ms.is_win), 0)::INTEGER as total_losses,
    CASE
      WHEN COUNT(DISTINCT ms.id) > 0 THEN ROUND((SUM(ms.is_win)::NUMERIC / COUNT(DISTINCT ms.id)) * 100, 1)
      ELSE 0::NUMERIC
    END as win_rate,

    -- Singles statistics
    COALESCE(SUM(CASE WHEN ms.match_type = 'singles' AND ms.is_win = 1 THEN 1 ELSE 0 END)::INTEGER, 0) as singles_wins,
    COALESCE(SUM(CASE WHEN ms.match_type = 'singles' AND ms.is_win = 0 THEN 1 ELSE 0 END)::INTEGER, 0) as singles_losses,

    -- Doubles statistics
    COALESCE(SUM(CASE WHEN ms.match_type = 'doubles' AND ms.is_win = 1 THEN 1 ELSE 0 END)::INTEGER, 0) as doubles_wins,
    COALESCE(SUM(CASE WHEN ms.match_type = 'doubles' AND ms.is_win = 0 THEN 1 ELSE 0 END)::INTEGER, 0) as doubles_losses,

    -- Set statistics - now properly aggregated
    COALESCE(SUM(agg.sets_won)::INTEGER, 0) as total_sets_won,
    COALESCE(SUM(agg.total_sets - agg.sets_won)::INTEGER, 0) as total_sets_lost,

    -- Game statistics - now properly aggregated
    COALESCE(SUM(agg.games_won)::INTEGER, 0) as total_games_won,
    COALESCE(SUM(agg.games_lost)::INTEGER, 0) as total_games_lost,

    -- ELO statistics
    es.max_elo::INTEGER as current_elo_rating,
    es.peak_elo::INTEGER as peak_elo_rating,
    es.total_matches_played::INTEGER as matches_played

  FROM match_stats ms
  LEFT JOIN aggregated_stats agg ON agg.match_id = ms.id
  CROSS JOIN elo_stats es
  GROUP BY es.max_elo, es.peak_elo, es.total_matches_played;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_user_statistics(UUID) TO authenticated;

-- Add comment
COMMENT ON FUNCTION get_user_statistics(UUID) IS 'Gets comprehensive match statistics for a user including win/loss records, set/game stats, and ELO ratings. Fixed to count matches correctly, not sets.';