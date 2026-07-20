# CLAUDE.md — Dev.log 블로그 프로젝트

개인 개발 블로그. 학습 기록과 프로젝트 기록을 남기는 정적 사이트.

---

## 콘텐츠 작성

포스트는 Markdown으로 작성하며 YAML frontmatter 필수:

```markdown
---
title: '포스트 제목'
date: '2025-01-15'
category: 'study'          # 'study' 또는 'project'
keywords: ['zod', 'CI']    # 선택. 첫 항목이 카드 썸네일 라벨이 된다
---
```

- URL 패턴: `/study/{slug}`, `/project/{slug}`
- 슬러그는 파일명 기반으로 자동 생성 (`gatsby-node.js`)
- 1년 이상 된 포스트는 DSG(Deferred Static Generation)로 처리
- 이전/다음 글은 같은 카테고리 안에서만 이어진다
- `keywords`가 없으면 카테고리 이름이 썸네일 라벨로 쓰인다

## 디자인 토큰

색상·간격·타이포 값은 전부 `src/styles/tokens.css`가 원본이다. 값을 찾을 때 이 문서가 아니라 그 파일을 본다.

테마를 건드릴 때는 네 곳이 함께 움직인다:

1. `tokens.css` — CSS 변수 정의 (`:root`, `[data-theme="dark"]`)
2. `theme.ts` — Emotion `ThemeProvider`용 객체. 현재 이걸 읽는 컴포넌트는 없지만 값은 `tokens.css`와 맞춰둔다
3. `gatsby-ssr.js` — 첫 페인트 전에 `data-theme`을 심는 인라인 스크립트 (FOUC 방지). 여기가 있어서 `tokens.css`에 `prefers-color-scheme` 폴백 블록을 두지 않는다
4. `ThemeContext.tsx` — `localStorage` + `prefers-color-scheme` 기반 모드 관리

## 주의

- `static/`에 두는 파일은 사이트 루트로 그대로 공개된다. 저장소가 public이므로 개인정보가 든 파일을 넣지 않는다.
- 카드·목록의 그림자 대신 보더를 쓴다. 다크 모드에서 그림자는 토큰을 두 벌 관리해야 한다.
