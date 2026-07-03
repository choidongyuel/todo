import type { Task, Progress } from '../types';

export interface OverallProgress {
  total: number;
  completed: number;
  percentage: number;
}

export function calculateProgress(tasks: Task[]): Progress[] {
  const byCategory = new Map<string, { total: number; completed: number; avgProgress: number }>();

  tasks.forEach(task => {
    const current = byCategory.get(task.category) || { total: 0, completed: 0, avgProgress: 0 };
    current.total += 1;
    current.completed += (task.progress || 0);
    byCategory.set(task.category, current);
  });

  return Array.from(byCategory.entries()).map(([category, { total, completed }]) => ({
    category,
    total,
    completed: Math.round(total * (completed / total / 100)),
    percentage: Math.round(completed / total),
  }));
}

export function calculateOverallProgress(tasks: Task[]): OverallProgress {
  const total = tasks.length;
  const avgProgress = total > 0 ? Math.round(tasks.reduce((sum, t) => sum + (t.progress || 0), 0) / total) : 0;
  const completed = tasks.filter(t => t.completed).length;

  return {
    total,
    completed,
    percentage: avgProgress,
  };
}
