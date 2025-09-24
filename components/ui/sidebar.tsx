import React, { useEffect, useRef } from 'react';
import { View, Pressable, Animated, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { Text } from './text';
import { Button } from './button';
import { Icon } from './icon';
import { Avatar } from './avatar';
import { cn } from '@/lib/utils';
import { 
  UserIcon, 
  SettingsIcon, 
  LogOutIcon, 
  MoonIcon, 
  SunIcon,
  HomeIcon,
  PlusIcon,
  BellIcon,
  ExternalLinkIcon
} from 'lucide-react-native';
import { useAuth } from '@/lib/auth';
import { useColorScheme } from 'nativewind';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onTabPress: (tab: string) => void;
}

export function Sidebar({ isOpen, onClose, activeTab, onTabPress }: SidebarProps) {
  const { user, logout } = useAuth();
  const { colorScheme, toggleColorScheme } = useColorScheme();
  
  const slideAnim = useRef(new Animated.Value(0)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const screenWidth = Dimensions.get('window').width;

  const handleProfilePress = () => {
    if (user?.username) {
      router.push(`/(tabs)/user/${user.username}`);
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      // Animate in with spring for natural feel
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
  }, [isOpen]);

  if (!isOpen) return null;

  const menuItems = [
    { id: 'home', label: 'Home', icon: HomeIcon },
    { id: 'create', label: 'Create', icon: PlusIcon },
    { id: 'notifications', label: 'Notifications', icon: BellIcon },
  ];

  const sidebarTranslateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [320, 0], // 320px is the sidebar width
  });

  return (
    <View className="absolute inset-0 z-50 flex-row">
      {/* Animated Overlay */}
      <Animated.View 
        className="flex-1 bg-black/50" 
        style={{ opacity: overlayOpacity }}
      >
        <Pressable 
          className="flex-1" 
          onPress={onClose}
        />
      </Animated.View>
      
      {/* Animated Sidebar */}
      <Animated.View 
        className="w-80 bg-background border-l border-border"
        style={{
          transform: [{ translateX: sidebarTranslateX }],
        }}
      >
        <View className="p-4 border-b border-border">
          <Pressable 
            onPress={handleProfilePress}
            className="flex-row items-center gap-3 mb-4 p-2 rounded-lg active:bg-muted"
          >
            <Avatar className="w-12 h-12">
              <Text className="text-lg font-bold">
                {(user?.get_full_name || user?.username || 'U').charAt(0).toUpperCase()}
              </Text>
            </Avatar>
            <View className="flex-1">
              <Text className="font-semibold text-base">
                {user?.get_full_name || user?.username || 'User'}
              </Text>
              <Text className="text-muted-foreground text-sm">
                @{user?.username || 'username'}
              </Text>
            </View>
            <Icon as={ExternalLinkIcon} size={16} className="text-muted-foreground" />
          </Pressable>
          
          <View className="flex-row gap-2 mb-3">
            <Button
              size="sm"
              variant="default"
              onPress={handleProfilePress}
              className="flex-1"
            >
              <Icon as={UserIcon} size={16} />
              <Text className="ml-2">View Profile</Text>
            </Button>
          </View>
          
          <View className="flex-row gap-2">
            <Button
              size="sm"
              variant="outline"
              onPress={toggleColorScheme}
              className="flex-1"
            >
              <Icon as={colorScheme === 'dark' ? SunIcon : MoonIcon} size={16} />
              <Text className="ml-2">Theme</Text>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onPress={logout}
              className="flex-1"
            >
              <Icon as={LogOutIcon} size={16} />
              <Text className="ml-2">Logout</Text>
            </Button>
          </View>
        </View>

        {/* Navigation */}
        <View className="p-2">
          {/* {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <Pressable
                key={item.id}
                onPress={() => {
                  onTabPress(item.id);
                  onClose();
                }}
                className={cn(
                  'flex-row items-center gap-3 p-3 rounded-lg mb-1',
                  isActive && 'bg-accent'
                )}
              >
                <Icon 
                  as={IconComponent} 
                  size={20} 
                  className={isActive ? 'text-primary' : 'text-muted-foreground'} 
                />
                <Text className={cn(
                  'text-base',
                  isActive ? 'text-primary font-medium' : 'text-foreground'
                )}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })} */}
        </View>

        {/* Stats */}
        <View className="p-4 border-t border-border mt-auto">
          <Text className="text-sm font-medium mb-2">Your Stats</Text>
          <View className="flex-row justify-between">
            <View className="items-center">
              <Text className="text-lg font-bold">12</Text>
              <Text className="text-xs text-muted-foreground">Drills</Text>
            </View>
            <View className="items-center">
              <Text className="text-lg font-bold">1.2k</Text>
              <Text className="text-xs text-muted-foreground">Likes</Text>
            </View>
            <View className="items-center">
              <Text className="text-lg font-bold">45</Text>
              <Text className="text-xs text-muted-foreground">Comments</Text>
            </View>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}
