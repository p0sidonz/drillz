import React, { useState } from 'react';
import { View, SafeAreaView } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { BottomTabs } from '@/components/ui/bottom-tabs';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { MoonStarIcon, SunIcon, CheckIcon } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useAuth } from '@/lib/auth';

export default function TabLayout() {
  const [activeTab, setActiveTab] = useState('home');
  const router = useRouter();
  const segments = useSegments();
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const { user, logout } = useAuth();

  // Update active tab based on current route
  React.useEffect(() => {
    const currentSegment = segments[segments.length - 1];
    if (currentSegment === 'index' || currentSegment === '(tabs)') {
      setActiveTab('home');
    } else if (currentSegment === 'create') {
      setActiveTab('create');
    } else if (currentSegment === 'notifications') {
      setActiveTab('notifications');
    }
  }, [segments]);

  const handleTabPress = (tabKey: string) => {
    setActiveTab(tabKey);
    switch (tabKey) {
      case 'home':
        router.push('/(tabs)');
        break;
      case 'create':
        router.push('/(tabs)/create');
        break;
      case 'notifications':
        router.push('/(tabs)/notifications');
        break;
    }
  };

  const getHeaderTitle = () => {
    switch (activeTab) {
      case 'home':
        return 'Drillz';
      case 'create':
        return 'Create Drill';
      case 'notifications':
        return 'Notifications';
      default:
        return 'Drillz';
    }
  };

  const getHeaderRight = () => {
    if (activeTab === 'notifications') {
      return (
        <View className="flex-row items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            onPress={() => {
              // TODO: Implement mark all as read
              console.log('Mark all as read');
            }}
          >
            <Icon as={CheckIcon} size={20} />
          </Button>
        </View>
      );
    }
    return null;
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Custom Header */}
      {/* <View className="flex-row items-center justify-between px-4 py-3 border-b border-border bg-background">
        <Text className="text-xl font-semibold text-foreground">
          {getHeaderTitle()}
        </Text>
        {getHeaderRight()}
      </View> */}

      {/* Content Area */}
      <View className="flex-1">
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="create" />
          <Stack.Screen name="notifications" />
        </Stack>
      </View>

      {/* Custom Bottom Tabs */}
      <BottomTabs
        activeTab={activeTab}
        onTabPress={handleTabPress}
      />
    </SafeAreaView>
  );
}
