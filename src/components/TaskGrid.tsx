import type { Task } from '../types';
import { TaskCard } from './TaskCard';
import styles from './TaskGrid.module.css';

interface TaskGridProps {
  tasks: Task[];
  onToggle?: (id: string) => void;
  onDelete?: (id: string) => void;
  onProgressChange?: (id: string, progress: number) => void;
}

export function TaskGrid({ tasks, onToggle, onDelete, onProgressChange }: TaskGridProps) {
  return (
    <div className={styles.grid}>
      {tasks.length === 0 ? (
        <div className={styles.empty}>할 일이 없습니다</div>
      ) : (
        tasks.map(task => <TaskCard key={task.id} task={task} onToggle={onToggle} onDelete={onDelete} onProgressChange={onProgressChange} />)
      )}
    </div>
  );
}
