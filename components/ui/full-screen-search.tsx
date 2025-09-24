import React, { useState, useRef, useEffect } from 'react';
import { View, ScrollView, Pressable, Animated, TextInput } from 'react-native';
import { Text } from './text';
import { Button } from './button';
import { Icon } from './icon';
import { Avatar } from './avatar';
import { XIcon, SearchIcon, UserIcon } from 'lucide-react-native';
import ApiService from '@/lib/api';

interface User {
  id: number;
  username: string;
  get_full_name: string;
  avatar?: string;
  title?: string;
  is_following: boolean;
  url: string;
}

interface UserProfile {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  get_full_name: string;
  avatar?: string;
  title?: string;
  following_count: number;
  followers_count: number;
  is_following: boolean;
  url: string;
}

interface FullScreenSearchProps {
  isVisible: boolean;
  onClose: () => void;
  onUserPress: (username: string) => void;
}

export function FullScreenSearch({
  isVisible,
  onClose,
  onUserPress
}: FullScreenSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isVisible) {
      // Animate in
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible]);

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setUsers([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    try {
      const response = await ApiService.searchUsers(query, 20);
      setUsers(response.data.results || []);
      setHasSearched(true);
    } catch (error) {
      console.error('Search error:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Clear previous timeout
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    // Set new timeout
    debounceTimeout.current = setTimeout(() => {
      searchUsers(searchQuery);
    }, 300); // 300ms debounce

    // Cleanup
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleClose = () => {
    setSearchQuery('');
    setUsers([]);
    setHasSearched(false);
    onClose();
  };

  const handleUserPress = (username: string) => {
    onUserPress(username);
    handleClose();
  };

  if (!isVisible) return null;

  const slideTranslateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [50, 0],
  });

  return (
    <View className="absolute inset-0 z-50">
      {/* Background Overlay */}
      <Animated.View 
        className="absolute inset-0 bg-black/50"
        style={{ opacity: overlayOpacity }}
      >
        <Pressable className="flex-1" onPress={handleClose} />
      </Animated.View>

      {/* Search Modal */}
      <Animated.View 
        className="absolute inset-0 bg-background"
        style={{
          transform: [{ translateY: slideTranslateY }],
        }}
      >
        {/* Search Header */}
        <View className="px-3 py-2 border-b border-border bg-background">
          <View className="flex-row items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onPress={handleClose}
              className="h-6 w-6 p-0"
            >
              <Icon as={XIcon} size={16} />
            </Button>
            <View className="flex-1">
              <View className="flex-row items-center bg-muted rounded-md px-3 py-1.5">
                <Icon as={SearchIcon} size={16} className="text-muted-foreground mr-2" />
                <TextInput
                  className="flex-1 text-sm text-foreground"
                  placeholder="Search users..."
                  placeholderTextColor="#8E8E93"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoFocus
                />
                {searchQuery.length > 0 && (
                  <Pressable onPress={() => setSearchQuery('')} className="ml-1">
                    <Icon as={XIcon} size={14} className="text-muted-foreground" />
                  </Pressable>
                )}
              </View>
            </View>
          </View>
        </View>
        
        {/* Search Results */}
        <ScrollView className="flex-1">
          {loading ? (
            <View className="items-center py-8">
              <Text className="text-muted-foreground text-sm">Searching...</Text>
            </View>
          ) : !hasSearched ? (
            <View className="items-center py-8">
              <Icon as={SearchIcon} size={32} className="text-muted-foreground mb-2" />
              <Text className="text-muted-foreground text-sm">Start typing to search users</Text>
            </View>
          ) : users.length === 0 ? (
            <View className="items-center py-8">
              <Icon as={UserIcon} size={32} className="text-muted-foreground mb-2" />
              <Text className="text-muted-foreground text-sm">No users found</Text>
            </View>
          ) : (
            <View>
              {users.map((user) => (
                <Pressable
                  key={user.id}
                  onPress={() => handleUserPress(user.username)}
                  className="flex-row items-center px-3 py-2 border-b border-border active:bg-muted"
                >
                  <Avatar className="w-8 h-8 mr-3">
                    <Text className="text-sm font-bold">
                      {user.get_full_name?.charAt(0).toUpperCase() || user.username.charAt(0).toUpperCase()}
                    </Text>
                  </Avatar>
                  
                  <View className="flex-1">
                    <Text className="font-medium text-sm">
                      {user.get_full_name || user.username}
                    </Text>
                    <Text className="text-muted-foreground text-xs">
                      u/{user.username}
                    </Text>
                  </View>
                  
                  {user.is_following && (
                    <View className="bg-blue-100 px-2 py-1 rounded-full">
                      <Text className="text-xs text-blue-600 font-medium">Following</Text>
                    </View>
                  )}
                </Pressable>
              ))}
            </View>
          )}
        </ScrollView>
      </Animated.View>
    </View>
  );
}
