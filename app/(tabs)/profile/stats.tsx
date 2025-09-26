import React from "react";
import { StyleSheet, ScrollView, View } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAuth } from "@/contexts/auth";
import { useProfile } from "@/hooks/useProfile";
import { useThemeColor } from "@/hooks/use-theme-color";

export default function StatsTab() {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "icon");
  const tintColor = useThemeColor({}, "tint");

  const topStats = [
    {
      label: "TOTAL MATCHES",
      value: "6",
    },
    {
      label: "WIN RATE",
      value: "100%",
      highlight: true,
    },
    {
      label: "W-L RECORD",
      value: "6-0",
    },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor }]}>
      <ThemedView style={styles.header}>
        <ThemedText style={styles.headerTitle}>Statistics</ThemedText>
        <ThemedText style={[styles.headerSubtitle, { color: textColor + "80" }]}>
          Your performance overview
        </ThemedText>
      </ThemedView>

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
            <ThemedText style={styles.breakdownValue}>6-0</ThemedText>
            <ThemedText style={[styles.breakdownPercentage, { color: textColor + "60" }]}>
              (100%)
            </ThemedText>
          </View>

          <View style={styles.breakdownItem}>
            <ThemedText style={styles.breakdownCategory}>Doubles</ThemedText>
            <ThemedText style={styles.breakdownValue}>0-0</ThemedText>
            <ThemedText style={[styles.breakdownPercentage, { color: textColor + "60" }]}>
              (0%)
            </ThemedText>
          </View>
        </View>
      </ThemedView>

      <ThemedView style={[styles.section, { borderColor: borderColor + "20" }]}>
        <ThemedText style={styles.sectionTitle}>Detailed Stats</ThemedText>

        <View style={styles.detailedStatsContainer}>
          <View style={styles.detailedStatItem}>
            <ThemedText style={styles.detailedStatValue}>6/6</ThemedText>
            <ThemedText style={[styles.detailedStatLabel, { color: textColor + "60" }]}>
              SETS WON
            </ThemedText>
            <ThemedText style={[styles.detailedStatPercentage, { color: textColor + "60" }]}>
              (100%)
            </ThemedText>
          </View>

          <View style={styles.detailedStatItem}>
            <ThemedText style={styles.detailedStatValue}>36/56</ThemedText>
            <ThemedText style={[styles.detailedStatLabel, { color: textColor + "60" }]}>
              GAMES WON
            </ThemedText>
            <ThemedText style={[styles.detailedStatPercentage, { color: textColor + "60" }]}>
              (64%)
            </ThemedText>
          </View>
        </View>
      </ThemedView>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
  },
  topStatsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 20,
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