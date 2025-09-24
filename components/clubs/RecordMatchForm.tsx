import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  TextInput,
  Modal,
} from 'react-native';
import { ClubMemberWithRating, RecordMatchRequest } from '@/types/matches';
import { useRecordMatch } from '@/hooks/useMatches';
import { MatchService } from '@/services/matchService';

interface RecordMatchFormProps {
  visible: boolean;
  onClose: () => void;
  clubId: number;
  members: ClubMemberWithRating[];
  onMatchRecorded?: () => void;
}

interface PlayerSelectorProps {
  title: string;
  selectedPlayer: ClubMemberWithRating | null;
  onSelect: (player: ClubMemberWithRating) => void;
  members: ClubMemberWithRating[];
  excludePlayer?: ClubMemberWithRating | null;
}

const PlayerSelector: React.FC<PlayerSelectorProps> = ({
  title,
  selectedPlayer,
  onSelect,
  members,
  excludePlayer,
}) => {
  const [showPicker, setShowPicker] = useState(false);

  const availableMembers = members.filter(m => m.user_id !== excludePlayer?.user_id);

  return (
    <View style={styles.selectorContainer}>
      <Text style={styles.selectorLabel}>{title}</Text>
      <TouchableOpacity
        style={[styles.selectorButton, selectedPlayer && styles.selectorButtonSelected]}
        onPress={() => setShowPicker(true)}
      >
        {selectedPlayer ? (
          <View style={styles.selectedPlayerInfo}>
            <Text style={styles.selectedPlayerName}>{selectedPlayer.display_name}</Text>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>{selectedPlayer.elo_rating}</Text>
            </View>
          </View>
        ) : (
          <Text style={styles.selectorPlaceholder}>Select player</Text>
        )}
      </TouchableOpacity>

      <Modal visible={showPicker} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.pickerContainer}>
          <View style={styles.pickerHeader}>
            <TouchableOpacity onPress={() => setShowPicker(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.pickerTitle}>{title}</Text>
            <View style={{ width: 60 }} />
          </View>

          <ScrollView style={styles.playersList}>
            {availableMembers.map((member) => (
              <TouchableOpacity
                key={member.user_id}
                style={styles.playerOption}
                onPress={() => {
                  onSelect(member);
                  setShowPicker(false);
                }}
              >
                <View style={styles.playerOptionInfo}>
                  <Text style={styles.playerOptionName}>{member.display_name}</Text>
                  <Text style={styles.playerOptionStats}>
                    {member.elo_rating} • {member.matches_won}-{member.matches_lost} ({member.win_rate ? member.win_rate.toFixed(0) : 0}%)
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
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
  const [player1, setPlayer1] = useState<ClubMemberWithRating | null>(null);
  const [player2, setPlayer2] = useState<ClubMemberWithRating | null>(null);
  const [player1Sets, setPlayer1Sets] = useState('');
  const [player2Sets, setPlayer2Sets] = useState('');
  const [notes, setNotes] = useState('');

  const { recordMatch, loading } = useRecordMatch();

  const resetForm = () => {
    setPlayer1(null);
    setPlayer2(null);
    setPlayer1Sets('');
    setPlayer2Sets('');
    setNotes('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateForm = (): boolean => {
    if (!player1 || !player2) {
      Alert.alert('Error', 'Please select both players');
      return false;
    }

    if (player1.user_id === player2.user_id) {
      Alert.alert('Error', 'Please select different players');
      return false;
    }

    const p1Sets = parseInt(player1Sets);
    const p2Sets = parseInt(player2Sets);

    if (isNaN(p1Sets) || isNaN(p2Sets) || p1Sets < 0 || p2Sets < 0) {
      Alert.alert('Error', 'Please enter valid set scores');
      return false;
    }

    if (p1Sets === p2Sets) {
      Alert.alert('Error', 'Match must have a winner (different set scores)');
      return false;
    }

    if (p1Sets > 5 || p2Sets > 5) {
      Alert.alert('Error', 'Set scores seem unusually high. Please check your input.');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const matchRequest: RecordMatchRequest = {
      club_id: clubId,
      player1_id: player1!.user_id,
      player2_id: player2!.user_id,
      player1_sets: parseInt(player1Sets),
      player2_sets: parseInt(player2Sets),
      notes: notes.trim() || undefined,
    };

    try {
      const result = await recordMatch(matchRequest);

      if (result.success) {
        const winner = result.player1_elo_change > 0 ? player1!.display_name : player2!.display_name;
        const winnerChange = Math.abs(result.player1_elo_change > 0 ? result.player1_elo_change : result.player2_elo_change);
        const loserChange = Math.abs(result.player1_elo_change < 0 ? result.player1_elo_change : result.player2_elo_change);

        Alert.alert(
          'Match Recorded!',
          `${winner} wins!\n\n` +
          `Rating changes:\n` +
          `${player1!.display_name}: ${result.player1_elo_change > 0 ? '+' : ''}${result.player1_elo_change}\n` +
          `${player2!.display_name}: ${result.player2_elo_change > 0 ? '+' : ''}${result.player2_elo_change}`,
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
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to record match');
    }
  };

  const winProbability = player1 && player2
    ? MatchService.calculateWinProbability(player1.elo_rating, player2.elo_rating)
    : null;

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
          <PlayerSelector
            title="Player 1"
            selectedPlayer={player1}
            onSelect={setPlayer1}
            members={members}
            excludePlayer={player2}
          />

          <View style={styles.vsContainer}>
            <Text style={styles.vsText}>VS</Text>
          </View>

          <PlayerSelector
            title="Player 2"
            selectedPlayer={player2}
            onSelect={setPlayer2}
            members={members}
            excludePlayer={player1}
          />

          {winProbability && (
            <View style={styles.predictionContainer}>
              <Text style={styles.predictionText}>
                {player1!.display_name} has a {winProbability}% chance of winning
              </Text>
            </View>
          )}

          <View style={styles.scoresContainer}>
            <Text style={styles.scoresTitle}>Final Score (Sets)</Text>
            <View style={styles.scoresRow}>
              <View style={styles.scoreInput}>
                <Text style={styles.scoreLabel}>{player1?.display_name || 'Player 1'}</Text>
                <TextInput
                  style={styles.scoreField}
                  value={player1Sets}
                  onChangeText={setPlayer1Sets}
                  placeholder="0"
                  keyboardType="numeric"
                  maxLength={1}
                />
              </View>

              <Text style={styles.scoreSeparator}>-</Text>

              <View style={styles.scoreInput}>
                <Text style={styles.scoreLabel}>{player2?.display_name || 'Player 2'}</Text>
                <TextInput
                  style={styles.scoreField}
                  value={player2Sets}
                  onChangeText={setPlayer2Sets}
                  placeholder="0"
                  keyboardType="numeric"
                  maxLength={1}
                />
              </View>
            </View>
          </View>

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
  selectorContainer: {
    marginBottom: 20,
  },
  selectorLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#333',
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
  selectorPlaceholder: {
    color: '#999',
    fontSize: 16,
  },
  selectedPlayerInfo: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  selectedPlayerName: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: '#333',
  },
  ratingBadge: {
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
  vsContainer: {
    alignItems: 'center' as const,
    marginVertical: 16,
  },
  vsText: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#666',
  },
  predictionContainer: {
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  predictionText: {
    textAlign: 'center' as const,
    color: '#1976d2',
    fontSize: 14,
    fontWeight: '500' as const,
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
  pickerContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  pickerHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#1a1a1a',
  },
  playersList: {
    flex: 1,
  },
  playerOption: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  playerOptionInfo: {
    flex: 1,
  },
  playerOptionName: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: '#333',
    marginBottom: 4,
  },
  playerOptionStats: {
    fontSize: 14,
    color: '#666',
  },
};