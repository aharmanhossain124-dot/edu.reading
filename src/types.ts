export type Language = 'bn' | 'en';
export type ThemeMode = 'light' | 'dark' | 'midnight' | 'forest' | 'sepia';
export type TimerMode = 'stopwatch' | 'pomodoro' | 'custom';
export type Priority = 'low' | 'medium' | 'high';
export type AmbientSoundType = 'none' | 'rain' | 'whitenoise' | 'binaural';

export interface Subject {
  id: string;
  nameBn: string;
  nameEn: string;
  color: string; // e.g. '#4f46e5'
  bgColor: string;
  iconName: string;
}

export interface Task {
  id: string;
  title: string;
  subjectId: string;
  priority: Priority;
  completed: boolean;
  estimatedMinutes?: number;
  createdAt: number;
  completedAt?: number;
}

export interface StudySession {
  id: string;
  subjectId: string;
  subjectName: string;
  durationSeconds: number;
  timestamp: number; // Date.now()
  notes?: string;
  mode: TimerMode;
}

export interface StudyQuote {
  quoteBn: string;
  quoteEn: string;
  authorBn: string;
  authorEn: string;
}
