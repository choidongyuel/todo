import type { Task } from '../types';

export interface DailyStat {
  date: string;
  count: number;
}

export interface WeeklyStats {
  days: DailyStat[];
  total: number;
  average: number;
}

export interface MonthlyStats {
  days: DailyStat[];
  total: number;
  average: number;
}

export function getWeeklyStats(tasks: Task[]): WeeklyStats {
  const now = Date.now();
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

  const completedTasks = tasks.filter(
    t => t.completedAt && t.completedAt >= sevenDaysAgo && t.completedAt <= now
  );

  const days: DailyStat[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now - i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];
    const dayStart = new Date(dateStr).getTime();
    const dayEnd = dayStart + 24 * 60 * 60 * 1000;

    const count = completedTasks.filter(
      t => t.completedAt && t.completedAt >= dayStart && t.completedAt < dayEnd
    ).length;

    days.push({ date: dateStr, count });
  }

  const total = completedTasks.length;
  const average = Math.round(total / 7);

  return { days, total, average };
}

export function getMonthlyStats(tasks: Task[], offsetMonth: number = 0): MonthlyStats {
  const now = new Date();
  const targetMonth = new Date(now.getFullYear(), now.getMonth() + offsetMonth, 1);
  const nextMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 1);

  const monthStart = targetMonth.getTime();
  const monthEnd = nextMonth.getTime();

  const completedTasks = tasks.filter(
    t => t.completedAt && t.completedAt >= monthStart && t.completedAt < monthEnd
  );

  const daysInMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0).getDate();
  const days: DailyStat[] = [];

  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), i);
    const dateStr = date.toISOString().split('T')[0];
    const dayStart = date.getTime();
    const dayEnd = dayStart + 24 * 60 * 60 * 1000;

    const count = completedTasks.filter(
      t => t.completedAt && t.completedAt >= dayStart && t.completedAt < dayEnd
    ).length;

    days.push({ date: dateStr, count });
  }

  const total = completedTasks.length;
  const average = daysInMonth > 0 ? Math.round(total / daysInMonth) : 0;

  return { days, total, average };
}
