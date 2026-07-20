# CLAUDE.md — Dev.log 블로그 프로젝트

개인 개발 블로그. 학습 기록과 프로젝트 기록을 남기는 정적 사이트.

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| 프레임워크 | Gatsby 5.13.7 |
| 언어 | TypeScript 5.6.3 |
| UI | React 18.2.0 |
| 스타일링 | Emotion (CSS-in-JS) + CSS Custom Properties |
| 콘텐츠 | Markdown + gatsby-transformer-remark |
| 배포 | GitHub Pages (`gh-pages`) |

---

## 디렉터리 구조

```
src/
├── components/     # 공통 컴포넌트 (GlobalLayout, GlobalHeader, PostCard, TOC 등)
├── contents/       # 블로그 포스트 (Markdown)
│   ├── study/      # 학습 포스트
│   └── project/    # 프로젝트 포스트
├── contexts/       # ThemeContext (light/dark/system)
├── pages/          # Gatsby 페이지 (index, study, project, about 등)
├── styles/         # 디자인 토큰 및 스타일
│   ├── theme.ts    # Emotion 테마 객체
│   ├── tokens.css  # CSS Custom Properties (라이트/다크)
│   └── *.ts        # 페이지별 Emotion 스타일
└── templates/      # 포스트 렌더링 템플릿 (study, project)
```

---

## 콘텐츠 작성

포스트는 Markdown으로 작성하며 YAML frontmatter 필수:

```markdown
---
title: '포스트 제목'
date: '2025-01-15'
category: 'study'   # 'study' 또는 'project'
---
```

- URL 패턴: `/study/{slug}`, `/project/{slug}`
- 슬러그는 파일명 기반으로 자동 생성 (`gatsby-node.js`)
- 1년 이상 된 포스트는 DSG(Deferred Static Generation)로 처리

---

## 디자인 시스템

### 색상

- **브랜드**: Daangn 오렌지 (`#FF7E36` 라이트 / `#FF8C4A` 다크)
- **Gray scale**: 50~950 단계 (GitHub 스타일)
- **시맨틱 색상**: `background`, `text`, `border`, `interactive`, `brand` 카테고리로 분류
- **모드**: CSS `data-theme` 속성으로 라이트/다크 전환

### 타이포그래피

- **본문 폰트**: Pretendard Variable (CDN, 한국어 최적화)
- **코드 폰트**: JetBrains Mono
- **스케일**: `display-lg`(48px) ~ `caption`(12px), 총 10단계
- **굵기**: 400(normal) ~ 800(extrabold)

### 간격 (Spacing)

- **기본 단위**: 4px
- **스케일**: `--space-0`(0) ~ `--space-24`(96px), 13단계

### 기타 토큰

- **Border Radius**: `sm`(6px), `md`(10px), `lg`(16px), `full`(9999px)
- **Shadow**: 5단계 + 다크 모드 변형
- **Transition**: 4단계 (120ms ~ 400ms, spring 포함)
- **Z-index**: 6단계 (base 0 ~ toast 500)

### 테마 적용 방법

1. `tokens.css` — CSS 변수 정의 (`:root`, `[data-theme="dark"]`)
2. `theme.ts` — Emotion `ThemeProvider`에 전달하는 TypeScript 객체
3. `gatsby-browser.js` — 루트에 `ThemeProvider` + `EmotionThemeProvider` 래핑
4. `ThemeContext.tsx` — `localStorage` + `prefers-color-scheme` 기반 모드 관리

---

## 주요 설정

- **경로 별칭**: `src/*` → `@/*` (tsconfig `paths`)
- **코드 스타일**: Prettier (single quote, tab width 2, trailing comma, max 140자)
- **Gatsby 설정**: `trailingSlash: "always"`

## 개발 명령어

```bash
npm run develop    # 개발 서버 (localhost:8000)
npm run build      # 프로덕션 빌드
npm run deploy     # GitHub Pages 배포
npm run clean      # .cache 및 public 폴더 초기화
```
