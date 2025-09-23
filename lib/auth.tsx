import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_BASE = 'https://api.apps.introdx.com';

interface UserProfile {
  id: number;
  username: string;
  get_full_name: string;
  avatar?: string;
  title?: string;
  email: string;
  first_name: string;
  last_name: string;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  fetchUserProfile: () => Promise<void>;
}

interface SignupData {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirm_password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadToken = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const storedToken = await AsyncStorage.getItem('authToken');
        if (storedToken) {
          setToken(storedToken);
          await fetchUserProfileWithToken(storedToken);
        }
      } catch (e) {
        console.log('Error loading token:', e);
        setError('Failed to load authentication token.');
        // Clear any invalid token
        await AsyncStorage.removeItem('authToken');
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    loadToken();
  }, []);

  const fetchUserProfileWithToken = async (jwt: string) => {
    try {
      const res = await axios.get(`${API_BASE}/accounts/users/whoami/`, {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });
      setUser(res.data);
    } catch (e) {
      setUser(null);
      setError('Could not fetch user profile.');
    }
  };

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Login called with:', { username, password });
      console.log('Making POST request to:', `${API_BASE}/accounts/login`);
      
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);
      
      const res = await axios.post(`${API_BASE}/accounts/login/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Login success response:', res.data);
      const jwt = res.data.key;
      await AsyncStorage.setItem('authToken', jwt);
      setToken(jwt);
      await fetchUserProfileWithToken(jwt);
    } catch (e: any) {
      console.log('Login error:', e);
      if (e.response) {
        console.log('Login error response:', e.response.data);
        console.log('Response status:', e.response.status);
        console.log('Response headers:', e.response.headers);
        setError(e.response.data?.non_field_errors?.[0] || e.response.data?.detail || 'Login failed');
      } else {
        console.log('Network or other error:', e.message);
        setError(e.message || 'Login error');
      }
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await AsyncStorage.removeItem('authToken');
      setUser(null);
      setToken(null);
    } catch (e) {
      setError('Logout failed');
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (data: SignupData) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API_BASE}/accounts/register/`, data);
      // Registration success, show verify email message
    } catch (e: any) {
      if (e.response) {
        setError(e.response.data?.non_field_errors?.[0] || e.response.data?.detail || 'Signup failed');
      } else {
        setError(e.message || 'Signup error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      await fetchUserProfileWithToken(token);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, error, login, logout, signup, fetchUserProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
