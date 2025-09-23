import { supabase } from '@/lib/supabase';
import {
  Club,
  ClubWithDistance,
  ClubSearchResult,
  CreateClubRequest,
  CreateClubResult,
  NearestClub,
  GeocodingResult,
  GeocodingError,
  UserLocation,
} from '@/types/clubs';
import {
  ClubUser,
  MyClub,
  ClubMember,
  JoinClubResult,
  LeaveClubResult,
} from '@/types/clubMembership';

export class ClubService {
  // Get clubs near a user's location
  static async getClubsNearLocation(
    userLocation: UserLocation,
    maxDistanceKm: number = 25
  ): Promise<ClubWithDistance[]> {
    const { data, error } = await supabase.rpc('get_clubs_near_location', {
      user_lat: userLocation.latitude,
      user_long: userLocation.longitude,
      max_distance_km: maxDistanceKm,
    });

    if (error) {
      throw new Error(`Failed to fetch nearby clubs: ${error.message}`);
    }

    return data || [];
  }

  // Get the nearest club to a location
  static async getNearestClub(userLocation: UserLocation): Promise<NearestClub | null> {
    const { data, error } = await supabase.rpc('get_nearest_club', {
      user_lat: userLocation.latitude,
      user_long: userLocation.longitude,
    });

    if (error) {
      throw new Error(`Failed to fetch nearest club: ${error.message}`);
    }

    return data?.[0] || null;
  }

  // Get clubs by zip code
  static async getClubsByZipCode(zipCode: string): Promise<ClubSearchResult[]> {
    const { data, error } = await supabase.rpc('get_clubs_by_zip_code', {
      zip: zipCode,
    });

    if (error) {
      throw new Error(`Failed to fetch clubs by zip code: ${error.message}`);
    }

    return data || [];
  }

  // Search clubs by name or city
  static async searchClubs(searchTerm: string): Promise<ClubSearchResult[]> {
    const { data, error } = await supabase.rpc('search_clubs', {
      search_term: searchTerm,
    });

    if (error) {
      throw new Error(`Failed to search clubs: ${error.message}`);
    }

    return data || [];
  }

  // Check if a club name exists in a zip code
  static async clubNameExistsInZip(clubName: string, zipCode: string): Promise<boolean> {
    const { data, error } = await supabase.rpc('club_name_exists_in_zip', {
      club_name: clubName,
      zip: zipCode,
    });

    if (error) {
      throw new Error(`Failed to check club name existence: ${error.message}`);
    }

    return data || false;
  }

  // Create a new club (automatically adds creator as member)
  static async createClub(clubData: CreateClubRequest): Promise<CreateClubResult> {
    const { data, error } = await supabase.rpc('create_club_with_member', {
      club_name: clubData.name,
      zip: clubData.zip_code,
      city_name: clubData.city,
      state_name: clubData.state,
      latitude: clubData.latitude,
      longitude: clubData.longitude,
      club_description: clubData.description || null,
      radius_m: clubData.radius_meters || 3000,
    });

    if (error) {
      throw new Error(`Failed to create club: ${error.message}`);
    }

    return data?.[0] || { club_id: null, success: false, message: 'Unknown error' };
  }

  // Get a specific club by ID
  static async getClubById(clubId: number): Promise<Club | null> {
    const { data, error } = await supabase
      .from('clubs')
      .select('*')
      .eq('id', clubId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Club not found
      }
      throw new Error(`Failed to fetch club: ${error.message}`);
    }

    return data;
  }

  // Get all clubs (with pagination)
  static async getAllClubs(
    page: number = 0,
    limit: number = 20
  ): Promise<{ clubs: Club[]; total: number }> {
    const from = page * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('clubs')
      .select('*', { count: 'exact' })
      .order('active_players_count', { ascending: false })
      .order('name')
      .range(from, to);

    if (error) {
      throw new Error(`Failed to fetch clubs: ${error.message}`);
    }

    return {
      clubs: data || [],
      total: count || 0,
    };
  }

  // Update club player count
  static async updateClubPlayerCount(clubId: number, count: number): Promise<void> {
    const { error } = await supabase
      .from('clubs')
      .update({ active_players_count: count })
      .eq('id', clubId);

    if (error) {
      throw new Error(`Failed to update club player count: ${error.message}`);
    }
  }

  // Join a club
  static async joinClub(clubId: number): Promise<JoinClubResult> {
    const { data, error } = await supabase.rpc('join_club', {
      p_club_id: clubId,
    });

    if (error) {
      throw new Error(`Failed to join club: ${error.message}`);
    }

    return data?.[0] || { success: false, message: 'Unknown error', membership_id: null };
  }

  // Leave a club
  static async leaveClub(clubId: number): Promise<LeaveClubResult> {
    const { data, error } = await supabase.rpc('leave_club', {
      p_club_id: clubId,
    });

    if (error) {
      throw new Error(`Failed to leave club: ${error.message}`);
    }

    return data?.[0] || { success: false, message: 'Unknown error' };
  }

  // Get user's clubs
  static async getMyClubs(): Promise<MyClub[]> {
    const { data, error } = await supabase.rpc('get_my_clubs');

    if (error) {
      throw new Error(`Failed to fetch your clubs: ${error.message}`);
    }

    return data || [];
  }

  // Get club members
  static async getClubMembers(clubId: number): Promise<ClubMember[]> {
    const { data, error } = await supabase.rpc('get_club_members', {
      p_club_id: clubId,
    });

    if (error) {
      throw new Error(`Failed to fetch club members: ${error.message}`);
    }

    return data || [];
  }

  // Check if user is a member of a club
  static async isClubMember(clubId: number): Promise<boolean> {
    const { data, error } = await supabase.rpc('is_club_member', {
      p_club_id: clubId,
    });

    if (error) {
      throw new Error(`Failed to check membership status: ${error.message}`);
    }

    return data || false;
  }

  // Get club member count
  static async getClubMemberCount(clubId: number): Promise<number> {
    const { data, error } = await supabase.rpc('get_club_member_count', {
      p_club_id: clubId,
    });

    if (error) {
      throw new Error(`Failed to get member count: ${error.message}`);
    }

    return data || 0;
  }
}

// Geocoding service (you might want to use a service like Google Maps, Mapbox, or Nominatim)
export class GeocodingService {
  // Simple geocoding using a free service (replace with your preferred service)
  static async geocodeZipCode(zipCode: string): Promise<GeocodingResult> {
    try {
      // Using Nominatim (OpenStreetMap) as a free alternative
      // In production, you might want to use Google Maps or Mapbox
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&countrycodes=us&postalcode=${zipCode}&limit=1`
      );

      if (!response.ok) {
        throw new Error('Geocoding service unavailable');
      }

      const data = await response.json();

      if (!data || data.length === 0) {
        throw new Error('Zip code not found');
      }

      const result = data[0];

      // Parse the display name to extract city and state
      const parts = result.display_name.split(', ');
      const city = parts[0] || '';
      const state = parts[parts.length - 2] || '';

      return {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        city,
        state,
        country: 'US',
        formatted_address: result.display_name,
      };
    } catch (error) {
      throw new Error(`Geocoding failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Reverse geocoding (get address from coordinates)
  static async reverseGeocode(
    latitude: number,
    longitude: number
  ): Promise<GeocodingResult> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
      );

      if (!response.ok) {
        throw new Error('Reverse geocoding service unavailable');
      }

      const data = await response.json();

      if (!data || !data.address) {
        throw new Error('Location not found');
      }

      const address = data.address;

      return {
        latitude,
        longitude,
        city: address.city || address.town || address.village || '',
        state: address.state || '',
        country: address.country || 'US',
        formatted_address: data.display_name,
      };
    } catch (error) {
      throw new Error(`Reverse geocoding failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}