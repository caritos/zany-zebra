import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { MatchFilter, MatchFilters } from './MatchFilter';

interface MatchSet {
  set_number: number;
  team1_games: number;
  team2_games: number;
  team1_tiebreak_points: number | null;
  team2_tiebreak_points: number | null;
  winner: number;
}

interface MatchRecord {
  id: number;
  club_id: number;
  match_type: 'singles' | 'doubles';
  // Team 1
  team1_player1_user_id: string | null;
  team1_player1_guest_name: string | null;
  team1_player2_user_id: string | null;
  team1_player2_guest_name: string | null;
  // Team 2
  team2_player1_user_id: string | null;
  team2_player1_guest_name: string | null;
  team2_player2_user_id: string | null;
  team2_player2_guest_name: string | null;
  // Winner (1 or 2)
  winner: number;
  match_date: string;
  notes: string | null;
  recorded_by: string;
  // Relations
  team1_player1_user: { email: string; nickname: string | null } | null;
  team1_player2_user: { email: string; nickname: string | null } | null;
  team2_player1_user: { email: string; nickname: string | null } | null;
  team2_player2_user: { email: string; nickname: string | null } | null;
  recorded_by_user: { email: string; nickname: string | null };
  // Sets
  match_sets: MatchSet[];
}

interface ClubMatchesListProps {
  clubId: number;
  onRefresh?: () => void;
}

interface PlayerInfo {
  name: string;
  isGuest: boolean;
  userId: string | null;
}

export const ClubMatchesList: React.FC<ClubMatchesListProps> = ({
  clubId,
  onRefresh,
}) => {
  const [matches, setMatches] = useState<MatchRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [filters, setFilters] = useState<MatchFilters>({
    matchType: 'all',
    involvement: 'all_matches',
  });

  useEffect(() => {
    loadMatches();
    getCurrentUser();
  }, [clubId]); // eslint-disable-line react-hooks/exhaustive-deps

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
  };

  const loadMatches = async () => {
    try {
      setLoading(true);

      // First, get the basic match records
      const { data: matchData, error: matchError } = await supabase
        .from('match_records')
        .select('*')
        .eq('club_id', clubId)
        .order('match_date', { ascending: false })
        .limit(50);

      if (matchError) throw matchError;

      console.log('Raw match data from database:', matchData?.slice(0, 2).map(m => ({
        id: m.id,
        match_date: m.match_date,
        match_date_type: typeof m.match_date
      })));

      if (!matchData || matchData.length === 0) {
        setMatches([]);
        return;
      }

      // Fetch sets for all matches
      const matchIds = matchData.map(m => m.id);
      const { data: setsData, error: setsError } = await supabase
        .from('match_sets')
        .select('*')
        .in('match_id', matchIds)
        .order('match_id')
        .order('set_number');

      if (setsError) {
        console.warn('Could not fetch match sets:', setsError);
      }

      console.log('Raw sets data from database:', setsData);

      // Group sets by match_id
      const setsByMatch = new Map<number, MatchSet[]>();
      if (setsData) {
        setsData.forEach((set) => {
          if (!setsByMatch.has(set.match_id)) {
            setsByMatch.set(set.match_id, []);
          }
          setsByMatch.get(set.match_id)!.push({
            set_number: set.set_number,
            team1_games: set.team1_games,
            team2_games: set.team2_games,
            team1_tiebreak_points: set.team1_tiebreak_points,
            team2_tiebreak_points: set.team2_tiebreak_points,
            winner: set.winner
          });
        });
      }

      console.log('Sets grouped by match:', Object.fromEntries(setsByMatch));

      // Collect all unique user IDs from the matches
      const userIds = new Set<string>();
      matchData.forEach((match) => {
        if (match.team1_player1_user_id) userIds.add(match.team1_player1_user_id);
        if (match.team1_player2_user_id) userIds.add(match.team1_player2_user_id);
        if (match.team2_player1_user_id) userIds.add(match.team2_player1_user_id);
        if (match.team2_player2_user_id) userIds.add(match.team2_player2_user_id);
        if (match.recorded_by) userIds.add(match.recorded_by);
      });

      // Fetch profile data for all users
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, nickname')
        .in('id', Array.from(userIds));

      if (profileError) {
        console.warn('Could not fetch profiles:', profileError);
      }

      // Create a map of user profiles
      const profileMap = new Map();
      if (profiles) {
        profiles.forEach((profile) => {
          profileMap.set(profile.id, profile);
        });
      }

      // Combine match data with profile information and sets
      const matchesWithProfiles = matchData.map((match) => ({
        ...match,
        team1_player1_user: match.team1_player1_user_id
          ? profileMap.get(match.team1_player1_user_id) || { email: 'Unknown', nickname: null }
          : null,
        team1_player2_user: match.team1_player2_user_id
          ? profileMap.get(match.team1_player2_user_id) || { email: 'Unknown', nickname: null }
          : null,
        team2_player1_user: match.team2_player1_user_id
          ? profileMap.get(match.team2_player1_user_id) || { email: 'Unknown', nickname: null }
          : null,
        team2_player2_user: match.team2_player2_user_id
          ? profileMap.get(match.team2_player2_user_id) || { email: 'Unknown', nickname: null }
          : null,
        recorded_by_user: match.recorded_by
          ? profileMap.get(match.recorded_by) || { email: 'Unknown', nickname: null }
          : { email: 'Unknown', nickname: null },
        match_sets: setsByMatch.get(match.id) || []
      }));

      console.log('Final matches with sets:', matchesWithProfiles.map(m => ({
        id: m.id,
        match_date: m.match_date,
        sets_count: m.match_sets.length,
        sets: m.match_sets
      })));

      setMatches(matchesWithProfiles);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load matches');
    } finally {
      setLoading(false);
    }
  };


  const getPlayerInfo = (
    userObj: { email: string; nickname: string | null } | null,
    guestName: string | null
  ): PlayerInfo => {
    if (userObj) {
      return {
        name: userObj.nickname || userObj.email.split('@')[0], // Use nickname if available, else email prefix
        isGuest: false,
        userId: null, // We don't need the userId for display, just checking if it's a user
      };
    } else if (guestName) {
      return {
        name: guestName,
        isGuest: true,
        userId: null,
      };
    }
    return { name: 'Unknown', isGuest: false, userId: null };
  };


  const isUserInvolvedInMatch = (match: MatchRecord): boolean => {
    if (!currentUserId) return false;

    return (
      match.team1_player1_user_id === currentUserId ||
      match.team1_player2_user_id === currentUserId ||
      match.team2_player1_user_id === currentUserId ||
      match.team2_player2_user_id === currentUserId
    );
  };

  const filteredMatches = useMemo(() => {
    let filtered = matches;

    // Filter by match type
    if (filters.matchType !== 'all') {
      filtered = filtered.filter(match => match.match_type === filters.matchType);
    }

    // Filter by involvement
    if (filters.involvement === 'my_matches') {
      filtered = filtered.filter(match => isUserInvolvedInMatch(match));
    }

    return filtered;
  }, [matches, filters, currentUserId]); // eslint-disable-line react-hooks/exhaustive-deps

  const formatDate = (dateString: string) => {
    // Handle null or undefined dates
    if (!dateString) {
      return 'Date not set';
    }

    // Handle both date formats from database:
    // 1. "2025-09-29T00:00:00+00:00" (with timezone)
    // 2. "2025-09-29" (date only)

    let localDate;

    // If it includes 'T', it's already a full datetime string
    if (dateString.includes('T')) {
      // Extract just the date part (YYYY-MM-DD) and treat as local date
      const datePart = dateString.split('T')[0];
      localDate = new Date(datePart + 'T00:00:00');
    } else {
      // Plain date format
      localDate = new Date(dateString + 'T00:00:00');
    }

    // Check if date is valid
    if (isNaN(localDate.getTime())) {
      return 'Invalid Date';
    }

    return localDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };


  const renderMatch = (match: MatchRecord) => {
    const team1Player1Info = getPlayerInfo(match.team1_player1_user, match.team1_player1_guest_name);
    const team1Player2Info = match.match_type === 'doubles'
      ? getPlayerInfo(match.team1_player2_user, match.team1_player2_guest_name)
      : null;

    const team2Player1Info = getPlayerInfo(match.team2_player1_user, match.team2_player1_guest_name);
    const team2Player2Info = match.match_type === 'doubles'
      ? getPlayerInfo(match.team2_player2_user, match.team2_player2_guest_name)
      : null;

    const isTeam1Winner = match.winner === 1;
    const isTeam2Winner = match.winner === 2;

    return (
      <View key={match.id} style={styles.matchCard}>
        <View style={styles.matchHeader}>
          <Text style={styles.matchDate}>{formatDate(match.match_date)}</Text>
        </View>

        {/* Team 1 */}
        <View style={[styles.scoreRow, isTeam1Winner && styles.winnerRow]}>
          <View style={styles.playerSection}>
            <View style={styles.playerNameContainer}>
              <Text style={[styles.playerNameInScore, isTeam1Winner && styles.winnerText]}>
                {team1Player1Info.name}
              </Text>
              {team1Player1Info.isGuest && (
                <View style={styles.guestBadge}>
                  <Text style={styles.guestBadgeText}>GUEST</Text>
                </View>
              )}
              {team1Player2Info && (
                <>
                  <Text style={[styles.playerNameInScore, isTeam1Winner && styles.winnerText]}> / {team1Player2Info.name}</Text>
                  {team1Player2Info.isGuest && (
                    <View style={styles.guestBadge}>
                      <Text style={styles.guestBadgeText}>GUEST</Text>
                    </View>
                  )}
                </>
              )}
            </View>
            {isTeam1Winner && (
              <View style={styles.winnerIndicatorLeft}>
                <Text style={styles.winnerArrow}>◀</Text>
              </View>
            )}
          </View>
          <View style={styles.scoresSection}>
            {match.match_sets && match.match_sets.length > 0 ? (
              <>
                {match.match_sets.map((set, index) => (
                  <View key={index} style={styles.setScoreContainer}>
                    <Text
                      style={[
                        styles.setScore,
                        set.winner === 1 ? styles.setWon : styles.setLost
                      ]}
                    >
                      {set.team1_games}
                    </Text>
                    {set.team1_tiebreak_points !== null && (
                      <Text style={styles.tiebreakScore}>
                        {set.team1_tiebreak_points}
                      </Text>
                    )}
                  </View>
                ))}
              </>
            ) : (
              <Text style={[styles.setScore, isTeam1Winner ? styles.setWon : styles.setLost]}>
                {isTeam1Winner ? '1' : '0'}
              </Text>
            )}
          </View>
        </View>

        {/* Team 2 */}
        <View style={[styles.scoreRow, isTeam2Winner && styles.winnerRow]}>
          <View style={styles.playerSection}>
            <View style={styles.playerNameContainer}>
              <Text style={[styles.playerNameInScore, isTeam2Winner && styles.winnerText]}>
                {team2Player1Info.name}
              </Text>
              {team2Player1Info.isGuest && (
                <View style={styles.guestBadge}>
                  <Text style={styles.guestBadgeText}>GUEST</Text>
                </View>
              )}
              {team2Player2Info && (
                <>
                  <Text style={[styles.playerNameInScore, isTeam2Winner && styles.winnerText]}> / {team2Player2Info.name}</Text>
                  {team2Player2Info.isGuest && (
                    <View style={styles.guestBadge}>
                      <Text style={styles.guestBadgeText}>GUEST</Text>
                    </View>
                  )}
                </>
              )}
            </View>
            {isTeam2Winner && (
              <View style={styles.winnerIndicatorLeft}>
                <Text style={styles.winnerArrow}>◀</Text>
              </View>
            )}
          </View>
          <View style={styles.scoresSection}>
            {match.match_sets && match.match_sets.length > 0 ? (
              <>
                {match.match_sets.map((set, index) => (
                  <View key={index} style={styles.setScoreContainer}>
                    <Text
                      style={[
                        styles.setScore,
                        set.winner === 2 ? styles.setWon : styles.setLost
                      ]}
                    >
                      {set.team2_games}
                    </Text>
                    {set.team2_tiebreak_points !== null && (
                      <Text style={styles.tiebreakScore}>
                        {set.team2_tiebreak_points}
                      </Text>
                    )}
                  </View>
                ))}
              </>
            ) : (
              <Text style={[styles.setScore, isTeam2Winner ? styles.setWon : styles.setLost]}>
                {isTeam2Winner ? '1' : '0'}
              </Text>
            )}
          </View>
        </View>

        {match.notes && (
          <View style={styles.matchFooter}>
            <Text style={styles.matchNotes}>{match.notes}</Text>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading matches...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Filter Component */}
      <MatchFilter filters={filters} onFiltersChange={setFilters} />

      <ScrollView
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadMatches} />
        }
      >
        {matches.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No matches recorded yet</Text>
            <Text style={styles.emptySubtext}>
              Record your first match to see it here
            </Text>
          </View>
        ) : filteredMatches.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No matches found</Text>
            <Text style={styles.emptySubtext}>
              Try adjusting your filters to see more matches
            </Text>
          </View>
        ) : (
          <View style={styles.matchesList}>
            <Text style={styles.sectionTitle}>
              {filters.matchType === 'all' ? 'Recent Matches' : `${filters.matchType.charAt(0).toUpperCase() + filters.matchType.slice(1)} Matches`} ({filteredMatches.length})
            </Text>
            {filteredMatches.map(renderMatch)}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center' as const,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center' as const,
  },
  matchesList: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#333',
    marginBottom: 16,
  },
  matchCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  matchHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  matchDate: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right' as const,
  },
  scoreRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  winnerRow: {
    backgroundColor: '#f8f9fa',
  },
  playerSection: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  playerNameContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    flexWrap: 'wrap' as const,
    flex: 1,
  },
  playerNameInScore: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500' as const,
  },
  scoresSection: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 16,
  },
  setScoreContainer: {
    alignItems: 'center' as const,
    minWidth: 40,
  },
  setScore: {
    fontSize: 24,
    fontWeight: '600' as const,
    textAlign: 'center' as const,
  },
  setWon: {
    color: '#000',
  },
  setLost: {
    color: '#999',
  },
  tiebreakScore: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  winnerIndicator: {
    marginLeft: 12,
  },
  winnerIndicatorLeft: {
    marginLeft: 8,
  },
  winnerArrow: {
    fontSize: 20,
    color: '#000',
  },
  matchFooter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  matchLocation: {
    fontSize: 12,
    color: '#666',
  },
  matchNotes: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic' as const,
  },
  // Keep these for other components that might use them
  playerRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    marginBottom: 4,
    paddingVertical: 2,
  },
  playerName: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500' as const,
    flex: 1,
  },
  guestBadge: {
    backgroundColor: '#FF9500',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    marginHorizontal: 4,
  },
  guestBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '600' as const,
  },
  claimButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    minWidth: 50,
    alignItems: 'center' as const,
  },
  claimButtonDisabled: {
    backgroundColor: '#ccc',
  },
  claimButtonText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600' as const,
  },
  winnerText: {
    fontWeight: '600' as const,
  },
};