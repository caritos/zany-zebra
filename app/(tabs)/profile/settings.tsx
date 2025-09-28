import React from "react";
import {
  ScrollView,
  View,
  TouchableOpacity,
  Alert,
  Linking,
} from "react-native";
import { globalStyles } from '../../styles/styles';
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useThemeColor } from "@/hooks/use-theme-color";
import { supabase } from "@/lib/supabase";
import { router } from "expo-router";

export default function SettingsTab() {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "icon");
  const tintColor = useThemeColor({}, "tint");

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

  const handleContactSupport = async () => {
    const email = "eladio@caritos.com";
    const subject = "Play Serve Support Request";
    const body = "Hi Eladio,\n\nI need help with:\n\n[Please describe your issue here]\n\nThanks!";

    const mailto = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    try {
      const supported = await Linking.canOpenURL(mailto);
      if (supported) {
        await Linking.openURL(mailto);
      } else {
        Alert.alert(
          "Email Not Available",
          `Please email us directly at: ${email}`,
          [
            {
              text: "Copy Email",
              onPress: () => {
                // Note: Clipboard requires additional setup, showing alert instead
                Alert.alert("Email Address", email);
              },
            },
            { text: "OK" },
          ]
        );
      }
    } catch (error) {
      Alert.alert(
        "Email Not Available",
        `Please email us directly at: ${email}`
      );
    }
  };

  return (
    <ScrollView style={[globalStyles.container, { backgroundColor }]} contentContainerStyle={globalStyles.scrollContainer}>
      <View>
        <TouchableOpacity
          style={globalStyles.menuItem}
          onPress={() => router.push("./faq")}
        >
          <View style={[globalStyles.menuIcon, { backgroundColor: tintColor }]}>
            <IconSymbol name="questionmark.circle.fill" size={20} color="white" />
          </View>
          <ThemedText style={globalStyles.menuText}>FAQ / Help</ThemedText>
          <IconSymbol name="chevron.right" size={16} color={borderColor + "60"} />
        </TouchableOpacity>

        <TouchableOpacity
          style={globalStyles.menuItem}
          onPress={() => router.push("./privacy-policy")}
        >
          <View style={[globalStyles.menuIcon, { backgroundColor: tintColor }]}>
            <IconSymbol name="checkmark.shield.fill" size={20} color="white" />
          </View>
          <ThemedText style={globalStyles.menuText}>Privacy Policy</ThemedText>
          <IconSymbol name="chevron.right" size={16} color={borderColor + "60"} />
        </TouchableOpacity>

        <TouchableOpacity
          style={globalStyles.menuItem}
          onPress={handleContactSupport}
        >
          <View style={[globalStyles.menuIcon, { backgroundColor: tintColor }]}>
            <IconSymbol name="envelope.fill" size={20} color="white" />
          </View>
          <ThemedText style={globalStyles.menuText}>Contact Support</ThemedText>
          <IconSymbol name="chevron.right" size={16} color={borderColor + "60"} />
        </TouchableOpacity>
      </View>

      <View style={globalStyles.actionSection}>
        <TouchableOpacity style={[globalStyles.signOutButton, { backgroundColor: tintColor }]} onPress={handleSignOut}>
          <ThemedText style={globalStyles.signOutText}>Sign Out</ThemedText>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}