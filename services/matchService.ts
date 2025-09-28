import { supabase } from '@/lib/supabase';
import {
  ClubMemberWithRating,
  MatchWithPlayers,
  PlayerStats,
  RecordMatchRequest,
  RecordMatchResult,
} from '@/types/matches';

export class MatchService {
  // Get club members with their ELO ratings
  static async getClubMembersWithRatings(clubId: number): Promise<ClubMemberWithRating[]> {
    const { data, error } = await supabase.rpc('get_club_members_with_ratings', {
      p_club_id: clubId,
    });

    if (error) {
      throw new Error(`Failed to fetch club members: ${error.message}`);
    }

    // The function now returns the columns directly without out_ prefix
    return data || [];
  }

  // Record a new match
  static async recordMatch(match: RecordMatchRequest): Promise<RecordMatchResult> {
    // Convert the old format to the new record_match_with_elo format
    // This is a compatibility layer for the old interface
    const { data, error } = await supabase.rpc('record_match_with_elo', {
      p_club_id: match.club_id,
      p_match_type: 'singles', // Default to singles, this should be determined by the caller
      p_team1_player1_user_id: match.player1_id,
      p_team1_player1_guest_name: null,
      p_team1_player2_user_id: null,
      p_team1_player2_guest_name: null,
      p_team2_player1_user_id: match.player2_id,
      p_team2_player1_guest_name: null,
      p_team2_player2_user_id: null,
      p_team2_player2_guest_name: null,
      p_winner: match.player1_sets > match.player2_sets ? 1 : 2,
      p_sets: match.sets || [],
      p_notes: match.notes || null,
    });

    if (error) {
      throw new Error(`Failed to record match: ${error.message}`);
    }

    return {
      match_id: data?.match_id || null,
      success: data?.success || false,
      message: data?.message || 'Unknown error',
      player1_elo_change: 0, // ELO changes not implemented yet
      player2_elo_change: 0,
    };
  }

  // Get recent matches for a club
  static async getClubMatches(
    clubId: number,
    limit: number = 20,
    offset: number = 0
  ): Promise<MatchWithPlayers[]> {
    const { data, error } = await supabase.rpc('get_club_matches', {
      p_club_id: clubId,
      p_limit: limit,
      p_offset: offset,
    });

    if (error) {
      throw new Error(`Failed to fetch matches: ${error.message}`);
    }

    return data || [];
  }

  // Get player statistics
  static async getPlayerStats(clubId: number, userId: string): Promise<PlayerStats | null> {
    const { data, error } = await supabase.rpc('get_player_stats', {
      p_club_id: clubId,
      p_user_id: userId,
    });

    if (error) {
      throw new Error(`Failed to fetch player stats: ${error.message}`);
    }

    return data?.[0] || null;
  }

  // Get head-to-head record between two players
  static async getHeadToHead(
    clubId: number,
    player1Id: string,
    player2Id: string
  ): Promise<{ player1Wins: number; player2Wins: number; matches: MatchWithPlayers[] }> {
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .eq('club_id', clubId)
      .or(
        `and(player1_id.eq.${player1Id},player2_id.eq.${player2Id}),and(player1_id.eq.${player2Id},player2_id.eq.${player1Id})`
      )
      .order('match_date', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch head-to-head: ${error.message}`);
    }

    const matches = data || [];
    const player1Wins = matches.filter((m) => m.winner_id === player1Id).length;
    const player2Wins = matches.filter((m) => m.winner_id === player2Id).length;

    return {
      player1Wins,
      player2Wins,
      matches: matches as any, // Type casting for simplicity
    };
  }

  // Get leaderboard for a club
  static async getClubLeaderboard(
    clubId: number,
    limit: number = 10
  ): Promise<ClubMemberWithRating[]> {
    const members = await this.getClubMembersWithRatings(clubId);
    return members.slice(0, limit);
  }

  // Calculate win probability (for display purposes)
  static calculateWinProbability(rating1: number, rating2: number): number {
    const expectedScore = 1 / (1 + Math.pow(10, (rating2 - rating1) / 400));
    return Math.round(expectedScore * 100);
  }

  // Format ELO rating for display
  static formatEloRating(rating: number): string {
    if (rating >= 2400) return `${rating} (Master)`;
    if (rating >= 2000) return `${rating} (Expert)`;
    if (rating >= 1600) return `${rating} (Advanced)`;
    if (rating >= 1200) return `${rating} (Intermediate)`;
    return `${rating} (Beginner)`;
  }

  // Get rating change color
  static getRatingChangeColor(change: number): string {
    if (change > 0) return '#4CAF50'; // Green for gain
    if (change < 0) return '#F44336'; // Red for loss
    return '#999'; // Gray for no change
  }
}