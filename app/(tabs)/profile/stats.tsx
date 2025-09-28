import React, { useState, useEffect, useCallback } from "react";
import { ScrollView, View, ActivityIndicator } from "react-native";
import { globalStyles } from '../../styles/styles';
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

  const { session } = useAuth();
  const user = session?.user;
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserStats = useCallback(async () => {
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
  }, [user]);

  useEffect(() => {
    fetchUserStats();
  }, [fetchUserStats]);

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
      <View style={[globalStyles.container, { backgroundColor }]}>
        <View style={globalStyles.loadingContainer}>
          <ActivityIndicator size="large" color={tintColor} />
          <ThemedText style={globalStyles.loadingText}>Loading statistics...</ThemedText>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[globalStyles.container, { backgroundColor }]}>
        <View style={globalStyles.errorContainer}>
          <ThemedText style={globalStyles.statsErrorText}>Failed to load statistics</ThemedText>
          <ThemedText style={[globalStyles.errorSubtext, { color: textColor + "60" }]}>
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
    <ScrollView
      style={[globalStyles.container, { backgroundColor }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[globalStyles.scrollContainer, { paddingTop: 40 }]}
    >
        <ThemedView style={globalStyles.section}>
          {topStats.map((stat, index) => (
            <View key={index} style={globalStyles.metricRow}>
              <ThemedText style={globalStyles.metricLabel}>
                {stat.label}
              </ThemedText>
              <ThemedText
                style={[
                  globalStyles.metricValue,
                  stat.highlight && { color: tintColor }
                ]}
              >
                {stat.value}
              </ThemedText>
            </View>
          ))}
        </ThemedView>

        <ThemedView style={globalStyles.section}>
          <ThemedText style={globalStyles.sectionTitle}>Match Breakdown</ThemedText>

          <View style={globalStyles.metricRow}>
            <ThemedText style={globalStyles.metricLabel}>Singles</ThemedText>
            <ThemedText style={globalStyles.metricValue}>
              {stats?.singles_wins || 0}-{stats?.singles_losses || 0} ({singlesWinRate}%)
            </ThemedText>
          </View>

          <View style={globalStyles.metricRow}>
            <ThemedText style={globalStyles.metricLabel}>Doubles</ThemedText>
            <ThemedText style={globalStyles.metricValue}>
              {stats?.doubles_wins || 0}-{stats?.doubles_losses || 0} ({doublesWinRate}%)
            </ThemedText>
          </View>
        </ThemedView>

        <ThemedView style={globalStyles.section}>
          <ThemedText style={globalStyles.sectionTitle}>Detailed Stats</ThemedText>

          <View style={globalStyles.metricRow}>
            <ThemedText style={globalStyles.metricLabel}>Sets Won</ThemedText>
            <ThemedText style={globalStyles.metricValue}>
              {stats?.total_sets_won || 0}/{setsTotal} ({setsWinRate}%)
            </ThemedText>
          </View>

          <View style={globalStyles.metricRow}>
            <ThemedText style={globalStyles.metricLabel}>Games Won</ThemedText>
            <ThemedText style={globalStyles.metricValue}>
              {stats?.total_games_won || 0}/{gamesTotal} ({gamesWinRate}%)
            </ThemedText>
          </View>
        </ThemedView>
    </ScrollView>
  );
}

