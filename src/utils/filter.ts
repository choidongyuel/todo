import type { Task } from '../types';

export function filterTasks(
  tasks: Task[],
  filterType: 'all' | 'active' | 'completed'
): Task[] {
  if (filterType === 'active') {
    return tasks.filter(t => !t.completed);
  }
  if (filterType === 'completed') {
    return tasks.filter(t => t.completed);
  }
  return tasks;
}
