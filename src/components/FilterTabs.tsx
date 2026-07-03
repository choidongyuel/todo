import styles from './FilterTabs.module.css';

interface FilterTabsProps {
  current?: 'all' | 'active' | 'completed';
  onChange?: (filter: 'all' | 'active' | 'completed') => void;
}

export function FilterTabs({ current = 'all', onChange }: FilterTabsProps) {
  return (
    <div className={styles.filters}>
      <button className={`${styles.tab} ${current === 'all' ? styles.active : ''}`} onClick={() => onChange?.('all')}>전체</button>
      <button className={`${styles.tab} ${current === 'active' ? styles.active : ''}`} onClick={() => onChange?.('active')}>활성</button>
      <button className={`${styles.tab} ${current === 'completed' ? styles.active : ''}`} onClick={() => onChange?.('completed')}>완료</button>
    </div>
  );
}
