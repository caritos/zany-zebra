import { useState, useEffect, useCallback } from 'react';
import { ClubService, GeocodingService } from '@/services/clubService';
import {
  ClubWithDistance,
  ClubSearchResult,
  CreateClubRequest,
  CreateClubResult,
  UseNearbyClubsOptions,
  UseNearbyClubsReturn,
  UseCreateClubReturn,
  UseClubSearchReturn,
  UserLocation,
  Club,
} from '@/types/clubs';

// Hook for getting nearby clubs
export const useNearbyClubs = (
  userLocation: UserLocation | null,
  options: UseNearbyClubsOptions = {}
): UseNearbyClubsReturn => {
  const { maxDistance = 25, enabled = true } = options;
  const [clubs, setClubs] = useState<ClubWithDistance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNearbyClubs = useCallback(async () => {
    if (!userLocation || !enabled) return;

    setLoading(true);
    setError(null);

    try {
      const nearbyClubs = await ClubService.getClubsNearLocation(userLocation, maxDistance);
      setClubs(nearbyClubs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch nearby clubs');
    } finally {
      setLoading(false);
    }
  }, [userLocation, maxDistance, enabled]);

  useEffect(() => {
    fetchNearbyClubs();
  }, [fetchNearbyClubs]);

  return {
    clubs,
    loading,
    error,
    refetch: fetchNearbyClubs,
  };
};

// Hook for creating clubs
export const useCreateClub = (): UseCreateClubReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createClub = useCallback(async (clubData: CreateClubRequest): Promise<CreateClubResult> => {
    setLoading(true);
    setError(null);

    try {
      // Create the club (validation happens in the database function)
      const result = await ClubService.createClub(clubData);

      if (!result.success) {
        setError(result.message);
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create club';
      setError(errorMessage);
      return {
        club_id: null,
        success: false,
        message: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createClub,
    loading,
    error,
  };
};

// Hook for searching clubs
export const useClubSearch = (): UseClubSearchReturn => {
  const [clubs, setClubs] = useState<ClubSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchClubs = useCallback(async (query: string) => {
    if (!query.trim()) {
      setClubs([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const results = await ClubService.searchClubs(query);
      setClubs(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search clubs');
    } finally {
      setLoading(false);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setClubs([]);
    setError(null);
  }, []);

  return {
    searchClubs,
    clubs,
    loading,
    error,
    clearSearch,
  };
};

// Hook for getting clubs by zip code
export const useClubsByZip = (zipCode: string | null) => {
  const [clubs, setClubs] = useState<ClubSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClubsByZip = useCallback(async () => {
    if (!zipCode) return;

    setLoading(true);
    setError(null);

    try {
      const results = await ClubService.getClubsByZipCode(zipCode);
      setClubs(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch clubs');
    } finally {
      setLoading(false);
    }
  }, [zipCode]);

  useEffect(() => {
    fetchClubsByZip();
  }, [fetchClubsByZip]);

  return {
    clubs,
    loading,
    error,
    refetch: fetchClubsByZip,
  };
};

// Hook for getting a specific club
export const useClub = (clubId: number | null) => {
  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClub = useCallback(async () => {
    if (!clubId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await ClubService.getClubById(clubId);
      setClub(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch club');
    } finally {
      setLoading(false);
    }
  }, [clubId]);

  useEffect(() => {
    fetchClub();
  }, [fetchClub]);

  return {
    club,
    loading,
    error,
    refetch: fetchClub,
  };
};

// Hook for geocoding zip codes
export const useGeocodingZip = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const geocodeZip = useCallback(async (zipCode: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await GeocodingService.geocodeZipCode(zipCode);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to geocode zip code';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    geocodeZip,
    loading,
    error,
  };
};