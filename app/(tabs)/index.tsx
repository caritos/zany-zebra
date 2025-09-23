import { StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Link } from "expo-router";

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Tennis Tracker</ThemedText>
        <ThemedText style={styles.subtitle}>
          Track your matches and improve your game
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.quickActions}>
        <TouchableOpacity style={styles.actionCard}>
          <IconSymbol name="plus.circle.fill" size={40} color="#007AFF" />
          <ThemedText style={styles.actionTitle}>New Match</ThemedText>
          <ThemedText style={styles.actionDescription}>
            Start tracking a new match
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard}>
          <IconSymbol name="clock.fill" size={40} color="#34C759" />
          <ThemedText style={styles.actionTitle}>Quick Match</ThemedText>
          <ThemedText style={styles.actionDescription}>
            Record a quick practice session
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Recent Matches</ThemedText>
        <ThemedView style={styles.emptyState}>
          <IconSymbol name="tennis.racket" size={60} color="#8E8E93" />
          <ThemedText style={styles.emptyStateText}>
            No matches recorded yet
          </ThemedText>
          <ThemedText style={styles.emptyStateSubtext}>
            Start tracking your first match to see your progress
          </ThemedText>
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Quick Stats</ThemedText>
        <ThemedView style={styles.statsGrid}>
          <ThemedView style={styles.statItem}>
            <ThemedText style={styles.statValue}>0</ThemedText>
            <ThemedText style={styles.statLabel}>Total Matches</ThemedText>
          </ThemedView>
          <ThemedView style={styles.statItem}>
            <ThemedText style={styles.statValue}>0%</ThemedText>
            <ThemedText style={styles.statLabel}>Win Rate</ThemedText>
          </ThemedView>
          <ThemedView style={styles.statItem}>
            <ThemedText style={styles.statValue}>0</ThemedText>
            <ThemedText style={styles.statLabel}>Win Streak</ThemedText>
          </ThemedView>
        </ThemedView>
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
    alignItems: "center",
  },
  subtitle: {
    marginTop: 8,
    opacity: 0.7,
    textAlign: "center",
  },
  quickActions: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
  },
  actionCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "rgba(0,122,255,0.1)",
    alignItems: "center",
  },
  actionTitle: {
    fontWeight: "600",
    marginTop: 8,
    fontSize: 16,
  },
  actionDescription: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.7,
    textAlign: "center",
  },
  section: {
    margin: 16,
  },
  emptyState: {
    padding: 32,
    alignItems: "center",
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "500",
  },
  emptyStateSubtext: {
    marginTop: 8,
    fontSize: 14,
    opacity: 0.6,
    textAlign: "center",
  },
  statsGrid: {
    flexDirection: "row",
    marginTop: 12,
    gap: 12,
  },
  statItem: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.05)",
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.7,
  },
});
