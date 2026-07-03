export interface Task {
  id: string;
  title: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  createdAt: number;
  completedAt?: number;
  dueDate?: number;
  recurring?: 'daily' | 'weekly' | 'monthly';
  isRecurringInstance?: boolean;
  progress: number;
}

export interface Progress {
  category: string;
  total: number;
  completed: number;
  percentage: number;
}

export const DEFAULT_CATEGORIES = ['업무', '개인', '쇼핑', '학습'];

export const PRIORITY_COLORS = {
  high: '#FF6B6B',
  medium: '#FFB84D',
  low: '#4ECDC4',
} as const;

export const PRIORITY_ORDER: Record<Task['priority'], number> = {
  high: 0,
  medium: 1,
  low: 2,
};
