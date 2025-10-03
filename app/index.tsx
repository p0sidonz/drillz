import { View, ActivityIndicator } from 'react-native';
import { useEffect } from 'react';
import { useRouter, useRootNavigationState } from 'expo-router';
import { useAuth } from '@/lib/auth';

export default function Index() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    // Wait for navigation to be ready
    if (!navigationState?.key || isLoading) return;

    // Redirect based on auth state
    const timer = setTimeout(() => {
      if (user) {
        router.replace('/(tabs)');
      } else {
        router.replace('/sign-in');
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [user, isLoading, navigationState?.key]);

  // Show loading state
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <ActivityIndicator size="large" color="#3B82F6" />
    </View>
  );
}
