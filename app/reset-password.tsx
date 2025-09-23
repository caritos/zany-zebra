import { useState, useEffect } from "react";
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  View,
} from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { supabase } from "@/lib/supabase";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/auth";

export default function ResetPasswordScreen() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();
  const { session } = useAuth();

  useEffect(() => {
    // Listen for password recovery events
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsRecoveryMode(true);
      }
    });

    // Check if we already have a recovery session
    checkRecoverySession();

    return () => subscription.unsubscribe();
  }, []);

  const checkRecoverySession = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    // Check if the session is from a password recovery
    if (session) {
      setIsRecoveryMode(true);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        Alert.alert("Error", error.message);
      } else {
        Alert.alert("Success", "Your password has been updated successfully!", [
          {
            text: "OK",
            onPress: () => router.replace("/(tabs)"),
          },
        ]);
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // If user navigated here directly without recovery session
  if (!isRecoveryMode && !session) {
    return (
      <ThemedView style={styles.container}>
        <ThemedView style={styles.content}>
          <ThemedView style={styles.header}>
            <ThemedText type="title">Reset Password</ThemedText>
            <ThemedText style={styles.subtitle}>
              Please request a password reset first
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.waitingContainer}>
            <ThemedText style={styles.instructionText}>
              To reset your password, please go back to the login screen and
              click &quot;Forgot Password?&quot;
            </ThemedText>

            <TouchableOpacity
              style={styles.button}
              onPress={() => router.replace("/login")}
            >
              <ThemedText style={styles.buttonText}>Back to Login</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ThemedView style={styles.content}>
        <ThemedView style={styles.header}>
          <ThemedText type="title">Create New Password</ThemedText>
          <ThemedText style={styles.subtitle}>
            Enter your new password below
          </ThemedText>
        </ThemedView>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <ThemedText style={styles.inputLabel}>New Password</ThemedText>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              placeholder="Enter new password (min 6 characters)"
              placeholderTextColor={isDark ? "#999" : "#666"}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.inputLabel}>Confirm Password</ThemedText>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              placeholder="Confirm new password"
              placeholderTextColor={isDark ? "#999" : "#666"}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleResetPassword}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <ThemedText style={styles.buttonText}>Update Password</ThemedText>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.replace("/(tabs)")}
          >
            <ThemedText style={styles.backText}>Cancel</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 16,
    opacity: 0.7,
    textAlign: "center",
  },
  form: {
    width: "100%",
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: "500",
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: "#FAFAFA",
    color: "#000",
  },
  inputDark: {
    borderColor: "#333",
    backgroundColor: "#1A1A1A",
    color: "#FFF",
  },
  button: {
    height: 50,
    backgroundColor: "#007AFF",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  backButton: {
    marginTop: 20,
    padding: 12,
    alignItems: "center",
  },
  backText: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "500",
  },
  waitingContainer: {
    alignItems: "center",
    padding: 20,
  },
  instructionText: {
    marginTop: 16,
    fontSize: 14,
    opacity: 0.6,
    textAlign: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
});
