import { useState } from "react";
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

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();


  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleForgotPassword = async () => {
    if (!email || !isValidEmail(email)) {
      Alert.alert("Error", "Please enter a valid email address first");
      return;
    }

    setIsLoading(true);
    try {
      // Don't provide redirectTo - let Supabase use its hosted page
      const { error } = await supabase.auth.resetPasswordForEmail(email);

      if (error) {
        Alert.alert("Error", error.message);
      } else {
        Alert.alert(
          "Password Reset Email Sent",
          "Please check your email for the password reset link. You will be directed to reset your password. After resetting, return to the app to log in with your new password.",
          [{ text: "OK" }],
        );
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to send reset email");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setIsLoading(true);

    try {
      // First, always try to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!signInError) {
        // Sign in successful - navigation will happen automatically via auth state change
        return;
      }

      // If sign in fails with invalid credentials, try to sign up
      if (signInError.message.includes("Invalid login credentials") ||
          signInError.message.includes("User not found")) {

        // Try to create a new account
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: undefined, // Disable email confirmation
          },
        });

        if (signUpError) {
          Alert.alert("Sign Up Error", signUpError.message);
        } else if (signUpData.user) {
          // Auto sign in after successful sign up
          const { error: autoSignInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (autoSignInError) {
            Alert.alert("Login Error", autoSignInError.message);
          }
          // Navigation will happen automatically via auth state change
        }
      } else {
        // Some other error occurred
        Alert.alert("Login Error", signInError.message);
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ThemedView style={styles.content}>
        <ThemedView style={styles.header}>
          <ThemedText type="title">Welcome</ThemedText>
          <ThemedText style={styles.subtitle}>
            Enter your credentials to continue
          </ThemedText>
        </ThemedView>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <ThemedText style={styles.inputLabel}>Email</ThemedText>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              placeholder="Enter your email"
              placeholderTextColor={isDark ? "#999" : "#666"}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.inputLabel}>Password</ThemedText>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              placeholder="Enter your password"
              placeholderTextColor={isDark ? "#999" : "#666"}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleAuth}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <ThemedText style={styles.buttonText}>Continue</ThemedText>
            )}
          </TouchableOpacity>

          <ThemedText style={styles.helpText}>
            We&apos;ll automatically sign you in or create a new account
          </ThemedText>

          <TouchableOpacity
            style={[
              styles.forgotPasswordButton,
              (!email || !isValidEmail(email)) && styles.forgotPasswordDisabled,
            ]}
            onPress={handleForgotPassword}
            disabled={!email || !isValidEmail(email) || isLoading}
          >
            <ThemedText
              style={[
                styles.forgotPasswordText,
                (!email || !isValidEmail(email)) &&
                  styles.forgotPasswordTextDisabled,
              ]}
            >
              Forgot Password?
            </ThemedText>
          </TouchableOpacity>

          {/* Legal Links */}
          <View style={styles.legalContainer}>
            <ThemedText style={styles.legalText}>
              By continuing, you agree to our
            </ThemedText>
            <View style={styles.legalLinks}>
              <TouchableOpacity
                onPress={() => router.push("/terms-of-service")}
              >
                <ThemedText style={styles.legalLink}>
                  Terms of Service
                </ThemedText>
              </TouchableOpacity>
              <ThemedText style={styles.legalSeparator}> and </ThemedText>
              <TouchableOpacity
                onPress={() => router.push("/privacy-policy")}
              >
                <ThemedText style={styles.legalLink}>
                  Privacy Policy
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
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
  helpText: {
    marginTop: 16,
    fontSize: 12,
    opacity: 0.6,
    textAlign: "center",
  },
  forgotPasswordButton: {
    marginTop: 20,
    padding: 12,
    alignItems: "center",
  },
  forgotPasswordDisabled: {
    opacity: 0.4,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "500",
  },
  forgotPasswordTextDisabled: {
    color: "#999",
  },
  legalContainer: {
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(128, 128, 128, 0.2)",
    alignItems: "center",
  },
  legalText: {
    fontSize: 12,
    opacity: 0.6,
    textAlign: "center",
  },
  legalLinks: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  legalLink: {
    fontSize: 12,
    color: "#007AFF",
    fontWeight: "500",
    textDecorationLine: "underline",
  },
  legalSeparator: {
    fontSize: 12,
    opacity: 0.6,
  },
});
