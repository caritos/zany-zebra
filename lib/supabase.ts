// @ts-ignore
import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";
import { Platform } from "react-native";

// Get environment variables from EAS build or local development
const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  Constants.expoConfig?.extra?.supabaseUrl ||
  Constants.manifest?.extra?.supabaseUrl ||
  Constants.manifest2?.extra?.expoClient?.extra?.supabaseUrl;

const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  Constants.expoConfig?.extra?.supabaseAnonKey ||
  Constants.manifest?.extra?.supabaseAnonKey ||
  Constants.manifest2?.extra?.expoClient?.extra?.supabaseAnonKey;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase configuration. Please check your setup.",
  );
}

// Use appropriate storage for platform
// For web, AsyncStorage uses localStorage which is only available in browser
const getStorage = () => {
  if (Platform.OS === 'web') {
    // Check if we're in a browser environment (not during static export)
    if (typeof window !== 'undefined' && window.localStorage) {
      return AsyncStorage;
    }
    // During static export, return undefined to skip storage
    return undefined;
  }
  return AsyncStorage;
};

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: getStorage(),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
});
