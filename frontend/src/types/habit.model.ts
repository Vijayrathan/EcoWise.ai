export type HabitCategory =
  | "transport"
  | "energy"
  | "diet"
  | "waste"
  | "water"
  | "other";

export interface Habit {
  _id?: string;
  user: string;
  userId?: string;
  date: Date | string;
  category: HabitCategory;
  description: string;
  carbonFootprint: number;
  sustainableAlternative?: string;
  pointsEarned: number;
  isCompleted: boolean;
  completedDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface HabitCompletion {
  habit: Habit;
  pointsEarned: number;
  totalPoints: number;
  newSustainabilityScore: number;
  badges: string[];
}

export interface WeeklyHabitSummary {
  habits: Habit[];
  stats: {
    totalHabits: number;
    completedHabits: number;
    pointsEarned: number;
    carbonFootprint: number;
    habitsByCategory: Record<HabitCategory, number>;
  };
}

