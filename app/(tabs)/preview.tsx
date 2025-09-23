import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Alert,
} from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { router } from "expo-router";

interface DatabaseChange {
  id: string;
  timestamp: string;
  eventType: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  record: any;
}

export default function PreviewScreen() {
  const [changes, setChanges] = useState<DatabaseChange[]>([]);
  const [isListening, setIsListening] = useState(false);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert("Error", error.message);
    } else {
      Alert.alert("Success", "You have been signed out");
      router.replace("/(tabs)/login");
    }
  };

  const checkCurrentUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      Alert.alert("Current User", `Logged in as: ${user.email}`);
    } else {
      Alert.alert("No User", "No user is currently logged in");
    }
  };

  useEffect(() => {
    setIsListening(true);

    // Subscribe to all changes in the messages table
    const channel = supabase
      .channel("preview-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const newChange: DatabaseChange = {
            id: `${Date.now()}-${Math.random()}`,
            timestamp: new Date().toISOString(),
            eventType: payload.eventType as "INSERT" | "UPDATE" | "DELETE",
            table: payload.table,
            record: payload.eventType === "DELETE" ? payload.old : payload.new,
          };

          setChanges((prev) => [newChange, ...prev].slice(0, 50)); // Keep last 50 changes
        },
      )
      .subscribe((status) => {
        setIsListening(status === "SUBSCRIBED");
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case "INSERT":
        return "#4CAF50";
      case "UPDATE":
        return "#2196F3";
      case "DELETE":
        return "#F44336";
      default:
        return "#757575";
    }
  };

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Real-time Database Changes</ThemedText>
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: isListening ? "#4CAF50" : "#F44336" },
            ]}
          />
          <ThemedText style={styles.statusText}>
            {isListening ? "Listening" : "Connecting..."}
          </ThemedText>
        </View>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Recent Changes
        </ThemedText>

        {changes.length === 0 ? (
          <ThemedView style={styles.emptyState}>
            <ThemedText style={styles.emptyStateText}>
              No changes detected yet
            </ThemedText>
            <ThemedText style={styles.emptyStateSubtext}>
              Database changes will appear here in real-time
            </ThemedText>
          </ThemedView>
        ) : (
          <View style={styles.changesList}>
            {changes.map((change) => (
              <View key={change.id} style={styles.changeItem}>
                <View style={styles.changeHeader}>
                  <View
                    style={[
                      styles.eventBadge,
                      { backgroundColor: getEventColor(change.eventType) },
                    ]}
                  >
                    <Text style={styles.eventBadgeText}>
                      {change.eventType}
                    </Text>
                  </View>
                  <ThemedText style={styles.changeTime}>
                    {new Date(change.timestamp).toLocaleTimeString()}
                  </ThemedText>
                </View>
                <ThemedText style={styles.changeTable}>
                  Table: {change.table}
                </ThemedText>
                <View style={styles.changeContent}>
                  <ThemedText style={styles.changeData}>
                    {JSON.stringify(change.record, null, 2)}
                  </ThemedText>
                </View>
              </View>
            ))}
          </View>
        )}
      </ThemedView>

      <ThemedView style={styles.statsContainer}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Statistics
        </ThemedText>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>
              {changes.filter((c) => c.eventType === "INSERT").length}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Inserts</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>
              {changes.filter((c) => c.eventType === "UPDATE").length}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Updates</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>
              {changes.filter((c) => c.eventType === "DELETE").length}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Deletes</ThemedText>
          </View>
        </View>
      </ThemedView>

      <ThemedView style={styles.debugSection}>
        <ThemedText style={styles.debugTitle}>Debug Actions</ThemedText>
        <View style={styles.debugButtons}>
          <TouchableOpacity
            style={styles.debugButton}
            onPress={checkCurrentUser}
          >
            <Text style={styles.debugButtonText}>Check User</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.debugButton, styles.signOutButton]}
            onPress={handleSignOut}
          >
            <Text style={styles.debugButtonText}>Sign Out</Text>
          </TouchableOpacity>
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
    alignItems: "center",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    opacity: 0.7,
  },
  section: {
    margin: 16,
  },
  sectionTitle: {
    marginBottom: 12,
    fontSize: 18,
    fontWeight: "600",
  },
  changesList: {
    gap: 12,
  },
  changeItem: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.03)",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  changeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  eventBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  eventBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  changeTime: {
    fontSize: 12,
    opacity: 0.6,
  },
  changeTable: {
    fontSize: 14,
    marginBottom: 4,
    opacity: 0.8,
  },
  changeContent: {
    marginTop: 8,
    padding: 8,
    backgroundColor: "rgba(0,0,0,0.02)",
    borderRadius: 4,
  },
  changeData: {
    fontSize: 12,
    fontFamily: "monospace",
  },
  emptyState: {
    padding: 32,
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: "500",
  },
  emptyStateSubtext: {
    marginTop: 8,
    fontSize: 14,
    opacity: 0.6,
    textAlign: "center",
  },
  statsContainer: {
    margin: 16,
    marginBottom: 32,
  },
  statsGrid: {
    flexDirection: "row",
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
  debugSection: {
    margin: 16,
    marginBottom: 32,
    padding: 16,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  debugTitle: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 8,
    opacity: 0.5,
  },
  debugButtons: {
    flexDirection: "row",
    gap: 8,
  },
  debugButton: {
    flex: 1,
    padding: 8,
    borderRadius: 4,
    backgroundColor: "#007AFF",
    alignItems: "center",
  },
  signOutButton: {
    backgroundColor: "#FF3B30",
  },
  debugButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },
});
