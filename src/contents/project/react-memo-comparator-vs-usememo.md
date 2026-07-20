---
title: 'React.memo 커스텀 comparator vs useMemo 안정화'
date: '2026-05-11'
category: 'project'
---

> 커스텀 comparator는 대부분 부모가 참조를 안정화하지 않아서 생긴다 — 부모를 고치는 게 더 낫다.

## 개요

`React.memo`의 두 번째 인자로 커스텀 비교 함수(arePropsEqual)를 넘기면 기본 얕은 비교(shallow equal) 대신 직접 비교 로직을 정의할 수 있다. 주로 부모에서 객체나 함수가 매 렌더마다 새 참조로 내려올 때 불필요한 자식 리렌더를 막기 위해 사용된다. 그런데 이 방식은 비교 항목을 누락하면 조용히 버그가 생기고, 코드도 장황해진다. 부모에서 참조를 안정화하면 커스텀 comparator 자체가 필요 없어진다.

## 핵심 개념

### React.memo 기본 동작

```tsx
// 기본: 모든 props를 얕은 비교(===)로 검사
const MyComponent = memo((props) => { ... })

// 커스텀: arePropsEqual이 true를 반환하면 리렌더 스킵
const MyComponent = memo((props) => { ... }, (prev, next) => {
  return prev.value === next.value
})
```

- `arePropsEqual`이 `true` → 리렌더 안 함 (같다고 판단)
- `arePropsEqual`이 `false` → 리렌더 함 (다르다고 판단)
- 기본 memo는 얕은 비교이므로 **객체/함수 참조가 바뀌면 항상 리렌더**

### 커스텀 comparator가 필요해지는 이유

부모 컴포넌트에서 form 라이브러리(예: react-hook-form, @mantine/form 등)를 쓰면, form의 values는 폼 필드 하나가 바뀔 때마다 새 객체 참조가 생성된다.

```tsx
// 부모
const form = useForm({ ... })
const itemInfo = form.values  // 매 폼 변경마다 새 객체 참조

return <ItemGrid itemInfo={itemInfo} ... />
```

이때 ItemGrid를 `memo()`로 감싸도, `itemInfo` 참조가 항상 바뀌기 때문에 매번 리렌더된다. 그래서 커스텀 comparator로 내부 필드만 비교하는 방식을 쓰게 된다.

```tsx
const ItemGrid = memo((props) => { ... }, (prev, next) => {
  return (
    prev.itemInfo?.title === next.itemInfo?.title &&
    prev.itemInfo?.category === next.itemInfo?.category &&
    prev.data === next.data &&
    prev.onSave === next.onSave &&
    // ... 모든 props를 직접 나열해야 함
  )
})
```

### 커스텀 comparator의 문제점

1. **누락 버그**: 커스텀 comparator를 쓰는 순간 기본 얕은 비교가 완전히 꺼진다. 비교 목록에서 빠진 prop은 바뀌어도 리렌더가 안 된다.

```tsx
// itemInfo.description을 컴포넌트에서 쓰는데 비교 목록에 없으면 → 조용히 stale
prev.itemInfo?.title === next.itemInfo?.title &&
prev.itemInfo?.category === next.itemInfo?.category
// description 누락 → description이 바뀌어도 리렌더 안 됨!
```

2. **장황함**: props가 많아질수록 비교 목록도 길어지고, props 추가/제거 시 comparator도 같이 관리해야 한다.

## 더 나은 해결책: 부모에서 useMemo로 안정화

자식이 실제로 쓰는 필드만 추려서 `useMemo`로 안정화된 객체를 내려주면, 커스텀 comparator 없이도 기본 `memo()`가 올바르게 동작한다.

### 변경 전

```tsx
// 부모
const itemInfo = form.values  // 매 렌더마다 새 참조

return (
  <ItemGrid
    itemInfo={itemInfo}  // 항상 새 객체 → memo 효과 없음
    data={data}
    onSave={handleSave}
  />
)
```

```tsx
// 자식 — 커스텀 comparator로 보완
const ItemGrid = memo((props) => { ... }, (prev, next) => {
  return (
    prev.itemInfo?.title === next.itemInfo?.title &&
    prev.itemInfo?.category === next.itemInfo?.category &&
    prev.data === next.data &&
    prev.onSave === next.onSave
  )
})
```

### 변경 후

```tsx
// 부모 — 자식이 쓰는 필드만 추려서 안정화
const itemInfo = form.values

const stableItemInfo = useMemo(
  () => ({
    title: itemInfo.title,
    category: itemInfo.category,
  }),
  [itemInfo.title, itemInfo.category],
)

return (
  <ItemGrid
    itemInfo={stableItemInfo}  // 실제 값이 바뀔 때만 새 참조
    data={data}
    onSave={handleSave}
  />
)
```

```tsx
// 자식 — 커스텀 comparator 불필요
const ItemGrid = memo((props) => { ... })
```

### 왜 이게 더 나은가

| 기준 | 커스텀 comparator | useMemo 안정화 |
|------|------------------|--------------|
| 누락 버그 위험 | 있음 (조용히 stale) | 없음 (기본 ===로 충분) |
| props 추가 시 | comparator도 같이 수정 | 부모 deps만 추가 |
| 코드 위치 | 자식 컴포넌트 내부 | 책임 있는 부모에 있음 |
| 가독성 | 길어질수록 관리 어려움 | 명확하고 짧음 |

## 주의사항 / 자주 하는 실수

- **의존성 배열에 객체 자체를 넣지 말 것**: `useMemo(() => ({...}), [itemInfo])` 는 itemInfo가 매번 새 참조이면 효과 없음. 반드시 **원시값 필드들**을 deps에 넣어야 한다.

```tsx
// ❌ 효과 없음
useMemo(() => ({ title: itemInfo.title }), [itemInfo])

// ✅ 올바름
useMemo(() => ({ title: itemInfo.title }), [itemInfo.title])
```

- **필요한 필드만 추릴 것**: form.values 전체를 useMemo로 복사하는 건 의미 없다. 해당 자식 컴포넌트가 실제로 쓰는 필드만 추려야 안정화 효과가 생긴다.

- **커스텀 comparator를 아예 쓰지 말라는 게 아님**: 서드파티 라이브러리 props처럼 부모를 수정할 수 없는 상황에서는 커스텀 comparator가 여전히 유효하다.

## 관련 개념

- `useCallback` — 함수 참조 안정화 (객체는 useMemo, 함수는 useCallback)
- `React.memo` — 함수형 컴포넌트의 props 얕은 비교 최적화
- `useMemo` — 값 메모이제이션, deps가 바뀔 때만 재계산
- Mantine `form.values` — 폼 필드 변경 시 항상 새 객체 참조 생성 (React state이므로)
