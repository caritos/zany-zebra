import React from "react";
import {
  StyleSheet,
  ScrollView,
  View,
  TouchableOpacity,
  Alert,
  Switch,
} from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAuth } from "@/contexts/auth";
import { useProfile } from "@/hooks/useProfile";
import { useThemeColor } from "@/hooks/use-theme-color";
import { supabase } from "@/lib/supabase";
import { ZipCodeEditor } from "@/components/profile/ZipCodeEditor";

export default function SettingsTab() {
  const { session } = useAuth();
  const { profile, loading, updateZipCode } = useProfile();
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "icon");
  const tintColor = useThemeColor({}, "tint");

  const [notifications, setNotifications] = React.useState(true);
  const [emailUpdates, setEmailUpdates] = React.useState(false);
  const [matchReminders, setMatchReminders] = React.useState(true);

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
      { cancelable: false }
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
    <ScrollView style={[styles.container, { backgroundColor }]}>
      <ThemedView style={styles.header}>
        <ThemedText style={styles.headerTitle}>Settings</ThemedText>
      </ThemedView>

      <ThemedView style={[styles.section, { borderColor: borderColor + "20" }]}>
        <ThemedText style={styles.sectionTitle}>Preferences</ThemedText>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <ThemedText style={styles.settingLabel}>Push Notifications</ThemedText>
            <ThemedText style={[styles.settingDescription, { color: textColor + "60" }]}>
              Receive alerts about matches
            </ThemedText>
          </View>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: borderColor + "30", true: tintColor }}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <ThemedText style={styles.settingLabel}>Email Updates</ThemedText>
            <ThemedText style={[styles.settingDescription, { color: textColor + "60" }]}>
              Weekly club newsletter
            </ThemedText>
          </View>
          <Switch
            value={emailUpdates}
            onValueChange={setEmailUpdates}
            trackColor={{ false: borderColor + "30", true: tintColor }}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <ThemedText style={styles.settingLabel}>Match Reminders</ThemedText>
            <ThemedText style={[styles.settingDescription, { color: textColor + "60" }]}>
              Get notified 1 hour before
            </ThemedText>
          </View>
          <Switch
            value={matchReminders}
            onValueChange={setMatchReminders}
            trackColor={{ false: borderColor + "30", true: tintColor }}
          />
        </View>
      </ThemedView>

      <ThemedView style={[styles.section, { borderColor: borderColor + "20" }]}>
        <ThemedText style={styles.sectionTitle}>Location</ThemedText>

        <ZipCodeEditor
          profile={profile}
          updateZipCode={updateZipCode}
          loading={loading}
        />
      </ThemedView>

      <ThemedView style={[styles.section, { borderColor: borderColor + "20" }]}>
        <ThemedText style={styles.sectionTitle}>Account Information</ThemedText>

        <View style={styles.infoRow}>
          <ThemedText style={[styles.infoLabel, { color: textColor + "60" }]}>
            User ID
          </ThemedText>
          <ThemedText style={styles.infoValue}>
            {session?.user?.id ? `...${session.user.id.slice(-8)}` : "Not available"}
          </ThemedText>
        </View>

        {profile && (
          <>
            <View style={styles.infoRow}>
              <ThemedText style={[styles.infoLabel, { color: textColor + "60" }]}>
                Member Since
              </ThemedText>
              <ThemedText style={styles.infoValue}>
                {formatDate(profile.created_at)}
              </ThemedText>
            </View>

            <View style={styles.infoRow}>
              <ThemedText style={[styles.infoLabel, { color: textColor + "60" }]}>
                Last Updated
              </ThemedText>
              <ThemedText style={styles.infoValue}>
                {formatDate(profile.updated_at)}
              </ThemedText>
            </View>
          </>
        )}
      </ThemedView>

      <ThemedView style={[styles.section, { borderColor: borderColor + "20" }]}>
        <ThemedText style={styles.sectionTitle}>Support</ThemedText>

        <TouchableOpacity style={styles.linkRow}>
          <IconSymbol name="questionmark.circle" size={20} color={tintColor} />
          <ThemedText style={[styles.linkText, { color: tintColor }]}>
            Help Center
          </ThemedText>
          <IconSymbol name="chevron.right" size={16} color={borderColor + "60"} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkRow}>
          <IconSymbol name="doc.text" size={20} color={tintColor} />
          <ThemedText style={[styles.linkText, { color: tintColor }]}>
            Terms of Service
          </ThemedText>
          <IconSymbol name="chevron.right" size={16} color={borderColor + "60"} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkRow}>
          <IconSymbol name="lock.shield" size={20} color={tintColor} />
          <ThemedText style={[styles.linkText, { color: tintColor }]}>
            Privacy Policy
          </ThemedText>
          <IconSymbol name="chevron.right" size={16} color={borderColor + "60"} />
        </TouchableOpacity>
      </ThemedView>

      <ThemedView style={styles.actionSection}>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <IconSymbol name="arrow.right.square.fill" size={20} color="white" />
          <ThemedText style={styles.signOutText}>Sign Out</ThemedText>
        </TouchableOpacity>
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
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  linkText: {
    flex: 1,
    fontSize: 15,
    marginLeft: 12,
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