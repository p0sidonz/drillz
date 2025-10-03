import { useState, useEffect, useCallback } from 'react';
import { Conversation, ConversationsResponse } from '../types';
import { ChatApiService } from '../services/ChatApiService';
import { useInfiniteScroll } from './useInfiniteScroll';

interface UseConversationsOptions {
  apiService: ChatApiService;
  initialData?: ConversationsResponse;
}

interface UseConversationsReturn {
  conversations: Conversation[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasNextPage: boolean;
  error: string | null;
  searchQuery: string;
  filterVerified: boolean | null;
  
  // Actions
  loadConversations: (params?: { is_verified?: boolean; search?: string }) => Promise<void>;
  loadMore: () => Promise<void>;
  search: (query: string) => void;
  setFilterVerified: (verified: boolean | null) => void;
  refresh: () => Promise<void>;
  updateConversation: (conversation: Conversation) => void;
  removeConversation: (conversationId: number) => void;
}

export function useConversations({ 
  apiService, 
  initialData 
}: UseConversationsOptions): UseConversationsReturn {
  const [conversations, setConversations] = useState<Conversation[]>(initialData?.results || []);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasNextPage, setIsNextPage] = useState(!!initialData?.next);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVerified, setFilterVerified] = useState<boolean | null>(null);
  const [nextPageUrl, setNextPageUrl] = useState<string | null>(initialData?.next || null);

  // Load conversations
  const loadConversations = useCallback(async (params?: { is_verified?: boolean; search?: string }) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await apiService.getConversations(params);
      setConversations(data.results);
      setNextPageUrl(data.next);
      setIsNextPage(!!data.next);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conversations');
    } finally {
      setIsLoading(false);
    }
  }, [apiService]);

  // Load more conversations (pagination)
  const loadMore = useCallback(async () => {
    if (!nextPageUrl || isLoadingMore) return;

    try {
      setIsLoadingMore(true);
      setError(null);
      
      const response = await fetch(nextPageUrl, {
        headers: { 'Authorization': `Bearer ${apiService['authKey']}` }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to load more conversations: ${response.statusText}`);
      }
      
      const data: ConversationsResponse = await response.json();
      setConversations(prev => [...prev, ...data.results]);
      setNextPageUrl(data.next);
      setIsNextPage(!!data.next);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more conversations');
    } finally {
      setIsLoadingMore(false);
    }
  }, [nextPageUrl, isLoadingMore, apiService]);

  // Search conversations
  const search = useCallback((query: string) => {
    setSearchQuery(query);
    loadConversations({ 
      is_verified: filterVerified || undefined, 
      search: query || undefined 
    });
  }, [loadConversations, filterVerified]);

  // Set verified filter
  const handleSetFilterVerified = useCallback((verified: boolean | null) => {
    setFilterVerified(verified);
    loadConversations({ 
      is_verified: verified || undefined, 
      search: searchQuery || undefined 
    });
  }, [loadConversations, searchQuery]);

  // Refresh conversations
  const refresh = useCallback(async () => {
    await loadConversations({ 
      is_verified: filterVerified || undefined, 
      search: searchQuery || undefined 
    });
  }, [loadConversations, filterVerified, searchQuery]);

  // Update a specific conversation
  const updateConversation = useCallback((conversation: Conversation) => {
    setConversations(prev => 
      prev.map(conv => 
        conv.id === conversation.id ? conversation : conv
      )
    );
  }, []);

  // Remove a conversation
  const removeConversation = useCallback((conversationId: number) => {
    setConversations(prev => prev.filter(conv => conv.id !== conversationId));
  }, []);

  // Initialize with search params if provided
  useEffect(() => {
    if (initialData) {
      setConversations(initialData.results);
      setNextPageUrl(initialData.next);
      setIsNextPage(!!initialData.next);
    }
  }, [initialData]);

  return {
    conversations,
    isLoading,
    isLoadingMore,
    hasNextPage,
    error,
    searchQuery,
    filterVerified,
    
    loadConversations,
    loadMore,
    search,
    setFilterVerified: handleSetFilterVerified,
    refresh,
    updateConversation,
    removeConversation,
  };
}
