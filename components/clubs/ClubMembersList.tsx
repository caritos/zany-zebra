import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { ClubMemberWithRating } from '@/types/matches';
import { MatchService } from '@/services/matchService';

interface ClubMembersListProps {
  members: ClubMemberWithRating[];
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  onMemberPress?: (member: ClubMemberWithRating) => void;
  currentUserId?: string;
}

export const ClubMembersList: React.FC<ClubMembersListProps> = ({
  members,
  loading = false,
  error,
  onRefresh,
  onMemberPress,
  currentUserId,
}) => {
  const renderMemberCard = ({ item, index }: { item: ClubMemberWithRating; index: number }) => {
    const isCurrentUser = item.user_id === currentUserId;
    const position = index + 1;
    const ratingLevel = MatchService.formatEloRating(item.elo_rating);

    return (
      <TouchableOpacity
        style={[styles.memberCard, isCurrentUser && styles.currentUserCard]}
        onPress={() => onMemberPress?.(item)}
        activeOpacity={0.7}
      >
        <View style={styles.positionBadge}>
          <Text style={styles.positionText}>#{position}</Text>
        </View>

        <View style={styles.memberInfo}>
          <View style={styles.memberHeader}>
            <Text style={[styles.memberName, isCurrentUser && styles.currentUserName]}>
              {item.display_name}
              {isCurrentUser && ' (You)'}
            </Text>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>{item.elo_rating}</Text>
            </View>
          </View>

          <Text style={styles.ratingLevel}>{ratingLevel.split(' ')[1]}</Text>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{item.matches_played}</Text>
              <Text style={styles.statLabel}>Matches</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{item.matches_won}-{item.matches_lost}</Text>
              <Text style={styles.statLabel}>W-L</Text>
            </View>
            <View style={styles.stat}>
              <Text style={[styles.statValue, styles.winRateText]}>
                {item.win_rate ? `${item.win_rate.toFixed(0)}%` : '0%'}
              </Text>
              <Text style={styles.statLabel}>Win Rate</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{item.peak_rating}</Text>
              <Text style={styles.statLabel}>Peak</Text>
            </View>
          </View>

          {item.last_match_at && (
            <Text style={styles.lastMatch}>
              Last match: {new Date(item.last_match_at).toLocaleDateString()}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>🎾</Text>
      <Text style={styles.emptyStateTitle}>No Members Yet</Text>
      <Text style={styles.emptyStateMessage}>
        Be the first to join this club!
      </Text>
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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Leaderboard</Text>
        <Text style={styles.headerSubtitle}>{members.length} members</Text>
      </View>

      <FlatList
        data={members}
        renderItem={renderMemberCard}
        keyExtractor={(item) => item.user_id}
        contentContainerStyle={[
          styles.listContainer,
          members.length === 0 && styles.emptyListContainer,
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl refreshing={loading} onRefresh={onRefresh} />
          ) : undefined
        }
        ListEmptyComponent={!loading ? renderEmptyState : undefined}
        ListFooterComponent={
          loading && members.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>Loading members...</Text>
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
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#1a1a1a',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  listContainer: {
    padding: 16,
  },
  emptyListContainer: {
    flex: 1,
  },
  memberCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row' as const,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  currentUserCard: {
    backgroundColor: '#e3f2fd',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  positionBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginRight: 12,
  },
  positionText: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#333',
  },
  memberInfo: {
    flex: 1,
  },
  memberHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 4,
  },
  memberName: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#1a1a1a',
    flex: 1,
  },
  currentUserName: {
    color: '#007AFF',
  },
  ratingBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  ratingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold' as const,
  },
  ratingLevel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
    textTransform: 'uppercase' as const,
  },
  statsRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    marginBottom: 8,
  },
  stat: {
    alignItems: 'center' as const,
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#333',
  },
  statLabel: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
    textTransform: 'uppercase' as const,
  },
  winRateText: {
    color: '#4CAF50',
  },
  lastMatch: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic' as const,
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
};