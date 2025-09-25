// Types for tennis matches and ELO ratings

export interface UserRating {
  id: number;
  user_id: string;
  club_id: number;
  elo_rating: number;
  matches_played: number;
  matches_won: number;
  matches_lost: number;
  last_match_at: string | null;
  peak_rating: number;
  created_at: string;
  updated_at: string;
}

export interface Match {
  id: number;
  club_id: number;
  player1_id: string;
  player2_id: string;
  player1_sets: number;
  player2_sets: number;
  game_scores?: number[][]; // e.g., [[6,4], [7,5]]
  winner_id: string;
  player1_elo_before: number;
  player2_elo_before: number;
  player1_elo_after: number;
  player2_elo_after: number;
  elo_change: number;
  match_date: string;
  recorded_by: string;
  notes?: string;
  created_at: string;
}

export interface ClubMemberWithRating {
  user_id: string;
  email: string;
  nickname: string | null;
  elo_rating: number;
  matches_played: number;
  matches_won: number;
  matches_lost: number;
  win_rate: number; // Percentage
  peak_rating: number;
  last_match_at: string | null;
  joined_at: string;
}

export interface MatchWithPlayers {
  match_id: number;
  player1_id: string;
  player1_email: string;
  player1_name: string;
  player2_id: string;
  player2_email: string;
  player2_name: string;
  player1_sets: number;
  player2_sets: number;
  game_scores?: number[][];
  winner_id: string;
  player1_elo_before: number;
  player2_elo_before: number;
  player1_elo_after: number;
  player2_elo_after: number;
  elo_change: number;
  match_date: string;
  notes?: string;
}

export interface PlayerStats {
  elo_rating: number;
  matches_played: number;
  matches_won: number;
  matches_lost: number;
  win_rate: number;
  peak_rating: number;
  recent_form: string[]; // ['W', 'W', 'L', 'W', 'L']
  head_to_head: Record<string, {
    wins: number;
    losses: number;
    total: number;
  }>;
}

export interface RecordMatchRequest {
  club_id: number;
  player1_id: string;
  player2_id: string;
  player1_sets: number;
  player2_sets: number;
  game_scores?: number[][];
  notes?: string;
}

export interface RecordMatchResult {
  match_id: number;
  success: boolean;
  message: string;
  player1_elo_change: number;
  player2_elo_change: number;
}

// Hook return types
export interface UseClubMembersWithRatingsReturn {
  members: ClubMemberWithRating[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export interface UseClubMatchesReturn {
  matches: MatchWithPlayers[];
  loading: boolean;
  error: string | null;
  loadMore: () => void;
  hasMore: boolean;
  refetch: () => void;
}

export interface UseRecordMatchReturn {
  recordMatch: (match: RecordMatchRequest) => Promise<RecordMatchResult>;
  loading: boolean;
  error: string | null;
}

export interface UsePlayerStatsReturn {
  stats: PlayerStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}