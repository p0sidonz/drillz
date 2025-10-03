// Main exports for the React Native Chat library

// Components
export { ChatApp } from './components/ChatApp';
export { ChatScreen } from './components/ChatScreen';
export { ChatMessage } from './components/ChatMessage';
export { ConversationList } from './components/ConversationList';

// Hooks
export { useChat } from './hooks/useChat';
export { useConversations } from './hooks/useConversations';
export { useInfiniteScroll } from './hooks/useInfiniteScroll';

// Services
export { WebSocketService } from './services/WebSocketService';
export { ChatApiService } from './services/ChatApiService';
export { FileUploadService } from './services/FileUploadService';

// Types
export type {
  UserType,
  ChatMessage,
  Conversation,
  ChatResponse,
  ConversationsResponse,
  WebSocketMessage,
  SendMessageData,
  AuthState,
  ChatConfig,
  FileType,
  FileUploadResponse,
} from './types';
