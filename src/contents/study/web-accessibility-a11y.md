---
title: '웹 접근성(a11y) — 왜 해야 하고 어떻게 하는가'
date: '2026-04-24'
category: 'study'
---

> 장애가 없는 사용자를 위해 만든 UI도, 스크린리더·키보드·고대비 모드 사용자에게는 완전히 다른 경험이 된다.

## 개요

웹 접근성(Accessibility, 줄여서 **a11y**)은 장애가 있는 사람들을 포함한 **모든 사람**이 웹을 동등하게 사용할 수 있도록 만드는 설계 원칙이다. 시각 장애인이 스크린리더로 화면을 듣거나, 운동 장애인이 마우스 없이 키보드만으로 조작하거나, 고령자가 저시력 모드로 접근하는 상황을 모두 포함한다.

단순히 "착한 일"이 아니다. **법적 의무**(한국 웹 접근성 지침 KWCAG, 미국 ADA/Section 508), **SEO 향상**, **전체 UX 개선**이라는 실질적인 이유가 있다.

---

## 핵심 이론: 왜 이게 필요한가

### 1. 스크린리더는 DOM을 "읽는다"

시각 장애인이 사용하는 스크린리더(NVDA, JAWS, macOS VoiceOver)는 HTML 구조를 순서대로 읽어준다. 이때 **의미 없는 태그**(`<div>`, `<span>`)는 맥락 없이 읽히고, **의미 있는 태그**(`<h1>`, `<button>`, `<label>`)는 "제목", "버튼", "레이블"로 안내된다.

```html
<!-- ❌ 스크린리더가 "모두를 위한 웹을 만듭니다" 이라고만 읽음 -->
<span style="font-size: 64px; font-weight: 800;">
  모두를 위한<br>웹을 만듭니다
</span>

<!-- ✅ "제목 수준 1, 모두를 위한 웹을 만듭니다" 이라고 읽음 -->
<h1 style="font-size: 64px; font-weight: 800; margin: 0;">
  모두를 위한<br>웹을 만듭니다
</h1>
```

`<h1>`으로 바꿔도 인라인 `style`이 이미 붙어 있으면 **시각적 변화는 없다.** 브라우저 기본 스타일을 `margin: 0`으로 리셋해주면 된다.

---

### 2. 폼 레이블과 입력 필드는 "연결"되어야 한다

스크린리더는 폼 입력 필드에 포커스가 오면 어떤 필드인지 읽어준다. 이때 `<label>`과 `<input>`이 연결되어 있지 않으면 "수정, 텍스트 입력" 같이 내용 없는 안내만 나온다.

```html
<!-- ❌ 레이블이 입력 필드와 무관한 별도 태그 -->
<p style="font-size: 12px; font-weight: 600;">아이디</p>
<input type="text" />

<!-- ✅ htmlFor ↔ id로 연결 -->
<label for="username-input" style="display: block; font-size: 12px; font-weight: 600;">
  아이디
</label>
<input id="username-input" type="text" />
```

React/JSX에서는 `htmlFor`을 사용한다:
```tsx
<label htmlFor="username-input" style={{ display: 'block', fontSize: 12, fontWeight: 600 }}>
  아이디
</label>
<input id="username-input" {...form.getInputProps('username')} />
```

`<label>`은 인라인 요소이므로, 기존 `<p>`처럼 블록으로 보이려면 `display: 'block'`을 명시해야 한다.

---

### 3. 장식용 요소는 스크린리더에서 숨겨야 한다

배경 그라데이션, 원형 장식, 아이콘(단순 시각 보조) 같은 요소는 스크린리더가 읽을 필요가 없다. 읽히면 오히려 사용자 경험을 방해한다.

**`aria-hidden="true"`** 속성 하나로 해결된다:

```tsx
{/* 배경 장식 원형 — 스크린리더에게 보이지 않아야 함 */}
<div
  aria-hidden="true"
  className="absolute rounded-full pointer-events-none"
  style={{ width: 466, height: 466, border: '60px solid rgba(255,255,255,0.06)' }}
/>
```

아이콘도 마찬가지다. 버튼 안에 텍스트가 있고 아이콘이 단순 장식이라면:

```tsx
{/* 텍스트가 버튼의 의미를 이미 전달 → 아이콘은 장식 */}
<button type="submit">
  <span>로그인</span>
  <IconArrowRight size={16} aria-hidden="true" />
</button>
```

---

### 4. 버튼에 텍스트가 없으면 `aria-label`이 필요하다

아이콘만 있는 버튼(햄버거 메뉴, 언어 선택 드롭다운 등)은 스크린리더가 "버튼"이라고만 읽는다. 무슨 버튼인지 알 수 없다.

```tsx
{/* ❌ 스크린리더: "버튼" */}
<button>
  <IconChevronDown size={11} />
</button>

{/* ✅ 스크린리더: "언어 선택: 한국어, 버튼" */}
<button
  aria-label={`언어 선택: ${currentLanguage}`}
>
  <span aria-hidden="true">{currentLanguage}</span>
  <IconChevronDown size={11} aria-hidden="true" />
</button>
```

`aria-label`이 있으면 버튼 내부 텍스트 대신 `aria-label`이 읽히므로, 내부의 시각적 텍스트(`<span>`)와 아이콘은 `aria-hidden`으로 숨겨도 된다.

---

### 5. 로딩 상태는 `aria-busy`로 알린다

버튼이 로딩 중일 때 시각적으로 스피너를 보여주는 것만으로는 부족하다. 스크린리더 사용자는 스피너가 보이지 않는다. `aria-busy` 속성을 쓰면 "지금 처리 중" 이라는 상태를 전달할 수 있다.

```tsx
<button
  type="submit"
  disabled={isLoading}
  aria-busy={isLoading}
>
  {isLoading ? (
    <>
      {/* 스피너는 장식 — 숨김 */}
      <div aria-hidden="true" className="animate-spin rounded-full w-4 h-4 border-2 border-white" />
      <span>로그인 중...</span>
    </>
  ) : (
    <span>로그인</span>
  )}
</button>
```

`aria-busy="true"`가 붙으면 일부 스크린리더는 "처리 중" 상태임을 안내한다.

---

### 6. 시맨틱 계층 구조: `<h1>` → `<h2>` → `<h3>`

페이지의 제목 계층은 스크린리더 사용자가 페이지를 **탐색**하는 데 쓰인다. `<h1>`부터 `<h6>`까지 계층을 건너뛰지 않고 순서대로 써야 한다.

로그인 페이지 예시:
```
h1: (브랜드 메인 슬로건 — 페이지 전체의 대표 제목)
  h2: 로그인 (폼 섹션의 제목)
```

```tsx
{/* 왼쪽 패널 — 브랜드 슬로건 */}
<h1 style={{ fontSize: 64, fontWeight: 800, margin: 0, marginBottom: 20 }}>
  모두를 위한{'\n'}웹을 만듭니다
</h1>

{/* 오른쪽 패널 — 로그인 폼 제목 */}
<h2 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>
  로그인
</h2>
```

---

### 7. Enter 키로 폼 submit — 키보드 접근성

키보드만 사용하는 사람은 Tab으로 포커스를 이동하고 Enter로 제출한다. `<form>` 태그가 입력 필드를 **모두 감싸야** Enter를 누를 때 submit이 트리거된다.

```tsx
{/* ❌ form이 버튼만 감싸는 경우 — 입력 중 Enter가 동작 안 함 */}
<input type="text" {...form.getInputProps('username')} />
<input type="password" {...form.getInputProps('password')} />
<form onSubmit={handleSubmit}>
  <button type="submit">로그인</button>
</form>

{/* ✅ form이 입력 필드까지 감싸는 경우 */}
<form onSubmit={handleSubmit}>
  <input type="text" {...form.getInputProps('username')} />
  <input type="password" {...form.getInputProps('password')} />
  <button type="submit">로그인</button>
</form>
```

---

## 실전 체크리스트 — 적용한 것들 요약

| 항목 | 변경 전 | 변경 후 | 이유 |
|------|---------|---------|------|
| 브랜드 슬로건 | `<span>` | `<h1>` | 페이지 최상위 제목 시맨틱 |
| 로그인 폼 제목 | `<p>` | `<h2>` | 폼 섹션 제목 시맨틱 |
| 서브타이틀 | `<span>` | `<p>` | 단락 시맨틱 |
| 배경 장식 원형 6개 | (없음) | `aria-hidden="true"` | 스크린리더 노이즈 제거 |
| 우측 패널 장식 원형 | (없음) | `aria-hidden="true"` | 스크린리더 노이즈 제거 |
| 아이디 레이블 | `<p>` | `<label htmlFor="username-input">` | 입력 필드와 레이블 연결 |
| 비밀번호 레이블 | `<p>` | `<label htmlFor="password-input">` | 입력 필드와 레이블 연결 |
| 언어 선택 버튼 | 텍스트만 | `aria-label="언어 선택: ..."` | 버튼 목적 명시 |
| 로딩 스피너 | (없음) | `aria-hidden="true"` | 장식용 요소 숨김 |
| 제출 버튼 로딩 상태 | (없음) | `aria-busy={isLoading}` | 처리 중 상태 전달 |
| 입력 필드 아이콘들 | (없음) | `aria-hidden="true"` | 장식용 아이콘 숨김 |
| 세로 구분선 | `<div>` | `aria-hidden="true"` | 장식용 구분선 숨김 |
| Enter 키 submit | 동작 안 함 | `<form>`이 입력 필드 포함 | 키보드 접근성 |

---

## 자주 하는 실수

### 실수 1: `aria-hidden`을 포커스 가능한 요소에 쓰기
```html
<!-- ❌ aria-hidden이어도 Tab으로 포커스 가능 → 모순 -->
<button aria-hidden="true">클릭</button>

<!-- ✅ 포커스 제거도 함께 -->
<button aria-hidden="true" tabindex="-1">클릭</button>
```

### 실수 2: `<div>` 클릭 이벤트에 키보드 접근성 없음
```html
<!-- ❌ 마우스만 동작, 키보드 불가 -->
<div onclick="handleClick()" style="cursor: pointer">클릭하세요</div>

<!-- ✅ 기본적으로 키보드 접근 가능 -->
<button type="button" onclick="handleClick()">클릭하세요</button>
```

### 실수 3: 색상만으로 상태 전달
```css
/* ❌ 색맹 사용자는 빨간색/초록색을 구분 못할 수 있음 */
.error { color: red; }
.success { color: green; }
```
→ 아이콘, 텍스트, 패턴을 함께 써야 한다.

### 실수 4: `placeholder`를 레이블 대용으로 쓰기
```html
<!-- ❌ 입력 시작하면 placeholder가 사라져서 무슨 필드인지 모름 -->
<input type="text" placeholder="아이디를 입력하세요" />

<!-- ✅ label은 항상 보여야 함 -->
<label for="username">아이디</label>
<input id="username" type="text" placeholder="예: user@example.com" />
```

---

## 관련 개념
- **WCAG 2.1** — 웹 접근성 국제 표준 (A / AA / AAA 등급)
- **KWCAG** — 한국형 웹 콘텐츠 접근성 지침
- **ARIA (Accessible Rich Internet Applications)** — 동적 컨텐츠에 시맨틱을 부여하는 HTML 속성 모음
- **시맨틱 HTML** — 의미를 가진 HTML 태그 사용 (`<main>`, `<nav>`, `<section>`, `<article>` 등)
- **포커스 관리** — 모달 열릴 때 포커스 이동, 닫힐 때 원래 위치로 복귀
- **컬러 대비(Color Contrast)** — WCAG AA 기준 텍스트 대비율 4.5:1 이상
- **Skip Navigation** — "본문 바로가기" 링크, 스크린리더/키보드 사용자가 반복 탐색 구간을 건너뜀
