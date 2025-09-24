import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Club } from '@/types/clubs';
import { ClubMembersList } from './ClubMembersList';
import { RecordMatchForm } from './RecordMatchForm';
import { useClubMembersWithRatings } from '@/hooks/useMatches';
import { supabase } from '@/lib/supabase';

interface ClubPageProps {
  club: Club;
  onBack?: () => void;
}

export const ClubPage: React.FC<ClubPageProps> = ({ club, onBack }) => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showRecordMatch, setShowRecordMatch] = useState(false);

  const {
    members,
    loading,
    error,
    refetch
  } = useClubMembersWithRatings(club.id);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

  const handleMemberPress = (member: any) => {
    // Could navigate to member profile or show stats
    Alert.alert(
      member.display_name,
      `Rating: ${member.elo_rating || 1200}\n` +
      `Matches: ${member.matches_played || 0}\n` +
      `Record: ${member.matches_won || 0}-${member.matches_lost || 0}\n` +
      `Win Rate: ${member.win_rate ? member.win_rate.toFixed(1) : 0}%\n` +
      `Peak Rating: ${member.peak_rating || 1200}`
    );
  };

  const handleMatchRecorded = () => {
    refetch(); // Refresh the members list to show updated ratings
  };

  const canRecordMatch = members.length >= 2;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        )}
        <View style={styles.clubInfo}>
          <Text style={styles.clubName}>{club.name}</Text>
          <Text style={styles.clubLocation}>
            {club.city}, {club.state} • {club.zip_code}
          </Text>
          {club.description && (
            <Text style={styles.clubDescription}>{club.description}</Text>
          )}
        </View>
      </View>

      {/* Action Bar */}
      <View style={styles.actionBar}>
        <TouchableOpacity
          style={[
            styles.recordMatchButton,
            !canRecordMatch && styles.recordMatchButtonDisabled
          ]}
          onPress={() => setShowRecordMatch(true)}
          disabled={!canRecordMatch}
        >
          <Text style={[
            styles.recordMatchButtonText,
            !canRecordMatch && styles.recordMatchButtonTextDisabled
          ]}>
            🎾 Record Match
          </Text>
        </TouchableOpacity>

        {!canRecordMatch && (
          <Text style={styles.disabledHint}>
            Need at least 2 members to record matches
          </Text>
        )}
      </View>

      {/* Members List */}
      <ClubMembersList
        members={members}
        loading={loading}
        error={error}
        onRefresh={refetch}
        onMemberPress={handleMemberPress}
        currentUserId={currentUserId}
      />

      {/* Record Match Modal */}
      <RecordMatchForm
        visible={showRecordMatch}
        onClose={() => setShowRecordMatch(false)}
        clubId={club.id}
        members={members}
        onMatchRecorded={handleMatchRecorded}
      />
    </SafeAreaView>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  backButton: {
    marginBottom: 12,
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500' as const,
  },
  clubInfo: {
    marginBottom: 8,
  },
  clubName: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: '#1a1a1a',
    marginBottom: 4,
  },
  clubLocation: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  clubDescription: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  actionBar: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center' as const,
  },
  recordMatchButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 200,
    alignItems: 'center' as const,
  },
  recordMatchButtonDisabled: {
    backgroundColor: '#ccc',
  },
  recordMatchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  recordMatchButtonTextDisabled: {
    color: '#999',
  },
  disabledHint: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
    textAlign: 'center' as const,
  },
};