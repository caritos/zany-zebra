import { useState, useEffect, useCallback } from 'react';
import { ClubService } from '@/services/clubService';
import {
  MyClub,
  ClubMember,
  JoinClubResult,
  LeaveClubResult,
  UseClubMembershipReturn,
  UseMyClubsReturn,
  UseClubMembersReturn,
} from '@/types/clubMembership';

// Hook for checking membership and joining/leaving clubs
export const useClubMembership = (clubId: number | null): UseClubMembershipReturn => {
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkMembership = useCallback(async () => {
    if (!clubId) return;

    setLoading(true);
    setError(null);

    try {
      const memberStatus = await ClubService.isClubMember(clubId);
      setIsMember(memberStatus);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check membership');
    } finally {
      setLoading(false);
    }
  }, [clubId]);

  const joinClub = useCallback(async (): Promise<JoinClubResult> => {
    if (!clubId) {
      return { success: false, message: 'No club selected', membership_id: null };
    }

    setLoading(true);
    setError(null);

    try {
      const result = await ClubService.joinClub(clubId);
      if (result.success) {
        setIsMember(true);
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to join club';
      setError(errorMessage);
      return { success: false, message: errorMessage, membership_id: null };
    } finally {
      setLoading(false);
    }
  }, [clubId]);

  const leaveClub = useCallback(async (): Promise<LeaveClubResult> => {
    if (!clubId) {
      return { success: false, message: 'No club selected' };
    }

    setLoading(true);
    setError(null);

    try {
      const result = await ClubService.leaveClub(clubId);
      if (result.success) {
        setIsMember(false);
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to leave club';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [clubId]);

  useEffect(() => {
    checkMembership();
  }, [checkMembership]);

  return {
    isMember,
    loading,
    error,
    joinClub,
    leaveClub,
    refetch: checkMembership,
  };
};

// Hook for getting user's clubs
export const useMyClubs = (): UseMyClubsReturn => {
  const [clubs, setClubs] = useState<MyClub[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMyClubs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const myClubs = await ClubService.getMyClubs();
      setClubs(myClubs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch your clubs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyClubs();
  }, [fetchMyClubs]);

  return {
    clubs,
    loading,
    error,
    refetch: fetchMyClubs,
  };
};

// Hook for getting club members
export const useClubMembers = (clubId: number | null): UseClubMembersReturn => {
  const [members, setMembers] = useState<ClubMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    if (!clubId) return;

    setLoading(true);
    setError(null);

    try {
      const clubMembers = await ClubService.getClubMembers(clubId);
      setMembers(clubMembers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch club members');
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