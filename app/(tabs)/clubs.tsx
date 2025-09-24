import React, { useState } from 'react';
import { NearbyClubsScreen } from '@/components/clubs/NearbyClubsScreen';
import { ClubPage } from '@/components/clubs/ClubPage';
import { ClubWithDistance, ClubSearchResult, Club } from '@/types/clubs';
import { MyClub } from '@/types/clubMembership';

type ClubItem = ClubWithDistance | ClubSearchResult | MyClub;

export default function ClubsScreen() {
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);

  const handleClubPress = (club: ClubItem) => {
    // Convert club item to Club type for the club page
    const clubData: Club = {
      id: club.club_id,
      name: club.club_name,
      description: 'description' in club ? club.description : ('club_description' in club ? club.club_description : undefined),
      zip_code: club.zip_code || '',
      city: club.city || '',
      state: club.state || '',
      country: 'US',
      location: null, // Not needed for UI
      radius_meters: 3000, // Default
      active_players_count: club.active_players_count || 0,
      created_at: '',
      updated_at: '',
    };

    setSelectedClub(clubData);
  };

  const handleBackToList = () => {
    setSelectedClub(null);
  };

  if (selectedClub) {
    return <ClubPage club={selectedClub} onBack={handleBackToList} />;
  }

  return <NearbyClubsScreen onClubPress={handleClubPress} />;
}