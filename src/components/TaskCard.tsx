import { useState } from 'react';
import type { Task } from '../types';
import { PRIORITY_COLORS } from '../types';
import styles from './TaskCard.module.css';

interface TaskCardProps {
  task: Task;
  onToggle?: (id: string) => void;
  onDelete?: (id: string) => void;
  onProgressChange?: (id: string, progress: number) => void;
}

const priorityLabels = { high: '높음', medium: '중간', low: '낮음' };
const recurringLabels = { daily: '매일', weekly: '매주', monthly: '매월' };

function getDueStatus(dueDate?: number): { label: string; isOverdue: boolean } | null {
  if (!dueDate) return null;

  const now = Date.now();
  const diffMs = dueDate - now;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { label: `${Math.abs(diffDays)}일 초과`, isOverdue: true };
  } else if (diffDays === 0) {
    return { label: '오늘', isOverdue: false };
  } else if (diffDays === 1) {
    return { label: '내일', isOverdue: false };
  } else {
    return { label: `${diffDays}일 남음`, isOverdue: false };
  }
}

export function TaskCard({ task, onToggle, onDelete, onProgressChange }: TaskCardProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const priorityColor = PRIORITY_COLORS[task.priority];
  const dueStatus = getDueStatus(task.dueDate);

  const handleToggle = (id: string) => {
    if (!task.completed) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 600);
    }
    onToggle?.(id);
  };

  return (
    <div 
      className={`${styles.card} ${task.completed ? styles.completed : ''}`}
      style={{ borderTopColor: priorityColor }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, position: 'relative' }}>
        <div style={{ position: 'relative', minWidth: '40px' }}>
          <div style={{ fontSize: '20px', textAlign: 'center' }}>
            {task.progress}%
          </div>
          {isAnimating && <div className={styles.confetti}>🎉</div>}
        </div>
        <div style={{ flex: 1 }}>
          <div className={styles.content}>{task.title}</div>
          <input
            type="range"
            min="0"
            max="100"
            value={task.progress}
            onChange={(e) => onProgressChange?.(task.id, parseInt(e.target.value))}
            className={styles.slider}
            style={{ width: '100%', marginBottom: '8px' }}
          />
          <div className={styles.meta}>
            <span className={styles.category}>{task.category}</span>
            <span style={{ color: priorityColor }}>{priorityLabels[task.priority]}</span>
            {task.recurring && (
              <span style={{ color: '#667eea' }}>
                🔄 {recurringLabels[task.recurring]}
              </span>
            )}
            {dueStatus && (
              <span style={{
                color: dueStatus.isOverdue ? '#FF6B6B' : '#667eea',
                fontWeight: dueStatus.isOverdue ? 'bold' : 'normal'
              }}>
                📅 {dueStatus.label}
              </span>
            )}
          </div>
        </div>
      </div>
      <button
        className={styles.deleteBtn}
        onClick={() => onDelete?.(task.id)}
      >
        ✕
      </button>
    </div>
  );
}
