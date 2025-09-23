import React from 'react';
import { View, Pressable } from 'react-native';
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
  BellIcon
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

  if (!isOpen) return null;

  const menuItems = [
    { id: 'home', label: 'Home', icon: HomeIcon },
    { id: 'create', label: 'Create', icon: PlusIcon },
    { id: 'notifications', label: 'Notifications', icon: BellIcon },
  ];

  return (
    <View className="absolute inset-0 z-50 flex-row">
      {/* Overlay */}
      <Pressable 
        className="flex-1 bg-black/50" 
        onPress={onClose}
      />
      
      {/* Sidebar */}
      <View className="w-80 bg-background border-l border-border ml-auto">
        <View className="p-4 border-b border-border">
          <View className="flex-row items-center gap-3 mb-4">
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
      </View>
    </View>
  );
}
