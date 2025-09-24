-- Functions for recording matches and calculating ELO ratings

-- Calculate expected score for ELO
CREATE OR REPLACE FUNCTION calculate_expected_score(
  rating_a INTEGER,
  rating_b INTEGER
)
RETURNS FLOAT AS $$
BEGIN
  RETURN 1.0 / (1.0 + POWER(10, (rating_b - rating_a) / 400.0));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Calculate new ELO rating
CREATE OR REPLACE FUNCTION calculate_new_elo(
  current_rating INTEGER,
  expected_score FLOAT,
  actual_score FLOAT,
  k_factor INTEGER DEFAULT 32
)
RETURNS INTEGER AS $$
BEGIN
  RETURN ROUND(current_rating + k_factor * (actual_score - expected_score));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Record a match and update ELO ratings
CREATE OR REPLACE FUNCTION record_match(
  p_club_id BIGINT,
  p_player1_id UUID,
  p_player2_id UUID,
  p_player1_sets INTEGER,
  p_player2_sets INTEGER,
  p_game_scores JSONB DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS TABLE (
  match_id BIGINT,
  success BOOLEAN,
  message TEXT,
  player1_elo_change INTEGER,
  player2_elo_change INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_match_id BIGINT;
  v_winner_id UUID;
  v_player1_rating INTEGER;
  v_player2_rating INTEGER;
  v_player1_new_rating INTEGER;
  v_player2_new_rating INTEGER;
  v_expected_score_p1 FLOAT;
  v_actual_score_p1 FLOAT;
  v_actual_score_p2 FLOAT;
  v_elo_change INTEGER;
  v_k_factor INTEGER;
  v_user_id UUID;
BEGIN
  -- Get current user
  v_user_id := auth.uid();

  -- Validate user is authenticated
  IF v_user_id IS NULL THEN
    RETURN QUERY SELECT
      NULL::BIGINT,
      FALSE,
      'User not authenticated'::TEXT,
      0,
      0;
    RETURN;
  END IF;

  -- Validate user is a member of the club
  IF NOT EXISTS (
    SELECT 1 FROM public.club_users
    WHERE club_id = p_club_id AND user_id = v_user_id
  ) THEN
    RETURN QUERY SELECT
      NULL::BIGINT,
      FALSE,
      'You must be a member of this club to record matches'::TEXT,
      0,
      0;
    RETURN;
  END IF;

  -- Validate both players are members of the club
  IF NOT EXISTS (
    SELECT 1 FROM public.club_users
    WHERE club_id = p_club_id AND user_id = p_player1_id
  ) THEN
    RETURN QUERY SELECT
      NULL::BIGINT,
      FALSE,
      'Player 1 is not a member of this club'::TEXT,
      0,
      0;
    RETURN;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.club_users
    WHERE club_id = p_club_id AND user_id = p_player2_id
  ) THEN
    RETURN QUERY SELECT
      NULL::BIGINT,
      FALSE,
      'Player 2 is not a member of this club'::TEXT,
      0,
      0;
    RETURN;
  END IF;

  -- Determine winner
  IF p_player1_sets > p_player2_sets THEN
    v_winner_id := p_player1_id;
    v_actual_score_p1 := 1.0;
    v_actual_score_p2 := 0.0;
  ELSE
    v_winner_id := p_player2_id;
    v_actual_score_p1 := 0.0;
    v_actual_score_p2 := 1.0;
  END IF;

  -- Get current ratings (or create if don't exist)
  INSERT INTO public.user_ratings (user_id, club_id)
  VALUES (p_player1_id, p_club_id)
  ON CONFLICT (user_id, club_id) DO NOTHING;

  INSERT INTO public.user_ratings (user_id, club_id)
  VALUES (p_player2_id, p_club_id)
  ON CONFLICT (user_id, club_id) DO NOTHING;

  SELECT elo_rating,
         CASE
           WHEN matches_played < 10 THEN 40  -- Higher K-factor for new players
           WHEN elo_rating > 2400 THEN 16    -- Lower K-factor for high-rated players
           ELSE 32                            -- Standard K-factor
         END
  INTO v_player1_rating, v_k_factor
  FROM public.user_ratings
  WHERE user_id = p_player1_id AND club_id = p_club_id;

  SELECT elo_rating
  INTO v_player2_rating
  FROM public.user_ratings
  WHERE user_id = p_player2_id AND club_id = p_club_id;

  -- Calculate expected scores and new ratings
  v_expected_score_p1 := calculate_expected_score(v_player1_rating, v_player2_rating);

  v_player1_new_rating := calculate_new_elo(
    v_player1_rating,
    v_expected_score_p1,
    v_actual_score_p1,
    v_k_factor
  );

  v_player2_new_rating := calculate_new_elo(
    v_player2_rating,
    1.0 - v_expected_score_p1,  -- Expected score for player 2
    v_actual_score_p2,
    v_k_factor
  );

  v_elo_change := ABS(v_player1_new_rating - v_player1_rating);

  -- Insert match record
  INSERT INTO public.matches (
    club_id,
    player1_id,
    player2_id,
    player1_sets,
    player2_sets,
    game_scores,
    winner_id,
    player1_elo_before,
    player2_elo_before,
    player1_elo_after,
    player2_elo_after,
    elo_change,
    recorded_by,
    notes
  )
  VALUES (
    p_club_id,
    p_player1_id,
    p_player2_id,
    p_player1_sets,
    p_player2_sets,
    p_game_scores,
    v_winner_id,
    v_player1_rating,
    v_player2_rating,
    v_player1_new_rating,
    v_player2_new_rating,
    v_elo_change,
    v_user_id,
    p_notes
  )
  RETURNING id INTO v_match_id;

  -- Update player ratings
  UPDATE public.user_ratings
  SET
    elo_rating = v_player1_new_rating,
    matches_played = matches_played + 1,
    matches_won = matches_won + CASE WHEN v_winner_id = p_player1_id THEN 1 ELSE 0 END,
    matches_lost = matches_lost + CASE WHEN v_winner_id != p_player1_id THEN 1 ELSE 0 END,
    peak_rating = GREATEST(peak_rating, v_player1_new_rating),
    last_match_at = NOW()
  WHERE user_id = p_player1_id AND club_id = p_club_id;

  UPDATE public.user_ratings
  SET
    elo_rating = v_player2_new_rating,
    matches_played = matches_played + 1,
    matches_won = matches_won + CASE WHEN v_winner_id = p_player2_id THEN 1 ELSE 0 END,
    matches_lost = matches_lost + CASE WHEN v_winner_id != p_player2_id THEN 1 ELSE 0 END,
    peak_rating = GREATEST(peak_rating, v_player2_new_rating),
    last_match_at = NOW()
  WHERE user_id = p_player2_id AND club_id = p_club_id;

  RETURN QUERY SELECT
    v_match_id,
    TRUE,
    'Match recorded successfully!'::TEXT,
    v_player1_new_rating - v_player1_rating,
    v_player2_new_rating - v_player2_rating;
END;
$$;

-- Drop and recreate the function with new return type
DROP FUNCTION IF EXISTS get_club_members_with_ratings(BIGINT);

-- Get club members with their ratings
CREATE OR REPLACE FUNCTION get_club_members_with_ratings(p_club_id BIGINT)
RETURNS TABLE (
  out_user_id UUID,
  out_email TEXT,
  out_display_name TEXT,
  out_elo_rating INTEGER,
  out_matches_played INTEGER,
  out_matches_won INTEGER,
  out_matches_lost INTEGER,
  out_win_rate FLOAT,
  out_peak_rating INTEGER,
  out_last_match_at TIMESTAMPTZ,
  out_joined_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is a member of the club
  IF NOT EXISTS (
    SELECT 1 FROM public.club_users
    WHERE club_id = p_club_id AND user_id = auth.uid()
  ) THEN
    RETURN; -- Return empty result set
  END IF;

  RETURN QUERY
  SELECT
    cu.user_id as out_user_id,
    u.email as out_email,
    COALESCE(u.raw_user_meta_data->>'display_name', u.email) as out_display_name,
    COALESCE(ur.elo_rating, 1200) as out_elo_rating,
    COALESCE(ur.matches_played, 0) as out_matches_played,
    COALESCE(ur.matches_won, 0) as out_matches_won,
    COALESCE(ur.matches_lost, 0) as out_matches_lost,
    CASE
      WHEN ur.matches_played > 0 THEN
        ROUND((ur.matches_won::FLOAT / ur.matches_played * 100)::NUMERIC, 1)::FLOAT
      ELSE 0::FLOAT
    END as out_win_rate,
    COALESCE(ur.peak_rating, 1200) as out_peak_rating,
    ur.last_match_at as out_last_match_at,
    cu.joined_at as out_joined_at
  FROM public.club_users cu
  JOIN auth.users u ON u.id = cu.user_id
  LEFT JOIN public.user_ratings ur ON ur.user_id = cu.user_id AND ur.club_id = cu.club_id
  WHERE cu.club_id = p_club_id
  ORDER BY COALESCE(ur.elo_rating, 1200) DESC, cu.joined_at;
END;
$$;

-- Get recent matches for a club
CREATE OR REPLACE FUNCTION get_club_matches(
  p_club_id BIGINT,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  match_id BIGINT,
  player1_id UUID,
  player1_email TEXT,
  player1_name TEXT,
  player2_id UUID,
  player2_email TEXT,
  player2_name TEXT,
  player1_sets INTEGER,
  player2_sets INTEGER,
  game_scores JSONB,
  winner_id UUID,
  player1_elo_before INTEGER,
  player2_elo_before INTEGER,
  player1_elo_after INTEGER,
  player2_elo_after INTEGER,
  elo_change INTEGER,
  match_date TIMESTAMPTZ,
  notes TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is a member of the club
  IF NOT EXISTS (
    SELECT 1 FROM public.club_users
    WHERE club_id = p_club_id AND user_id = auth.uid()
  ) THEN
    RETURN; -- Return empty result set
  END IF;

  RETURN QUERY
  SELECT
    m.id,
    m.player1_id,
    p1.email,
    COALESCE(p1.raw_user_meta_data->>'display_name', p1.email),
    m.player2_id,
    p2.email,
    COALESCE(p2.raw_user_meta_data->>'display_name', p2.email),
    m.player1_sets,
    m.player2_sets,
    m.game_scores,
    m.winner_id,
    m.player1_elo_before,
    m.player2_elo_before,
    m.player1_elo_after,
    m.player2_elo_after,
    m.elo_change,
    m.match_date,
    m.notes
  FROM public.matches m
  JOIN auth.users p1 ON p1.id = m.player1_id
  JOIN auth.users p2 ON p2.id = m.player2_id
  WHERE m.club_id = p_club_id
  ORDER BY m.match_date DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Get player statistics for a club
CREATE OR REPLACE FUNCTION get_player_stats(
  p_club_id BIGINT,
  p_user_id UUID
)
RETURNS TABLE (
  elo_rating INTEGER,
  matches_played INTEGER,
  matches_won INTEGER,
  matches_lost INTEGER,
  win_rate FLOAT,
  peak_rating INTEGER,
  recent_form TEXT[], -- Last 5 match results (W/L)
  head_to_head JSONB  -- Win/loss record against other players
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is a member of the club
  IF NOT EXISTS (
    SELECT 1 FROM public.club_users
    WHERE club_id = p_club_id AND user_id = auth.uid()
  ) THEN
    RETURN; -- Return empty result set
  END IF;

  RETURN QUERY
  WITH recent_matches AS (
    SELECT
      CASE
        WHEN winner_id = p_user_id THEN 'W'
        ELSE 'L'
      END as result
    FROM public.matches
    WHERE club_id = p_club_id
      AND (player1_id = p_user_id OR player2_id = p_user_id)
    ORDER BY match_date DESC
    LIMIT 5
  ),
  h2h AS (
    SELECT
      jsonb_object_agg(
        opponent_id::TEXT,
        jsonb_build_object(
          'wins', wins,
          'losses', losses,
          'total', wins + losses
        )
      ) as head_to_head
    FROM (
      SELECT
        CASE
          WHEN player1_id = p_user_id THEN player2_id
          ELSE player1_id
        END as opponent_id,
        COUNT(CASE WHEN winner_id = p_user_id THEN 1 END) as wins,
        COUNT(CASE WHEN winner_id != p_user_id THEN 1 END) as losses
      FROM public.matches
      WHERE club_id = p_club_id
        AND (player1_id = p_user_id OR player2_id = p_user_id)
      GROUP BY opponent_id
    ) h2h_data
  )
  SELECT
    ur.elo_rating,
    ur.matches_played,
    ur.matches_won,
    ur.matches_lost,
    CASE
      WHEN ur.matches_played > 0 THEN
        ROUND((ur.matches_won::FLOAT / ur.matches_played * 100)::NUMERIC, 1)
      ELSE 0
    END as win_rate,
    ur.peak_rating,
    ARRAY(SELECT result FROM recent_matches) as recent_form,
    COALESCE(h2h.head_to_head, '{}'::JSONB)
  FROM public.user_ratings ur
  CROSS JOIN h2h
  WHERE ur.user_id = p_user_id AND ur.club_id = p_club_id;
END;
$$;