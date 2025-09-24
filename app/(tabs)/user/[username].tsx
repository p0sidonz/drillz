import React, { useState, useEffect } from 'react';
import { View, ScrollView, Pressable, RefreshControl } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Avatar } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeftIcon, UserPlusIcon, UserMinusIcon, MessageCircleIcon, HeartIcon, SettingsIcon } from 'lucide-react-native';
import { useAuth } from '@/lib/auth';
import ApiService from '@/lib/api';

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

export default function UserProfileScreen() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [following, setFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const isOwnProfile = currentUser?.username === username;

  console.log('UserProfileScreen rendered with username:', username);
  console.log('Current user:', currentUser?.username);
  console.log('Is own profile:', isOwnProfile);

  const fetchUserProfile = async () => {
    if (!username) return;
    
    try {
      const response = await ApiService.getUserProfile(username);
      setUser(response.data);
      setFollowing(response.data.is_following);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserProfile();
    setRefreshing(false);
  };

  const handleFollow = async () => {
    if (!user || followLoading) return;
    
    setFollowLoading(true);
    try {
      const newFollowState = !following;
      await ApiService.followUnfollowUser(user.username, newFollowState);
      setFollowing(newFollowState);
      
      // Update user object to reflect the new follow state
      setUser(prev => prev ? { ...prev, is_following: newFollowState } : null);
      
      console.log(`Successfully ${newFollowState ? 'followed' : 'unfollowed'} ${user.username}`);
    } catch (error) {
      console.error('Error following/unfollowing user:', error);
      // You could show an error message to the user here
    } finally {
      setFollowLoading(false);
    }
  };

  const handleSettings = () => {
    router.push('/(tabs)/settings');
  };

  const handleFollowListPress = (type: 'following' | 'followers') => {
    if (!user) return;
    router.push(`/(tabs)/follow-list?type=${type}&userId=${user.id}&username=${user.username}`);
  };

  useEffect(() => {
    fetchUserProfile();
  }, [username]);

  if (loading) {
    return (
      <View className="flex-1 bg-background">
        <View className="flex-row items-center p-4 border-b border-border">
          <Button
            size="sm"
            variant="ghost"
            onPress={() => router.back()}
            className="h-8 w-8 p-0 mr-3"
          >
            <Icon as={ArrowLeftIcon} size={20} />
          </Button>
          <Text>Loading...</Text>
        </View>
        <View className="flex-1 items-center justify-center">
          <Text >Loading profile...</Text>
        </View>
      </View>
    );
  }

  if (!user) {
    return (
      <View className="flex-1 bg-background">
        <View className="flex-row items-center p-4 border-b border-border">
          <Button
            size="sm"
            variant="ghost"
            onPress={() => router.back()}
            className="h-8 w-8 p-0 mr-3"
          >
            <Icon as={ArrowLeftIcon} size={20} />
          </Button>
          <Text className="text-lg font-semibold">User Not Found</Text>
        </View>
        <View className="flex-1 items-center justify-center">
          <Text className="text-muted-foreground">User not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center p-4 border-b border-border">
        <Button
          size="sm"
          variant="ghost"
          onPress={() => router.back()}
          className="h-8 w-8 p-0 mr-3"
        >
          <Icon as={ArrowLeftIcon} size={20} />
        </Button>
        <Text className="text-lg font-semibold">u/{user.username}</Text>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Profile Header */}
        <View className="p-4">
          <View className="flex-row items-start gap-4 mb-4">
            <Avatar className="w-16 h-16" alt={user.get_full_name || user.username}>
              <Text className="text-2xl font-bold">
                {user.get_full_name?.charAt(0).toUpperCase() || user.username.charAt(0).toUpperCase()}
              </Text>
            </Avatar>
            
            <View className="flex-1">
              <Text className="text-xl font-bold mb-1">
                {user.get_full_name || user.username}
              </Text>
              <Text className="text-muted-foreground text-sm mb-2">
                u/{user.username}
              </Text>
              {user.title && (
                <Text className="text-muted-foreground text-sm mb-3">
                  {user.title}
                </Text>
              )}
              
              {isOwnProfile ? (
                <Button
                  size="sm"
                  variant="outline"
                  onPress={handleSettings}
                  className="w-24"
                >
                  <Icon 
                    as={SettingsIcon} 
                    size={16} 
                    className="mr-1" 
                  />
                  <Text>Settings</Text>
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant={following ? "outline" : "default"}
                  onPress={handleFollow}
                  disabled={followLoading}
                  className="w-24"
                >
                  <Icon 
                    as={following ? UserMinusIcon : UserPlusIcon} 
                    size={16} 
                    color={following ? 'red' : 'white'}
                    className="mr-1" 
                  />
                  <Text>
                    {followLoading 
                      ? (following ? 'Unfollowing...' : 'Following...') 
                      : (following ? 'Unfollow' : 'Follow')
                    }
                  </Text>
                </Button>
              )}
            </View>
          </View>

          {/* Stats */}
          <View className="flex-row gap-6 mb-4">
            <Pressable 
              onPress={() => handleFollowListPress('following')}
              className="items-center flex-1"
            >
              <Text className="text-lg font-bold">{user.following_count}</Text>
              <Text className="text-xs text-muted-foreground">Following</Text>
            </Pressable>
            <Pressable 
              onPress={() => handleFollowListPress('followers')}
              className="items-center flex-1"
            >
              <Text className="text-lg font-bold">{user.followers_count}</Text>
              <Text className="text-xs text-muted-foreground">Followers</Text>
            </Pressable>
          </View>
        </View>

        {/* Content Tabs */}
        <View className="flex-row border-b border-border">
          <Pressable className="flex-1 py-3 border-b-2 border-primary">
            <Text className="text-center font-medium text-primary">Posts</Text>
          </Pressable>
          <Pressable className="flex-1 py-3">
            <Text className="text-center font-medium text-muted-foreground">Comments</Text>
          </Pressable>
          <Pressable className="flex-1 py-3">
            <Text className="text-center font-medium text-muted-foreground">About</Text>
          </Pressable>
        </View>

        {/* Posts Section */}
        <View className="p-4">
          <Card>
            <CardContent className="p-4">
              <View className="items-center py-8">
                <Icon as={MessageCircleIcon} size={48} className="text-muted-foreground mb-4" />
                <Text className="text-lg font-medium mb-2">No posts yet</Text>
                <Text className="text-muted-foreground text-center text-sm">
                  This user hasn't posted anything yet
                </Text>
              </View>
            </CardContent>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}
