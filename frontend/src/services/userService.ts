import api from './api';
import { User, UserStats, LoginRequest, RegisterRequest, LoginResponse, UserPreferences } from '../types/user.model';

export const userService = {
  register: async (userData: RegisterRequest): Promise<void> => {
    await api.post('/api/users/register', userData);
  },

  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/api/users/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('currentUser', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  getUserById: async (userId: string): Promise<User> => {
    const response = await api.get<User>(`/api/users/${userId}`);
    return response.data;
  },

  updateProfile: async (userId: string, userData: Partial<User>): Promise<User> => {
    const response = await api.put<User>(`/api/users/${userId}`, userData);
    const updatedUser = response.data;
    const currentUserStr = localStorage.getItem('currentUser');
    if (currentUserStr) {
      const currentUser = JSON.parse(currentUserStr);
      if (currentUser._id === updatedUser._id) {
        const newUserData = { ...currentUser, ...updatedUser };
        localStorage.setItem('currentUser', JSON.stringify(newUserData));
      }
    }
    return updatedUser;
  },

  getUserStats: async (userId: string): Promise<UserStats> => {
    const response = await api.get<UserStats>(`/api/users/${userId}/stats`);
    return response.data;
  },

  getUserBadges: async (userId: string): Promise<{ badges: string[] }> => {
    const response = await api.get<{ badges: string[] }>(`/api/users/${userId}/badges`);
    return response.data;
  },

  updateUserPreferences: async (userId: string, preferences: UserPreferences): Promise<User> => {
    const response = await api.post<User>(`/api/users/${userId}/preferences`, {
      goalPreferences: preferences,
    });
    return response.data;
  },

  logout: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
  },

  isLoggedIn: (): boolean => {
    return !!localStorage.getItem('token');
  },

  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        return null;
      }
    }
    return null;
  },

  getToken: (): string | null => {
    return localStorage.getItem('token');
  },
};

