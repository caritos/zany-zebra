import React, { useState } from "react";
import {
  StyleSheet,
  ScrollView,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { globalStyles } from '../../styles/styles';
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAuth } from "@/contexts/auth";
import { useProfile } from "@/hooks/useProfile";
import { useThemeColor } from "@/hooks/use-theme-color";

export default function ProfileTab() {
  const { session } = useAuth();
  const { profile, loading, error, updateNickname, updatePhoneNumber, updateZipCode } = useProfile();
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "icon");
  const tintColor = useThemeColor({}, "tint");

  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempNickname, setTempNickname] = useState(profile?.nickname || "");
  const [tempPhone, setTempPhone] = useState(profile?.phone_number || "");
  const [tempZipCode, setTempZipCode] = useState(profile?.zip_code || "");

  const handleSaveNickname = async () => {
    if (tempNickname !== profile?.nickname) {
      await updateNickname(tempNickname);
    }
    setEditingField(null);
  };

  const handleSavePhone = async () => {
    if (tempPhone !== profile?.phone_number) {
      await updatePhoneNumber(tempPhone);
    }
    setEditingField(null);
  };

  const handleSaveZipCode = async () => {
    if (tempZipCode !== profile?.zip_code) {
      await updateZipCode(tempZipCode);
    }
    setEditingField(null);
  };

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, "");
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return phone;
  };

  return (
    <ScrollView style={[globalStyles.container, { backgroundColor }]} contentContainerStyle={globalStyles.scrollContainer}>
      {loading ? (
        <ThemedView style={globalStyles.loadingContainer}>
          <ThemedText>Loading profile...</ThemedText>
        </ThemedView>
      ) : error ? (
        <ThemedView style={globalStyles.errorContainer}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        </ThemedView>
      ) : (
        <ThemedView>
          <ThemedText style={[styles.sectionLabel, { color: textColor + "80" }]}>
            FULL NAME
          </ThemedText>
          <View style={[styles.inputContainer, { borderColor: borderColor + "20" }]}>
            {editingField === "nickname" ? (
              <View style={styles.editingRow}>
                <TextInput
                  style={[styles.input, { color: textColor }]}
                  value={tempNickname}
                  onChangeText={setTempNickname}
                  placeholder="Enter your name"
                  placeholderTextColor={textColor + "40"}
                  autoFocus
                />
                <TouchableOpacity onPress={handleSaveNickname}>
                  <IconSymbol name="checkmark.circle.fill" size={24} color={tintColor} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setEditingField(null)}>
                  <IconSymbol name="xmark.circle.fill" size={24} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.fieldRow}
                onPress={() => {
                  setEditingField("nickname");
                  setTempNickname(profile?.nickname || "");
                }}
              >
                <ThemedText style={styles.fieldValue}>
                  {profile?.nickname || "Tap to add name"}
                </ThemedText>
                <IconSymbol name="pencil" size={20} color={borderColor + "80"} />
              </TouchableOpacity>
            )}
          </View>

          <ThemedText style={[styles.sectionLabel, { color: textColor + "80" }]}>
            EMAIL
          </ThemedText>
          <View style={[styles.inputContainer, { borderColor: borderColor + "20" }]}>
            <ThemedText style={[styles.fieldValue, { color: textColor + "60" }]}>
              {session?.user?.email || "Not available"}
            </ThemedText>
          </View>

          <ThemedText style={[styles.sectionLabel, { color: textColor + "80" }]}>
            PHONE NUMBER
          </ThemedText>
          <View style={[styles.inputContainer, { borderColor: borderColor + "20" }]}>
            {editingField === "phone" ? (
              <View style={styles.editingRow}>
                <TextInput
                  style={[styles.input, { color: textColor }]}
                  value={tempPhone}
                  onChangeText={setTempPhone}
                  placeholder="Enter phone number"
                  placeholderTextColor={textColor + "40"}
                  keyboardType="phone-pad"
                  autoFocus
                />
                <TouchableOpacity onPress={handleSavePhone}>
                  <IconSymbol name="checkmark.circle.fill" size={24} color={tintColor} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setEditingField(null)}>
                  <IconSymbol name="xmark.circle.fill" size={24} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.fieldRow}
                onPress={() => {
                  setEditingField("phone");
                  setTempPhone(profile?.phone_number || "");
                }}
              >
                <ThemedText style={styles.fieldValue}>
                  {profile?.phone_number
                    ? formatPhoneNumber(profile.phone_number)
                    : "Tap to add phone"}
                </ThemedText>
                <IconSymbol name="pencil" size={20} color={borderColor + "80"} />
              </TouchableOpacity>
            )}
          </View>

          <ThemedText style={[styles.sectionLabel, { color: textColor + "80" }]}>
            ZIP CODE
          </ThemedText>
          <View style={[styles.inputContainer, { borderColor: borderColor + "20" }]}>
            {editingField === "zipCode" ? (
              <View style={styles.editingRow}>
                <TextInput
                  style={[styles.input, { color: textColor }]}
                  value={tempZipCode}
                  onChangeText={setTempZipCode}
                  placeholder="Enter zip code"
                  placeholderTextColor={textColor + "40"}
                  keyboardType="numeric"
                  autoFocus
                />
                <TouchableOpacity onPress={handleSaveZipCode}>
                  <IconSymbol name="checkmark.circle.fill" size={24} color={tintColor} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setEditingField(null)}>
                  <IconSymbol name="xmark.circle.fill" size={24} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.fieldRow}
                onPress={() => {
                  setEditingField("zipCode");
                  setTempZipCode(profile?.zip_code || "");
                }}
              >
                <ThemedText style={styles.fieldValue}>
                  {profile?.zip_code || "Tap to add zip code"}
                </ThemedText>
                <IconSymbol name="pencil" size={20} color={borderColor + "80"} />
              </TouchableOpacity>
            )}
          </View>
        </ThemedView>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 20,
    paddingTop: 20,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 14,
    textAlign: "center",
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 24,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  inputContainer: {
    backgroundColor: "transparent",
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 56,
    justifyContent: "center",
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  fieldValue: {
    fontSize: 16,
    flex: 1,
  },
  editingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 4,
  },
});
