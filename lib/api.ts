import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = 'https://api.apps.introdx.com';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      console.log('Unauthorized - token might be expired');
      // You can dispatch logout action here if needed
    }
    return Promise.reject(error);
  }
);

// API Service Class
export class ApiService {
  // Auth endpoints
  static async login(username: string, password: string) {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    
    return apiClient.post('/accounts/login/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  static async register(data: {
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    confirm_password: string;
  }) {
    return apiClient.post('/accounts/register/', data);
  }

  static async changePassword(data: {
    current_password: string;
    new_password: string;
    confirm_new_password: string;
  }) {
    return apiClient.post('/accounts/users/change_password/', data);
  }

  static async changeEmail(data: {
    current_password: string;
    email: string;
  }) {
    return apiClient.post('/accounts/users/change_email/', data);
  }

  // User endpoints
  static async getCurrentUser() {
    return apiClient.get('/accounts/users/whoami/');
  }

  static async getUserProfile(username: string) {
    return apiClient.get(`/accounts/users/${username}/`);
  }

  static async updateUserProfile(username: string, data: {
    username: string;
    first_name: string;
    last_name: string;
    title: string;
  }) {
    return apiClient.patch(`/accounts/users/${username}/`, data);
  }

  static async searchUsers(query: string, limit: number = 20) {
    return apiClient.get('/accounts/users/', {
      params: {
        search: query,
        limit,
      },
    });
  }

  static async getFollowing(userId: number, page: number = 1, limit: number = 20) {
    return apiClient.get('/accounts/users/', {
      params: {
        following: userId,
        page,
        limit,
      },
    });
  }

  static async getFollowers(userId: number, page: number = 1, limit: number = 20) {
    return apiClient.get('/accounts/users/', {
      params: {
        followers: userId,
        page,
        limit,
      },
    });
  }

  // Follow/Unfollow endpoints
  static async followUnfollowUser(username: string, follow: boolean) {
    return apiClient.post(`/accounts/users/${username}/follow_unfollow/`, {
      follow: follow
    });
  }

  // Posts endpoints (if needed)
  static async getPosts(params?: any) {
    return apiClient.get('/posts/', { params });
  }

  static async createPost(data: any) {
    return apiClient.post('/posts/', data);
  }

  static async getPost(id: string) {
    return apiClient.get(`/posts/${id}/`);
  }

  // Generic method for custom endpoints
  static async request(method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE', url: string, data?: any, config?: any) {
    return apiClient.request({
      method,
      url,
      data,
      ...config,
    });
  }
}

// Export the axios instance for direct use if needed
export { apiClient };
export default ApiService;
