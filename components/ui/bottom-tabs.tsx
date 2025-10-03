import React from 'react';
import { View, Pressable } from 'react-native';
import { cn } from '@/lib/utils';
import { Text } from './text';
import { Icon } from './icon';
import { HomeIcon, PlusIcon, BellIcon, MessageCircleIcon } from 'lucide-react-native';

interface TabItem {
  key: string;
  title: string;
  icon: React.ComponentType<any>;
  href: string;
}

interface BottomTabsProps {
  activeTab: string;
  onTabPress: (tabKey: string) => void;
  className?: string;
}

const tabs: TabItem[] = [
  {
    key: 'home',
    title: 'Home',
    icon: HomeIcon,
    href: '/(tabs)',
  },
  {
    key: 'create',
    title: 'Create',
    icon: PlusIcon,
    href: '/(tabs)/create',
  },
  {
    key: 'chat',
    title: 'Chat',
    icon: MessageCircleIcon,
    href: '/(tabs)/chat',
  },
  {
    key: 'notifications',
    title: 'Notifications',
    icon: BellIcon,
    href: '/(tabs)/notifications',
  },
];

export function BottomTabs({ activeTab, onTabPress, className }: BottomTabsProps) {
  return (
    <View
      className={cn(
        'flex-row items-center justify-around bg-background border-t border-border px-4 py-2',
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        const IconComponent = tab.icon;
        
        return (
          <Pressable
            key={tab.key}
            onPress={() => onTabPress(tab.key)}
            className={cn(
              'flex-1 items-center justify-center py-2 px-1',
              isActive && 'bg-accent rounded-lg'
            )}
          >
            <Icon
              as={IconComponent}
              size={24}
              className={cn(
                'mb-1',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            />
            <Text
              className={cn(
                'text-xs font-medium',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              {tab.title}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export { tabs };
