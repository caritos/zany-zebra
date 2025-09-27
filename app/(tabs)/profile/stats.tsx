import React, { useState, useEffect } from "react";
import { StyleSheet, ScrollView, View, ActivityIndicator } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAuth } from "@/contexts/auth";
import { useProfile } from "@/hooks/useProfile";
import { useThemeColor } from "@/hooks/use-theme-color";
import { supabase } from "@/lib/supabase";

interface UserStats {
  total_matches: number;
  total_wins: number;
  total_losses: number;
  win_rate: number;
  singles_wins: number;
  singles_losses: number;
  doubles_wins: number;
  doubles_losses: number;
  total_sets_won: number;
  total_sets_lost: number;
  total_games_won: number;
  total_games_lost: number;
  current_elo_rating: number;
  peak_elo_rating: number;
  matches_played: number;
}

export default function StatsTab() {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "icon");
  const tintColor = useThemeColor({}, "tint");

  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserStats();
  }, [user]);

  const fetchUserStats = async () => {
    console.log('🔍 fetchUserStats called, user:', user);

    if (!user) {
      console.log('❌ No user found, returning early');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('📞 Calling get_user_statistics with user ID:', user.id);

      const { data, error } = await supabase.rpc('get_user_statistics', {
        p_user_id: user.id
      });

      console.log('📊 RPC response:', { data, error });

      if (error) {
        console.error('❌ RPC error:', error);
        throw error;
      }

      if (data && data.length > 0) {
        console.log('✅ Setting stats:', data[0]);
        setStats(data[0]);
      } else {
        console.log('📭 No data returned, using defaults');
        // No stats yet, use defaults
        setStats({
          total_matches: 0,
          total_wins: 0,
          total_losses: 0,
          win_rate: 0,
          singles_wins: 0,
          singles_losses: 0,
          doubles_wins: 0,
          doubles_losses: 0,
          total_sets_won: 0,
          total_sets_lost: 0,
          total_games_won: 0,
          total_games_lost: 0,
          current_elo_rating: 1200,
          peak_elo_rating: 1200,
          matches_played: 0
        });
      }
    } catch (err) {
      console.error('💥 Error fetching user stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to load statistics');
    } finally {
      console.log('🏁 Setting loading to false');
      setLoading(false);
    }
  };

  const topStats = [
    {
      label: "TOTAL MATCHES",
      value: stats?.total_matches?.toString() || "0",
    },
    {
      label: "WIN RATE",
      value: `${stats?.win_rate || 0}%`,
      highlight: true,
    },
    {
      label: "W-L RECORD",
      value: `${stats?.total_wins || 0}-${stats?.total_losses || 0}`,
    },
  ];

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={tintColor} />
          <ThemedText style={styles.loadingText}>Loading statistics...</ThemedText>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>Failed to load statistics</ThemedText>
          <ThemedText style={[styles.errorSubtext, { color: textColor + "60" }]}>
            {error}
          </ThemedText>
        </View>
      </View>
    );
  }

  const singlesTotal = (stats?.singles_wins || 0) + (stats?.singles_losses || 0);
  const doublesTotal = (stats?.doubles_wins || 0) + (stats?.doubles_losses || 0);
  const setsTotal = (stats?.total_sets_won || 0) + (stats?.total_sets_lost || 0);
  const gamesTotal = (stats?.total_games_won || 0) + (stats?.total_games_lost || 0);

  const singlesWinRate = singlesTotal > 0 ? Math.round((stats?.singles_wins || 0) / singlesTotal * 100) : 0;
  const doublesWinRate = doublesTotal > 0 ? Math.round((stats?.doubles_wins || 0) / doublesTotal * 100) : 0;
  const setsWinRate = setsTotal > 0 ? Math.round((stats?.total_sets_won || 0) / setsTotal * 100) : 0;
  const gamesWinRate = gamesTotal > 0 ? Math.round((stats?.total_games_won || 0) / gamesTotal * 100) : 0;

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 10 }}
      >
        <View style={styles.topStatsContainer}>
          {topStats.map((stat, index) => (
            <View key={index} style={styles.topStatItem}>
              <ThemedText
                style={[
                  styles.topStatValue,
                  stat.highlight && { color: tintColor }
                ]}
              >
                {stat.value}
              </ThemedText>
              <ThemedText style={[styles.topStatLabel, { color: textColor + "60" }]}>
                {stat.label}
              </ThemedText>
            </View>
          ))}
        </View>

        <ThemedView style={[styles.section, { borderColor: borderColor + "20" }]}>
          <ThemedText style={styles.sectionTitle}>Match Breakdown</ThemedText>

          <View style={styles.breakdownContainer}>
            <View style={styles.breakdownItem}>
              <ThemedText style={styles.breakdownCategory}>Singles</ThemedText>
              <ThemedText style={styles.breakdownValue}>
                {stats?.singles_wins || 0}-{stats?.singles_losses || 0}
              </ThemedText>
              <ThemedText style={[styles.breakdownPercentage, { color: textColor + "60" }]}>
                ({singlesWinRate}%)
              </ThemedText>
            </View>

            <View style={styles.breakdownItem}>
              <ThemedText style={styles.breakdownCategory}>Doubles</ThemedText>
              <ThemedText style={styles.breakdownValue}>
                {stats?.doubles_wins || 0}-{stats?.doubles_losses || 0}
              </ThemedText>
              <ThemedText style={[styles.breakdownPercentage, { color: textColor + "60" }]}>
                ({doublesWinRate}%)
              </ThemedText>
            </View>
          </View>
        </ThemedView>

        <ThemedView style={[styles.section, { borderColor: borderColor + "20" }]}>
          <ThemedText style={styles.sectionTitle}>Detailed Stats</ThemedText>

          <View style={styles.detailedStatsContainer}>
            <View style={styles.detailedStatItem}>
              <ThemedText style={styles.detailedStatValue}>
                {stats?.total_sets_won || 0}/{setsTotal}
              </ThemedText>
              <ThemedText style={[styles.detailedStatLabel, { color: textColor + "60" }]}>
                SETS WON
              </ThemedText>
              <ThemedText style={[styles.detailedStatPercentage, { color: textColor + "60" }]}>
                ({setsWinRate}%)
              </ThemedText>
            </View>

            <View style={styles.detailedStatItem}>
              <ThemedText style={styles.detailedStatValue}>
                {stats?.total_games_won || 0}/{gamesTotal}
              </ThemedText>
              <ThemedText style={[styles.detailedStatLabel, { color: textColor + "60" }]}>
                GAMES WON
              </ThemedText>
              <ThemedText style={[styles.detailedStatPercentage, { color: textColor + "60" }]}>
                ({gamesWinRate}%)
              </ThemedText>
            </View>
          </View>
        </ThemedView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  topStatsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  topStatItem: {
    alignItems: "center",
  },
  topStatValue: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
  },
  topStatLabel: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  breakdownContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  breakdownItem: {
    alignItems: "center",
  },
  breakdownCategory: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  breakdownValue: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  breakdownPercentage: {
    fontSize: 14,
  },
  detailedStatsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  detailedStatItem: {
    alignItems: "center",
  },
  detailedStatValue: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  detailedStatLabel: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  detailedStatPercentage: {
    fontSize: 14,
  },
  section: {
    margin: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 15,
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 13,
  },
  metricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  metricLabel: {
    fontSize: 15,
  },
  metricValue: {
    fontSize: 15,
    fontWeight: "600",
  },
});