---
title: 'CSS Grid 반응형 레이아웃과 통계 카드 UI 패턴'
date: '2026-05-14'
category: 'project'
keywords: ['CSS Grid', '반응형', 'FE']
---

> `repeat(auto-fit, minmax())` 으로 flex-wrap과 유사한 반응형 grid 구현 + 카드 stat 항목 통일 패턴

<!--more-->

## 개요
데이터 동기화 대시보드에서 카드 목록을 3열로 보여주되, 해상도가 줄어들면 자동으로 2열→1열로 wrapping되도록 개선했다. 동시에 각 카드의 통계 항목(마지막 동기화, 동기화 건수, 소요 시간, 미동기화)을 공통 함수로 통일했다.

## 핵심 개념

### 1. `repeat(auto-fit, minmax(minWidth, 1fr))`

| 방식 | 동작 |
|------|------|
| `grid-template-columns: repeat(3, 1fr)` | 항상 3열 고정, 카드가 작아짐 |
| `repeat(auto-fit, minmax(700px, 1fr))` | 700px 이상 들어갈 수 있는 만큼 열 생성, 나머지는 wrap |

```css
/* 컨테이너 너비에 따라 자동 wrapping */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(700px, 1fr));
  gap: 16px;
}
```

- 컨테이너 2132px 이상 → 3열 (`700*3 + 16*2`, gap 포함)
- 1416~2131px → 2열 (`700*2 + 16`, gap 포함)
- 700~1415px → 1열

**vs flex-wrap 차이점**
- flex: 아이템이 남은 공간 채우다가 다음 줄로 넘어감 (마지막 행이 비대칭할 수 있음)
- `auto-fit`: 각 열이 균등하게 `1fr`을 나눠 가짐 → 정렬 깔끔

### 2. `auto-fit` vs `auto-fill`

```css
/* auto-fit: 빈 트랙 collapse, 아이템이 남은 공간 늘어남 */
repeat(auto-fit, minmax(300px, 1fr))

/* auto-fill: 빈 트랙 유지, 아이템이 늘어나지 않음 */
repeat(auto-fill, minmax(300px, 1fr))
```

차이는 아이템 수가 고정인지가 아니라, 아이템이 가용 트랙을 전부 채우는지에서 갈린다. 아이템이 모든 트랙을 채우면 둘 다 같게 동작하지만, 컨테이너가 넓어 빈 트랙이 생기면 `auto-fill`은 빈 트랙을 그대로 유지(아이템 안 늘어남)하고 `auto-fit`은 빈 트랙을 collapse(아이템이 늘어나 남은 공간을 채움)한다. 아이템 수가 고정이어도 빈 트랙이 생길 수 있으므로, 남는 공간에서 아이템을 늘리고 싶으면 `auto-fit`을 쓴다.

## 카드 통계 항목 공통 함수 패턴

여러 종류의 동기화 카드가 있을 때, 각 카드마다 통계 배열을 따로 작성하면 항목 추가 시 모든 곳을 수정해야 한다.

### 문제 상황 (수정 전)

```typescript
// 카드 A — 직접 작성
const statsA = [
  { label: '마지막 동기화', value: data?.lastSyncAt ?? '—' },
  { label: '동기화 건수', value: `${data?.successCount}건` },
  { label: '소요 시간', value: '1.3초' },
  // 미동기화 항목 없음
]

// 카드 B — 별도로 직접 작성 (항목 순서도 다름)
const statsB = [
  { label: '마지막 동기화', value: data?.lastSyncAt ?? '—' },
  { label: '동기화 건수', value: `${data?.successCount}건` },
  { label: '미동기화', value: `${data?.failedCount}건` },
  // 소요 시간 없음
]
```

### 해결 (공통 함수로 통일)

```typescript
// 공통 포맷 함수 — 4개 항목 고정
const formatSyncStats = (
  status: ISyncStatusDto | null | undefined,
  labels: { lastSync: string; syncCount: string; elapsed: string; unsyncCount: string }
) => [
  {
    label: labels.lastSync,
    value: status?.lastSyncAt ? dayjs(status.lastSyncAt).format('YY.MM.DD HH:mm') : '—',
  },
  {
    label: labels.syncCount,
    value: status?.successCount != null ? `${status.successCount}건` : '—',
  },
  {
    label: labels.elapsed,
    value: status?.durationMs != null
      ? status.durationMs < 1000
        ? `${status.durationMs}ms`
        : `${(status.durationMs / 1000).toFixed(1)}초`
      : '—',
  },
  {
    label: labels.unsyncCount,
    value: status?.failedCount != null ? `${status.failedCount}건` : '—',
    valueColor: status?.failedCount ? 'var(--color-red-500)' : undefined,
  },
]

// 사용 — 각 카드에서 동일한 함수 호출
const statLabels = useMemo(() => ({
  lastSync: t('label.last_sync'),
  syncCount: t('label.sync_count'),
  elapsed: t('label.elapsed_time'),
  unsyncCount: t('label.unsync_count'),
}), [t])

const statsA = useMemo(() => formatSyncStats(dataA, statLabels), [dataA, statLabels])
const statsB = useMemo(() => formatSyncStats(dataB, statLabels), [dataB, statLabels])
```

**장점**
- 항목 추가/수정 시 `formatSyncStats` 한 곳만 변경
- 모든 카드 항목 순서 보장
- `valueColor` 같은 조건부 스타일도 함수 안에서 통일 처리

## 주의사항 / 자주 하는 실수

- `repeat(3, minmax(700px, 1fr))`: **고정 3열** → 카드가 700px 미만으로 줄어들 수 있음 (wrap 안 됨)
- `repeat(auto-fit, minmax(700px, 1fr))`: **자동 wrap** → 원하는 동작
- Tailwind의 `grid-cols-3` 유틸리티와 inline `style={{ gridTemplateColumns: ... }}`을 동시에 쓰면 inline이 이김 → 충돌 방지를 위해 둘 중 하나만 사용
- `flexWrap: 'wrap'`은 grid에 아무 효과 없음 (flex 전용 속성)

## 관련 개념
- CSS Grid `auto-fit` / `auto-fill`
- `useMemo` 의존성 최소화 (라벨 객체를 `useMemo`로 안정화)
- i18n 다국어 라벨 → 컴포넌트가 아닌 hook에서 가져와 함수에 주입
