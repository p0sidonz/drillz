import React, { useState } from 'react';
import { View } from 'react-native';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Text } from '../components/ui/text';
import { useAuth } from '../lib/auth';
import { Link } from 'expo-router';

function validateEmail(email: string) {
  return /\S+@\S+\.\S+/.test(email);
}

export default function SignUpScreen() {
  const { signup, isLoading, error } = useAuth();
  const [form, setForm] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm_password: '',
  });
  const [localError, setLocalError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const handleSignup = async () => {
    setLocalError(null);
    setSuccess(false);
    if (!form.username || !form.first_name || !form.last_name || !form.email || !form.password || !form.confirm_password) {
      setLocalError('All fields are required');
      return;
    }
    if (!validateEmail(form.email)) {
      setLocalError('Invalid email format');
      return;
    }
    if (form.password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return;
    }
    if (form.password !== form.confirm_password) {
      setLocalError('Passwords do not match');
      return;
    }
    await signup(form);
    if (!error) setSuccess(true);
  };

  return (
    <View className="flex-1 items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create Account</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Username"
            value={form.username}
            onChangeText={v => handleChange('username', v)}
            autoCapitalize="none"
            className="mb-4"
          />
          <Input
            placeholder="First Name"
            value={form.first_name}
            onChangeText={v => handleChange('first_name', v)}
            className="mb-4"
          />
          <Input
            placeholder="Last Name"
            value={form.last_name}
            onChangeText={v => handleChange('last_name', v)}
            className="mb-4"
          />
          <Input
            placeholder="Email"
            value={form.email}
            onChangeText={v => handleChange('email', v)}
            autoCapitalize="none"
            keyboardType="email-address"
            className="mb-4"
          />
          <Input
            placeholder="Password"
            value={form.password}
            onChangeText={v => handleChange('password', v)}
            secureTextEntry
            className="mb-4"
          />
          <Input
            placeholder="Confirm Password"
            value={form.confirm_password}
            onChangeText={v => handleChange('confirm_password', v)}
            secureTextEntry
            className="mb-4"
          />
          {(localError || error) && (
            <Text className="text-red-500 mb-2">{localError || error}</Text>
          )}
          {success && (
            <Text className="text-green-600 mb-2">Please verify your email and then login.</Text>
          )}
          <Button onPress={handleSignup} disabled={isLoading} className="mb-2">
           <Text>{isLoading ? 'Signing up...' : 'Sign Up'}</Text>
          </Button>
          <Text className="text-center mt-2">
            Already have an account?{' '}
            <Link href="/sign-in" className="text-primary underline">Login</Link>
          </Text>
        </CardContent>
      </Card>
    </View>
  );
}
