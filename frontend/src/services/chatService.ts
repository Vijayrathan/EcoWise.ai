import { ChatMessage, ChatResponse } from '../types/chat.model';
import { aiService } from './aiService';
import { userService } from './userService';

let currentChatId: string | undefined;

export const chatService = {
  getChatHistory: async (): Promise<ChatMessage[]> => {
    const user = userService.getCurrentUser();
    if (user && user._id) {
      const chats = await aiService.getUserChats(user._id);
      const allMessages: ChatMessage[] = [];
      chats.forEach((chat) => {
        chat.messages.forEach((msg) => {
          allMessages.push({
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp,
          });
        });
      });
      return allMessages;
    }
    return [];
  },

  sendMessage: async (message: string): Promise<ChatResponse> => {
    const user = userService.getCurrentUser();
    if (!user || !user._id) {
      throw new Error('You must be logged in to use the chat.');
    }
    return await aiService.chatWithAI(user._id, message, currentChatId);
  },

  clearChatHistory: (): void => {
    currentChatId = undefined;
  },
};

