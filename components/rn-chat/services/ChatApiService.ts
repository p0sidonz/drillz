import { 
  ChatResponse, 
  ConversationsResponse, 
  Conversation, 
  UserType, 
  FileUploadResponse 
} from '../types';

export class ChatApiService {
  private baseUrl: string;
  private authKey: string;

  constructor(baseUrl: string, authKey: string) {
    this.baseUrl = baseUrl;
    this.authKey = authKey;
  }

  private getHeaders(): HeadersInit {
    return {
      'Authorization': `Bearer ${this.authKey}`,
      'Content-Type': 'application/json',
    };
  }

  // Get all conversations
  async getConversations(params?: {
    is_verified?: boolean | string | null;
    search?: string;
    page?: number;
  }): Promise<ConversationsResponse> {
    const searchParams = new URLSearchParams();
    
    // Always include exclude_empty=true
    searchParams.append('exclude_empty', 'true');
    
    // Handle is_verified parameter according to the specified patterns:
    // Active: is_verified=true
    // Requests: is_verified=false  
    // All: is_verified= (empty string)
    if (params?.is_verified !== undefined && params?.is_verified !== null) {
      searchParams.append('is_verified', params.is_verified.toString());
    } else if (params?.is_verified === null) {
      // For "All" tab, we want is_verified= (empty string)
      searchParams.append('is_verified', '');
    }
    
    if (params?.search) {
      searchParams.append('search', params.search);
    }
    if (params?.page) {
      searchParams.append('page', params.page.toString());
    }

    const url = `${this.baseUrl}/chats/conversations/?${searchParams.toString()}`;
    
    const response = await fetch(url, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch conversations: ${response.statusText}`);
    }

    return response.json();
  }

  // Get a specific conversation
  async getConversation(conversationId: number): Promise<Conversation> {
    const response = await fetch(`${this.baseUrl}/chats/conversations/${conversationId}/`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch conversation: ${response.statusText}`);
    }

    return response.json();
  }

  // Get messages for a conversation
  async getMessages(conversationId: number, params?: {
    page?: number;
    page_size?: number;
  }): Promise<ChatResponse> {
    const searchParams = new URLSearchParams();
    
    if (params?.page) {
      searchParams.append('page', params.page.toString());
    }
    if (params?.page_size) {
      searchParams.append('page_size', params.page_size.toString());
    }

    const url = `${this.baseUrl}/chats/conversations/${conversationId}/messages/${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    
    const response = await fetch(url, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch messages: ${response.statusText}`);
    }

    return response.json();
  }

  // Get current user info
  async getCurrentUser(): Promise<UserType> {
    const response = await fetch(`${this.baseUrl}/accounts/users/whoami/`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch current user: ${response.statusText}`);
    }

    return response.json();
  }

  // Upload a file
  async uploadFile(file: any, onProgress?: (progress: number) => void): Promise<FileUploadResponse> {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      
      // Handle React Native file objects (from expo-document-picker)
      if (file.uri) {
        // For React Native, we need to create a proper file object
        formData.append('file', {
          uri: file.uri,
          type: file.type || 'application/octet-stream',
          name: file.name || 'file',
        } as any);
      } else {
        // For web File objects
        formData.append('file', file);
      }

      const xhr = new XMLHttpRequest();

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = (event.loaded / event.total) * 100;
          onProgress(progress);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 201) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            reject(new Error('Failed to parse upload response'));
          }
        } else {
          reject(new Error(`Upload failed: ${xhr.statusText}`));
        }
      };

      xhr.onerror = () => {
        reject(new Error('Upload failed'));
      };

      xhr.open('POST', `${this.baseUrl}/contents/file-content/`);
      xhr.setRequestHeader('Authorization', `Bearer ${this.authKey}`);
      xhr.send(formData);
    });
  }

  // Mark conversation as seen
  async markConversationAsSeen(conversationId: number): Promise<void> {
    try {
      // Try different possible endpoints for marking as seen
      const endpoints = [
        `/chats/conversations/${conversationId}/mark-seen/`,
        `/chats/conversations/${conversationId}/seen/`,
        `/chats/conversations/${conversationId}/mark_as_seen/`,
        `/conversations/${conversationId}/mark-seen/`,
        `/conversations/${conversationId}/seen/`
      ];

      let lastError = null;
      
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'POST',
            headers: this.getHeaders(),
          });

          if (response.ok) {
            console.log(`Successfully marked conversation as seen using endpoint: ${endpoint}`);
            return;
          } else if (response.status !== 404) {
            // If it's not a 404, log the error but continue trying other endpoints
            console.warn(`Endpoint ${endpoint} returned ${response.status}: ${response.statusText}`);
          }
        } catch (error) {
          lastError = error;
          console.warn(`Endpoint ${endpoint} failed:`, error);
        }
      }

      // If all endpoints failed, just log a warning
      console.warn('All mark as seen endpoints failed. This feature may not be supported by the backend.');
      if (lastError) {
        console.warn('Last error:', lastError);
      }
    } catch (error) {
      // If there's a general error, just log it and continue
      // console.warn('Failed to mark conversation as seen:', error);
    }
  }

  // Delete conversation
  async deleteConversation(conversationId: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/chats/conversations/${conversationId}/`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete conversation: ${response.statusText}`);
    }
  }
}
