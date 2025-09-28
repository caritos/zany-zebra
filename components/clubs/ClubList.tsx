import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { ClubWithDistance, ClubSearchResult } from '@/types/clubs';
import { MyClub, JoinClubResult, LeaveClubResult } from '@/types/clubMembership';

type ClubItem = ClubWithDistance | ClubSearchResult | MyClub;

interface ClubListProps {
  clubs: ClubItem[];
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  onClubPress?: (club: ClubItem) => void;
  showDistance?: boolean;
  emptyMessage?: string;
  showMembershipActions?: boolean;
  userMemberships?: Set<number>; // Set of club IDs user is a member of
  onJoinClub?: (clubId: number) => Promise<JoinClubResult>;
  onLeaveClub?: (clubId: number) => Promise<LeaveClubResult>;
  scrollEnabled?: boolean; // Allow disabling scroll for nested use
}

export const ClubList: React.FC<ClubListProps> = ({
  clubs,
  loading = false,
  error,
  onRefresh,
  onClubPress,
  showDistance = true,
  emptyMessage = 'No clubs found in your area',
  showMembershipActions = false,
  userMemberships = new Set(),
  onJoinClub,
  onLeaveClub,
  scrollEnabled = true,
}) => {
  const handleJoinClub = async (clubId: number) => {
    if (!onJoinClub) return;

    try {
      const result = await onJoinClub(clubId);
      if (result.success) {
        Alert.alert('Success', result.message);
      } else {
        Alert.alert('Error', result.message);
      }
    } catch {
      Alert.alert('Error', 'Failed to join club');
    }
  };

  const handleLeaveClub = async (clubId: number) => {
    if (!onLeaveClub) return;

    Alert.alert(
      'Leave Club',
      'Are you sure you want to leave this club?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await onLeaveClub(clubId);
              if (result.success) {
                Alert.alert('Success', result.message);
              } else {
                Alert.alert('Error', result.message);
              }
            } catch {
              Alert.alert('Error', 'Failed to leave club');
            }
          },
        },
      ]
    );
  };

  const renderClubCard = ({ item }: { item: ClubItem }) => {
    const isDistanceClub = 'distance_km' in item;
    const isMyClub = 'joined_at' in item;
    const clubId = item.club_id;
    const isMember = userMemberships.has(clubId) || isMyClub;

    return (
      <TouchableOpacity
        style={styles.clubCard}
        onPress={() => onClubPress?.(item)}
        activeOpacity={0.7}
      >
        <View style={styles.clubHeader}>
          <View style={styles.clubInfo}>
            <Text style={styles.clubName}>{item.club_name}</Text>
            <View style={styles.locationRow}>
              <Text style={styles.locationText}>
                {item.city && item.state ? `${item.city}, ${item.state}` : item.zip_code}
              </Text>
              {showDistance && isDistanceClub && (
                <View style={styles.distanceBadge}>
                  <Text style={styles.distanceText}>
                    {item.distance_km < 1
                      ? `${Math.round(item.distance_km * 1000)}m`
                      : `${item.distance_km}km`
                    }
                  </Text>
                </View>
              )}
            </View>
          </View>
          <View style={styles.playerCount}>
            <Text style={styles.playerCountNumber}>{item.active_players_count}</Text>
            <Text style={styles.playerCountLabel}>
              {item.active_players_count === 1 ? 'player' : 'players'}
            </Text>
          </View>
        </View>

        {(('description' in item && item.description) || ('club_description' in item && item.club_description)) && (
          <Text style={styles.description} numberOfLines={2}>
            {'description' in item ? item.description : item.club_description}
          </Text>
        )}

        {/* Membership status and actions */}
        {showMembershipActions && (
          <View style={styles.membershipSection}>
            {isMember ? (
              <View style={styles.membershipRow}>
                <View style={styles.memberBadge}>
                  <Text style={styles.memberBadgeText}>✓ Member</Text>
                </View>
                {isMyClub && (
                  <Text style={styles.joinedDate}>
                    Joined {new Date(item.joined_at).toLocaleDateString()}
                  </Text>
                )}
                <TouchableOpacity
                  style={styles.leaveButton}
                  onPress={() => handleLeaveClub(clubId)}
                >
                  <Text style={styles.leaveButtonText}>Leave</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.joinButton}
                onPress={() => handleJoinClub(clubId)}
              >
                <Text style={styles.joinButtonText}>+ Join Club</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>🎾</Text>
      <Text style={styles.emptyStateTitle}>No Clubs Found</Text>
      <Text style={styles.emptyStateMessage}>{emptyMessage}</Text>
    </View>
  );

  const renderError = () => (
    <View style={styles.errorState}>
      <Text style={styles.errorStateIcon}>⚠️</Text>
      <Text style={styles.errorStateTitle}>Something went wrong</Text>
      <Text style={styles.errorStateMessage}>{error}</Text>
      {onRefresh && (
        <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (error && !loading) {
    return renderError();
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={clubs}
        renderItem={renderClubCard}
        keyExtractor={(item) => `club-${item.club_id}`}
        contentContainerStyle={[
          styles.listContainer,
          clubs.length === 0 && styles.emptyListContainer,
        ]}
        showsVerticalScrollIndicator={false}
        scrollEnabled={scrollEnabled}
        refreshControl={
          onRefresh && scrollEnabled ? (
            <RefreshControl refreshing={loading} onRefresh={onRefresh} />
          ) : undefined
        }
        ListEmptyComponent={!loading ? renderEmptyState : undefined}
        ListFooterComponent={
          loading && clubs.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>Finding clubs near you...</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  listContainer: {
    padding: 16,
  },
  emptyListContainer: {
    flex: 1,
  },
  clubCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  clubHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-start' as const,
    marginBottom: 8,
  },
  clubInfo: {
    flex: 1,
    marginRight: 16,
  },
  clubName: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#1a1a1a',
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
  },
  distanceBadge: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  distanceText: {
    fontSize: 12,
    color: '#1976d2',
    fontWeight: '600' as const,
  },
  playerCount: {
    alignItems: 'center' as const,
  },
  playerCountNumber: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#007AFF',
  },
  playerCountLabel: {
    fontSize: 12,
    color: '#666',
  },
  description: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: 40,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#333',
    marginBottom: 8,
    textAlign: 'center' as const,
  },
  emptyStateMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center' as const,
    lineHeight: 24,
  },
  errorState: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: 40,
  },
  errorStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorStateTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#dc3545',
    marginBottom: 8,
    textAlign: 'center' as const,
  },
  errorStateMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center' as const,
    lineHeight: 24,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    textAlign: 'center' as const,
  },
  membershipSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  membershipRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
  },
  memberBadge: {
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  memberBadgeText: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: '600' as const,
  },
  joinedDate: {
    fontSize: 12,
    color: '#666',
    flex: 1,
    textAlign: 'center' as const,
  },
  joinButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center' as const,
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600' as const,
  },
  leaveButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  leaveButtonText: {
    color: '#666',
    fontSize: 12,
    fontWeight: '600' as const,
  },
};