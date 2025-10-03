// Chat Types for React Native
export interface UserType {
  url: string;
  id: number;
  username: string;
  get_full_name: string;
  avatar: string;
  title: string;
  is_following: boolean;
  total_experience: [number, number];
}

export interface FileType {
  file: File;
  response: FileUploadResponse | null;
}

export interface FileUploadResponse {
  url: string;
  id: number;
  file: string;
  filename: string;
  mimetype: string;
}

export interface ChatMessage {
  id: number;
  content: string;
  created: string;
  sender: UserType;
  files: FileUploadResponse[];
}

export interface Conversation {
  id: number;
  created: string;
  has_seen: boolean;
  last_message: ChatMessage | null;
  users: UserType[];
}

export interface ChatResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ChatMessage[];
}

export interface ConversationsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Conversation[];
}

export interface WebSocketMessage {
  type: 'chat.message';
  content: ChatMessage;
}

export interface SendMessageData {
  text: string;
  files: FileUploadResponse[];
}

export interface AuthState {
  key: string | null;
  user: UserType | null;
}

export interface ChatConfig {
  backendUrl: string;
  websocketUrl: string;
  authKey: string;
}
