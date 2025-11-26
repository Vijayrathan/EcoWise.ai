import api from './api';
import { ChatResponse, Chat, FootprintAnalysis } from '../types/chat.model';
import { HabitCategory } from '../types/habit.model';

export const aiService = {
  chatWithAI: async (userId: string, message: string, chatId?: string): Promise<ChatResponse> => {
    const response = await api.post<ChatResponse>('/api/ai/chat', {
      userId,
      message,
      chatId,
    });
    return response.data;
  },

  getUserChats: async (userId: string): Promise<Chat[]> => {
    const response = await api.get<Chat[]>('/api/ai/chats', {
      params: { userId },
    });
    return response.data;
  },

  getChatById: async (chatId: string): Promise<Chat> => {
    const response = await api.get<Chat>(`/api/ai/chats/${chatId}`);
    return response.data;
  },

  analyzeHabits: async (userId: string): Promise<{
    analysis: string;
    userProfile: {
      sustainabilityScore: number;
      greenPoints: number;
      badges: string[];
    };
    habitCount: number;
  }> => {
    const response = await api.post<{
      analysis: string;
      userProfile: {
        sustainabilityScore: number;
        greenPoints: number;
        badges: string[];
      };
      habitCount: number;
    }>('/api/ai/analyze-habits', { userId });
    return response.data;
  },

  getSuggestions: async (userId: string, category?: HabitCategory): Promise<{
    suggestions: string;
    category: string;
    userProfile: {
      sustainabilityScore: number;
      greenPoints: number;
    };
  }> => {
    const payload: any = { userId };
    if (category) {
      payload.category = category;
    }
    const response = await api.post<{
      suggestions: string;
      category: string;
      userProfile: {
        sustainabilityScore: number;
        greenPoints: number;
      };
    }>('/api/ai/suggestions', payload);
    return response.data;
  },

  calculateFootprint: async (userId: string, description: string): Promise<FootprintAnalysis> => {
    const response = await api.post<FootprintAnalysis>('/api/ai/calculate-footprint', {
      userId,
      description,
    });
    return response.data;
  },
};

