import { useState, useEffect, useMemo } from 'react';
import type { Task } from './types';
import { Dashboard } from './components/Dashboard';
import { InputCard } from './components/InputCard';
import { FilterTabs } from './components/FilterTabs';
import { TaskGrid } from './components/TaskGrid';
import { loadTasks, saveTasks } from './utils/storage';
import { filterTasks } from './utils/filter';
import { sortTasks } from './utils/sort';
import { generateId } from './utils/id';
import styles from './App.module.css';

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [sortBy] = useState<'priority' | 'createdDate'>('priority');
  const [isLoaded, setIsLoaded] = useState(false);

  // 초기 로드 (마운트 시 한 번만)
  useEffect(() => {
    const loaded = loadTasks();
    console.log('Loaded tasks from localStorage:', loaded);
    setTasks(loaded);
    setIsLoaded(true);
  }, []);

  // 자동 저장 (isLoaded 후에만, tasks 변경 시)
  useEffect(() => {
    if (isLoaded && tasks.length >= 0) {
      console.log('Saving tasks to localStorage:', tasks);
      saveTasks(tasks);
    }
  }, [tasks, isLoaded]);

  // 필터 + 정렬
  const filteredTasks = useMemo(() => {
    let result = filterTasks(tasks, filter);
    result = sortTasks(result, sortBy);
    return result;
  }, [tasks, filter, sortBy]);

  // 핸들러들
  const handleAddTask = (title: string, category: string, priority: 'high' | 'medium' | 'low', dueDate?: number, recurring?: 'daily' | 'weekly' | 'monthly') => {
    console.log('Adding task:', title, category, priority, dueDate, recurring);
    const newTask: Task = {
      id: generateId(),
      title,
      category,
      priority,
      completed: false,
      createdAt: Date.now(),
      progress: 0,
      ...(dueDate && { dueDate }),
      ...(recurring && { recurring }),
    };
    setTasks(prev => {
      const updated = [...prev, newTask];
      console.log('Updated tasks:', updated);
      return updated;
    });
  };

  const handleToggle = (id: string) => {
    const toggledTask = tasks.find(t => t.id === id);

    setTasks(prev => {
      const updated = prev.map(t =>
        t.id === id ? { ...t, completed: !t.completed } : t
      );

      // 반복 할 일 완료 시 다음 할 일 자동 생성
      if (toggledTask && !toggledTask.completed && toggledTask.recurring && toggledTask.dueDate) {
        const recurringType = toggledTask.recurring;
        let nextDueDate = toggledTask.dueDate;

        if (recurringType === 'daily') {
          nextDueDate += 1000 * 60 * 60 * 24; // +1일
        } else if (recurringType === 'weekly') {
          nextDueDate += 1000 * 60 * 60 * 24 * 7; // +7일
        } else if (recurringType === 'monthly') {
          const date = new Date(nextDueDate);
          date.setMonth(date.getMonth() + 1);
          nextDueDate = date.getTime();
        }

        const nextTask: Task = {
          id: generateId(),
          title: toggledTask.title,
          category: toggledTask.category,
          priority: toggledTask.priority,
          completed: false,
          createdAt: Date.now(),
          progress: 0,
          dueDate: nextDueDate,
          recurring: recurringType,
          isRecurringInstance: true,
        };

        updated.push(nextTask);
      }

      return updated;
    });
  };

  const handleDelete = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const handleProgressChange = (id: string, newProgress: number) => {
    const clampedProgress = Math.max(0, Math.min(100, newProgress));
    setTasks(tasks.map(t =>
      t.id === id ? {
        ...t,
        progress: clampedProgress,
        completed: clampedProgress === 100,
        ...(clampedProgress === 100 && !t.completed && { completedAt: Date.now() })
      } : t
    ));
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>할 일</h1>
      </div>

      <div className={styles.content}>
        <Dashboard tasks={tasks} />
        <InputCard onAdd={handleAddTask} />
        <FilterTabs current={filter} onChange={setFilter} />
        <TaskGrid tasks={filteredTasks} onToggle={handleToggle} onDelete={handleDelete} onProgressChange={handleProgressChange} />
      </div>
    </div>
  );
}

export default App;
