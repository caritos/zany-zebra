import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export type MatchType = 'all' | 'singles' | 'doubles';
export type InvolvementType = 'all_matches' | 'my_matches';

export interface MatchFilters {
  matchType: MatchType;
  involvement: InvolvementType;
}

interface MatchFilterProps {
  filters: MatchFilters;
  onFiltersChange: (filters: MatchFilters) => void;
}

export const MatchFilter: React.FC<MatchFilterProps> = ({
  filters,
  onFiltersChange,
}) => {
  const handleMatchTypeChange = (matchType: MatchType) => {
    onFiltersChange({ ...filters, matchType });
  };

  const handleInvolvementChange = (involvement: InvolvementType) => {
    onFiltersChange({ ...filters, involvement });
  };

  return (
    <View style={styles.container}>
      {/* Match Type Section */}
      <View style={styles.filterSection}>
        <Text style={styles.sectionLabel}>MATCH TYPE</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filters.matchType === 'all' && styles.activeButton,
            ]}
            onPress={() => handleMatchTypeChange('all')}
          >
            <Text
              style={[
                styles.buttonText,
                filters.matchType === 'all' && styles.activeButtonText,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              filters.matchType === 'singles' && styles.activeButton,
            ]}
            onPress={() => handleMatchTypeChange('singles')}
          >
            <Text
              style={[
                styles.buttonText,
                filters.matchType === 'singles' && styles.activeButtonText,
              ]}
            >
              Singles
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              filters.matchType === 'doubles' && styles.activeButton,
            ]}
            onPress={() => handleMatchTypeChange('doubles')}
          >
            <Text
              style={[
                styles.buttonText,
                filters.matchType === 'doubles' && styles.activeButtonText,
              ]}
            >
              Doubles
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Involvement Section */}
      <View style={styles.filterSection}>
        <Text style={styles.sectionLabel}>INVOLVEMENT</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filters.involvement === 'all_matches' && styles.activeButton,
            ]}
            onPress={() => handleInvolvementChange('all_matches')}
          >
            <Text
              style={[
                styles.buttonText,
                filters.involvement === 'all_matches' && styles.activeButtonText,
              ]}
            >
              All Matches
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              filters.involvement === 'my_matches' && styles.activeButton,
            ]}
            onPress={() => handleInvolvementChange('my_matches')}
          >
            <Text
              style={[
                styles.buttonText,
                filters.involvement === 'my_matches' && styles.activeButtonText,
              ]}
            >
              My Matches
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = {
  container: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  filterSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#999',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  buttonRow: {
    flexDirection: 'row' as const,
    gap: 12,
    flexWrap: 'wrap' as const,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  activeButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#333',
  },
  activeButtonText: {
    color: '#fff',
  },
};