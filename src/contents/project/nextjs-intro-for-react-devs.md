---
title: 'Next.js 입문 — React 개발자를 위한 핵심 개념'
date: '2026-03-12'
category: 'project'
keywords: ['Next.js', 'React', 'FE']
---

> React 개발자 기준, 새 Next.js 프로젝트 투입 시 파악해야 할 것들

---

## 개요

React 개발자가 새 Next.js 프로젝트에 투입될 때 파악해야 할 핵심 개념을 정리한다. 폴더 구조를 읽는 순서에서 시작해 App Router의 파일 기반 라우팅, `"use client"`와 Server Component의 경계, 컴포넌트 분리 원칙, BFF 패턴과 `next.config.ts` rewrite까지 순서대로 본다.

---

## 1. 폴더 구조 파악 우선순위

새 Next.js 프로젝트를 받으면 이 순서로 읽는다.

| 순서 | 위치 | 이유 |
|------|------|------|
| 1 | `app/` 폴더 구조 | 파일 위치 = URL. 라우팅 전체 파악 |
| 2 | `"use client"` 경계 | 어디가 서버/클라이언트인지 |
| 3 | `app/api/` BFF | 인증 흐름 파악 |
| 4 | `lib/api-client.ts` | API 호출 방식 |
| 5 | `stores/` | 전역 상태 파악 |
| 6 | `middleware.ts` | 보호된 경로 |
| 7 | `next.config.ts` | 프록시/빌드 설정 |

---

## 2. App Router — 파일 위치 = URL

```
app/
├── page.tsx          →  /
├── analyze/page.tsx  →  /analyze
├── result/page.tsx   →  /result
└── api/auth/me/route.ts  →  GET /api/auth/me
```

- `page.tsx` 없으면 라우트 없음
- `layout.tsx` 는 중첩 적용됨
- `route.ts` 는 HTTP API 엔드포인트 (Express 라우터 역할)

---

## 3. `"use client"` vs Server Component

### 기본 규칙
- 파일 맨 위에 `"use client"` **없음** → Server Component (기본값)
- 파일 맨 위에 `"use client"` **있음** → Client Component

### "use client" 필요한 경우
```
useState / useReducer         → ✅
useEffect / useLayoutEffect   → ✅
useRouter / usePathname       → ✅
Jotai / TanStack Query 훅     → ✅
Framer Motion (motion.div)    → ✅ (브라우저 DOM 조작)
onClick, onChange 직접 정의   → ✅
window / document / localStorage → ✅
```

### "use client" 불필요한 경우
```
props 받아서 JSX만 반환   → ❌
async/await fetch         → ❌ (서버에서 해야 함)
className, style만        → ❌
children 감싸는 layout    → ❌
```

### Provider 격리 패턴
```tsx
// layout.tsx (서버) — "use client" 없음
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

// providers.tsx (클라이언트)
"use client";
export function Providers({ children }) {
  return <QueryClientProvider>{children}</QueryClientProvider>;
}
```
→ Provider만 격리해서 나머지 페이지들은 서버 컴포넌트 유지

### Framer Motion이 "use client" 필요한 이유
Framer Motion 내부에서 `requestAnimationFrame`, `window`, DOM element ref 등 **브라우저에만 있는 API**를 직접 사용하기 때문. 서버에서 실행하면 `window is not defined` 에러 발생.

---

## 4. Server Component가 진짜 유용한 경우

### DB/API 직접 fetch
```tsx
// "use client" 없음
export default async function Page() {
  const data = await fetch("http://internal-api/data", {
    headers: { Authorization: `Bearer ${process.env.SECRET_KEY}` }
  });
  return <UI data={data} />;
}
```
→ `useEffect + fetch` 조합 자체가 없어짐. API 키 브라우저에 노출 안 됨.

### 실무 패턴 — 서버에서 fetch, 클라이언트에 props로 전달
```tsx
// page.tsx (서버) — 데이터 fetch
export default async function Page() {
  const data = await fetchData();
  return <InteractiveUI data={data} />;  // props로 넘김
}

// interactive-ui.tsx (클라이언트)
"use client";
export function InteractiveUI({ data }) {
  const [selected, setSelected] = useState(null);
  // useState는 여기서만
}
```

---

## 5. 컴포넌트 분리 원칙

**내용 표시 → Server Component, 액션 → Client Component**

```
result-content.tsx  (Server)  — 데이터 표시만
├── 텍스트, 날짜, 요약
├── <SummaryCard />
├── <ScoreBar />
└── <ResultActions />  (Client)  — 버튼 클릭만 담당
```

```tsx
// result-actions.tsx — Client Component
"use client";
export function ResultActions() {
  const router = useRouter();
  return (
    <div>
      <Button onClick={() => router.push("/analyze")}>다시 시도</Button>
      <Button onClick={() => router.push("/detail")}>상세 보기</Button>
    </div>
  );
}

// result-content.tsx — Server Component ("use client" 없음)
import { ResultActions } from "./result-actions";
export function ResultContent({ report }) {
  return (
    <main>
      <h1>{report.title}</h1>
      {/* ... 표시만 ... */}
      <ResultActions />  {/* 클라이언트 컴포넌트 embed 가능 */}
    </main>
  );
}
```

---

## 6. BFF 패턴 (app/api/auth/)

`route.ts` = 프론트 프로젝트 안에 내장된 경량 Express 라우터

### 왜 필요한가
| 이유 | 설명 |
|------|------|
| HttpOnly 쿠키 설정 | 브라우저 JS에서는 httpOnly 쿠키를 set 못함 |
| 민감한 환경변수 숨기기 | `NEXT_PUBLIC_` 없는 env는 브라우저에 노출 안됨 |
| CORS 우회 | 브라우저 → Next.js 서버(같은 origin) → 외부 API |

```
브라우저 → /api/auth/* (Next.js BFF) → BE /api/v1/auth/*
```

---

## 7. URL 기반 라우팅으로 Server Component 활용

### 기존 방식 (React식)
```tsx
"use client";
// sessionStorage에서 reportId 꺼내서 폴링
const reportId = useAtomValue(reportIdAtom);
const { data } = useReport(reportId);
```

### Next.js식 (URL 기반)
```
/result/[reportId]  →  서버에서 직접 fetch
```

```tsx
// app/result/[reportId]/page.tsx — Server Component
export default async function ResultPage({ params }) {
  const { reportId } = await params;
  const report = await fetch(`/api/v1/report/${reportId}`);

  if (report.status !== "completed") {
    return <PollingUI reportId={reportId} />;  // 클라이언트로
  }

  return <ResultContent report={report} />;  // 서버에서 렌더링
}
```

**장점**
- `useState` 제거
- Jotai store 불필요 (sessionStorage 저장 안해도 됨)
- URL 공유 가능
- 새로고침해도 결과 유지

---

## 8. `next.config.ts` Rewrite

```ts
rewrites() {
  return [{ source: "/api/v1/:path*", destination: "http://localhost:8000/api/v1/:path*" }]
}
```
→ CORS 우회 + 백엔드 URL 숨김. api-client에 baseURL이 없는 이유.
