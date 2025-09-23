import React from 'react';
import { NearbyClubsScreen } from '@/components/clubs/NearbyClubsScreen';
import { ClubWithDistance, ClubSearchResult } from '@/types/clubs';
import { MyClub } from '@/types/clubMembership';

type ClubItem = ClubWithDistance | ClubSearchResult | MyClub;

export default function ClubsScreen() {
  const handleClubPress = (club: ClubItem) => {
    console.log('Club pressed:', club);
    // TODO: Navigate to club details screen when implemented
  };

  return <NearbyClubsScreen onClubPress={handleClubPress} />;
}