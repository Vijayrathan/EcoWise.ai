import api from './api';
import { Habit, HabitCompletion, WeeklyHabitSummary, HabitCategory } from '../types/habit.model';

export const habitService = {
  getUserHabits: async (userId: string): Promise<Habit[]> => {
    const response = await api.get<Habit[]>('/api/habits', {
      params: { userId },
    });
    return response.data;
  },

  getHabitById: async (habitId: string): Promise<Habit> => {
    const response = await api.get<Habit>(`/api/habits/${habitId}`);
    return response.data;
  },

  createHabit: async (habitData: Partial<Habit>): Promise<Habit> => {
    const response = await api.post<Habit>('/api/habits', habitData);
    return response.data;
  },

  updateHabit: async (habitId: string, habitData: Partial<Habit>): Promise<Habit> => {
    const response = await api.put<Habit>(`/api/habits/${habitId}`, habitData);
    return response.data;
  },

  deleteHabit: async (habitId: string): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/api/habits/${habitId}`);
    return response.data;
  },

  completeHabit: async (habitId: string): Promise<HabitCompletion> => {
    const response = await api.post<HabitCompletion>(`/api/habits/${habitId}/complete`, {});
    return response.data;
  },

  getWeeklyHabitSummary: async (userId: string): Promise<WeeklyHabitSummary> => {
    const response = await api.get<WeeklyHabitSummary>('/api/habits/summary/weekly', {
      params: { userId },
    });
    return response.data;
  },

  getHabitsByCategory: async (userId: string, category: HabitCategory): Promise<Habit[]> => {
    const response = await api.get<Habit[]>(`/api/habits/categories/${category}`, {
      params: { userId },
    });
    return response.data;
  },

  calculateCarbonReduction: (habits: Habit[]): number => {
    if (!habits || habits.length === 0) return 0;
    return habits.reduce((total, habit) => total + (habit.carbonFootprint || 0), 0);
  },

  groupHabitsByCategory: (habits: Habit[]): Record<HabitCategory, Habit[]> => {
    if (!habits || habits.length === 0) return {} as Record<HabitCategory, Habit[]>;
    return habits.reduce((grouped, habit) => {
      const category = habit.category;
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(habit);
      return grouped;
    }, {} as Record<HabitCategory, Habit[]>);
  },
};

