export interface UserPreferences {
  diet: "standard" | "flexitarian" | "vegetarian" | "vegan" | "other";
  transport: "car" | "public_transport" | "bike" | "walk" | "mixed";
  energyUse: "standard" | "conservative" | "minimal" | "renewable";
  wasteManagement: "standard" | "recycle" | "compost" | "zerowaste";
}

export interface User {
  _id?: string;
  name: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  sustainabilityScore: number;
  greenPoints: number;
  badges: string[];
  goalPreferences: UserPreferences;
  createdAt?: Date;
  lastActive?: Date;
}

export interface UserStats {
  sustainabilityScore: number;
  greenPoints: number;
  badges: string[];
}

export interface AuthResponse {
  user: User;
  token?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface DashboardData {
  ecoChallengesCompleted: number;
  carbonSaved: number;
  streakDays: number;
  recentActivities: Array<{
    action: string;
    description: string;
    date: Date | string;
  }>;
  upcomingChallenges: Array<{
    title: string;
    description: string;
    impact: string;
    category?: string;
  }>;
}

