import React, { useState } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { BellIcon, CheckIcon, TrashIcon, HeartIcon, MessageCircleIcon } from 'lucide-react-native';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Sarah Johnson commented on your post',
    message: 'Great workout routine! I tried it yesterday and loved it 💪',
    time: '2 minutes ago',
    isRead: false,
    type: 'info',
  },
  {
    id: '2',
    title: 'Mike Chen liked your post',
    message: 'Mike liked your "Morning Cardio Blast" workout',
    time: '15 minutes ago',
    isRead: false,
    type: 'success',
  },
  {
    id: '3',
    title: 'Alex Rodriguez commented on your post',
    message: 'This is exactly what I needed! Thanks for sharing the tips',
    time: '1 hour ago',
    isRead: true,
    type: 'info',
  },
  {
    id: '4',
    title: 'Emma Wilson liked your post',
    message: 'Emma liked your "Strength Training Basics" post',
    time: '2 hours ago',
    isRead: true,
    type: 'success',
  },
  {
    id: '5',
    title: 'David Kim commented on your post',
    message: 'Amazing progress! How long have you been following this routine?',
    time: '3 hours ago',
    isRead: true,
    type: 'info',
  },
  {
    id: '6',
    title: 'Lisa Park liked your post',
    message: 'Lisa liked your "HIIT Workout" routine',
    time: '5 hours ago',
    isRead: true,
    type: 'success',
  },
];

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, isRead: true }))
    );
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-red-500'; // Like notifications (heart color)
      case 'warning': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-blue-500'; // Comment notifications
    }
  };

  return (
    <ScrollView 
      className="flex-1 bg-background"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
        <View className="px-2">
          {notifications.length === 0 ? (
            <View className="items-center py-8 px-4">
              <Icon as={BellIcon} size={32} className="text-muted-foreground mb-2" />
              <Text className="text-base font-medium mb-1">No Notifications</Text>
              <Text className="text-muted-foreground text-center text-sm">
                You're all caught up!
              </Text>
            </View>
          ) : (
            <View>
              {notifications.map((notification) => (
                <View 
                  key={notification.id} 
                  className={`py-3 px-3 border-b border-border ${!notification.isRead ? 'bg-blue-50/50' : ''}`}
                >
                  <View className="flex-row items-start gap-3">
                    <View className={`w-6 h-6 rounded-full ${getTypeColor(notification.type)} items-center justify-center mt-0.5`}>
                      <Icon 
                        as={notification.type === 'success' ? HeartIcon : MessageCircleIcon} 
                        size={12} 
                        className="text-white" 
                      />
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2 mb-1">
                        <Text className="font-medium text-sm flex-1">
                          {notification.title}
                        </Text>
                        {!notification.isRead && (
                          <View className="w-2 h-2 bg-blue-500 rounded-full" />
                        )}
                      </View>
                      <Text className="text-muted-foreground text-xs mb-1">
                        {notification.message}
                      </Text>
                      <View className="flex-row items-center justify-between">
                        <Text className="text-xs text-muted-foreground">
                          {notification.time}
                        </Text>
                        <View className="flex-row gap-1">
                          {!notification.isRead && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onPress={() => markAsRead(notification.id)}
                              className="h-6 px-2"
                            >
                              <Icon as={CheckIcon} size={12} />
                            </Button>
                          )}
                          {/* <Button
                            size="sm"
                            variant="ghost"
                            onPress={() => deleteNotification(notification.id)}
                            className="h-6 px-2"
                          >
                            <Icon as={TrashIcon} size={12} />
                          </Button> */}
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

  );
}
