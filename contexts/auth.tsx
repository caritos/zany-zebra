import { createContext, useContext, useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import * as Linking from "expo-linking";

type AuthContextData = {
  session: Session | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextData>({
  session: null,
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Handle deep linking
    const handleDeepLink = (url: string) => {
      if (url) {
        const parsedUrl = Linking.parse(url);

        // Check if this is a password recovery link
        if (
          parsedUrl.hostname === "reset-password" ||
          parsedUrl.path === "reset-password"
        ) {
          // Extract the hash fragment which contains the tokens
          const hashParams = parsedUrl.queryParams;
          if (hashParams?.access_token && hashParams?.refresh_token) {
            // Set the session with the tokens from the URL
            supabase.auth.setSession({
              access_token: hashParams.access_token as string,
              refresh_token: hashParams.refresh_token as string,
            });
          }
        }
      }
    };

    // Check for initial URL (app opened from link)
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink(url);
    });

    // Listen for URL changes (app already open)
    const urlSubscription = Linking.addEventListener("url", (event) => {
      handleDeepLink(event.url);
    });

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
      urlSubscription.remove();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
