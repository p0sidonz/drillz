import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Dimensions, Text } from 'react-native';
import { ConversationList } from './ConversationList';
import { ChatScreen } from './ChatScreen';
import { useChat } from '../hooks/useChat';
import { UserType } from '../types';

interface ChatAppProps {
  backendUrl: string;
  websocketUrl: string;
  authKey: string;
  onUserPress?: (user: UserType) => void;
  onConversationNameChange?: (name: string) => void;
}

export const ChatApp: React.FC<ChatAppProps> = ({
  backendUrl,
  websocketUrl,
  authKey,
  onUserPress,
  onConversationNameChange,
}) => {
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const [isTablet, setIsTablet] = useState(false);
  const [filterVerified, setFilterVerified] = useState<boolean | null>(null);

  const {
    messages,
    conversations,
    currentUser,
    currentConversation,
    isLoading,
    isConnected,
    error,
    loadConversations,
    selectConversation,
    sendMessage,
    addMeeting,
    markAsSeen,
    deleteConversation,
    fileUploadService,
  } = useChat({ backendUrl, websocketUrl, authKey });

  // Check if device is tablet for responsive layout
  useEffect(() => {
    const { width } = Dimensions.get('window');
    setIsTablet(width >= 768);
  }, []);

  // Notify parent when conversation changes
  useEffect(() => {
    if (currentConversation && onConversationNameChange) {
      const otherUsers = currentConversation.users.filter(
        (user: UserType) => user.id !== currentUser?.id
      );
      const conversationName = otherUsers.map((user: UserType) => user.get_full_name).join(', ');
      onConversationNameChange(conversationName);
    }
  }, [currentConversation, currentUser, onConversationNameChange]);

  // Handle conversation selection
  const handleConversationSelect = async (conversation: any) => {
    setSelectedConversationId(conversation.id);
    await selectConversation(conversation);
    // Mark as seen in the background without blocking the conversation selection
    // markAsSeen(conversation.id).catch(err => {
    //   console.warn('Background mark as seen failed:', err);
    // });
  };

  // Handle search
  const handleSearch = (query: string) => {
    loadConversations({ search: query });
  };

  // Handle filter change
  const handleFilterChange = (verified: boolean | null) => {
    setFilterVerified(verified);
    // Always include exclude_empty=true and handle is_verified parameter correctly
    const params: { is_verified?: boolean | string } = {};
    if (verified !== null) {
      params.is_verified = verified;
    }
    loadConversations(params);
  };

  // Handle file press
  const handleFilePress = (file: any) => {
    Alert.alert(
      'File',
      `Filename: ${file.filename}\nType: ${file.mimetype}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Download', onPress: () => console.log('Download file:', file.file) },
      ]
    );
  };

  // Handle user press
  const handleUserPress = (user: UserType) => {
    if (user && user.username) {
      if (onUserPress) {
        onUserPress(user);
      } else {
        Alert.alert('User Profile', `Name: ${user.get_full_name || 'Unknown'}\nUsername: @${user.username}`);
      }
    }
  };

  // Handle conversation deletion
  const handleDeleteConversation = (conversationId: number) => {
    Alert.alert(
      'Delete Conversation',
      'Are you sure you want to delete this conversation?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteConversation(conversationId)
        },
      ]
    );
  };

  // Show error alerts
  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
    }
  }, [error]);

  // Render mobile layout (single screen)
  const renderMobileLayout = () => {
    if (selectedConversationId && currentConversation) {
      return (
        <ChatScreen
          messages={messages}
          currentUser={currentUser}
          currentConversation={currentConversation}
          isLoading={isLoading}
          isConnected={isConnected}
          error={error}
          onSendMessage={sendMessage}
          onAddMeeting={addMeeting}
          onUserPress={handleUserPress}
          onFilePress={handleFilePress}
          fileUploadService={fileUploadService}
        />
      );
    }

    return (
      <ConversationList
        conversations={conversations}
        currentUser={currentUser}
        selectedConversationId={selectedConversationId || undefined}
        isLoading={isLoading}
        isLoadingMore={false}
        hasNextPage={false}
        searchQuery=""
        filterVerified={filterVerified}
        onConversationSelect={handleConversationSelect}
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        onLoadMore={() => {}}
        onRefresh={() => loadConversations({ is_verified: filterVerified })}
      />
    );
  };

  // Render tablet layout (split screen)
  const renderTabletLayout = () => (
    <View style={styles.tabletContainer}>
      <View style={styles.conversationPanel}>
        <ConversationList
          conversations={conversations}
          currentUser={currentUser}
          selectedConversationId={selectedConversationId || undefined}
          isLoading={isLoading}
          isLoadingMore={false}
          hasNextPage={false}
          searchQuery=""
          filterVerified={filterVerified}
          onConversationSelect={handleConversationSelect}
          onSearch={handleSearch}
          onFilterChange={handleFilterChange}
          onLoadMore={() => {}}
          onRefresh={() => loadConversations({ is_verified: filterVerified })}
        />
      </View>
      
      <View style={styles.chatPanel}>
        {currentConversation ? (
          <ChatScreen
            messages={messages}
            currentUser={currentUser}
            currentConversation={currentConversation}
            isLoading={isLoading}
            isConnected={isConnected}
            error={error}
            onSendMessage={sendMessage}
            onAddMeeting={addMeeting}
            onUserPress={handleUserPress}
            onFilePress={handleFilePress}
            fileUploadService={fileUploadService}
          />
        ) : (
          <View style={styles.noSelectionContainer}>
            <Text style={styles.noSelectionText}>
              Select a conversation to start chatting
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {isTablet ? renderTabletLayout() : renderMobileLayout()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  tabletContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  conversationPanel: {
    width: 300,
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
  },
  chatPanel: {
    flex: 1,
  },
  noSelectionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  noSelectionText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
