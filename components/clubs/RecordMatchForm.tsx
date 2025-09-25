import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  TextInput,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { ClubMemberWithRating } from '@/types/matches';
import { SetScore, TennisScoring } from '@/types/tennis-scoring';
import { SetScoreInput } from './SetScoreInput';
import { supabase } from '@/lib/supabase';

interface RecordMatchFormProps {
  visible: boolean;
  onClose: () => void;
  clubId: number;
  members: ClubMemberWithRating[];
  onMatchRecorded?: () => void;
}

type PlayerOption = ClubMemberWithRating | { type: 'guest'; name: string; id: string };

interface PlayerSelectorProps {
  title: string;
  selectedPlayer: PlayerOption | null;
  onSelectPlayer: (player: PlayerOption) => void;
  members: ClubMemberWithRating[];
  excludePlayerIds?: string[];
}

const PlayerSelector: React.FC<PlayerSelectorProps> = ({
  title,
  selectedPlayer,
  onSelectPlayer,
  members,
  excludePlayerIds = [],
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchText, setSearchText] = useState('');

  const filteredMembers = useMemo(() => {
    return members.filter(member =>
      !excludePlayerIds.includes(member.user_id) &&
      (member.email.toLowerCase().includes(searchText.toLowerCase()) ||
       member.nickname?.toLowerCase().includes(searchText.toLowerCase()))
    );
  }, [members, searchText, excludePlayerIds]);

  const handleSelectMember = (member: ClubMemberWithRating) => {
    onSelectPlayer(member);
    setShowDropdown(false);
    setSearchText('');
  };

  const handleAddGuest = () => {
    if (!searchText.trim()) {
      Alert.alert('Error', 'Please enter a guest player name');
      return;
    }

    const guestPlayer: PlayerOption = {
      type: 'guest',
      name: searchText.trim(),
      id: `guest_${Date.now()}`,
    };

    onSelectPlayer(guestPlayer);
    setShowDropdown(false);
    setSearchText('');
  };

  const getDisplayName = (player: PlayerOption | null): string => {
    if (!player) return 'Select player';
    if ('type' in player) return player.name;
    return player.display_name;
  };

  const renderMemberItem = ({ item }: { item: ClubMemberWithRating }) => (
    <TouchableOpacity
      style={styles.dropdownItem}
      onPress={() => handleSelectMember(item)}
    >
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>
          {item.nickname ? `${item.nickname} (${item.email})` : item.email}
        </Text>
        <Text style={styles.memberRating}>Rating: {item.elo_rating || 1200}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.selectorContainer}>
      <Text style={styles.selectorLabel}>{title}</Text>

      <TouchableOpacity
        style={[styles.selectorButton, selectedPlayer && styles.selectorButtonSelected]}
        onPress={() => setShowDropdown(true)}
      >
        <View style={styles.selectedPlayerInfo}>
          <Text style={styles.selectedPlayerText}>
            {getDisplayName(selectedPlayer)}
          </Text>
          {selectedPlayer && (
            <View style={styles.playerBadge}>
              {'type' in selectedPlayer ? (
                <Text style={styles.guestBadgeText}>Guest</Text>
              ) : (
                <Text style={styles.ratingText}>{selectedPlayer.elo_rating}</Text>
              )}
            </View>
          )}
        </View>
      </TouchableOpacity>

      <Modal visible={showDropdown} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView
          style={styles.dropdownContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.dropdownHeader}>
            <TouchableOpacity onPress={() => setShowDropdown(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.dropdownTitle}>{title}</Text>
            <View style={{ width: 60 }} />
          </View>

          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search players or enter guest name"
              value={searchText}
              onChangeText={setSearchText}
              autoFocus
            />
          </View>

          {searchText.trim().length > 0 && (
            <TouchableOpacity
              style={styles.addGuestButton}
              onPress={handleAddGuest}
            >
              <Text style={styles.addGuestText}>
                ➕ Add &quot;{searchText.trim()}&quot; as Guest Player
              </Text>
            </TouchableOpacity>
          )}

          <FlatList
            data={filteredMembers}
            renderItem={renderMemberItem}
            keyExtractor={(item) => item.user_id}
            style={styles.membersList}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {searchText ? 'No members found' : 'Start typing to search members'}
                </Text>
              </View>
            }
          />
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

export const RecordMatchForm: React.FC<RecordMatchFormProps> = ({
  visible,
  onClose,
  clubId,
  members,
  onMatchRecorded,
}) => {
  // Auto-detect match type based on number of selected players
  const getMatchType = (): 'singles' | 'doubles' => {
    const playerCount = [team1Player1, team1Player2, team2Player1, team2Player2].filter(Boolean).length;
    return playerCount > 2 ? 'doubles' : 'singles';
  };

  // Team 1 players
  const [team1Player1, setTeam1Player1] = useState<PlayerOption | null>(null);
  const [team1Player2, setTeam1Player2] = useState<PlayerOption | null>(null);

  // Team 2 players
  const [team2Player1, setTeam2Player1] = useState<PlayerOption | null>(null);
  const [team2Player2, setTeam2Player2] = useState<PlayerOption | null>(null);

  const [sets, setSets] = useState<SetScore[]>([{ team1_games: 0, team2_games: 0, tie_breaker: null }]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  // Auto-select current user as team1Player1 when form opens
  useEffect(() => {
    if (visible && members.length > 0 && !team1Player1) {
      const getCurrentUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const currentMember = members.find(m => m.user_id === user.id);
          if (currentMember) {
            setTeam1Player1(currentMember);
          }
        }
      };
      getCurrentUser();
    }
  }, [visible, members, team1Player1]);

  const resetForm = () => {
    // Reset all players except current user as team1Player1 will be auto-set
    setTeam1Player1(null);
    setTeam1Player2(null);
    setTeam2Player1(null);
    setTeam2Player2(null);
    setSets([{ team1_games: 0, team2_games: 0, tie_breaker: null }]);
    setNotes('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const excludedPlayerIds = useMemo(() => {
    const ids: string[] = [];

    if (team1Player1 && 'user_id' in team1Player1) ids.push(team1Player1.user_id);
    if (team1Player2 && 'user_id' in team1Player2) ids.push(team1Player2.user_id);
    if (team2Player1 && 'user_id' in team2Player1) ids.push(team2Player1.user_id);
    if (team2Player2 && 'user_id' in team2Player2) ids.push(team2Player2.user_id);

    return ids;
  }, [team1Player1, team1Player2, team2Player1, team2Player2]);

  const validateForm = (): boolean => {
    // Check required players
    if (!team1Player1 || !team2Player1) {
      Alert.alert('Error', 'Please select players for both teams');
      return false;
    }

    const matchType = getMatchType();
    if (matchType === 'doubles' && (!team1Player2 || !team2Player2)) {
      Alert.alert('Error', 'Please select all 4 players for doubles match');
      return false;
    }

    // Validate sets
    if (sets.length === 0) {
      Alert.alert('Error', 'Please add at least one set');
      return false;
    }

    // Check each set is valid
    for (let i = 0; i < sets.length; i++) {
      const set = sets[i];
      if (!TennisScoring.isValidSetScore(set.team1_games, set.team2_games)) {
        Alert.alert('Error', `Set ${i + 1} has invalid score`);
        return false;
      }

      // Check tie breaker if needed
      if (TennisScoring.needsTieBreaker(set.team1_games, set.team2_games)) {
        if (!set.tie_breaker || !TennisScoring.isValidTieBreaker(set.tie_breaker.team1_points, set.tie_breaker.team2_points)) {
          Alert.alert('Error', `Set ${i + 1} needs a valid tie breaker`);
          return false;
        }
      }
    }

    // All sets are valid, match can proceed (ties are allowed in recreational play)

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Prepare player data
      const getPlayerData = (player: PlayerOption | null) => {
        if (!player) return { userId: null, guestName: null };
        if ('type' in player) {
          return { userId: null, guestName: player.name };
        } else {
          return { userId: player.user_id, guestName: null };
        }
      };

      const team1Player1Data = getPlayerData(team1Player1);
      const team1Player2Data = getPlayerData(team1Player2);
      const team2Player1Data = getPlayerData(team2Player1);
      const team2Player2Data = getPlayerData(team2Player2);

      // Calculate match result using TennisScoring helper
      const matchResult = TennisScoring.calculateMatchResult(sets, 'best_of_3');
      const winner = matchResult.winner;
      const team1SetsWon = matchResult.team1_sets_won;
      const team2SetsWon = matchResult.team2_sets_won;

      // Record the match
      const matchType = getMatchType();
      const { error: matchError } = await supabase
        .from('match_records')
        .insert({
          club_id: clubId,
          match_type: matchType,
          team1_player1_user_id: team1Player1Data.userId,
          team1_player1_guest_name: team1Player1Data.guestName,
          team1_player2_user_id: team1Player2Data.userId,
          team1_player2_guest_name: team1Player2Data.guestName,
          team2_player1_user_id: team2Player1Data.userId,
          team2_player1_guest_name: team2Player1Data.guestName,
          team2_player2_user_id: team2Player2Data.userId,
          team2_player2_guest_name: team2Player2Data.guestName,
          winner: winner,
          game_scores: {
            sets: sets
          },
          match_date: new Date().toISOString(),
          recorded_by: user.id,
          notes: notes.trim() || null,
        });

      if (matchError) throw matchError;

      const matchResultMessage = winner === null
        ? `Match tied ${team1SetsWon}-${team2SetsWon}!`
        : `Team ${winner} wins ${team1SetsWon}-${team2SetsWon}!`;

      Alert.alert(
        'Match Recorded!',
        matchResultMessage,
        [
          {
            text: 'OK',
            onPress: () => {
              handleClose();
              onMatchRecorded?.();
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to record match');
    } finally {
      setLoading(false);
    }
  };

  const addSet = () => {
    setSets([...sets, { team1_games: 0, team2_games: 0, tie_breaker: null }]);
  };

  const removeSet = (index: number) => {
    if (sets.length > 1) {
      setSets(sets.filter((_, i) => i !== index));
    }
  };

  const updateSetScore = useCallback((index: number, setScore: SetScore) => {
    setSets(prevSets => {
      const newSets = [...prevSets];
      newSets[index] = setScore;
      return newSets;
    });
  }, []);

  const getPlayerDisplayName = (player: PlayerOption | null): string => {
    if (!player) return 'Select player';
    if ('type' in player) return player.name;
    return player.nickname ? `${player.nickname} (${player.email})` : player.email;
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Record Match</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Match Type Display */}
          <View style={styles.matchTypeContainer}>
            <Text style={styles.sectionTitle}>Match Type: {getMatchType() === 'singles' ? 'Singles' : 'Doubles'}</Text>
            <Text style={styles.matchTypeHint}>
              {getMatchType() === 'singles' ? 'Add 1 more player for singles' : 'Add 3 more players for doubles'}
            </Text>
          </View>

          {/* Team 1 */}
          <View style={styles.teamContainer}>
            <Text style={styles.teamTitle}>Team 1</Text>

            <View style={styles.lockedPlayerContainer}>
              <Text style={styles.lockedPlayerLabel}>Player 1 (You)</Text>
              <View style={styles.lockedPlayerDisplay}>
                <Text style={styles.lockedPlayerText}>
                  {team1Player1 ? getPlayerDisplayName(team1Player1) : 'Loading...'}
                </Text>
                <View style={styles.lockedBadge}>
                  <Text style={styles.lockedBadgeText}>Me</Text>
                </View>
              </View>
            </View>

            <PlayerSelector
              title="Player 2 (Your Partner) - Optional"
              selectedPlayer={team1Player2}
              onSelectPlayer={setTeam1Player2}
              members={members}
              excludePlayerIds={excludedPlayerIds.filter(id =>
                team1Player2 && 'user_id' in team1Player2 ? id !== team1Player2.user_id : true
              )}
            />
          </View>

          <View style={styles.vsContainer}>
            <Text style={styles.vsText}>VS</Text>
          </View>

          {/* Team 2 */}
          <View style={styles.teamContainer}>
            <Text style={styles.teamTitle}>Team 2</Text>

            <PlayerSelector
              title={getMatchType() === 'singles' ? 'Opponent' : 'Player 1'}
              selectedPlayer={team2Player1}
              onSelectPlayer={setTeam2Player1}
              members={members}
              excludePlayerIds={excludedPlayerIds.filter(id =>
                team2Player1 && 'user_id' in team2Player1 ? id !== team2Player1.user_id : true
              )}
            />

            <PlayerSelector
              title="Player 2 - Optional"
              selectedPlayer={team2Player2}
              onSelectPlayer={setTeam2Player2}
              members={members}
              excludePlayerIds={excludedPlayerIds.filter(id =>
                team2Player2 && 'user_id' in team2Player2 ? id !== team2Player2.user_id : true
              )}
            />
          </View>

          {/* Sets Score Input */}
          <View style={styles.setsContainer}>
            <View style={styles.setsHeader}>
              <Text style={styles.sectionTitle}>Set Scores</Text>
              <TouchableOpacity
                style={styles.addSetButton}
                onPress={addSet}
              >
                <Text style={styles.addSetButtonText}>+ Add Set</Text>
              </TouchableOpacity>
            </View>

            {sets.map((set, index) => (
              <SetScoreInput
                key={index}
                setNumber={index + 1}
                initialScore={set}
                onSetScoreChange={(setScore) => updateSetScore(index, setScore)}
                onRemoveSet={() => removeSet(index)}
                canRemove={sets.length > 1}
              />
            ))}
          </View>

          {/* Notes */}
          <View style={styles.notesContainer}>
            <Text style={styles.notesLabel}>Notes (Optional)</Text>
            <TextInput
              style={styles.notesInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="Match notes..."
              multiline
              numberOfLines={3}
              maxLength={200}
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>Record Match</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  title: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#1a1a1a',
  },
  cancelButton: {
    color: '#007AFF',
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#333',
    marginBottom: 12,
  },
  matchTypeContainer: {
    marginBottom: 20,
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
  },
  matchTypeHint: {
    fontSize: 14,
    color: '#1976D2',
    marginTop: 4,
    fontStyle: 'italic' as const,
  },
  lockedPlayerContainer: {
    marginBottom: 16,
  },
  lockedPlayerLabel: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#666',
    marginBottom: 8,
  },
  lockedPlayerDisplay: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#007AFF',
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  lockedPlayerText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500' as const,
  },
  lockedBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  lockedBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600' as const,
  },
  teamContainer: {
    marginBottom: 20,
  },
  teamTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#333',
    marginBottom: 12,
  },
  selectorContainer: {
    marginBottom: 16,
  },
  selectorLabel: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#666',
    marginBottom: 8,
  },
  selectorButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectorButtonSelected: {
    borderColor: '#007AFF',
  },
  selectedPlayerInfo: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  selectedPlayerText: {
    fontSize: 16,
    color: '#333',
  },
  playerBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600' as const,
  },
  guestBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600' as const,
  },
  vsContainer: {
    alignItems: 'center' as const,
    marginVertical: 16,
  },
  vsText: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#666',
  },
  scoresContainer: {
    marginBottom: 20,
  },
  scoresTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#333',
    marginBottom: 12,
  },
  scoresRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  scoreInput: {
    alignItems: 'center' as const,
    flex: 1,
  },
  scoreLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center' as const,
  },
  scoreField: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    fontSize: 24,
    fontWeight: 'bold' as const,
    textAlign: 'center' as const,
    borderWidth: 1,
    borderColor: '#ddd',
    width: 80,
  },
  scoreSeparator: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#666',
    marginHorizontal: 20,
  },
  notesContainer: {
    marginBottom: 20,
  },
  notesLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#333',
    marginBottom: 8,
  },
  notesInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    textAlignVertical: 'top' as const,
    minHeight: 80,
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center' as const,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  // Dropdown styles
  dropdownContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  dropdownHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  dropdownTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#1a1a1a',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
  },
  searchInput: {
    backgroundColor: '#f1f1f1',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  addGuestButton: {
    backgroundColor: '#34C759',
    margin: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center' as const,
  },
  addGuestText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  membersList: {
    flex: 1,
  },
  dropdownItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: '#333',
    marginBottom: 4,
  },
  memberRating: {
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center' as const,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center' as const,
  },
  // Sets container styles
  setsContainer: {
    marginBottom: 20,
  },
  setsHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 16,
  },
  addSetButton: {
    backgroundColor: '#34C759',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addSetButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600' as const,
  },
};