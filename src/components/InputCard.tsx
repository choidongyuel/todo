import { useState } from 'react';
import { DEFAULT_CATEGORIES } from '../types';
import styles from './InputCard.module.css';

interface InputCardProps {
  onAdd?: (title: string, category: string, priority: 'high' | 'medium' | 'low', dueDate?: number, recurring?: 'daily' | 'weekly' | 'monthly') => void;
}

export function InputCard({ onAdd }: InputCardProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(DEFAULT_CATEGORIES[0]);
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [dueDate, setDueDate] = useState('');
  const [recurring, setRecurring] = useState<'daily' | 'weekly' | 'monthly' | ''>('');

  const handleAdd = () => {
    if (!title.trim()) return;
    const dueDateTimestamp = dueDate ? new Date(dueDate).getTime() : undefined;
    const recurringValue = recurring as 'daily' | 'weekly' | 'monthly' | undefined;
    onAdd?.(title, category, priority, dueDateTimestamp, recurringValue || undefined);
    setTitle('');
    setDueDate('');
    setPriority('medium');
    setRecurring('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAdd();
    }
  };

  return (
    <div className={styles.inputCard}>
      <input
        type="text"
        className={styles.input}
        placeholder="새로운 할 일..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyPress={handleKeyPress}
      />
      <select
        className={styles.select}
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        {DEFAULT_CATEGORIES.map(cat => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>
      <select
        className={styles.select}
        value={priority}
        onChange={(e) => setPriority(e.target.value as 'high' | 'medium' | 'low')}
      >
        <option value="high">높음</option>
        <option value="medium">중간</option>
        <option value="low">낮음</option>
      </select>
      <input
        type="date"
        className={styles.dateInput}
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
      />
      <select
        className={styles.select}
        value={recurring}
        onChange={(e) => setRecurring(e.target.value as 'daily' | 'weekly' | 'monthly' | '')}
      >
        <option value="">반복 없음</option>
        <option value="daily">매일</option>
        <option value="weekly">매주</option>
        <option value="monthly">매월</option>
      </select>
      <button className={styles.btn} onClick={handleAdd}>추가</button>
    </div>
  );
}
