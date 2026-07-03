# 아키텍처 문서 (06-architecture.md)

## 스택 확정

| 분류 | 선택 | 이유 |
|------|------|------|
| **프론트엔드** | React 18+ | 선언적 UI, 빠른 개발 |
| **언어** | TypeScript | 타입 안정성, IDE 지원 |
| **번들러** | Vite | 빠른 시작, HMR, 최신 표준 |
| **스타일링** | CSS Modules | 스코프 격리, 번들 작음, 추가 라이브러리 불필요 |
| **상태 관리** | useState (Props drilling 최소화) | 초기 상태 간단, 복잡도 낮음 |
| **데이터 저장** | localStorage (JSON 직렬화) | 클라이언트 전용, 데이터베이스 불필요 |
| **패키지 관리** | npm 또는 yarn | 표준 |
| **버전 관리** | Git | 표준 |

---

## 비채택 사항과 이유

| 도구 | 이유 |
|------|------|
| **Redux** | 상태 복잡도가 낮음, 보일러플레이트 과다 |
| **Zustand** | useState로 충분, 나중에 필요시 마이그레이션 가능 |
| **Tailwind CSS** | CSS Modules로 충분한 스타일링, 사용자 정의 색상 체계 필요 |
| **Firebase/Supabase** | localStorage로 충분, 서버 없음 |
| **GraphQL** | REST API조차 불필요, localStorage 직접 접근 |

---

## 폴더 구조

```
todo/
├── src/
│   ├── components/
│   │   ├── App.tsx                 # 루트 컴포넌트
│   │   ├── App.module.css
│   │   ├── Dashboard.tsx           # 진도 카드 대시보드
│   │   ├── Dashboard.module.css
│   │   ├── InputCard.tsx           # 입력 카드
│   │   ├── InputCard.module.css
│   │   ├── TaskGrid.tsx            # 할 일 카드 그리드
│   │   ├── TaskGrid.module.css
│   │   ├── TaskCard.tsx            # 개별 할 일 카드
│   │   ├── TaskCard.module.css
│   │   ├── FilterTabs.tsx          # 필터 탭 (전체/활성/완료)
│   │   └── FilterTabs.module.css
│   ├── hooks/
│   │   ├── useTasks.ts             # 할 일 CRUD + localStorage
│   │   └── useFilter.ts            # 필터 상태 관리
│   ├── types/
│   │   └── index.ts                # TypeScript 타입 정의
│   ├── utils/
│   │   ├── storage.ts              # localStorage 유틸리티
│   │   ├── filter.ts               # 필터링 로직
│   │   └── sort.ts                 # 정렬 로직
│   ├── styles/
│   │   └── globals.css             # 글로벌 스타일
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── public/
│   └── favicon.ico
├── index.html
├── vite.config.ts
├── tsconfig.json
├── package.json
└── .gitignore
```

---

## 데이터 모델 (TypeScript)

### 기본 타입

```typescript
// types/index.ts

// 할 일 항목
export interface Task {
  id: string;                                  // UUID
  title: string;                               // 할 일 제목
  category: string;                            // 카테고리 (예: "업무", "개인")
  priority: 'low' | 'medium' | 'high';         // 우선순위
  completed: boolean;                          // 완료 여부
  createdAt: number;                           // 생성 시간 (timestamp, ms)
  completedAt?: number;                        // 완료 시간 (선택)
}

// 앱 전체 상태
export interface AppState {
  tasks: Task[];
  filter: 'all' | 'active' | 'completed';      // 현재 필터
  sortBy: 'priority' | 'createdDate';           // 정렬 기준
  categories: string[];                         // 사용 가능한 카테고리 목록
}

// 진도 정보 (계산된 값)
export interface Progress {
  category: string;
  total: number;
  completed: number;
  percentage: number;
}
```

### 상수

```typescript
// types/index.ts (하단)

export const DEFAULT_CATEGORIES = ['업무', '개인', '쇼핑', '학습'];

export const PRIORITY_COLORS = {
  high: '#FF6B6B',
  medium: '#FFB84D',
  low: '#4ECDC4',
} as const;

export const PRIORITY_ORDER: Record<Task['priority'], number> = {
  high: 0,
  medium: 1,
  low: 2,
};
```

---

## localStorage 스키마

### 저장 형식

```json
// Key: "todoAppTasks"
// Value:
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "보고서 초안 작성",
    "category": "업무",
    "priority": "high",
    "completed": false,
    "createdAt": 1720000000000,
    "completedAt": null
  },
  ...
]

// Key: "todoAppFilter"
// Value: "all" | "active" | "completed"

// Key: "todoAppCategories"
// Value: ["업무", "개인", "쇼핑", "학습", "커스텀"]
```

### 저장 방식

```typescript
// utils/storage.ts

export const StorageKeys = {
  TASKS: 'todoAppTasks',
  FILTER: 'todoAppFilter',
  CATEGORIES: 'todoAppCategories',
} as const;

export function saveTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(StorageKeys.TASKS, JSON.stringify(tasks));
  } catch (e) {
    console.error('Failed to save tasks:', e);
    // fallback: 가장 최근 작업만 유지 (용량 초과 시)
  }
}

export function loadTasks(): Task[] {
  try {
    const data = localStorage.getItem(StorageKeys.TASKS);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to load tasks:', e);
    return [];
  }
}

export function saveFilter(filter: AppState['filter']): void {
  localStorage.setItem(StorageKeys.FILTER, filter);
}

export function loadFilter(): AppState['filter'] {
  return (localStorage.getItem(StorageKeys.FILTER) as AppState['filter']) || 'all';
}
```

---

## 상태 흐름 (State Flow)

### 상태 다이어그램

```
┌─────────────────────────────────────────────────────────┐
│                    App (루트)                           │
│  ┌─────────────────────────────────────────────────────┤
│  │  const [tasks, setTasks] = useState(...)            │
│  │  const [filter, setFilter] = useState(...)          │
│  │  const [sortBy, setSortBy] = useState(...)          │
│  │                                                      │
│  │  useEffect(() => {                                  │
│  │    // 초기 로드: localStorage에서 복원             │
│  │    const loaded = loadTasks();                       │
│  │    setTasks(loaded);                                │
│  │  }, [])                                             │
│  │                                                      │
│  │  useEffect(() => {                                  │
│  │    // 변경 감지: 즉시 저장                         │
│  │    saveTasks(tasks);                                │
│  │  }, [tasks])                                        │
│  └─────────────────────────────────────────────────────┘
│
├─ Dashboard (부모에서 tasks 받음)
│  ├─ ProgressCard (카테고리별 진도 계산)
│  └─ ProgressCard
│
├─ InputCard
│  ├─ 입력 후 "추가" 클릭
│  └─ onAddTask(title, category, priority) 호출
│     → App의 setTasks() 트리거
│        → localStorage 자동 저장
│
├─ FilterTabs
│  ├─ "전체" / "활성" / "완료" 클릭
│  └─ setFilter() 호출
│     → 리스트 재렌더링
│
└─ TaskGrid (필터된 tasks 받음)
   ├─ TaskCard (각 항목)
   │  ├─ 체크박스 클릭
   │  │  └─ onToggleTask(id) 호출
   │  │     → completed 상태 반전
   │  │        → localStorage 저장
   │  │
   │  ├─ 우선순위 변경
   │  │  └─ onUpdateTask(id, { priority: ... })
   │  │     → tasks 배열 업데이트
   │  │        → 자동 정렬 (우선순위)
   │  │        → localStorage 저장
   │  │
   │  └─ 삭제 버튼
   │     └─ onDeleteTask(id)
   │        → tasks에서 제거
   │        → localStorage 저장
   │
   └─ 필터+정렬 적용된 리스트 표시
      필터: all | active | completed
      정렬: priority 우선, 같으면 createdAt
```

---

## 컴포넌트 구조

### 데이터 흐름 (Props Drilling 최소화)

```typescript
// components/App.tsx
function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<AppState['filter']>('all');
  const [sortBy, setSortBy] = useState<AppState['sortBy']>('priority');

  // 필터된 + 정렬된 tasks
  const filteredTasks = useMemo(() => {
    let result = tasks;

    // 1. 필터링
    if (filter === 'active') {
      result = result.filter(t => !t.completed);
    } else if (filter === 'completed') {
      result = result.filter(t => t.completed);
    }

    // 2. 정렬
    result.sort((a, b) => {
      if (sortBy === 'priority') {
        return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      } else {
        return b.createdAt - a.createdAt;
      }
    });

    return result;
  }, [tasks, filter, sortBy]);

  // 진도 계산
  const progress = useMemo(() => {
    return calculateProgress(tasks);
  }, [tasks]);

  return (
    <div className={styles.container}>
      <Dashboard tasks={tasks} />
      <InputCard onAdd={(title, category, priority) => {
        const newTask: Task = {
          id: generateId(),
          title,
          category,
          priority,
          completed: false,
          createdAt: Date.now(),
        };
        setTasks([...tasks, newTask]);
      }} />
      <FilterTabs 
        current={filter} 
        onChange={setFilter} 
      />
      <TaskGrid 
        tasks={filteredTasks}
        onToggle={(id) => {
          setTasks(tasks.map(t => 
            t.id === id ? { ...t, completed: !t.completed } : t
          ));
        }}
        onUpdate={(id, updates) => {
          setTasks(tasks.map(t => 
            t.id === id ? { ...t, ...updates } : t
          ));
        }}
        onDelete={(id) => {
          setTasks(tasks.filter(t => t.id !== id));
        }}
      />
    </div>
  );
}
```

---

## 핵심 유틸리티

### 필터링 로직

```typescript
// utils/filter.ts

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
  return tasks; // 'all'
}
```

### 정렬 로직

```typescript
// utils/sort.ts

export function sortTasks(
  tasks: Task[],
  sortBy: 'priority' | 'createdDate'
): Task[] {
  const sorted = [...tasks];
  
  if (sortBy === 'priority') {
    sorted.sort((a, b) => {
      const priorityDiff = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.createdAt - a.createdAt; // 같은 우선순위면 최신순
    });
  } else if (sortBy === 'createdDate') {
    sorted.sort((a, b) => b.createdAt - a.createdAt);
  }

  return sorted;
}
```

### 진도 계산

```typescript
// utils/progress.ts

export function calculateProgress(tasks: Task[]): Progress[] {
  const byCategory = new Map<string, { total: number; completed: number }>();

  tasks.forEach(task => {
    const current = byCategory.get(task.category) || { total: 0, completed: 0 };
    current.total += 1;
    if (task.completed) current.completed += 1;
    byCategory.set(task.category, current);
  });

  return Array.from(byCategory.entries()).map(([category, { total, completed }]) => ({
    category,
    total,
    completed,
    percentage: Math.round((completed / total) * 100),
  }));
}
```

---

## 성능 고려사항

### 1. 렌더링 최적화

```typescript
// 필터된 리스트가 변경될 때만 TaskGrid 재렌더링
const filteredTasks = useMemo(() => { ... }, [tasks, filter, sortBy]);

// 각 TaskCard는 메모이제이션 고려
const TaskCard = React.memo(({ task, onToggle, onUpdate, onDelete }: Props) => {
  // ...
});
```

### 2. localStorage 성능

```typescript
// 저장 frequency: onChange 마다 (자동 저장)
// 단점: 100+ 항목일 때 약간의 지연 가능
// 해결: 나중에 debounce 추가 가능

// 로드 frequency: 마운트 시 1회 (useEffect)
// 성능 영향: 최소
```

### 3. 번들 크기

```
React: ~42kb (gzipped)
TypeScript 컴파일: ~0 (번들에 영향 없음)
CSS Modules: 매우 작음 (~5kb)

예상 최종 크기: ~50~60kb (gzipped)
```

---

## 확장 가능성

### v2에서 추가될 구조 (사전 설계)

```typescript
// 나중에 추가될 때를 대비
export interface TaskWithSubtasks extends Task {
  subtasks?: Subtask[];
  dueDate?: number;
  recurring?: 'daily' | 'weekly' | 'monthly';
  tags?: string[];
}

// API 추가 시 구조 (현재는 불필요)
export interface SyncState {
  isSyncing: boolean;
  lastSyncedAt?: number;
  conflictedTasks?: Task[];
}
```

### 마이그레이션 경로

```
현재 (localStorage JSON)
  ↓ (백업 후)
Zustand (상태 관리 추가)
  ↓
Firebase (클라우드 저장)
  ↓
Supabase (팀 협업)
```

---

## 보안 고려사항

### localStorage 한계

```
- 클라이언트 전용, 서버와 동기화 안 됨
- 브라우저 저장소 5~10MB 제한
- XSS 공격에 취약하지 않음 (직렬화된 JSON만 저장)
- 민감 정보(비밀번호 등) 저장 금지
```

### 현재 앱에서 안전함

```
✓ 할 일은 민감 정보 아님
✓ 사용자 인증 필요 없음
✓ 개인 기기에서만 사용 가정
```

---

## 개발 환경 설정

### package.json 스크립트

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "type-check": "tsc --noEmit"
  }
}
```

### Vite 설정

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
});
```

