import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SetScore, TennisScoring } from '@/types/tennis-scoring';

interface SetScoreInputProps {
  setNumber: number;
  initialScore: SetScore;
  onSetScoreChange: (setScore: SetScore) => void;
  onRemoveSet?: () => void;
  canRemove?: boolean;
}

export const SetScoreInput: React.FC<SetScoreInputProps> = ({
  setNumber,
  initialScore,
  onSetScoreChange,
  onRemoveSet,
  canRemove = false,
}) => {
  const [team1Games, setTeam1Games] = useState(initialScore.team1_games.toString());
  const [team2Games, setTeam2Games] = useState(initialScore.team2_games.toString());
  const [showTieBreaker, setShowTieBreaker] = useState(!!initialScore.tie_breaker);
  const [team1TiePoints, setTeam1TiePoints] = useState(initialScore.tie_breaker?.team1_points.toString() || '');
  const [team2TiePoints, setTeam2TiePoints] = useState(initialScore.tie_breaker?.team2_points.toString() || '');

  useEffect(() => {
    const t1Games = parseInt(team1Games) || 0;
    const t2Games = parseInt(team2Games) || 0;

    // Build set score object
    let setScore: SetScore = {
      team1_games: t1Games,
      team2_games: t2Games,
      tie_breaker: null,
    };

    // Add tie breaker if user has enabled it and entered scores
    if (showTieBreaker) {
      const t1Tie = parseInt(team1TiePoints) || 0;
      const t2Tie = parseInt(team2TiePoints) || 0;

      if (t1Tie > 0 || t2Tie > 0) {
        setScore.tie_breaker = {
          team1_points: t1Tie,
          team2_points: t2Tie,
        };
      }
    }

    onSetScoreChange(setScore);
  }, [team1Games, team2Games, team1TiePoints, team2TiePoints, showTieBreaker]);

  const isValidSet = (): boolean => {
    const t1Games = parseInt(team1Games) || 0;
    const t2Games = parseInt(team2Games) || 0;

    if (!TennisScoring.isValidSetScore(t1Games, t2Games)) {
      return false;
    }

    // If tie breaker is shown, validate it
    if (showTieBreaker) {
      const t1Tie = parseInt(team1TiePoints) || 0;
      const t2Tie = parseInt(team2TiePoints) || 0;
      return TennisScoring.isValidTieBreaker(t1Tie, t2Tie);
    }

    return true;
  };

  const getValidationMessage = (): string => {
    const t1Games = parseInt(team1Games) || 0;
    const t2Games = parseInt(team2Games) || 0;

    if (t1Games === 0 && t2Games === 0) return '';

    if (!TennisScoring.isValidSetScore(t1Games, t2Games)) {
      return 'Please enter a valid score';
    }

    if (showTieBreaker) {
      const t1Tie = parseInt(team1TiePoints) || 0;
      const t2Tie = parseInt(team2TiePoints) || 0;
      if (!TennisScoring.isValidTieBreaker(t1Tie, t2Tie)) {
        return 'Tie breaker needs at least some points';
      }
    }

    return '';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.setLabel}>Set {setNumber}</Text>
        {canRemove && onRemoveSet && (
          <TouchableOpacity style={styles.removeButton} onPress={onRemoveSet}>
            <Text style={styles.removeButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.gameScoreRow}>
        <View style={styles.scoreInput}>
          <Text style={styles.teamLabel}>Your Team</Text>
          <TextInput
            style={[styles.gameInput, !isValidSet() && styles.invalidInput]}
            value={team1Games}
            onChangeText={setTeam1Games}
            keyboardType="numeric"
            maxLength={2}
            placeholder="0"
          />
        </View>

        <Text style={styles.scoreSeparator}>-</Text>

        <View style={styles.scoreInput}>
          <Text style={styles.teamLabel}>Opponents</Text>
          <TextInput
            style={[styles.gameInput, !isValidSet() && styles.invalidInput]}
            value={team2Games}
            onChangeText={setTeam2Games}
            keyboardType="numeric"
            maxLength={2}
            placeholder="0"
          />
        </View>
      </View>

      {/* Tie Breaker Toggle */}
      <TouchableOpacity
        style={styles.tieBreakToggle}
        onPress={() => {
          const newState = !showTieBreaker;
          setShowTieBreaker(newState);
          // Clear tie breaker scores when disabling
          if (!newState) {
            setTeam1TiePoints('');
            setTeam2TiePoints('');
          }
        }}
      >
        <Text style={styles.tieBreakToggleText}>
          {showTieBreaker ? '✓ Tie Breaker' : '+ Add Tie Breaker'}
        </Text>
      </TouchableOpacity>

      {showTieBreaker && (
        <View style={styles.tieBreakContainer}>
          <Text style={styles.tieBreakLabel}>Tie Breaker</Text>
          <View style={styles.tieBreakRow}>
            <TextInput
              style={[styles.tieInput, !isValidSet() && styles.invalidInput]}
              value={team1TiePoints}
              onChangeText={setTeam1TiePoints}
              keyboardType="numeric"
              maxLength={2}
              placeholder="7"
            />
            <Text style={styles.tieSeparator}>-</Text>
            <TextInput
              style={[styles.tieInput, !isValidSet() && styles.invalidInput]}
              value={team2TiePoints}
              onChangeText={setTeam2TiePoints}
              keyboardType="numeric"
              maxLength={2}
              placeholder="5"
            />
          </View>
        </View>
      )}

      {getValidationMessage() && (
        <Text style={styles.validationMessage}>{getValidationMessage()}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  setLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  removeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ff4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  gameScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  scoreInput: {
    alignItems: 'center',
    flex: 1,
  },
  teamLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  gameInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    width: 60,
  },
  invalidInput: {
    borderColor: '#ff4444',
    backgroundColor: '#fff5f5',
  },
  scoreSeparator: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#666',
    marginHorizontal: 16,
  },
  tieBreakContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  tieBreakLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  tieBreakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tieInput: {
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 8,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    width: 50,
  },
  tieSeparator: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginHorizontal: 12,
  },
  validationMessage: {
    fontSize: 12,
    color: '#ff4444',
    textAlign: 'center',
    marginTop: 8,
  },
  tieBreakToggle: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  tieBreakToggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
  },
});