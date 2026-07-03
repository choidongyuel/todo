import type { Task } from '../types';

export const StorageKeys = {
  TASKS: 'todoAppTasks',
} as const;

export function saveTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(StorageKeys.TASKS, JSON.stringify(tasks));
  } catch (e) {
    console.error('Failed to save tasks:', e);
  }
}

export function loadTasks(): Task[] {
  try {
    const data = localStorage.getItem(StorageKeys.TASKS);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to load tasks:', e);
    return [];
  }
}
