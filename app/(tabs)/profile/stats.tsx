import React from "react";
import { StyleSheet, ScrollView, View } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAuth } from "@/contexts/auth";
import { useProfile } from "@/hooks/useProfile";
import { useThemeColor } from "@/hooks/use-theme-color";

export default function StatsTab() {
  const { session } = useAuth();
  const { profile } = useProfile();
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "icon");
  const tintColor = useThemeColor({}, "tint");

  const statsData = [
    {
      label: "Matches Played",
      value: "42",
      icon: "sportscourt" as any,
      trend: "+5 this month",
    },
    {
      label: "Win Rate",
      value: "62%",
      icon: "trophy" as any,
      trend: "↑ 3% from last month",
    },
    {
      label: "Current Streak",
      value: "3 wins",
      icon: "flame" as any,
      trend: "Best: 7 wins",
    },
    {
      label: "Club Rank",
      value: "#8",
      icon: "chart.line.uptrend.xyaxis" as any,
      trend: "Top 20%",
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

      <View style={styles.statsGrid}>
        {statsData.map((stat, index) => (
          <View
            key={index}
            style={[styles.statCard, { borderColor: borderColor + "20" }]}
          >
            <View style={[styles.iconContainer, { backgroundColor: tintColor + "15" }]}>
              <IconSymbol name={stat.icon} size={28} color={tintColor} />
            </View>
            <ThemedText style={styles.statValue}>{stat.value}</ThemedText>
            <ThemedText style={[styles.statLabel, { color: textColor + "60" }]}>
              {stat.label}
            </ThemedText>
            <ThemedText style={[styles.statTrend, { color: tintColor }]}>
              {stat.trend}
            </ThemedText>
          </View>
        ))}
      </View>

      <ThemedView style={[styles.section, { borderColor: borderColor + "20" }]}>
        <ThemedText style={styles.sectionTitle}>Recent Activity</ThemedText>

        <View style={styles.activityItem}>
          <View style={[styles.activityDot, { backgroundColor: "#4CAF50" }]} />
          <View style={styles.activityContent}>
            <ThemedText style={styles.activityText}>Won match vs. John D.</ThemedText>
            <ThemedText style={[styles.activityTime, { color: textColor + "60" }]}>
              2 hours ago • 6-4, 7-5
            </ThemedText>
          </View>
        </View>

        <View style={styles.activityItem}>
          <View style={[styles.activityDot, { backgroundColor: "#FF9500" }]} />
          <View style={styles.activityContent}>
            <ThemedText style={styles.activityText}>Lost match vs. Sarah M.</ThemedText>
            <ThemedText style={[styles.activityTime, { color: textColor + "60" }]}>
              Yesterday • 4-6, 5-7
            </ThemedText>
          </View>
        </View>

        <View style={styles.activityItem}>
          <View style={[styles.activityDot, { backgroundColor: "#4CAF50" }]} />
          <View style={styles.activityContent}>
            <ThemedText style={styles.activityText}>Won match vs. Mike R.</ThemedText>
            <ThemedText style={[styles.activityTime, { color: textColor + "60" }]}>
              3 days ago • 6-3, 6-2
            </ThemedText>
          </View>
        </View>
      </ThemedView>

      <ThemedView style={[styles.section, { borderColor: borderColor + "20" }]}>
        <ThemedText style={styles.sectionTitle}>Performance Metrics</ThemedText>

        <View style={styles.metricRow}>
          <ThemedText style={[styles.metricLabel, { color: textColor + "80" }]}>
            Average Game Duration
          </ThemedText>
          <ThemedText style={styles.metricValue}>45 min</ThemedText>
        </View>

        <View style={styles.metricRow}>
          <ThemedText style={[styles.metricLabel, { color: textColor + "80" }]}>
            Sets Won
          </ThemedText>
          <ThemedText style={styles.metricValue}>68/110</ThemedText>
        </View>

        <View style={styles.metricRow}>
          <ThemedText style={[styles.metricLabel, { color: textColor + "80" }]}>
            Games Won
          </ThemedText>
          <ThemedText style={styles.metricValue}>412/650</ThemedText>
        </View>

        <View style={styles.metricRow}>
          <ThemedText style={[styles.metricLabel, { color: textColor + "80" }]}>
            Aces per Match
          </ThemedText>
          <ThemedText style={styles.metricValue}>3.2</ThemedText>
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
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 10,
  },
  statCard: {
    width: "47%",
    margin: "1.5%",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    marginBottom: 4,
  },
  statTrend: {
    fontSize: 12,
    fontWeight: "600",
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