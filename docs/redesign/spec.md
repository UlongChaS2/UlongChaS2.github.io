# Dev.log 블로그 재정비 명세서 v2

> 상태: 기획 완료 → 디자인/구현 대기
> 작성일: 2026-05-14

---

## 콘셉트

**"윤종신 월간 윤종신" 방식** — 매년 다른 테마/무드로 블로그 자체가 그 해의 나를 표현.
2025년 테마: **따뜻하고 실험적인**.

Hero에서 그 해의 "나의 캐릭터"(현재 placeholder)가 한 줄로 소개,
스크롤하면 포스트 목록.

---

## 2025 디자인 시스템

### 색상 (2025 테마)
| 토큰 | 값 | 용도 |
|------|-----|------|
| `--color-bg` | `#FBF8F3` | 따뜻한 아이보리 배경 |
| `--color-bg-card` | `#F5F0E8` | 카드 배경 |
| `--color-text-primary` | `#1C1209` | 메인 텍스트 |
| `--color-text-secondary` | `#6B5744` | 보조 텍스트 |
| `--color-accent` | `#D4622A` | 테라코타 — 2025 브랜드 |
| `--color-accent-warm` | `#E8935A` | 밝은 테라코타 |
| `--color-accent-muted` | `#F2DDD0` | 연한 테라코타 |
| `--color-sage` | `#8B956D` | 보조 컬러 (실험적) |
| `--color-border` | `#E2D8CC` | 보더 |

다크모드: warm dark (`#1A1108` 배경).

### 타이포그래피 (새 스케일)
| 토큰 | 값 | 용도 |
|------|-----|------|
| `--fs-hero` | `clamp(80px, 15vw, 180px)` | Hero 연도 "2025" |
| `--fs-hero-sub` | `clamp(20px, 3vw, 32px)` | 캐릭터 소개 문구 |
| `--fs-display` | `clamp(32px, 5vw, 56px)` | 포스트 제목 (큰 것) |
| `--fs-title` | `24px` | 섹션 제목 |
| `--fs-body` | `17px` | 본문 |
| `--fs-caption` | `13px` | 메타 정보 |

폰트: Pretendard Variable 유지. Hero 연도엔 font-weight 900.

---

## 페이지 구조

### 메인 페이지 (index.tsx)

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 HERO (100vh)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 배경: 따뜻한 아이보리 (#FBF8F3)
 우측: 비대칭 테라코타 도형 (장식)

 왼쪽:
   2025  ← 초대형 (180px, font-weight 900)

   ┌──────────────────┐
   │  [캐릭터 영역]    │  ← styled box placeholder
   └──────────────────┘
   "따뜻하게, 실험적으로 —"
   "2025년의 나는 이것저것 만들고 있어."

   [Study 보기 →]  [Project 보기 →]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 POSTS (스크롤 후)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 포스트 카드 리스트 (큰 제목 타이포)
 카테고리 필터 탭
```

### 헤더
- 투명 시작 → 스크롤 시 `--color-bg` 배경 + subtle border
- Position: sticky

---

## 애니메이션 (Framer Motion)

| 요소 | 애니메이션 |
|------|-----------|
| Hero "2025" | 로드 시 fade + slide up (0.8s) |
| 캐릭터 영역 | fade in (delay 0.3s) |
| 소개 문구 | fade in (delay 0.6s) |
| CTA 버튼 | delay 0.9s |
| 포스트 카드 | 스크롤 진입 시 fade + slide up |
| 헤더 배경 | 스크롤 smooth transition |

---

## 연도별 테마 시스템

```typescript
// src/themes/years/2025.ts
export const theme2025 = {
  year: 2025,
  mood: '따뜻하고 실험적인',
  intro: '따뜻하게, 실험적으로 — 2025년의 나는 이것저것 만들고 있어.',
}
// 현재 연도 자동 선택: new Date().getFullYear()
```

---

## Paper MCP 작업 목록

| 우선순위 | Artboard | 설명 | 크기 |
|---------|---------|------|------|
| 1 | `hero-desktop` | Hero 섹션 — 연도 + 캐릭터 placeholder + 문구 + CTA | 1440×900 |
| 2 | `hero-mobile` | Hero 모바일 | 390×844 |
| 3 | `post-list-section` | 포스트 목록 섹션 | 1440×800 |
| 4 | `post-card-v2` | 포스트 카드 warm 스타일 | 800×140 |
| 5 | `header-transparent` | 투명 헤더 (스크롤 전/후) | 1440×64 |

## Paper Artboard 목록

Paper 파일: **Blog** (Page 1)

| Artboard | Paper ID | 크기 |
|----------|----------|------|
| `hero-desktop` | `SN-0` | 1440×900 |
| `hero-mobile` | `TA-0` | 390×844 |
| `post-card-v2` | `UB-0` | 800×160 |
| `post-list-section` | `UR-0` | 1440×800 |
| `header-transparent` | `WF-0` | 1440×256 (transparent / scrolled 두 상태) |

---

## 구현 태스크

| 순서 | 파일 | 작업 |
|-----|------|------|
| 1 | `src/styles/tokens.css` | 2025 색상/타이포 토큰 교체 |
| 2 | `src/themes/years/2025.ts` | 신규 — 연도 테마 데이터 |
| 3 | `src/components/HeroSection.tsx` | 신규 — Hero 컴포넌트 + Framer Motion |
| 4 | `src/components/GlobalHeader.tsx` | 투명 → 스크롤 배경 |
| 5 | `src/styles/HeaderStyles.ts` | 투명 헤더 스타일 |
| 6 | `src/pages/index.tsx` | Hero + 포스트 목록 |
| 7 | `src/components/PostCard.tsx` | warm 스타일 v2 |
| 8 | `src/pages/about.tsx` | 연도 테마 반영 |
