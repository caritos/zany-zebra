import { useState, useEffect, useCallback } from 'react';
import { MatchService } from '@/services/matchService';
import {
  ClubMemberWithRating,
  MatchWithPlayers,
  PlayerStats,
  RecordMatchRequest,
  RecordMatchResult,
  UseClubMembersWithRatingsReturn,
  UseClubMatchesReturn,
  UseRecordMatchReturn,
  UsePlayerStatsReturn,
} from '@/types/matches';

// Hook for getting club members with ratings
export const useClubMembersWithRatings = (clubId: number | null): UseClubMembersWithRatingsReturn => {
  const [members, setMembers] = useState<ClubMemberWithRating[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    if (!clubId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await MatchService.getClubMembersWithRatings(clubId);
      setMembers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch members');
    } finally {
      setLoading(false);
    }
  }, [clubId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  return {
    members,
    loading,
    error,
    refetch: fetchMembers,
  };
};

// Hook for recording matches
export const useRecordMatch = (): UseRecordMatchReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recordMatch = useCallback(async (match: RecordMatchRequest): Promise<RecordMatchResult> => {
    setLoading(true);
    setError(null);

    try {
      const result = await MatchService.recordMatch(match);

      if (!result.success) {
        setError(result.message);
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to record match';
      setError(errorMessage);
      return {
        match_id: 0,
        success: false,
        message: errorMessage,
        player1_elo_change: 0,
        player2_elo_change: 0,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    recordMatch,
    loading,
    error,
  };
};

// Hook for getting club matches with pagination
export const useClubMatches = (clubId: number | null): UseClubMatchesReturn => {
  const [matches, setMatches] = useState<MatchWithPlayers[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  const limit = 20;

  const fetchMatches = useCallback(async (reset: boolean = false) => {
    if (!clubId) return;

    setLoading(true);
    setError(null);

    const currentOffset = reset ? 0 : offset;

    try {
      const data = await MatchService.getClubMatches(clubId, limit, currentOffset);

      if (reset) {
        setMatches(data);
        setOffset(limit);
      } else {
        setMatches((prev) => [...prev, ...data]);
        setOffset((prev) => prev + limit);
      }

      setHasMore(data.length === limit);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch matches');
    } finally {
      setLoading(false);
    }
  }, [clubId, offset]);

  useEffect(() => {
    fetchMatches(true);
  }, [clubId]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchMatches(false);
    }
  }, [loading, hasMore, fetchMatches]);

  const refetch = useCallback(() => {
    setOffset(0);
    fetchMatches(true);
  }, [fetchMatches]);

  return {
    matches,
    loading,
    error,
    loadMore,
    hasMore,
    refetch,
  };
};

// Hook for getting player statistics
export const usePlayerStats = (clubId: number | null, userId: string | null): UsePlayerStatsReturn => {
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!clubId || !userId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await MatchService.getPlayerStats(clubId, userId);
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch player stats');
    } finally {
      setLoading(false);
    }
  }, [clubId, userId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
};