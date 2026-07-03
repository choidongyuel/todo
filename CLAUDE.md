# CLAUDE.md

이 파일은 이 저장소에서 코드로 작업할 때 Claude Code (claude.ai/code)에 대한 지침을 제공합니다.

## 프로젝트 개요

**할 일 관리 앱** — React 18+ + TypeScript + Vite + localStorage

우선순위 기반 정렬, 진도 추적, 마감일 관리, 반복 작업, 활동 통계 등의 기능을 포함하는 개인용 할 일 관리 애플리케이션입니다. 백엔드나 데이터베이스가 필요 없으며, 모든 데이터는 브라우저의 localStorage를 통해 지속됩니다.

**주요 기술 스택:**
- **프론트엔드:** React 19.2.7, TypeScript 6.0.2
- **빌드:** Vite 8.1.1
- **스타일링:** CSS Modules (Tailwind/외부 CSS 프레임워크 없음)
- **저장소:** localStorage (JSON 직렬화)
- **상태 관리:** useState 훅 (Redux/Zustand 없음)

---

## 개발 명령어

```bash
# 개발 서버 시작 (핫 리로드)
npm run dev
# → http://localhost:5173+ 에서 실행됨 (자동으로 빈 포트 찾음)

# 타입 체크 + 프로덕션 빌드
npm run build

# oxlint으로 린트
npm run lint

# 프로덕션 빌드 로컬 미리보기
npm run preview
```

**주요 포트:** 개발 서버는 5173부터 시작하여 첫 번째로 사용 가능한 포트를 찾습니다.

---

## 프로젝트 아키텍처

### 데이터 모델 (`src/types/index.ts`)

```typescript
interface Task {
  id: string;                                      // UUID
  title: string;
  category: string;                               // '업무', '개인', '쇼핑', '학습'
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  progress: number;                               // 0-100% (사용자 입력 진도)
  createdAt: number;                              // 타임스탬프 (ms)
  completedAt?: number;                           // 완료 시점 타임스탐프
  dueDate?: number;                               // 선택적 마감일 (ms)
  recurring?: 'daily' | 'weekly' | 'monthly';     // 완료 시 자동 생성
  isRecurringInstance?: boolean;                  // 플래그: 반복 부모로부터 생성됨
}
```

### 컴포넌트 구조

**루트 상태 관리** (`src/App.tsx`):
- `tasks[]` — 모든 할 일
- `filter` — 'all' | 'active' | 'completed'
- `sortBy` — 현재 'priority'
- `isLoaded` — 중요 플래그: 초기화 중 localStorage 덮어쓰기 방지

**핵심 패턴:** `isLoaded` 플래그는 첫 번째 자동 저장 효과가 실행되기 **전에** 저장소에서 작업을 로드하도록 합니다. 이것이 없으면 빈 배열이 마운트 시 지속된 데이터를 덮어쓸 것입니다.

**컴포넌트 계층:**
```
App.tsx (상태 + 핸들러)
├─ Dashboard.tsx
│  ├─ 진도 카드 (카테고리별)
│  ├─ 알림 (마감초과, 긴급, 완료)
│  ├─ 주간 통계 차트
│  └─ 월간 통계 차트 (월 선택기 포함)
├─ InputCard.tsx (카테고리, 우선순위, 마감일, 반복으로 할 일 추가)
├─ FilterTabs.tsx (전체/활성/완료)
└─ TaskGrid.tsx
   └─ TaskCard[] (진도 슬라이더, 메타, 삭제)
```

### 비즈니스 로직 (`src/utils/`)

| 파일 | 목적 |
|------|------|
| `storage.ts` | localStorage 읽기/쓰기 (키: `todoAppTasks`) |
| `filter.ts` | `filterTasks(tasks, filterType)` → 활성/완료/전체 |
| `sort.ts` | `sortTasks(tasks, sortBy)` → 우선순위 후 생성일시 순 |
| `progress.ts` | `calculateProgress(tasks)` → 카테고리별 완료율 (평균 진도) |
| | `calculateOverallProgress(tasks)` → 전체 평균 진도율 |
| `notifications.ts` | `getNotifications(tasks)` → 마감초과, 긴급(24시간), 이정표 |
| `stats.ts` | `getWeeklyStats(tasks)` → 최근 7일 활동 |
| | `getMonthlyStats(tasks, offsetMonth)` → 특정 월 (월 선택기 지원) |
| `id.ts` | `generateId()` → UUID v4 |

### 상태 흐름 및 자동 저장

1. **초기화 (마운트):** `useEffect` localStorage에서 로드 → `setTasks()` → `setIsLoaded(true)`
2. **사용자 작업:** `handleAddTask`, `handleToggle`, `handleDelete`, `handleProgressChange` → `setTasks()`
3. **자동 저장:** `useEffect`는 `tasks` + `isLoaded` 감시 → `saveTasks()` localStorage 호출
4. **계산된 값:** `useMemo` 필터링 및 정렬 → `filteredTasks` → 의존성이 변경될 때만 리렌더링

**중요:** `isLoaded` 플래그는 저장 효과를 보호합니다: `if (isLoaded && tasks.length >= 0)`. 이는 첫 번째 렌더링(빈 배열)이 지속된 데이터를 지우는 것을 방지합니다.

---

## 핵심 구현 패턴

### 진도 vs 완료

- **`progress` (0-100%):** 작업별 사용자 입력 슬라이더. Dashboard 표시를 제어합니다.
- **`completed` (부울):** `progress === 100`일 때 자동으로 `true`로 설정됩니다. 반복 완료 시에도 수동으로 설정됩니다.
- **계산:** Dashboard 진도 % = 모든 작업 `progress` 값의 평균 (개수 기반 아님).

### 반복 작업

반복 작업 (`recurring: 'daily'|'weekly'|'monthly'`)이 완료되면:
1. `handleToggle`은 `!completed && recurring && dueDate` 감지
2. 반복 유형에 따라 다음 마감일 계산
3. `isRecurringInstance: true`로 새 작업 생성
4. 작업 배열에 추가 → 자동 저장

### 알림

`getNotifications()`은 경고 배열을 반환합니다:
- **마감초과:** `dueDate < now` & `!completed` → 빨간색 경고
- **긴급:** `24h <= (dueDate - now)` → 주황색 경고
- **이정표:** 모든 작업 완료 → 축하 배너

Dashboard 상단에 애니메이션과 함께 렌더링됩니다.

### 월간 통계

- `getMonthlyStats(tasks, offsetMonth)`는 주어진 월의 일별 완료 개수를 계산합니다
- `offsetMonth = 0` → 현재 월, `-1` → 이전 월, `+1` → 다음 월
- Dashboard는 월 선택기를 렌더링합니다: `◀ 2026년 7월 ▶` (버튼이 `monthOffset` 상태 업데이트)
- 차트는 해당 월의 1~N일을 표시합니다 (월별 길이 차이 고려)

---

## CSS Modules 구조

각 컴포넌트는 범위가 지정된 스타일이 있는 `.module.css`를 가집니다:
- 클래스 이름 충돌 없음
- 반응형 중단점: `@media (max-width: 768px)` 및 `640px`
- 애니메이션: 폭죽 드롭(완료), 펄스 체크, 슬라이드인(알림)
- 그라데이션 색상: `#667eea` → `#764ba2` (주요), `#FF6B6B` (오류)

---

## 테스트 및 검증

- **타입 체크:** `npm run build`는 먼저 `tsc -b` 실행 (타입 에러 포착)
- **린트:** `npm run lint` via oxlint (선택사항, 논블로킹)
- **수동:** 브라우저에서 `http://localhost:5173+` 열기, 흐름 테스트:
  - 모든 필드로 할 일 추가 → 새로고침 시 저장됨 확인
  - 100% 진도 표시 → 자동 완료 + 애니메이션
  - 반복 작업 완료 → 다음 작업 나타남
  - 월 네비게이션 → 통계 업데이트
  - 마감초과 작업 존재 → 빨간색 알림 나타남

---

## 일반적인 워크플로우

### 새 기능 추가

1. **타입 업데이트** (`src/types/index.ts`) (스키마 변경 시)
2. **유틸리티 추가** `src/utils/`에 (비즈니스 로직 필요 시)
3. **컴포넌트 업데이트** `src/components/`에서 새 UI
4. **핸들러 연결** `App.tsx`에서 props로 전달
5. **스타일 추가** 컴포넌트의 `.module.css`에
6. `npm run build` 실행해 타입 및 번들 검증

### localStorage 문제 디버깅

- 브라우저 DevTools 열기 → Application → localStorage
- 키 `todoAppTasks` 찾기
- 값은 유효한 Task 객체 JSON 배열이어야 함
- 새로고침 시 데이터가 사라지면 `isLoaded` 플래그 타이밍 확인

### 통계 계산 수정

모든 통계는 `completedAt` 타임스탬프 및 `dueDate` 필드에서 파생됩니다. 계산 로직 변경:
- `src/utils/progress.ts` 또는 `src/utils/stats.ts` 편집
- 재계산은 즉시 (데이터베이스 동기화 없음)
- 여러 날짜에 걸친 작업으로 테스트

---

## 배포 노트

앱은 정적이며(서버 불필요) 브라우저에서 완전히 실행됩니다. Vercel, Netlify 또는 모든 정적 호스트에 배포할 준비가 됨. 빌드 출력: `dist/` (Vite 기본값).

**빌드 크기:** ~64 KB gzipped (React + 앱 코드 + CSS Modules).

