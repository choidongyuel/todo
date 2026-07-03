import type { Task } from '../types';
import { PRIORITY_ORDER } from '../types';

export function sortTasks(tasks: Task[], sortBy: 'priority' | 'createdDate'): Task[] {
  const sorted = [...tasks];
  if (sortBy === 'priority') {
    sorted.sort((a, b) => {
      const priorityDiff = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.createdAt - a.createdAt;
    });
  } else {
    sorted.sort((a, b) => b.createdAt - a.createdAt);
  }
  return sorted;
}
