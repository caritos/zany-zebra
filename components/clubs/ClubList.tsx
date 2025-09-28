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
import { globalStyles } from '@/assets/styles/styles';

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
        style={globalStyles.clubCard}
        onPress={() => onClubPress?.(item)}
        activeOpacity={0.7}
      >
        <View style={globalStyles.clubHeader}>
          <View style={globalStyles.clubInfo}>
            <Text style={globalStyles.clubName}>{item.club_name}</Text>
            <View style={globalStyles.clubLocationRow}>
              <Text style={globalStyles.clubLocationText}>
                {item.city && item.state ? `${item.city}, ${item.state}` : item.zip_code}
              </Text>
              {showDistance && isDistanceClub && (
                <View style={globalStyles.clubDistanceBadge}>
                  <Text style={globalStyles.clubDistanceText}>
                    {item.distance_km < 1
                      ? `${Math.round(item.distance_km * 1000)}m`
                      : `${item.distance_km}km`
                    }
                  </Text>
                </View>
              )}
            </View>
          </View>
          <View style={globalStyles.clubPlayerCount}>
            <Text style={globalStyles.clubPlayerCountNumber}>{item.active_players_count}</Text>
            <Text style={globalStyles.clubPlayerCountLabel}>
              {item.active_players_count === 1 ? 'player' : 'players'}
            </Text>
          </View>
        </View>

        {(('description' in item && item.description) || ('club_description' in item && item.club_description)) && (
          <Text style={globalStyles.clubDescription} numberOfLines={2}>
            {'description' in item ? item.description : item.club_description}
          </Text>
        )}

        {/* Membership status and actions */}
        {showMembershipActions && (
          <View style={globalStyles.clubMembershipSection}>
            {isMember ? (
              <View style={globalStyles.clubMembershipRow}>
                <View style={globalStyles.clubMemberBadge}>
                  <Text style={globalStyles.clubMemberBadgeText}>✓ Member</Text>
                </View>
                {isMyClub && (
                  <Text style={globalStyles.clubJoinedDate}>
                    Joined {new Date(item.joined_at).toLocaleDateString()}
                  </Text>
                )}
                <TouchableOpacity
                  style={globalStyles.clubLeaveButton}
                  onPress={() => handleLeaveClub(clubId)}
                >
                  <Text style={globalStyles.clubLeaveButtonText}>Leave</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={globalStyles.clubJoinButton}
                onPress={() => handleJoinClub(clubId)}
              >
                <Text style={globalStyles.clubJoinButtonText}>+ Join Club</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={globalStyles.clubEmptyState}>
      <Text style={globalStyles.clubEmptyStateIcon}>🎾</Text>
      <Text style={globalStyles.clubEmptyStateTitle}>No Clubs Found</Text>
      <Text style={globalStyles.clubEmptyStateMessage}>{emptyMessage}</Text>
    </View>
  );

  const renderError = () => (
    <View style={globalStyles.clubErrorState}>
      <Text style={globalStyles.clubErrorStateIcon}>⚠️</Text>
      <Text style={globalStyles.clubErrorStateTitle}>Something went wrong</Text>
      <Text style={globalStyles.clubErrorStateMessage}>{error}</Text>
      {onRefresh && (
        <TouchableOpacity style={globalStyles.clubRetryButton} onPress={onRefresh}>
          <Text style={globalStyles.clubRetryButtonText}>Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (error && !loading) {
    return renderError();
  }

  return (
    <View style={globalStyles.clubListContainer}>
      <FlatList
        data={clubs}
        renderItem={renderClubCard}
        keyExtractor={(item) => `club-${item.club_id}`}
        contentContainerStyle={[
          globalStyles.clubListContent,
          clubs.length === 0 && globalStyles.clubListEmptyContent,
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
            <View style={globalStyles.clubLoadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={globalStyles.clubLoadingText}>Finding clubs near you...</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
};

