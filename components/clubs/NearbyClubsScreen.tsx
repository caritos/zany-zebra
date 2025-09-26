import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StatusBar,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { useNearbyClubs } from '@/hooks/useClubs';
import { useMyClubs, useClubMembership } from '@/hooks/useClubMembership';
import { ClubService } from '@/services/clubService';
import { ClubList } from './ClubList';
import { CreateClubForm } from './CreateClubForm';
import { UserLocation, ClubWithDistance, ClubSearchResult } from '@/types/clubs';
import { MyClub } from '@/types/clubMembership';

type ClubItem = ClubWithDistance | ClubSearchResult | MyClub;

interface NearbyClubsScreenProps {
  onClubPress?: (club: ClubItem) => void;
}

export const NearbyClubsScreen: React.FC<NearbyClubsScreenProps> = ({
  onClubPress,
}) => {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Get user's clubs
  const { clubs: myClubs, loading: myClubsLoading, refetch: refetchMyClubs } = useMyClubs();

  // Get nearby clubs (limited to 5 for discovery)
  const { clubs: nearbyClubs, loading: nearbyLoading, error, refetch: refetchNearby } = useNearbyClubs(userLocation, {
    maxDistance: 25,
    enabled: !!userLocation,
  });

  // Create set of user's club IDs for membership checking
  const userMembershipIds = new Set(myClubs.map(club => club.club_id));

  // Filter nearby clubs to only show ones user is NOT a member of, limit to 5
  const discoverableClubs = nearbyClubs
    .filter(club => !userMembershipIds.has(club.club_id))
    .slice(0, 5);

  // Get user's current location
  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setLocationError('Location permission is required to find nearby clubs');
        return;
      }

      // Get current position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || undefined,
      });
      setLocationError(null);
    } catch (error) {
      console.error('Error getting location:', error);
      setLocationError('Unable to get your current location');
    }
  };

  const handleCreateClubSuccess = (clubId: number) => {
    setShowCreateForm(false);
    refetchMyClubs(); // Refresh my clubs
    refetchNearby(); // Refresh nearby clubs
  };

  const handleJoinClub = async (clubId: number) => {
    try {
      const result = await ClubService.joinClub(clubId);
      if (result.success) {
        refetchMyClubs(); // Refresh my clubs
        refetchNearby(); // Refresh nearby clubs to update counts
      }
      return result;
    } catch (error) {
      throw error;
    }
  };

  const handleLeaveClub = async (clubId: number) => {
    try {
      const result = await ClubService.leaveClub(clubId);
      if (result.success) {
        refetchMyClubs(); // Refresh my clubs
        refetchNearby(); // Refresh nearby clubs to update counts
      }
      return result;
    } catch (error) {
      throw error;
    }
  };

  const handleRefresh = () => {
    refetchMyClubs();
    refetchNearby();
  };

  const handleRetryLocation = () => {
    setLocationError(null);
    getCurrentLocation();
  };

  // Show create club form
  if (showCreateForm) {
    return (
      <SafeAreaView style={styles.container}>
        <CreateClubForm
          onSuccess={handleCreateClubSuccess}
          onCancel={() => setShowCreateForm(false)}
        />
      </SafeAreaView>
    );
  }

  const loading = myClubsLoading || nearbyLoading;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Tennis Clubs</Text>
        <Text style={styles.subtitle}>
          Your clubs and nearby communities
        </Text>
      </View>

      {/* Location Error */}
      {locationError && (
        <View style={styles.locationErrorContainer}>
          <Text style={styles.locationErrorText}>{locationError}</Text>
          <TouchableOpacity
            style={styles.retryLocationButton}
            onPress={handleRetryLocation}
          >
            <Text style={styles.retryLocationButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* My Clubs Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Clubs</Text>
            {myClubs.length > 0 && (
              <Text style={styles.sectionCount}>{myClubs.length}</Text>
            )}
          </View>

          <ClubList
            clubs={myClubs}
            loading={myClubsLoading}
            error={null}
            onRefresh={handleRefresh}
            onClubPress={onClubPress}
            showDistance={false}
            showMembershipActions={true}
            userMemberships={userMembershipIds}
            onLeaveClub={handleLeaveClub}
            emptyMessage="You haven't joined any clubs yet. Discover clubs below!"
            scrollEnabled={false}
          />
        </View>

        {/* Discover Clubs Section */}
        {userLocation && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Discover Clubs Near You</Text>
              {discoverableClubs.length > 0 && (
                <Text style={styles.sectionSubtitle}>Closest 5 clubs</Text>
              )}
            </View>

            <ClubList
              clubs={discoverableClubs}
              loading={nearbyLoading}
              error={error}
              onRefresh={handleRefresh}
              onClubPress={onClubPress}
              showDistance={true}
              showMembershipActions={true}
              userMemberships={userMembershipIds}
              onJoinClub={handleJoinClub}
              emptyMessage="No nearby clubs found. Create a new club in your area!"
              scrollEnabled={false}
            />
          </View>
        )}

        {/* Create Club Button */}
        {userLocation && !loading && discoverableClubs.length === 0 && !error && (
          <View style={styles.createClubContainer}>
            <TouchableOpacity
              style={styles.createClubButton}
              onPress={() => setShowCreateForm(true)}
            >
              <Text style={styles.createClubButtonText}>
                ➕ Create New Club
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Loading Location */}
      {!userLocation && !locationError && (
        <View style={styles.loadingLocationContainer}>
          <Text style={styles.loadingLocationText}>
            📍 Getting your location...
          </Text>
        </View>
      )}

    </SafeAreaView>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: '#1a1a1a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#1a1a1a',
  },
  sectionCount: {
    backgroundColor: '#007AFF',
    color: '#fff',
    fontSize: 12,
    fontWeight: '600' as const,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 24,
    textAlign: 'center' as const,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic' as const,
  },
  locationErrorContainer: {
    backgroundColor: '#ffeaea',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center' as const,
  },
  locationErrorText: {
    color: '#dc3545',
    fontSize: 16,
    textAlign: 'center' as const,
    marginBottom: 12,
  },
  retryLocationButton: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryLocationButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600' as const,
  },
  loadingLocationContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: 40,
  },
  loadingLocationText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center' as const,
  },
  createClubContainer: {
    padding: 20,
  },
  createClubButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center' as const,
  },
  createClubButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600' as const,
  },
};