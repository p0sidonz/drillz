import '@/global.css';

import { NAV_THEME } from '@/lib/theme';
import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import { AuthProvider, useAuth } from '../lib/auth';
import { useSegments, useRouter, useRootNavigationState } from 'expo-router';
import React, { useEffect } from 'react';
import { View, Text } from 'react-native';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';


function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    // Wait for navigation to be ready and auth to finish loading
    if (isLoading || !navigationState?.key) return;
    
    // Add a small delay to ensure navigation is fully ready
    const timer = setTimeout(() => {
      const inAuthGroup = segments[0] === 'sign-in' || segments[0] === 'sign-up';
      const inTabsGroup = segments[0] === '(tabs)';
      
      if (!user && !inAuthGroup) {
        router.replace('/sign-in');
      } else if (user && inAuthGroup) {
        router.replace('/(tabs)');
      } else if (user && !inTabsGroup && !inAuthGroup) {
        router.replace('/(tabs)');
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [user, segments, navigationState?.key, isLoading]);

  // Show loading screen while auth is loading or navigation isn't ready
  if (isLoading || !navigationState?.key) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text>Loading...</Text>
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  return (
    <AuthProvider>
      <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <AuthGate>
          <Stack />
          <PortalHost />
        </AuthGate>
      </ThemeProvider>
    </AuthProvider>
  );
}
