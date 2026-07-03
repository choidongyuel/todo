import type { Task } from '../types';

export interface Notification {
  id: string;
  type: 'urgent' | 'overdue' | 'complete' | 'milestone';
  message: string;
  emoji: string;
  taskId?: string;
}

export function getNotifications(tasks: Task[]): Notification[] {
  const notifications: Notification[] = [];
  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;

  // 1. 마감 임박 (24시간 이내, 미완료)
  const urgentTasks = tasks.filter(t => {
    if (!t.dueDate || t.completed) return false;
    const timeLeft = t.dueDate - now;
    return timeLeft > 0 && timeLeft <= oneDayMs;
  });

  urgentTasks.forEach(t => {
    const hoursLeft = Math.ceil((t.dueDate! - now) / (60 * 60 * 1000));
    notifications.push({
      id: `urgent-${t.id}`,
      type: 'urgent',
      message: `"${t.title}" 마감까지 ${hoursLeft}시간 남았습니다`,
      emoji: '⏰',
      taskId: t.id,
    });
  });

  // 2. 마감 초과 (미완료)
  const overdueTasks = tasks.filter(t => {
    if (!t.dueDate || t.completed) return false;
    return t.dueDate < now;
  });

  overdueTasks.forEach(t => {
    const daysOver = Math.floor((now - t.dueDate!) / (24 * 60 * 60 * 1000));
    notifications.push({
      id: `overdue-${t.id}`,
      type: 'overdue',
      message: `"${t.title}" 마감이 ${daysOver}일 초과되었습니다`,
      emoji: '⚠️',
      taskId: t.id,
    });
  });

  // 3. 전체 진도 100% 달성
  const allTasksCount = tasks.length;
  const completedCount = tasks.filter(t => t.completed).length;
  if (allTasksCount > 0 && completedCount === allTasksCount) {
    notifications.push({
      id: 'milestone-complete',
      type: 'milestone',
      message: '🎉 모든 할 일을 완료했습니다! 축하합니다!',
      emoji: '🎉',
    });
  }

  return notifications;
}
