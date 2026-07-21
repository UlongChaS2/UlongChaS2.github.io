---
title: 'react-compiler 도입 시도하다 ESLint & useEffect 톺은 이야기'
date: '2025-10-14'
category: 'project'
keywords: ['compiler', 'useEffect', 'ESLint']
---

> exhaustive-deps를 꺼둔 채 React Compiler를 도입하려다, 잘못된 의존성 배열이 (컴파일러와 무관하게) 런타임 버그의 원인이 된다는 걸 문서·코드·빌드 산출물까지 톺아보며 확인한 기록.

<!--more-->

## 개요

React 19.2 / React Compiler 1.0 소식 듣자마자, '바로 마이그레이션 해야지'하고 실무 프로젝트 코드베이스를 훑고, 커서 AI로 리스크 맵을 찍어봤다. 역시 예상대로 ref 패턴이랑 state 직접 덮어쓰기가 신경 쓰였는데, 충격이였던 것은 eslint.config에서 exhaustive-deps를 꺼둔 상태가 🔴 Critical로 찍힌 것.

의존성 배열에 관한 eslint rule과 React Compiler이 상관관계가 궁금해 문서, 코드, 빌드 산출물까지 전부 톺아봤고, 결론적으로 React Compiler는 eslint 설정(룰 on/off)이나 useEffect 의존성 배열을 최적화 입력으로 읽지 않는다는 걸 확인했다. exhaustive-deps는 컴파일러의 입력이 아니라, useEffect의 런타임 정확성을 지키는 룰이라는 걸 체감했다.

## 프로젝트 위험도 요약

| 이슈                   | 위험도         | 영향 범위     | 우선순위 |
| -------------------- | ----------- | --------- | ---- |
| exhaustive-deps off  | 🔴 Critical | 전체        | 1    |
| ref 변경 패턴            | 🟠 High     | 10+ 파일    | 2    |
| state 직접 덮어쓰기        | 🟡 Medium   | 5+ 파일     | 3    |
| useEffect refetch 누락 | 🟡 Medium   | 3+ 파일     | 4    |
| 인라인 객체 생성            | 🟢 Low      | 대부분 자동 처리 | 5    |

exhaustive-deps은 의존성에 들어있는 state, props로 넘겨온값들을 의존성 배열에 넣어줘야하는 eslint 룰을 뜻하며, 기본 severity는 React 19에서도 여전히 warn이다(팀에 따라 error로 올려 쓰기도 한다). 다만 내 문제는 setter를 의존성 배열에 안넣어서 warning이 계속 보여 off로 끈 케이스고 setter는 안전이 보장되어있어 eslint가 자동적으로 warning을 넘긴다고 알고있었는데 계속 떠있었다.

주요 포인트는 eslint는 local setter의 안정성만 인정하고 **"외부에서 넘어온 함수(= props로 받은 함수)"는, useState의 setter인지 구분할 수 없어서 "일반 함수"로 간주** 하기 때문이다.

그리고 props에 type을 작성한다고 하더라도 타입표시는 **런타임 정보가 아니고**, ESLint는 타입을 근거로 특별취급하지 않는다고한다.

## 요약

- useState의 로컬 setX만 예외(생략 가능).
- **props로 받은 "setter처럼 생긴 함수"는 일반 함수로 간주 → deps에 넣는 게 정답.**
- 불필요한 재실행은 **부모에서 useCallback(그리고 컨텍스트면 useMemo)로 안정화**해서 막는다.
- 정말 한 번만 실행 의도가 분명하면, 설계를 바꾸거나(상태 올리기/초깃값 전달), 불가피할 때만 라인 예외.

## 주요 문제점

### 1. exhaustive-deps 규칙이 꺼져 있음 (Critical)

```js
// eslint.config.js
'react-hooks/exhaustive-deps': 'off'
```

문제: 의존성이 누락되면 useEffect가 stale 값을 참조하거나 필요한 재실행을 놓쳐 런타임 버그가 날 수 있다. (React Compiler가 이 deps 배열을 읽어서 최적화하는 건 아니지만, 잘못된 effect는 컴파일러와 무관하게 그대로 버그로 남는다.)

발견된 케이스:

```tsx
// AuthProvider.tsx
React.useEffect(() => {
  if (!isFetched.current) {
    // ... refreshAccessToken.mutateAsync 등을 사용
  }
}, [cookies.refreshToken]) // setAccessToken, setIsAuth 누락
```

해결:

- Compiler 적용 전에 exhaustive-deps를 warn으로 변경하고 경고 해결
- 또는 의도적 누락이면 `// eslint-disable-next-line react-hooks/exhaustive-deps` 주석 추가

---

### 2. Ref를 렌더링 로직에서 변경 (High Risk)

```ts
// 목록 조회 훅들 (pages/*/hook.ts)
const load = useCallback(async (loadOptions) => {
  // ...
  allDataRef.current = data?.content.map(...) || []  // ❌ 렌더링 중 ref 변경
  totalPageRef.current = data?.totalElements || 0
}, [...])
```

문제: React Compiler는 ref가 렌더링 로직 중에 변경되지 않는다고 가정한다. 이를 위반하면 무한 루프나 예측 불가능한 동작이 발생할 수 있다.

해결:

```tsx
// ref 대신 state 사용
const [allData, setAllData] = useState([])
const [totalPage, setTotalPage] = useState(0)

// 또는 useEffect 내부로 이동
useEffect(() => {
  if (data) {
    allDataRef.current = data.content
  }
}, [data])
```

---

### 3. 객체를 직접 spread로 덮어쓰는 패턴 (Medium Risk)

```tsx
// 각종 폼 모달 컴포넌트
setState({
  ...state,  // ❌ 전체 state를 덮어씀
  code,
  name,
  memo: supplierInfo?.data.memo || '',
})
```

문제: 이 패턴은 이전 state 참조를 사용하므로 stale closure 문제를 일으킬 수 있다.

해결:

```tsx
setState((prev) => ({  // ✅ updater 함수 사용
  ...prev,
  code,
  name,
  memo: supplierInfo?.data.memo || '',
}))
```

---

### 4. 인라인 객체/배열 생성 (불필요한 리렌더) (Low-Medium Risk)

```tsx
// 트리 선택 모달
const getAllDescendantValues = (nodes: TreeNodeData[]): string[] => {
  return nodes.flatMap((n) =>
    n.children ? [n.value, ...getAllDescendantValues(n.children)] : [n.value]
  )  // ❌ 매 렌더마다 새 배열 생성
}

// 목록 가공 모달
useMemo(() => {
  return documentItems?.data.map((item) => ({
    ...item,  // 매번 새 객체 생성
    docNo: item.docNo || '',
    // ...
  }))
}, [documentItems, opened])
```

문제: Compiler가 자동 메모이제이션을 시도하지만, 이미 복잡한 참조 체인이면 최적화가 덜 효과적일 수 있다.

해결: 대부분 Compiler가 알아서 처리하지만, 성능 이슈 시 useMemo로 명시적 최적화.

---

### 5. useEffect에서 조건부 refetch 호출 (Medium Risk)

```ts
// 목록 조회 훅
React.useEffect(() => {
  if (forceFetchKey) refetch()  // refetch가 의존성에 없음
}, [forceFetchKey])
```

문제: refetch 함수가 의존성 배열에 없으면 stale 참조를 사용할 수 있다.

해결: refetch를 의존성에 추가하거나, React Query의 `queryClient.invalidateQueries` 사용.

결국 나는 swc(rust 기반)을 사용중이라서 아직 공식적으로 제공하지 않아 [(링크 참고)](https://react.dev/blog/2025/10/07/react-compiler-1#swc-support-experimental)

## SWC vs React Compiler 비교

| 항목     | SWC                    | React Compiler           |
| ------ | ---------------------- | ------------------------ |
| 속도     | ⚡ 매우 빠름 (Rust 기반)      | 🐢 상대적으로 느림 (Babel 기반)   |
| 빌드 시간  | 30-70% 더 빠름            | 기존 Babel과 비슷             |
| 최적화    | 트랜스파일만 (TS→JS, JSX→JS) | 런타임 성능 자동 최적화            |
| 메모이제이션 | ❌ 없음                   | ✅ 자동 useMemo/useCallback |
| 개발 경험  | HMR 빠름                 | HMR 약간 느림                |
| 성숙도    | ✅ 안정적 (Next.js 기본)     | ⚠️ RC 버전 (2025년 안정화 예정)  |

---

## 핵심 전제

- React 19 + Compiler는 **정적 분석 기반 자동 최적화**를 한다. 이때 컴파일러는 **코드 자체**를 분석할 뿐, eslint 설정이나 useEffect 의존성 배열을 입력으로 읽지 않는다.
- 그래서 잘못된 deps는 컴파일러와 무관하게 **런타임 버그**로 남는다.
- 그 deps 정확성을 "문법적으로" 잡아주는 게 바로 **react-hooks/exhaustive-deps**다.

---

## What — useEffect 의존성 배열, 정확히 뭘 넣나

> "**effect 내부에서 참조하는 모든 가변 외부 값**"을 넣는다. (렌더마다 바뀔 수 있는 것)

| **분류** | **예시** | **넣어야 하나** | **이유** |
| --- | --- | --- | --- |
| State 값 | count, user | ✅ | 값 바뀌면 effect 재실행 |
| Props 값 | userId, onChange | ✅ | 부모 변화 반영 |
| 외부 함수 | fetchData, refreshToken | ✅ | 참조 바뀌면 재실행 |
| ref.current | ref.current 읽기 | ⚙️(상황) | 직접 읽으면 deps 포함 |
| 로컬 useState **setter** | setUser | ❌ | React가 참조 안정 보장 |
| **props로 받은 setter처럼 보이는 함수** | setHeaderInfo | ✅ | ESLint는 일반 함수로 간주 |
| useMemo/useCallback 결과 | memoizedFn, memoizedValue | ✅ | deps로 관리 |
| ref 객체 자체 | ref | ❌ | 객체 참조 불변(.current만 변함) |

핵심은: **로컬 useState setter만 예외**, 외부에서 들어오는 함수는 전부 deps에 넣기.

---

## Why — 왜 이제 더 빡세졌나 (React Compiler 연결고리)

내가 느낀 포인트 3개:

1. **exhaustive-deps는 useEffect의 런타임 정확성을 지키는 룰**

   이걸 끄면 잘못된 deps가 그대로 남아 "이 effect가 뭐에 반응해야 하는지"가 어긋나고, stale 참조·재실행 누락 같은 버그로 이어진다. (컴파일러가 eslint 설정을 읽어서 최적화를 끄는 건 아니다.)

2. **props로 받은 'setter 같은' 함수는 타입표시와 무관**

   타입은 런타임에 없으니 ESLint는 그걸 useState의 진짜 setter로 못 알아본다. 결국 **일반 함수 → deps 포함**.

3. **여전히 기본은 warn(React 19 기준)**

   기본 severity는 warn이라 무시하고 넘어가기 쉽지만, 팀에 따라 error로 올려 강제하기도 한다. 컴파일러 도입 전이라면 warn이라도 실제로 해결해두는 게 안전하다.

---

## How — 내가 Babel/빌드 산출물 보며 이해한 동작

### 빌드 파이프라인 한 장 요약

이 흐름이 핵심:

1. **Source**
2. **ESLint** (react-hooks/exhaustive-deps가 deps 정확성 보장)
3. **React Compiler (Babel 플러그인)**: 코드의 데이터 흐름을 정적으로 분석해 "언제 다시 계산/실행할지"를 추론, 내부적으로 메모이제이션 포인트를 삽입
4. **Optimized Output**

exhaustive-deps를 끄면?

→ 3단계(컴파일러)는 영향받지 않는다. 컴파일러는 eslint 설정을 모른다. 대신 잘못된 deps가 그대로 남아 **런타임에서 stale 참조/재실행 누락** 같은 버그로 이어진다.

### useEffect 의존성 그래프 시각화

내가 정리한 룰을 정리하면:

- userId, title, **props/ctx 함수(setHeaderInfo)** → deps에 포함
- **로컬 setUser**는 안정적이므로 deps 불필요
- 하나라도 빠지면 **effect가 오작동(stale 참조/재실행 누락)**

---

## ex — 내가 실제로 정리한 패턴

### 1) props로 받은 setter-like 함수는 deps에 넣고, 부모에서 안정화

```tsx
// Parent
const [header, setHeader] = useState({ title: '', subtitle: '' });
const setHeaderInfo = useCallback(
  (patch: Partial<typeof header>) => setHeader(prev => ({ ...prev, ...patch })),
  [] // setHeader는 안정적
);

// Child
useEffect(() => {
  setHeaderInfo({ title });
}, [title, setHeaderInfo]); // ✅ 안전
```

### 2) effect 없이 설계 바꾸기 (가능하면 이게 더 깔끔)

```tsx
function Child({ initialHeader }: { initialHeader: Header }) {
  const [header] = useState(initialHeader); // 마운트 1회 세팅
  // effect 불필요
}
```

### 3) 정말 1회만 필요하면 (팀 컨벤션 하에)

```tsx
// 명시적 코멘트와 함께 단일 라인 예외
// eslint-disable-next-line react-hooks/exhaustive-deps
useEffect(() => { setHeaderInfo({ title }); }, []);
```

---

## 맺음말

- React 19 + Compiler 시대에도, **의존성 배열은 컴파일러의 입력이 아니라 useEffect 런타임 정확성의 문제**다.
- **로컬 useState setter만 예외**, 외부 함수(심지어 "setter 타입"이라도)는 deps 포함.
- exhaustive-deps를 끄는 건 컴파일러 최적화를 끊는 게 아니라, **런타임 버그를 조용히 방치하는 행위**에 가깝다.
- 나도 이번에 Babel 산출물을 직접 보면서 "아, 이제 React는 정적 분석 가능한 DSL로 가고 있구나"를 체감했다.
