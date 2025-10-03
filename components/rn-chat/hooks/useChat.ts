import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  ChatMessage, 
  Conversation, 
  UserType, 
  ChatResponse, 
  ConversationsResponse,
  SendMessageData,
  FileUploadResponse
} from '../types';
import { WebSocketService } from '../services/WebSocketService';
import { ChatApiService } from '../services/ChatApiService';
import { FileUploadService } from '../services/FileUploadService';

interface UseChatOptions {
  backendUrl: string;
  websocketUrl: string;
  authKey: string;
}

interface UseChatReturn {
  // State
  messages: ChatMessage[];
  conversations: Conversation[];
  currentUser: UserType | null;
  currentConversation: Conversation | null;
  isLoading: boolean;
  isConnected: boolean;
  error: string | null;

  // Actions
  loadConversations: (params?: { is_verified?: boolean | string | null; search?: string }) => Promise<void>;
  loadMessages: (conversationId: number) => Promise<void>;
  selectConversation: (conversation: Conversation) => void;
  sendMessage: (text: string, files?: File[]) => Promise<void>;
  addMeeting: () => void;
  markAsSeen: (conversationId: number) => Promise<void>;
  deleteConversation: (conversationId: number) => Promise<void>;

  // File handling
  fileUploadService: FileUploadService;
}

export function useChat({ backendUrl, websocketUrl, authKey }: UseChatOptions): UseChatReturn {
  // State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Services
  const apiService = useRef(new ChatApiService(backendUrl, authKey));
  const fileUploadService = useRef(new FileUploadService(apiService.current));
  const websocketService = useRef<WebSocketService | null>(null);

  // Initialize user and conversations
  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const user = await apiService.current.getCurrentUser();
        setCurrentUser(user);
        
        const conversationsData = await apiService.current.getConversations({ is_verified: null });
        setConversations(conversationsData.results);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize chat');
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, [authKey]);

  // Handle new messages from WebSocket
  const handleNewMessage = useCallback((message: ChatMessage) => {
    if (!message || !message.sender) return;
    
    setMessages(prev => [message, ...prev]);
    
    // Update conversation's last message
    setConversations(prev => 
      prev.map(conv => 
        conv.id === message.sender.id 
          ? { ...conv, last_message: message }
          : conv
      )
    );
  }, []);

  // Connect to WebSocket when conversation is selected
  useEffect(() => {
    if (currentConversation && authKey && websocketUrl) {
      try {
        const wsUrl = `${websocketUrl}/chat/${currentConversation.id}/?key=${authKey}`;
        websocketService.current = new WebSocketService(wsUrl);
        
        websocketService.current.addMessageHandler(handleNewMessage);
        websocketService.current.addConnectionHandler(setIsConnected);
        
        websocketService.current.connect().catch(err => {
          console.error('WebSocket connection error:', err);
          setError(`WebSocket connection failed: ${err.message}`);
        });
      } catch (err) {
        console.error('WebSocket setup error:', err);
        setError(`WebSocket setup failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }

      return () => {
        try {
          websocketService.current?.disconnect();
          websocketService.current = null;
        } catch (err) {
          console.error('WebSocket cleanup error:', err);
        }
      };
    }
  }, [currentConversation, authKey, websocketUrl, handleNewMessage]);

  // Load conversations
  const loadConversations = useCallback(async (params?: { is_verified?: boolean | string | null; search?: string }) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await apiService.current.getConversations(params);
      setConversations(data.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conversations');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load messages for a conversation
  const loadMessages = useCallback(async (conversationId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await apiService.current.getMessages(conversationId);
      setMessages(data.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Select conversation
  const selectConversation = useCallback(async (conversation: Conversation) => {
    setCurrentConversation(conversation);
    await loadMessages(conversation.id);
  }, [loadMessages]);

  // Send message
  const sendMessage = useCallback(async (text: string, files?: File[]) => {
    if (!currentConversation || !websocketService.current?.isConnected) {
      setError('Not connected to chat');
      return;
    }

    try {
      let uploadedFiles: FileUploadResponse[] = [];
      
      if (files && files.length > 0) {
        console.log('Uploading files:', files);
        
        // Check if we can add these files
        if (!fileUploadService.current.canAddFiles(files.length)) {
          setError(`Maximum ${fileUploadService.current.getMaxFiles()} files allowed. Please select fewer files.`);
          return;
        }

        const fileTypes = fileUploadService.current.addFiles(files);
        console.log('File types added to queue:', fileTypes);
        
        await fileUploadService.current.uploadAllFiles();
        uploadedFiles = fileUploadService.current.getReadyFiles();
        console.log('Uploaded files:', uploadedFiles);
        
        fileUploadService.current.clearQueue();
      }

      // Format the message data according to your WebSocket specification
      const messageData: SendMessageData = {
        text: text || (uploadedFiles.length > 0 ? uploadedFiles.map(f => f.filename).join(', ') : ''),
        files: uploadedFiles,
      };

      console.log('Sending WebSocket message:', messageData);
      websocketService.current.sendMessage(messageData);
    } catch (err) {
      console.error('Send message error:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
    }
  }, [currentConversation]);

  // Add meeting
  const addMeeting = useCallback(() => {
    if (!currentConversation || !websocketService.current?.isConnected) {
      setError('Not connected to chat');
      return;
    }

    const meetingLink = `https://meet.jit.si/${crypto.randomUUID()}`;
    const messageData: SendMessageData = {
      text: meetingLink,
      files: [],
    };

    websocketService.current.sendMessage(messageData);
  }, [currentConversation]);

  // Mark conversation as seen
  const markAsSeen = useCallback(async (conversationId: number) => {
    try {
      await apiService.current.markConversationAsSeen(conversationId);
      // Update the conversation as seen locally regardless of API response
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, has_seen: true }
            : conv
        )
      );
    } catch (err) {
      // Don't set error for mark as seen failures, just log it
      console.warn('Mark as seen failed:', err);
      // Still update locally to maintain UI state
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, has_seen: true }
            : conv
        )
      );
    }
  }, []);

  // Delete conversation
  const deleteConversation = useCallback(async (conversationId: number) => {
    try {
      await apiService.current.deleteConversation(conversationId);
      setConversations(prev => prev.filter(conv => conv.id !== conversationId));
      
      if (currentConversation?.id === conversationId) {
        setCurrentConversation(null);
        setMessages([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete conversation');
    }
  }, [currentConversation]);

  return {
    // State
    messages,
    conversations,
    currentUser,
    currentConversation,
    isLoading,
    isConnected,
    error,

    // Actions
    loadConversations,
    loadMessages,
    selectConversation,
    sendMessage,
    addMeeting,
    markAsSeen,
    deleteConversation,

    // File handling
    fileUploadService: fileUploadService.current,
  };
}
