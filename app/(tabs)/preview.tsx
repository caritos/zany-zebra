import { StyleSheet, ScrollView } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

export default function PreviewScreen() {
  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Preview</ThemedText>
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
