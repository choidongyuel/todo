import { useState } from 'react';
import type { Task, Progress } from '../types';
import { calculateProgress, calculateOverallProgress } from '../utils/progress';
import { getWeeklyStats, getMonthlyStats } from '../utils/stats';
import { getNotifications } from '../utils/notifications';
import styles from './Dashboard.module.css';

interface DashboardProps {
  tasks: Task[];
}

export function Dashboard({ tasks }: DashboardProps) {
  const [monthOffset, setMonthOffset] = useState(0);

  const progress = calculateProgress(tasks);
  const overall = calculateOverallProgress(tasks);
  const weeklyStats = getWeeklyStats(tasks);
  const monthlyStats = getMonthlyStats(tasks, monthOffset);
  const notifications = getNotifications(tasks);

  const now = new Date();
  const targetMonth = new Date(now.getFullYear(), now.getMonth() + monthOffset);
  const monthName = targetMonth.toLocaleString('ko-KR', { year: 'numeric', month: 'long' });

  const maxWeeklyCount = Math.max(...weeklyStats.days.map(d => d.count), 1);
  const maxMonthlyCount = Math.max(...monthlyStats.days.map(d => d.count), 1);

  const notificationsByType = {
    urgent: notifications.filter(n => n.type === 'urgent'),
    overdue: notifications.filter(n => n.type === 'overdue'),
    milestone: notifications.filter(n => n.type === 'milestone'),
  };

  return (
    <div className={styles.dashboard}>
      {notifications.length > 0 && (
        <div className={styles.notificationsSection}>
          {notificationsByType.milestone.map(n => (
            <div key={n.id} className={`${styles.notification} ${styles.milestone}`}>
              <span className={styles.notificationEmoji}>{n.emoji}</span>
              <span className={styles.notificationMessage}>{n.message}</span>
            </div>
          ))}
          {notificationsByType.overdue.map(n => (
            <div key={n.id} className={`${styles.notification} ${styles.overdue}`}>
              <span className={styles.notificationEmoji}>{n.emoji}</span>
              <span className={styles.notificationMessage}>{n.message}</span>
            </div>
          ))}
          {notificationsByType.urgent.map(n => (
            <div key={n.id} className={`${styles.notification} ${styles.urgent}`}>
              <span className={styles.notificationEmoji}>{n.emoji}</span>
              <span className={styles.notificationMessage}>{n.message}</span>
            </div>
          ))}
        </div>
      )}
      {overall.total > 0 && (
        <div className={styles.overallCard}>
          <div className={styles.overallLabel}>전체 진도</div>
          <div className={styles.overallValue}>{overall.percentage}%</div>
          <div className={styles.overallMeta}>
            {overall.completed}/{overall.total} 완료
          </div>
          <div className={styles.bar}>
            <div className={styles.fill} style={{ width: `${overall.percentage}%` }}></div>
          </div>
        </div>
      )}
      <div className={styles.gridContainer}>
        {progress.map(p => (
          <div key={p.category} className={styles.progressCard}>
            <div className={styles.label}>{p.category}</div>
            <div className={styles.value}>{p.percentage}%</div>
            <div className={styles.meta}>
              {p.completed}/{p.total}
            </div>
            <div className={styles.bar}>
              <div className={styles.fill} style={{ width: `${p.percentage}%` }}></div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.statsSection}>
        <div className={styles.statCard}>
          <div className={styles.statTitle}>📊 이번 주</div>
          <div className={styles.statMeta}>
            총 {weeklyStats.total}개 완료 · 일평균 {weeklyStats.average}개
          </div>
          <div className={styles.chartContainer}>
            {weeklyStats.days.map((day, idx) => (
              <div key={idx} className={styles.chartBar}>
                <div
                  className={styles.barFill}
                  style={{
                    height: `${(day.count / maxWeeklyCount) * 100}%`,
                  }}
                  title={`${day.date}: ${day.count}개`}
                />
                <div className={styles.barLabel}>
                  {new Date(day.date).getDate()}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.monthHeader}>
            <button className={styles.monthBtn} onClick={() => setMonthOffset(monthOffset - 1)}>
              ◀
            </button>
            <div className={styles.monthTitle}>📈 {monthName}</div>
            <button className={styles.monthBtn} onClick={() => setMonthOffset(monthOffset + 1)}>
              ▶
            </button>
          </div>
          <div className={styles.statMeta}>
            총 {monthlyStats.total}개 완료 · 일평균 {monthlyStats.average}개
          </div>
          <div className={styles.chartContainer}>
            {monthlyStats.days.map((day, idx) => (
              <div key={idx} className={styles.chartBar}>
                <div
                  className={styles.barFill}
                  style={{
                    height: `${(day.count / maxMonthlyCount) * 100}%`,
                  }}
                  title={`${day.date}: ${day.count}개`}
                />
                <div className={styles.barLabel}>
                  {new Date(day.date).getDate()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
