# 구현 계획 (07-plan.md)

## 마일스톤 개요

**시간 예산:** 반나절 (2~3시간)  
**스코프:** CRUD + localStorage + 필터 + 정렬 + 시각적 피드백  
**스타일:** 기본 배치만 (v1.1에서 색상 미세 조정)

---

## 마일스톤 표

| 마일스톤 | 목표 | 끝나면 보이는 것 | 예상 시간 | 누적 |
|---------|------|-----------------|---------|------|
| **M1** | 프로젝트 초기화 + 뼈대 | 빈 앱, 컴포넌트 구조 | 20분 | 20분 |
| **M2** | 할 일 CRUD | 추가/완료/삭제 동작 | 35분 | 55분 |
| **M3** | localStorage 연동 | 새로고침 후에도 데이터 유지 | 25분 | 80분 |
| **M4** | 필터 탭 | 전체/활성/완료 필터 동작 | 20분 | 100분 |
| **M5** | 정렬 + 피드백 | 우선순위 재정렬, 완료 애니메이션 | 30분 | 130분 |
| **M6** | 스타일링 (기본) | 그라데이션 배경, 카드 레이아웃 | 15분 | 145분 |
| **여유** | 버그 수정, 테스트 | 모바일 테스트, 엣지 케이스 | 35분 | 180분 |

---

## M1: 프로젝트 초기화 + 뼈대 (20분)

### 할 일

```bash
# 1. Vite 프로젝트 생성
npm create vite@latest todo -- --template react-ts
cd todo
npm install

# 2. 폴더 구조 생성
mkdir -p src/components src/hooks src/types src/utils src/styles

# 3. 타입 정의 작성
# → src/types/index.ts (Task, AppState 등)

# 4. 기본 컴포넌트 생성 (빈 함수 상태)
# → src/components/App.tsx
# → src/components/Dashboard.tsx
# → src/components/InputCard.tsx
# → src/components/TaskGrid.tsx
# → src/components/TaskCard.tsx
# → src/components/FilterTabs.tsx

# 5. App.tsx에 컴포넌트 임포트 + 배치
# → CSS는 아직 추가 안 함 (M6에서)
```

### 검증

```
□ npm run dev 실행되는가
□ 브라우저에서 "할 일" 제목 보이는가
□ 6개 컴포넌트 모두 import되는가
□ TypeScript 에러 없는가
```

### 끝나면 보이는 것

```
┌─────────────────────────────┐
│       할 일 (제목만)          │
├─────────────────────────────┤
│                             │
│  [Dashboard 자리]           │
│                             │
├─────────────────────────────┤
│  [InputCard 자리]           │
├─────────────────────────────┤
│  [FilterTabs 자리]          │
├─────────────────────────────┤
│  [TaskGrid 자리]            │
│                             │
└─────────────────────────────┘
```

---

## M2: 할 일 CRUD (35분)

### 할 일

```typescript
// 1. App.tsx에 상태 추가
const [tasks, setTasks] = useState<Task[]>([]);

// 2. InputCard 구현
// - 입력 필드 + 버튼
// - onAdd(title, category, priority) 콜백
// - 입력 후 Enter 또는 추가 버튼 클릭 시 동작
// → App에 전달하여 tasks 배열에 추가

// 3. TaskCard 구현
// - 체크박스 (완료 토글)
// - 제목, 카테고리, 우선순위 표시
// - 삭제 버튼
// → onToggle, onDelete 콜백

// 4. TaskGrid 구현
// - tasks 배열 받아서 TaskCard 배열 렌더
// - 각 TaskCard에 onToggle, onDelete 연결

// 5. App.tsx에 핸들러 추가
const handleAddTask = (title: string, category: string, priority: 'high' | 'medium' | 'low') => {
  const newTask: Task = {
    id: generateId(),
    title,
    category,
    priority,
    completed: false,
    createdAt: Date.now(),
  };
  setTasks([...tasks, newTask]);
};

const handleToggle = (id: string) => {
  setTasks(tasks.map(t => 
    t.id === id ? { ...t, completed: !t.completed } : t
  ));
};

const handleDelete = (id: string) => {
  setTasks(tasks.filter(t => t.id !== id));
};
```

### 검증

```
□ 텍스트 입력 후 추가 버튼 클릭 → 리스트에 나타나는가
□ 카테고리, 우선순위 기본값 설정되는가
□ 체크박스 클릭 → 항목이 회색으로 표시되는가
□ 삭제 버튼 클릭 → 항목이 제거되는가
□ 3개 항목 추가 후 리스트에 모두 보이는가
```

### 끝나면 보이는 것

```
┌─────────────────────────────────────────┐
│          할 일                           │
├─────────────────────────────────────────┤
│ [입력 필드] [추가 버튼]                 │
├─────────────────────────────────────────┤
│ ☐ 보고서 초안 작성  업무  높음  [삭제] │
│ ☐ 메일 답장        업무  중간  [삭제] │
│ ☑ 점심 예약       개인  중간  [삭제] │ (회색)
└─────────────────────────────────────────┘
```

---

## M3: localStorage 연동 (25분)

### 할 일

```typescript
// 1. 유틸리티 함수 작성 (src/utils/storage.ts)
export function saveTasks(tasks: Task[]): void {
  localStorage.setItem('todoAppTasks', JSON.stringify(tasks));
}

export function loadTasks(): Task[] {
  const data = localStorage.getItem('todoAppTasks');
  return data ? JSON.parse(data) : [];
}

// 2. App.tsx에 useEffect 추가 (초기 로드)
useEffect(() => {
  const loaded = loadTasks();
  setTasks(loaded);
}, []);

// 3. App.tsx에 useEffect 추가 (자동 저장)
useEffect(() => {
  saveTasks(tasks);
}, [tasks]);
```

### 검증

```
□ 앱 새로고침(F5) → 이전 데이터 복원되는가
□ 새 항목 추가 → localStorage에 저장되는가
  (개발자 도구 → Application → Local Storage 확인)
□ 항목 삭제 → localStorage에서도 제거되는가
□ 완료 상태 토글 → localStorage에 반영되는가
```

### 끝나면 보이는 것

사용자는 데이터가 유지되는 것을 느낍니다 (새로고침 후에도).

---

## M4: 필터 탭 (20분)

### 할 일

```typescript
// 1. App.tsx에 필터 상태 추가
const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

// 2. 필터링 로직 (useMemo로 최적화)
const filteredTasks = useMemo(() => {
  if (filter === 'active') return tasks.filter(t => !t.completed);
  if (filter === 'completed') return tasks.filter(t => t.completed);
  return tasks; // 'all'
}, [tasks, filter]);

// 3. FilterTabs 구현
// - 3개 버튼: "전체", "활성", "완료"
// - 현재 필터 강조 (다른 색상)
// - onClick → setFilter(type)

// 4. TaskGrid에 filteredTasks 전달
<TaskGrid tasks={filteredTasks} ... />
```

### 검증

```
□ "전체" 클릭 → 모든 항목 보이는가
□ "활성" 클릭 → 미완료 항목만 보이는가
□ "완료" 클릭 → 완료 항목만 보이는가
□ 탭의 시각적 강조가 명확한가 (스타일)
```

### 끝나면 보이는 것

```
┌─────────────────────────────────────┐
│  할 일                              │
├─────────────────────────────────────┤
│  [전체] [활성] [완료]              │
├─────────────────────────────────────┤
│  ☐ 보고서 초안                      │
│  ☐ 메일 답장                        │
│  (☑ 점심 예약 - 현재 필터에 따라)  │
└─────────────────────────────────────┘
```

---

## M5: 정렬 + 시각적 피드백 (30분)

### 할 일

```typescript
// 1. 정렬 로직 추가 (M4의 filteredTasks 확장)
const filteredTasks = useMemo(() => {
  let result = tasks;

  // 필터링
  if (filter === 'active') result = result.filter(t => !t.completed);
  else if (filter === 'completed') result = result.filter(t => t.completed);

  // 정렬 (우선순위: high > medium > low)
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  result.sort((a, b) => {
    const orderDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (orderDiff !== 0) return orderDiff;
    return b.createdAt - a.createdAt; // 같은 우선순위면 최신순
  });

  return result;
}, [tasks, filter]);

// 2. TaskCard에 CSS 애니메이션 추가
// - 완료 시: opacity 감소, text-decoration: line-through
// - 우선순위 색상: 높음(빨강), 중간(주황), 낮음(청록)

// 3. 완료 피드백 (E1)
// - 체크박스 클릭 시 작은 애니메이션
// - 선택사항: 폭죽 이모지 깜박임, 또는 그냥 색상 변화
```

### 검증

```
□ 높음 우선순위 항목이 맨 위에 있는가
□ 같은 우선순위끼리는 최신순인가
□ 우선순위 색상이 시각적으로 다른가
□ 완료 항목이 회색으로 표시되는가
□ 체크박스 클릭 시 즉시 시각적 변화가 있는가
```

### 끝나면 보이는 것

```
┌─────────────────────────────────────┐
│ ☐ 보고서 초안   업무  [높음 빨강]   │ ← 맨 위
│ ☐ 회의 준비     업무  [높음 빨강]   │
│ ☐ 메일 답장     업무  [중간 주황]   │
│ ☑ 점심 예약     개인  [중간 회색]   │ ← 완료, 회색
└─────────────────────────────────────┘
```

---

## M6: 스타일링 (기본) (15분)

### 할 일

```css
/* src/styles/globals.css + App.module.css 등 */

/* 1. 그라데이션 배경 */
background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);

/* 2. 카드 스타일 */
.card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

/* 3. 우선순위 색상 */
.priority-high { color: #FF6B6B; }
.priority-medium { color: #FFB84D; }
.priority-low { color: #4ECDC4; }

/* 4. 텍스트 스타일 */
body { font: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }

/* 5. 기본 레이아웃 */
.container { max-width: 1200px; margin: 0 auto; padding: 24px; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 16px; }
```

### 검증

```
□ 그라데이션 배경이 적용되는가
□ 카드들이 흰색에 그림자가 있는가
□ 우선순위별로 색상이 다른가
□ 모바일(320px)에서 레이아웃이 깨지지 않는가
□ 텍스트가 읽기 쉬운가
```

### 끝나면 보이는 것

**완성된 앱의 v1 모습**

---

## 시간 부족 시 스코프 축소

### 시간이 120분 이하로 남으면 (2시간)

**v2로 미룰 것:**
- ❌ M6 스타일링 (색상 미세 조정) → 기본 배치만 유지
- ❌ 애니메이션 (부드러운 전환) → 즉시 상태 변화만

**남길 것 (필수):**
- ✓ M1~M5 모두 (CRUD, localStorage, 필터, 정렬, 피드백)

### 시간이 90분 이하로 남으면 (1.5시간)

**추가로 v2로 미룰 것:**
- ❌ M5 시각적 피드백 (애니메이션) → 기본 동작만
- ❌ 우선순위 정렬 색상 구분 → 우선순위 숫자 텍스트로만

**남길 것 (필수):**
- ✓ M1~M4 (CRUD, localStorage, 필터)

### 최악의 경우 (60분만 남으면 1시간)

**MVP만 구현:**
- ✓ M1: 초기화
- ✓ M2: CRUD
- ✓ M3: localStorage

**v2로 모두 미룸:**
- ❌ 필터 (나중)
- ❌ 정렬 (나중)
- ❌ 스타일 (나중)

---

## 검증 방법

### 자동 테스트

```bash
# 현재는 Unit Test 스킵 (시간 부족)
# v1.1에서 추가 예정
```

### 수동 테스트 체크리스트

```
[ ] 항목 추가
  [ ] 제목만 입력 → 기본값(업무, 중간) 적용
  [ ] 모든 필드 입력 → 정확히 저장
  [ ] 빈 제목 추가 시도 → 경고 또는 무시

[ ] 항목 완료
  [ ] 체크박스 클릭 → 회색 처리
  [ ] 다시 클릭 → 원래 색상 복원

[ ] 항목 삭제
  [ ] 삭제 버튼 클릭 → 즉시 제거

[ ] 필터
  [ ] "전체" → 모든 항목
  [ ] "활성" → 미완료만
  [ ] "완료" → 완료 항목만

[ ] 정렬
  [ ] 높음 우선순위가 위에
  [ ] 중간 그 다음
  [ ] 낮음 맨 아래

[ ] localStorage
  [ ] 새로고침 후 데이터 복원
  [ ] 브라우저 DevTools에서 확인

[ ] 모바일 (반응형)
  [ ] 모바일 기기(또는 DevTools) 320px에서 레이아웃 깨지지 않음
```

---

## 마일스톤별 Git 커밋 전략

```bash
# M1 완료 후
git add .
git commit -m "feat: scaffold project structure and components"

# M2 완료 후
git commit -m "feat: implement task CRUD operations"

# M3 완료 후
git commit -m "feat: integrate localStorage persistence"

# M4 완료 후
git commit -m "feat: add filter tabs (all/active/completed)"

# M5 완료 후
git commit -m "feat: implement sorting and visual feedback"

# M6 완료 후
git commit -m "style: add basic styling (gradient, cards, colors)"
```

---

## 다음 단계 (기획 완료 후)

1. **Plan Mode 진입** (선택사항)
   - Shift+Tab으로 plan mode 켜기
   - 마일스톤 실행 순서 확인

2. **구현 시작**
   - M1부터 차례대로
   - 각 M 완료 후 브라우저 테스트
   - 시간 체크하며 진행

3. **시간 관리**
   - 여유 35분 버퍼 활용
   - 막히면 v2로 미루기
   - 중간에 자동 저장하며 진행

