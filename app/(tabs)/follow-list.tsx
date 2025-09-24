import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, Pressable, RefreshControl, ActivityIndicator } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Avatar } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeftIcon, UserPlusIcon, UserMinusIcon, UsersIcon, UserCheckIcon } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
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

interface FollowListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: User[];
}

export default function FollowListScreen() {
  const { type, userId, username } = useLocalSearchParams<{ 
    type: 'following' | 'followers'; 
    userId: string; 
    username: string; 
  }>();
  const router = useRouter();
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [followLoading, setFollowLoading] = useState<number | null>(null);

  const isFollowing = type === 'following';

  const fetchUsers = async (page: number = 1, refresh: boolean = false) => {
    if (!userId) return;

    try {
      if (refresh) {
        setRefreshing(true);
      } else if (page > 1) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const response = await (isFollowing 
        ? ApiService.getFollowing(parseInt(userId), page)
        : ApiService.getFollowers(parseInt(userId), page)
      );

      const data: FollowListResponse = response.data;
      
      if (refresh || page === 1) {
        setUsers(data.results);
      } else {
        setUsers(prev => [...prev, ...data.results]);
      }
      
      setHasNextPage(!!data.next);
      setCurrentPage(page);
    } catch (error) {
      console.error(`Error fetching ${type}:`, error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const onRefresh = useCallback(() => {
    fetchUsers(1, true);
  }, [userId, isFollowing]);

  const loadMore = useCallback(() => {
    if (hasNextPage && !loadingMore && !loading) {
      fetchUsers(currentPage + 1);
    }
  }, [hasNextPage, loadingMore, loading, currentPage, userId, isFollowing]);

  const handleFollow = async (user: User) => {
    if (followLoading === user.id) return;

    setFollowLoading(user.id);
    try {
      const newFollowState = !user.is_following;
      await ApiService.followUnfollowUser(user.username, newFollowState);
      
      // Update the user in the list
      setUsers(prev => prev.map(u => 
        u.id === user.id 
          ? { ...u, is_following: newFollowState }
          : u
      ));
      
      console.log(`Successfully ${newFollowState ? 'followed' : 'unfollowed'} ${user.username}`);
    } catch (error) {
      console.error('Error following/unfollowing user:', error);
    } finally {
      setFollowLoading(null);
    }
  };

  const handleUserPress = (username: string) => {
    router.push(`/(tabs)/user/${username}`);
  };

  useEffect(() => {
    fetchUsers(1);
  }, [userId, isFollowing]);

  const renderUser = (user: User) => (
    <Pressable 
      key={user.id} 
      onPress={() => handleUserPress(user.username)}
      className="flex-row items-center py-2 px-3 border-b border-border active:bg-muted/30"
    >
      <Avatar className="w-8 h-8 mr-3">
        {user.avatar ? (
          <Text className="text-sm font-bold">IMG</Text>
        ) : (
          <Text className="text-sm font-bold">
            {user.get_full_name?.charAt(0).toUpperCase() || user.username.charAt(0).toUpperCase()}
          </Text>
        )}
      </Avatar>
      
      <View className="flex-1">
        <Text className="font-medium text-sm">
          {user.get_full_name || user.username}
        </Text>
        <Text className="text-muted-foreground text-xs">
          u/{user.username}
        </Text>
        {user.title && (
          <Text className="text-muted-foreground text-xs mt-0.5" numberOfLines={1}>
            {user.title}
          </Text>
        )}
      </View>

      <Button
        size="sm"
        variant={user.is_following ? "outline" : "default"}
        onPress={() => handleFollow(user)}
        disabled={followLoading === user.id}
        className="h-6 px-2"
      >
        <Icon 
          as={user.is_following ? UserMinusIcon : UserPlusIcon} 
          size={12} 
          color={user.is_following ? 'red' : 'white'}
          className="mr-1" 
        />
        <Text className="text-xs">
          {followLoading === user.id 
            ? '...' 
            : (user.is_following ? 'Unfollow' : 'Follow')
          }
        </Text>
      </Button>
    </Pressable>
  );

  const renderFooter = () => {
    if (loadingMore) {
      return (
        <View className="py-2 items-center">
          <ActivityIndicator size="small" color="#007AFF" />
          <Text className="text-muted-foreground text-xs mt-1">Loading more...</Text>
        </View>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-border bg-background">
          <Button
            size="sm"
            variant="ghost"
            onPress={() => router.back()}
            className="h-8 w-8 p-0"
          >
            <Icon as={ArrowLeftIcon} size={20} />
          </Button>
          <Text className="text-lg font-semibold text-foreground">
            {isFollowing ? 'Following' : 'Followers'}
          </Text>
          <View className="w-8" />
        </View>

        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#007AFF" />
          <Text className="text-muted-foreground mt-2">Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-border bg-background">
        <Button
          size="sm"
          variant="ghost"
          onPress={() => router.back()}
          className="h-8 w-8 p-0"
        >
          <Icon as={ArrowLeftIcon} size={20} />
        </Button>
        <View className="flex-row items-center">
          <Icon 
            as={isFollowing ? UserCheckIcon : UsersIcon} 
            size={20} 
            className="mr-2" 
          />
          <Text className="text-lg font-semibold text-foreground">
            {isFollowing ? 'Following' : 'Followers'}
          </Text>
        </View>
        <View className="w-8" />
      </View>

      {/* User Info */}
      <View className="px-3 py-2 bg-muted/20">
        <Text className="text-xs text-muted-foreground">
          {isFollowing ? 'People' : 'People following'} <Text className="font-medium text-foreground">@{username}</Text>
        </Text>
      </View>

      {/* Users List */}
      <ScrollView 
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
          if (isCloseToBottom) {
            loadMore();
          }
        }}
        scrollEventThrottle={400}
      >
        {users.length === 0 ? (
          <View className="items-center py-8 px-4">
            <Icon 
              as={isFollowing ? UserCheckIcon : UsersIcon} 
              size={32} 
              className="text-muted-foreground mb-2" 
            />
            <Text className="text-base font-medium mb-1">
              No {isFollowing ? 'Following' : 'Followers'}
            </Text>
            <Text className="text-muted-foreground text-center text-sm">
              {isFollowing 
                ? `${username} isn't following anyone yet.`
                : `No one is following ${username} yet.`
              }
            </Text>
          </View>
        ) : (
          <>
            {users.map(renderUser)}
            {renderFooter()}
          </>
        )}
      </ScrollView>
    </View>
  );
}
