// Club membership types
export interface ClubUser {
  id: number;
  club_id: number;
  user_id: string;
  joined_at: string;
  last_active_at: string;
  created_at: string;
  updated_at: string;
}

export interface MyClub {
  club_id: number;
  club_name: string;
  club_description: string | null;
  zip_code: string;
  city: string | null;
  state: string | null;
  joined_at: string;
  active_players_count: number;
  club_lat: number;
  club_long: number;
}

export interface ClubMember {
  user_id: string;
  joined_at: string;
  last_active_at: string;
}

export interface JoinClubResult {
  success: boolean;
  message: string;
  membership_id: number | null;
}

export interface LeaveClubResult {
  success: boolean;
  message: string;
}

// Hook return types
export interface UseClubMembershipReturn {
  isMember: boolean;
  loading: boolean;
  error: string | null;
  joinClub: () => Promise<JoinClubResult>;
  leaveClub: () => Promise<LeaveClubResult>;
  refetch: () => void;
}

export interface UseMyClubsReturn {
  clubs: MyClub[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export interface UseClubMembersReturn {
  members: ClubMember[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}