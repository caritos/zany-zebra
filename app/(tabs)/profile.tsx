import {
  StyleSheet,
  ScrollView,
  View,
  TouchableOpacity,
  Alert,
} from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";
import { useEffect, useState, useCallback } from "react";
import { IconSymbol } from "@/components/ui/icon-symbol";

interface Profile {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export default function ProfileScreen() {
  const { session } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (session?.user) {
      fetchProfile();
    }
  }, [session, fetchProfile]);

  const handleSignOut = async () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            const { error } = await supabase.auth.signOut();
            if (error) {
              Alert.alert("Error", error.message);
            }
          },
        },
      ],
      { cancelable: false },
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.header}>
        <View style={styles.avatarContainer}>
          <IconSymbol name="person.circle.fill" size={80} color="#007AFF" />
        </View>
        <ThemedText type="title">Profile</ThemedText>
      </ThemedView>

      {loading ? (
        <ThemedView style={styles.loadingContainer}>
          <ThemedText>Loading profile...</ThemedText>
        </ThemedView>
      ) : (
        <>
          <ThemedView style={styles.section}>
            <ThemedText style={styles.sectionTitle}>
              Account Information
            </ThemedText>

            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>Email</ThemedText>
              <ThemedText style={styles.infoValue}>
                {session?.user?.email || "Not available"}
              </ThemedText>
            </View>

            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>User ID</ThemedText>
              <ThemedText style={styles.infoValue}>
                {session?.user?.id
                  ? `...${session.user.id.slice(-8)}`
                  : "Not available"}
              </ThemedText>
            </View>

            {profile && (
              <>
                <View style={styles.infoRow}>
                  <ThemedText style={styles.infoLabel}>Member Since</ThemedText>
                  <ThemedText style={styles.infoValue}>
                    {formatDate(profile.created_at)}
                  </ThemedText>
                </View>

                <View style={styles.infoRow}>
                  <ThemedText style={styles.infoLabel}>Last Updated</ThemedText>
                  <ThemedText style={styles.infoValue}>
                    {formatDate(profile.updated_at)}
                  </ThemedText>
                </View>
              </>
            )}
          </ThemedView>

          <ThemedView style={styles.section}>
            <ThemedText style={styles.sectionTitle}>
              Session Information
            </ThemedText>

            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>Session Active</ThemedText>
              <View style={styles.statusBadge}>
                <View style={[styles.statusDot, styles.statusActive]} />
                <ThemedText style={styles.statusText}>Active</ThemedText>
              </View>
            </View>

            {session?.expires_at && (
              <View style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>
                  Session Expires
                </ThemedText>
                <ThemedText style={styles.infoValue}>
                  {new Date(session.expires_at * 1000).toLocaleString()}
                </ThemedText>
              </View>
            )}
          </ThemedView>

          <ThemedView style={styles.actionSection}>
            <TouchableOpacity
              style={styles.signOutButton}
              onPress={handleSignOut}
            >
              <IconSymbol
                name="arrow.right.square.fill"
                size={20}
                color="white"
              />
              <ThemedText style={styles.signOutText}>Sign Out</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </>
      )}
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
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  avatarContainer: {
    marginBottom: 16,
  },
  loadingContainer: {
    padding: 32,
    alignItems: "center",
  },
  section: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.02)",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
    opacity: 0.8,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  infoLabel: {
    fontSize: 14,
    opacity: 0.6,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusActive: {
    backgroundColor: "#4CAF50",
  },
  statusText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4CAF50",
  },
  actionSection: {
    margin: 16,
    marginBottom: 32,
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF3B30",
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  signOutText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
