import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomTabNavigation, TabItem } from '@/components/ui/BottomTabNavigation';
import { Club } from '@/types/clubs';
import { ClubMembersList } from './ClubMembersList';
import { ClubMatchesList } from './ClubMatchesList';
import { RecordMatchForm } from './RecordMatchForm';
import { useClubMembersWithRatings } from '@/hooks/useMatches';
import { supabase } from '@/lib/supabase';

interface ClubPageProps {
  club: Club | null;
  visible: boolean;
  onClose: () => void;
}

const CLUB_TABS: TabItem[] = [
  {
    key: 'matches',
    title: 'Matches',
    icon: 'figure.tennis'
  },
  {
    key: 'members',
    title: 'Members',
    icon: 'person.2.fill'
  },
  {
    key: 'about',
    title: 'About',
    icon: 'info.circle'
  }
];

export const ClubPage: React.FC<ClubPageProps> = ({ club, visible, onClose }) => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showRecordMatch, setShowRecordMatch] = useState(false);
  const [activeTab, setActiveTab] = useState<'about' | 'members' | 'matches'>('matches');

  const {
    members,
    loading,
    error,
    refetch
  } = useClubMembersWithRatings(club?.id || 0);

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

  const canRecordMatch = members.length >= 1; // Only need current user, can add guests

  if (!club) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        {/* Modal Header */}
        <View style={styles.modalHeader}>
          <View style={styles.dragHandle} />
          <View style={styles.headerContent}>
            <Text style={styles.modalTitle}>{club.name}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <IconSymbol name="xmark" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

      {/* Tab Navigation */}
      <BottomTabNavigation
        tabs={CLUB_TABS}
        activeTab={activeTab}
        onTabChange={(tabKey) => setActiveTab(tabKey as 'about' | 'members' | 'matches')}
        backgroundColor="#fff"
      />

      {/* Action Bar - Only show for Matches tab */}
      {activeTab === 'matches' && (
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
              Need to be a club member to record matches
            </Text>
          )}
        </View>
      )}

      {/* Tab Content */}
      {activeTab === 'about' ? (
        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.aboutContainer}>
            <View style={styles.aboutSection}>
              <Text style={styles.clubLocation}>
                {club.city}, {club.state} • {club.zip_code}
              </Text>
              {club.description && (
                <Text style={styles.clubDescription}>{club.description}</Text>
              )}
            </View>

            <View style={styles.aboutSection}>
              <Text style={styles.aboutLabel}>Active Players</Text>
              <Text style={styles.aboutValue}>{club.active_players_count || 0}</Text>
            </View>

            <View style={styles.aboutSection}>
              <Text style={styles.aboutLabel}>Location</Text>
              <Text style={styles.aboutValue}>
                {club.city}, {club.state} {club.zip_code}
              </Text>
            </View>

            {club.radius_meters && (
              <View style={styles.aboutSection}>
                <Text style={styles.aboutLabel}>Coverage Area</Text>
                <Text style={styles.aboutValue}>
                  {(club.radius_meters / 1000).toFixed(1)} km radius
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      ) : activeTab === 'members' ? (
        <ClubMembersList
          members={members}
          loading={loading}
          error={error}
          onRefresh={refetch}
          onMemberPress={handleMemberPress}
          currentUserId={currentUserId || undefined}
        />
      ) : (
        <ClubMatchesList
          clubId={club.id}
          onRefresh={refetch}
        />
      )}

      {/* Record Match Modal */}
      <RecordMatchForm
        visible={showRecordMatch}
        onClose={() => setShowRecordMatch(false)}
        clubId={club.id}
        members={members}
        onMatchRecorded={handleMatchRecorded}
      />
      </SafeAreaView>
    </Modal>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
    alignSelf: 'center' as const,
    marginTop: 8,
    marginBottom: 16,
  },
  headerContent: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#1a1a1a',
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  scrollContent: {
    flex: 1,
  },
  aboutContainer: {
    flex: 1,
    padding: 20,
  },
  aboutSection: {
    marginBottom: 24,
  },
  aboutLabel: {
    fontSize: 14,
    color: '#999',
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    marginBottom: 6,
    fontWeight: '600' as const,
  },
  aboutValue: {
    fontSize: 16,
    color: '#333',
  },
  clubInfo: {
    marginBottom: 8,
  },
  clubLocation: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  clubDescription: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
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