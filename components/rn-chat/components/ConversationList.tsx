import React from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  StyleSheet, 
  TextInput,
  ActivityIndicator 
} from 'react-native';
import { Conversation, UserType } from '../types';

interface ConversationListProps {
  conversations: Conversation[];
  currentUser: UserType | null;
  selectedConversationId?: number;
  isLoading: boolean;
  isLoadingMore: boolean;
  hasNextPage: boolean;
  searchQuery: string;
  filterVerified: boolean | null;
  onConversationSelect: (conversation: Conversation) => void;
  onSearch: (query: string) => void;
  onFilterChange: (verified: boolean | null) => void;
  onLoadMore: () => void;
  onRefresh: () => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  currentUser,
  selectedConversationId,
  isLoading,
  isLoadingMore,
  hasNextPage,
  searchQuery,
  filterVerified,
  onConversationSelect,
  onSearch,
  onFilterChange,
  onLoadMore,
  onRefresh,
}) => {
  const renderConversation = ({ item: conversation }: { item: Conversation }) => {
    const otherUsers = conversation.users.filter(user => user.id !== currentUser?.id);
    const isSelected = selectedConversationId === conversation.id;
    const hasUnread = !conversation.has_seen;

    return (
      <TouchableOpacity
        style={[
          styles.conversationItem,
          isSelected && styles.selectedConversation,
          hasUnread && styles.unreadConversation,
        ]}
        onPress={() => onConversationSelect(conversation)}
      >
        <View style={styles.avatarGroup}>
          {otherUsers.slice(0, 3).map((user, index) => (
            <View key={user.id} style={[styles.avatarContainer, { zIndex: 3 - index }]}>
              {user.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatar} />
              ) : (
                <View style={styles.defaultAvatar}>
                  <Text style={styles.avatarText}>
                    {user.get_full_name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>

        <View style={styles.conversationContent}>
          <Text style={styles.conversationTitle} numberOfLines={1}>
            {otherUsers.map(user => user.get_full_name).join(', ')}
          </Text>
          
          <Text style={styles.conversationTime}>
            {conversation.last_message 
              ? new Date(conversation.last_message.created).toLocaleString()
              : new Date(conversation.created).toLocaleString()
            }
          </Text>
          
          <Text style={styles.conversationPreview} numberOfLines={1}>
            {conversation.last_message?.content || '--'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>
        {searchQuery ? `No search results for "${searchQuery}"` : 'No Messages Yet...'}
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!hasNextPage) return null;
    
    return (
      <View style={styles.footer}>
        {isLoadingMore ? (
          <ActivityIndicator size="small" color="#007AFF" />
        ) : (
          <Text style={styles.footerText}>Load More</Text>
        )}
      </View>
    );
  };

  const renderFilterTabs = () => (
    <View style={styles.filterTabs}>
      <TouchableOpacity
        style={[
          styles.filterTab,
          filterVerified === true && styles.activeFilterTab,
        ]}
        onPress={() => onFilterChange(true)}
      >
        <Text style={[
          styles.filterTabText,
          filterVerified === true && styles.activeFilterTabText,
        ]}>
          Active
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.filterTab,
          filterVerified === false && styles.activeFilterTab,
        ]}
        onPress={() => onFilterChange(false)}
      >
        <Text style={[
          styles.filterTabText,
          filterVerified === false && styles.activeFilterTabText,
        ]}>
          Requests
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.filterTab,
          filterVerified === null && styles.activeFilterTab,
        ]}
        onPress={() => onFilterChange(null)}
      >
        <Text style={[
          styles.filterTabText,
          filterVerified === null && styles.activeFilterTabText,
        ]}>
          All
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {renderFilterTabs()}
      
      {/* <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search conversations..."
          value={searchQuery}
          onChangeText={onSearch}
          placeholderTextColor="#666"
        />
      </View> */}

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderConversation}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={renderEmptyState}
          ListFooterComponent={renderFooter}
          onEndReached={onLoadMore}
          onEndReachedThreshold={0.1}
          onRefresh={onRefresh}
          refreshing={isLoading}
          style={styles.list}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  filterTabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeFilterTab: {
    borderBottomColor: '#007AFF',
  },
  filterTabText: {
    fontSize: 14,
    color: '#666',
  },
  activeFilterTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  searchContainer: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  list: {
    flex: 1,
  },
  conversationItem: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
  },
  selectedConversation: {
    backgroundColor: '#f0f8ff',
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  unreadConversation: {
    backgroundColor: '#f8f8f8',
  },
  avatarGroup: {
    flexDirection: 'row',
    marginRight: 12,
  },
  avatarContainer: {
    marginLeft: -12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  defaultAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
  },
  conversationContent: {
    flex: 1,
    marginLeft: 12,
  },
  conversationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  conversationTime: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  conversationPreview: {
    fontSize: 14,
    color: '#666',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
  },
});
