import { Redirect } from 'expo-router';
import { useAuth } from '@/contexts/auth';

export default function Index() {
  const { session, loading } = useAuth();

  // Show nothing while loading
  if (loading) {
    return null;
  }

  // Redirect to tabs (home) if authenticated, login otherwise
  if (session) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/login" />;
}
