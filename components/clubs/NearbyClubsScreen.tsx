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
import { useNearbyClubs, useGeocodingZip } from '@/hooks/useClubs';
import { useMyClubs, useClubMembership } from '@/hooks/useClubMembership';
import { useProfile } from '@/hooks/useProfile';
import { ClubService, GeocodingService } from '@/services/clubService';
import { supabase } from '@/lib/supabase';
import { ClubList } from './ClubList';
import { CreateClubForm } from './CreateClubForm';
import { UserLocation, ClubWithDistance, ClubSearchResult, Club } from '@/types/clubs';
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
  const [locationSource, setLocationSource] = useState<'gps' | 'zip' | 'phone' | 'default'>('gps');

  // Get user profile for fallback location data
  const { profile } = useProfile();
  const { geocodeZip } = useGeocodingZip();

  // Get user's clubs
  const { clubs: myClubs, loading: myClubsLoading, refetch: refetchMyClubs } = useMyClubs();

  // Get nearby clubs (no limit for discovery)
  const { clubs: nearbyClubs, loading: nearbyLoading, error, refetch: refetchNearby } = useNearbyClubs(userLocation, {
    maxDistance: 50, // Increased to 50km to show more clubs
    enabled: !!userLocation,
  });

  // Create set of user's club IDs for membership checking
  const userMembershipIds = new Set(myClubs.map(club => club.club_id));

  // Filter nearby clubs to only show ones user is NOT a member of, limit to 5 closest
  const discoverableClubs = nearbyClubs
    .filter(club => !userMembershipIds.has(club.club_id))
    .slice(0, 5); // Limit to 5 closest clubs

  // Debug logging
  console.log('🐛 Debug Info:', {
    userLocation,
    locationSource,
    nearbyClubsCount: nearbyClubs.length,
    myClubsCount: myClubs.length,
    userMembershipIds: Array.from(userMembershipIds),
    discoverableClubsCount: discoverableClubs.length,
    allNearbyClubs: nearbyClubs.map(c => ({ id: c.club_id, name: c.club_name, isMember: userMembershipIds.has(c.club_id) }))
  });

  // Get user's current location with fallback logic
  useEffect(() => {
    if (profile !== undefined) { // Only run after profile is loaded
      getCurrentLocation();
    }
  }, [profile, geocodeZip]);

  const getAreaCodeFromPhone = (phoneNumber: string): string | null => {
    // Extract area code from US phone number (first 3 digits after country code)
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.length >= 10) {
      return cleaned.slice(-10, -7); // Get area code
    }
    return null;
  };

  const getZipFromAreaCode = (areaCode: string): string => {
    // Map common area codes to representative zip codes
    // This is a simplified mapping - in production you'd want a more comprehensive mapping
    const areaCodeToZip: { [key: string]: string } = {
      '212': '10001', // Manhattan, NY
      '310': '90210', // Beverly Hills, CA
      '415': '94102', // San Francisco, CA
      '305': '33101', // Miami, FL
      '516': '11790', // Long Island, NY (Stony Brook area)
      '631': '11790', // Long Island, NY (Suffolk County)
      // Add more mappings as needed
    };
    return areaCodeToZip[areaCode] || '11790'; // Default to 11790
  };

  const getCurrentLocation = async () => {
    try {
      // Try GPS first
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status === 'granted') {
        try {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });

          console.log('✅ Using GPS location:', location.coords);
          setUserLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy || undefined,
          });
          setLocationSource('gps');
          setLocationError(null);
          return;
        } catch (gpsError) {
          console.log('GPS failed, trying fallback locations...');
        }
      }

      // Fallback 1: Try user's zip code
      if (profile?.zip_code) {
        console.log('Using user zip code:', profile.zip_code);
        try {
          const location = await geocodeZip(profile.zip_code);
          if (location) {
            setUserLocation(location);
            setLocationSource('zip');
            setLocationError(null);
            return;
          }
        } catch (zipError) {
          console.log('Zip code geocoding failed:', zipError);
        }
      }

      // Fallback 2: Try area code from phone number
      if (profile?.phone_number) {
        const areaCode = getAreaCodeFromPhone(profile.phone_number);
        if (areaCode) {
          console.log('Using area code:', areaCode);
          const zipFromAreaCode = getZipFromAreaCode(areaCode);
          try {
            const location = await geocodeZip(zipFromAreaCode);
            if (location) {
              setUserLocation(location);
              setLocationSource('phone');
              setLocationError(null);
              return;
            }
          } catch (phoneError) {
            console.log('Area code geocoding failed:', phoneError);
          }
        }
      }

      // Fallback 3: Use default zip code 11790
      console.log('Using default location: 11790');
      try {
        const location = await geocodeZip('11790');
        if (location) {
          console.log('✅ Default location set:', location);
          setUserLocation(location);
          setLocationSource('default');
          setLocationError(null);
        } else {
          console.log('❌ Default location returned null, using hardcoded fallback');
          // Use hardcoded coordinates for 11790 (Stony Brook, NY)
          setUserLocation({
            latitude: 40.9176,
            longitude: -73.1252,
          });
          setLocationSource('default');
          setLocationError(null);
        }
      } catch (defaultError) {
        console.error('❌ Default location failed, using hardcoded fallback:', defaultError);
        // Use hardcoded coordinates for 11790 (Stony Brook, NY) as last resort
        setUserLocation({
          latitude: 40.9176,
          longitude: -73.1252,
        });
        setLocationSource('default');
        setLocationError(null);
      }
    } catch (error) {
      console.error('Error getting location:', error);
      setLocationError('Unable to determine your location');
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

  // Debug function to test direct database call
  const testDirectDatabaseCall = async () => {
    console.log('🧪 Testing direct database call...');
    try {
      const { data, error } = await supabase.rpc('get_clubs_near_location', {
        user_lat: 40.9176, // Hardcoded Stony Brook coordinates
        user_long: -73.1252,
        max_distance_km: 50,
      });

      console.log('🧪 Direct DB call result:', { data, error });
    } catch (err) {
      console.error('🧪 Direct DB call failed:', err);
    }
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
        <View style={styles.section}>
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

        {/* Create Club Button */}
        {userLocation && !loading && (
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
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
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