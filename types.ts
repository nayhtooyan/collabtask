export type Language = 'en' | 'mm';

export type Priority = 'low' | 'medium' | 'high';

export type Category = 'Work' | 'Personal' | 'Study' | 'Health' | 'Finance' | 'Other';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: Priority;
  category: Category;
  dueDate?: number; // timestamp
  createdAt: number;
  subTasks: SubTask[];
}

export interface User {
  id: string;
  email: string;
  username: string;
  bio?: string;
  avatar?: string; // Base64 or URL
  emailVerified: boolean;
  preferences: {
    theme: 'light' | 'dark';
    language: Language;
    notifications: boolean;
  };
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export type ViewState = 'onboarding' | 'auth' | 'verification' | 'dashboard' | 'settings';

// AI Service Types
export interface AIGeneratedTask {
  title: string;
  description?: string;
  priority: Priority;
  category: Category;
  subTasks?: string[];
}