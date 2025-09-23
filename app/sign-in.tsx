import React, { useState } from 'react';
import { View } from 'react-native';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Text } from '../components/ui/text';
import { useAuth } from '../lib/auth';
import { Link } from 'expo-router';

export default function SignInScreen() {
  const { login, isLoading, error } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleLogin = async (e?: any) => {
    if (e) {
      e.preventDefault();
    }
    setLocalError(null);
    if (!username || !password) {
      setLocalError('Username and password are required');
      return;
    }
    try {
      await login(username, password);
    } catch (error) {
      // Error is already handled in the auth context
      console.error('Login error:', error);
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome Back</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            className="mb-4"
          />
          <Input
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            className="mb-4"
          />
          {(localError || error) && (
            <Text className="text-red-500 mb-2">{localError || error}</Text>
          )}
          <Button onPress={handleLogin} disabled={isLoading} >
          <Text>{isLoading ? 'Logging in...' : 'Login'}</Text>
          </Button>
          <Text className="text-center mt-2">
            Don't have an account?{' '}
            <Link href="/sign-up" className="text-primary underline">Sign Up</Link>
          </Text>
        </CardContent>
      </Card>
    </View>
  );
}
