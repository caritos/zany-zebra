import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { supabase } from '@/lib/supabase';

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
  // Scores
  team1_sets: number;
  team2_sets: number;
  winner: number;
  match_date: string;
  notes: string | null;
  recorded_by: string;
  // Relations
  team1_player1_user: { display_name: string; username: string } | null;
  team1_player2_user: { display_name: string; username: string } | null;
  team2_player1_user: { display_name: string; username: string } | null;
  team2_player2_user: { display_name: string; username: string } | null;
  recorded_by_user: { display_name: string; username: string };
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
  const [claiming, setClaiming] = useState<number | null>(null); // matchId being claimed

  useEffect(() => {
    loadMatches();
    getCurrentUser();
  }, [clubId]); // loadMatches is recreated on each render, but we only want to run when clubId changes

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
  };

  const loadMatches = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('match_records')
        .select(`
          *,
          team1_player1_user:team1_player1_user_id (
            display_name,
            username
          ),
          team1_player2_user:team1_player2_user_id (
            display_name,
            username
          ),
          team2_player1_user:team2_player1_user_id (
            display_name,
            username
          ),
          team2_player2_user:team2_player2_user_id (
            display_name,
            username
          ),
          recorded_by_user:recorded_by!inner (
            display_name,
            username
          )
        `)
        .eq('club_id', clubId)
        .order('match_date', { ascending: false })
        .limit(50);

      if (error) throw error;

      setMatches(data || []);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load matches');
    } finally {
      setLoading(false);
    }
  };

  const handleClaimMatchSpot = async (
    matchId: number,
    teamNumber: number,
    playerNumber: number,
    guestName: string
  ) => {
    Alert.alert(
      'Claim Match Spot',
      `Claim &quot;${guestName}&quot; as yourself for this match only?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Claim',
          onPress: () => claimMatchSpot(matchId, teamNumber, playerNumber, guestName),
        },
      ]
    );
  };

  const claimMatchSpot = async (
    matchId: number,
    teamNumber: number,
    playerNumber: number,
    guestName: string
  ) => {
    try {
      setClaiming(matchId);

      const { error } = await supabase.rpc('claim_guest_match_spot', {
        p_match_id: matchId,
        p_team_number: teamNumber,
        p_player_number: playerNumber,
      });

      if (error) throw error;

      Alert.alert(
        'Success!',
        `You have successfully claimed the &quot;${guestName}&quot; spot in this match.`,
        [
          {
            text: 'OK',
            onPress: () => {
              loadMatches(); // Refresh matches
              onRefresh?.(); // Refresh parent if needed
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to claim match spot');
    } finally {
      setClaiming(null);
    }
  };

  const getPlayerInfo = (
    userObj: { display_name: string; username: string } | null,
    guestName: string | null
  ): PlayerInfo => {
    if (userObj) {
      return {
        name: userObj.display_name,
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

  const canClaimSpot = (match: MatchRecord, isGuest: boolean): boolean => {
    if (!currentUserId || !isGuest) return false;

    // User can't claim if they're already part of the match
    const isUserInMatch =
      match.team1_player1_user_id === currentUserId ||
      match.team1_player2_user_id === currentUserId ||
      match.team2_player1_user_id === currentUserId ||
      match.team2_player2_user_id === currentUserId;

    return !isUserInMatch;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderPlayer = (
    playerInfo: PlayerInfo,
    match: MatchRecord,
    teamNumber: number,
    playerNumber: number
  ) => (
    <View key={`${teamNumber}-${playerNumber}`} style={styles.playerRow}>
      <Text style={styles.playerName}>{playerInfo.name}</Text>
      {playerInfo.isGuest && (
        <View style={styles.guestBadge}>
          <Text style={styles.guestBadgeText}>Guest</Text>
        </View>
      )}
      {canClaimSpot(match, playerInfo.isGuest) && (
        <TouchableOpacity
          style={[
            styles.claimButton,
            claiming === match.id && styles.claimButtonDisabled,
          ]}
          onPress={() =>
            handleClaimMatchSpot(match.id, teamNumber, playerNumber, playerInfo.name)
          }
          disabled={claiming === match.id}
        >
          {claiming === match.id ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.claimButtonText}>Claim</Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );

  const renderMatch = (match: MatchRecord) => {
    const team1Player1Info = getPlayerInfo(match.team1_player1_user, match.team1_player1_guest_name);
    const team1Player2Info = match.match_type === 'doubles'
      ? getPlayerInfo(match.team1_player2_user, match.team1_player2_guest_name)
      : null;

    const team2Player1Info = getPlayerInfo(match.team2_player1_user, match.team2_player1_guest_name);
    const team2Player2Info = match.match_type === 'doubles'
      ? getPlayerInfo(match.team2_player2_user, match.team2_player2_guest_name)
      : null;

    const winnerTeam = match.winner === 1 ? 'Team 1' : 'Team 2';

    return (
      <View key={match.id} style={styles.matchCard}>
        <View style={styles.matchHeader}>
          <View style={styles.matchInfo}>
            <Text style={styles.matchDate}>{formatDate(match.match_date)}</Text>
            <View style={styles.matchTypeBadge}>
              <Text style={styles.matchTypeText}>
                {match.match_type.charAt(0).toUpperCase() + match.match_type.slice(1)}
              </Text>
            </View>
          </View>
          <View style={styles.winnerBadge}>
            <Text style={styles.winnerText}>
              {winnerTeam} wins
            </Text>
          </View>
        </View>

        <View style={styles.matchContent}>
          <View style={styles.teamsContainer}>
            {/* Team 1 */}
            <View style={styles.team}>
              <View style={styles.teamHeader}>
                <Text style={styles.teamLabel}>Team 1</Text>
                <Text style={styles.teamScore}>{match.team1_sets}</Text>
              </View>
              {renderPlayer(team1Player1Info, match, 1, 1)}
              {team1Player2Info && renderPlayer(team1Player2Info, match, 1, 2)}
            </View>

            <View style={styles.vsContainer}>
              <Text style={styles.vsText}>VS</Text>
            </View>

            {/* Team 2 */}
            <View style={styles.team}>
              <View style={styles.teamHeader}>
                <Text style={styles.teamLabel}>Team 2</Text>
                <Text style={styles.teamScore}>{match.team2_sets}</Text>
              </View>
              {renderPlayer(team2Player1Info, match, 2, 1)}
              {team2Player2Info && renderPlayer(team2Player2Info, match, 2, 2)}
            </View>
          </View>
        </View>

        {match.notes && (
          <Text style={styles.matchNotes}>{match.notes}</Text>
        )}

        <Text style={styles.recordedBy}>
          Recorded by: {match.recorded_by_user.display_name}
        </Text>
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
    <ScrollView
      style={styles.container}
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
      ) : (
        <View style={styles.matchesList}>
          <Text style={styles.sectionTitle}>
            Recent Matches ({matches.length})
          </Text>
          {matches.map(renderMatch)}
        </View>
      )}
    </ScrollView>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  matchHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 12,
  },
  matchInfo: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
  },
  matchDate: {
    fontSize: 12,
    color: '#999',
  },
  matchTypeBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  matchTypeText: {
    color: '#1976D2',
    fontSize: 10,
    fontWeight: '600' as const,
  },
  winnerBadge: {
    backgroundColor: '#34C759',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  winnerText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600' as const,
  },
  matchContent: {
    marginBottom: 8,
  },
  teamsContainer: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-start' as const,
  },
  team: {
    flex: 1,
  },
  teamHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  teamLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#666',
  },
  teamScore: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#333',
  },
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
  vsContainer: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingHorizontal: 8,
  },
  vsText: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#999',
  },
  matchNotes: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic' as const,
    marginTop: 8,
    marginBottom: 4,
  },
  recordedBy: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right' as const,
    marginTop: 8,
  },
};