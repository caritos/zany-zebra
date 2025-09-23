import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter, useSegments, SplashScreen } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { useEffect } from "react";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { AuthProvider, useAuth } from "@/contexts/auth";

// Prevent the splash screen from auto-hiding before auth check
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // Hide splash screen once we know auth state
      SplashScreen.hideAsync();

      // Check if user is in the right navigation flow
      const inAuthGroup = segments[0] === "(tabs)";
      const isResetPassword = segments[0] === "reset-password";

      // Allow reset-password route regardless of session
      if (isResetPassword) {
        return;
      }

      if (!session && inAuthGroup) {
        // Redirect to login if not authenticated
        router.replace("/login");
      } else if (session && !inAuthGroup) {
        // Redirect to tabs if authenticated
        router.replace("/(tabs)");
      }
    }
  }, [session, segments, loading, router]);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="reset-password" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
