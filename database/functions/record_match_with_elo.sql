-- Function to record a match and update ELO ratings atomically
-- This is the main function called by the React Native app to record tennis matches

-- Drop the old function first (required when changing parameter names)
DROP FUNCTION IF EXISTS record_match_with_elo(bigint,text,uuid,text,uuid,text,uuid,text,uuid,text,integer,jsonb,text);

CREATE OR REPLACE FUNCTION record_match_with_elo(
  p_club_id BIGINT,
  p_match_type TEXT,
  p_team1_player1_user_id UUID,
  p_team1_player1_guest_name TEXT,
  p_team1_player2_user_id UUID,
  p_team1_player2_guest_name TEXT,
  p_team2_player1_user_id UUID,
  p_team2_player1_guest_name TEXT,
  p_team2_player2_user_id UUID,
  p_team2_player2_guest_name TEXT,
  p_winner INTEGER,
  p_sets JSONB,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_match_id BIGINT;
  v_scores_text TEXT;
  v_rating_changes JSONB := '{}';
  v_rating_result RECORD;
  v_doubles_result RECORD;
BEGIN
  -- Validate user permissions
  IF NOT EXISTS (
    SELECT 1 FROM public.club_users
    WHERE club_id = p_club_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'User not authorized to record matches in this club';
  END IF;

  -- Start transaction
  BEGIN
    -- Insert match record
    INSERT INTO public.match_records (
      club_id, match_type,
      team1_player1_user_id, team1_player1_guest_name,
      team1_player2_user_id, team1_player2_guest_name,
      team2_player1_user_id, team2_player1_guest_name,
      team2_player2_user_id, team2_player2_guest_name,
      winner, notes, recorded_by, match_date
    ) VALUES (
      p_club_id, p_match_type,
      p_team1_player1_user_id, p_team1_player1_guest_name,
      p_team1_player2_user_id, p_team1_player2_guest_name,
      p_team2_player1_user_id, p_team2_player1_guest_name,
      p_team2_player2_user_id, p_team2_player2_guest_name,
      p_winner, p_notes, auth.uid(), NOW()
    ) RETURNING id INTO v_match_id;

    -- Convert sets to text for ELO calculation
    IF p_sets IS NOT NULL THEN
      SELECT string_agg(
        (set_info->>'team1_games') || '-' || (set_info->>'team2_games'),
        ','
        ORDER BY (set_info->>'set_number')::INTEGER
      )
      INTO v_scores_text
      FROM jsonb_array_elements(p_sets) AS set_info;
    END IF;

    -- TODO: Add ELO rating calculations here
    -- For now, just record the match without ELO updates
    v_rating_changes := jsonb_build_object(
      'type', p_match_type,
      'message', 'Match recorded successfully (ELO calculations to be implemented)'
    );

    -- Insert match sets from sets data
    IF p_sets IS NOT NULL THEN
      INSERT INTO public.match_sets (
        match_id, set_number, team1_games, team2_games,
        team1_tiebreak_points, team2_tiebreak_points, winner
      )
      SELECT
        v_match_id,
        (set_info->>'set_number')::INTEGER,
        (set_info->>'team1_games')::INTEGER,
        (set_info->>'team2_games')::INTEGER,
        (set_info->>'team1_tiebreak_points')::INTEGER,
        (set_info->>'team2_tiebreak_points')::INTEGER,
        CASE WHEN (set_info->>'team1_games')::INTEGER > (set_info->>'team2_games')::INTEGER
             THEN 1 ELSE 2 END
      FROM jsonb_array_elements(p_sets) AS set_info;
    END IF;

    -- Return success with details
    RETURN jsonb_build_object(
      'success', true,
      'match_id', v_match_id,
      'rating_changes', v_rating_changes,
      'message', 'Match recorded successfully'
    );

  EXCEPTION
    WHEN OTHERS THEN
      -- Roll back transaction and return error
      RAISE EXCEPTION 'Failed to record match: %', SQLERRM;
  END;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION record_match_with_elo(BIGINT, TEXT, UUID, TEXT, UUID, TEXT, UUID, TEXT, UUID, TEXT, INTEGER, JSONB, TEXT) TO authenticated;

-- Add helpful comment
COMMENT ON FUNCTION record_match_with_elo(BIGINT, TEXT, UUID, TEXT, UUID, TEXT, UUID, TEXT, UUID, TEXT, INTEGER, JSONB, TEXT) IS 'Records tennis match with match sets and automatic ELO rating updates (when implemented)';