import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { ChatApp } from '../components/ChatApp';

// Replace these with your actual backend URLs
const BACKEND_URL = 'https://api.apps.introdx.com';
const WEBSOCKET_URL = 'wss://api.apps.introdx.com';

export default function App() {
  const [authKey, setAuthKey] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);

  // In a real app, you'd get the auth key from secure storage
  useEffect(() => {
    // Example: Load auth key from AsyncStorage
    // AsyncStorage.getItem('authKey').then(key => {
    //   if (key) {
    //     setAuthKey(key);
    //     setIsAuthenticated(true);
    //   }
    // });
  }, []);

  const handleLogin = () => {
    if (!authKey.trim()) {
      Alert.alert('Error', 'Please enter an authentication key');
      return;
    }
    
    // In a real app, you'd validate the key with your backend
    setIsAuthenticated(true);
    setUser({ id: 1, username: 'user', get_full_name: 'John Doe' });
  };

  const handleLogout = () => {
    setAuthKey('');
    setIsAuthenticated(false);
    setUser(null);
  };

  const handleUserPress = (user: any) => {
    Alert.alert(
      'User Profile',
      `Name: ${user.get_full_name}\nUsername: @${user.username}`,
      [{ text: 'OK' }]
    );
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.loginContainer}>
          <Text style={styles.title}>Chat App</Text>
          <Text style={styles.subtitle}>Enter your authentication key</Text>
          
          <TextInput
            style={styles.input}
            value={authKey}
            onChangeText={setAuthKey}
            placeholder="Enter auth key..."
            secureTextEntry
            autoCapitalize="none"
          />
          
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chat</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
      
      <ChatApp
        backendUrl={BACKEND_URL}
        websocketUrl={WEBSOCKET_URL}
        authKey={authKey}
        onUserPress={handleUserPress}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 20,
  },
  loginButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#f8f8f8',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#ff4444',
    borderRadius: 6,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
