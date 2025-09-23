// Database table types
export interface Club {
  id: number;
  name: string;
  description: string | null;
  zip_code: string;
  city: string | null;
  state: string | null;
  country: string;
  location: string; // PostGIS geography point as string
  radius_meters: number;
  active_players_count: number;
  created_at: string;
  updated_at: string;
}

// API function return types
export interface ClubWithDistance {
  club_id: number;
  club_name: string;
  description: string | null;
  zip_code: string;
  city: string | null;
  state: string | null;
  distance_km: number;
  distance_meters: number;
  active_players_count: number;
  club_lat: number;
  club_long: number;
}

export interface NearestClub {
  club_id: number;
  club_name: string;
  distance_km: number;
}

export interface ClubSearchResult {
  club_id: number;
  club_name: string;
  description: string | null;
  zip_code: string;
  city: string | null;
  state: string | null;
  active_players_count: number;
}

export interface CreateClubResult {
  club_id: number | null;
  success: boolean;
  message: string;
}

// Form types for creating clubs
export interface CreateClubRequest {
  name: string;
  description?: string;
  zip_code: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  radius_meters?: number;
}

// Geocoding types (for converting zip code to coordinates)
export interface GeocodingResult {
  latitude: number;
  longitude: number;
  city: string;
  state: string;
  country: string;
  formatted_address: string;
}

export interface GeocodingError {
  error: string;
  message: string;
}

// UI component types
export interface ClubCardProps {
  club: ClubWithDistance | ClubSearchResult;
  onPress?: (club: ClubWithDistance | ClubSearchResult) => void;
  showDistance?: boolean;
}

export interface ClubListProps {
  clubs: (ClubWithDistance | ClubSearchResult)[];
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  onClubPress?: (club: ClubWithDistance | ClubSearchResult) => void;
}

// Location types
export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

// API hook types
export interface UseNearbyClubsOptions {
  maxDistance?: number;
  enabled?: boolean;
}

export interface UseNearbyClubsReturn {
  clubs: ClubWithDistance[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export interface UseCreateClubReturn {
  createClub: (clubData: CreateClubRequest) => Promise<CreateClubResult>;
  loading: boolean;
  error: string | null;
}

// Search types
export interface UseClubSearchReturn {
  searchClubs: (query: string) => Promise<void>;
  clubs: ClubSearchResult[];
  loading: boolean;
  error: string | null;
  clearSearch: () => void;
}

// Navigation types (for React Navigation)
export interface ClubStackParamList {
  ClubList: undefined;
  ClubDetails: {
    clubId: number;
    club?: ClubWithDistance | ClubSearchResult;
  };
  CreateClub: undefined;
  ClubSearch: undefined;
}