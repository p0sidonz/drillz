import React, { useState } from 'react';
import { View, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/lib/auth';
import { ChatApp } from '@/components/rn-chat';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { ArrowLeftIcon } from 'lucide-react-native';

export default function ChatScreen() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [conversationName, setConversationName] = useState('Messages');

  // Handle user profile navigation
  const handleUserPress = (user: any) => {
    if (user?.username) {
      router.push(`/(tabs)/user/${user.username}`);
    }
  };

  // Handle conversation name change
  const handleConversationNameChange = (name: string) => {
    setConversationName(name || 'Messages');
  };

  if (!user || !token) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <View className="items-center">
          <Text className="text-lg font-medium mb-2">Authentication Required</Text>
          <Text className="text-muted-foreground text-center mb-4">
            Please sign in to access chat
          </Text>
          <Button onPress={() => router.push('/sign-in')}>
            <Text>Sign In</Text>
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-border bg-background">
        <Button size="sm" variant="ghost" onPress={router.back} className="h-8 w-8 p-0">
          <Icon as={ArrowLeftIcon} size={20} />
        </Button>
        <Text className="text-lg font-semibold text-foreground">{conversationName}</Text>
        <View className="w-8" />
      </View>

      {/* Chat App */}
      <View className="flex-1">
        <ChatApp
          backendUrl="https://api.apps.introdx.com"
          websocketUrl="wss://api.apps.introdx.com"
          authKey={token}
          onUserPress={handleUserPress}
          onConversationNameChange={handleConversationNameChange}
        />
      </View>
    </SafeAreaView>
  );
}
