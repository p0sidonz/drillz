import { Redirect } from 'expo-router';

export default function Index() {
  // This will be handled by the AuthGate in _layout.tsx
  // The AuthGate will redirect to either /sign-in or /(tabs) based on auth state
  return <Redirect href="/(tabs)" />;
}
