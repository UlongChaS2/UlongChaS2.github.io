# 📝 Dev.log - 개발자 블로그

Gatsby와 React를 활용한 모던하고 반응형인 개인 블로그입니다.

## ✨ 주요 기능

- 📱 **반응형 디자인**: 모바일부터 태블릿, 데스크톱까지 모든 기기 지원
- 🎨 **Emotion Styled**: CSS-in-JS를 활용한 모던한 스타일링
- 📝 **마크다운 지원**: 편리한 글 작성
- ⚡ **빠른 성능**: Gatsby의 정적 사이트 생성 기능 활용
- 🏷️ **카테고리 분류**: 스터디와 프로젝트 카테고리 구분
- 🔍 **SEO 최적화**: 검색 엔진 최적화

## 🛠️ 기술 스택

- **Frontend**: React 18, TypeScript
- **Framework**: Gatsby 5
- **Styling**: Emotion (CSS-in-JS)
- **Content**: Markdown
- **Deployment**: GitHub Pages

## 🚀 시작하기

### 필수 요구사항

- Node.js 18 이상
- npm 또는 yarn

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run develop

# 프로덕션 빌드
npm run build

# 로컬에서 프로덕션 빌드 테스트
npm run serve

# GitHub Pages 배포
npm run deploy
```

개발 서버는 `http://localhost:8000`에서 실행됩니다.

GraphQL 쿼리 테스트는 `http://localhost:8000/___graphql`에서 가능합니다.

## 📁 프로젝트 구조

```
.
├── src/
│   ├── components/        # React 컴포넌트
│   │   ├── GlobalHeader.tsx
│   │   ├── GlobalLayout.tsx
│   │   ├── GlobalStyles.tsx
│   │   └── PostCard.tsx
│   ├── contents/          # 마크다운 콘텐츠
│   │   ├── study/        # 스터디 포스트
│   │   └── project/      # 프로젝트 포스트
│   ├── pages/            # 페이지 컴포넌트
│   │   ├── index.tsx     # 메인 페이지
│   │   ├── study.tsx     # 스터디 목록
│   │   ├── project.tsx   # 프로젝트 목록
│   │   └── about.tsx     # 소개 페이지
│   ├── styles/           # 스타일 정의
│   │   ├── theme.ts      # 테마 설정
│   │   ├── HeaderStyles.ts
│   │   ├── LayoutStyles.ts
│   │   ├── PageStyles.ts
│   │   └── PostStyles.ts
│   └── templates/        # 포스트 템플릿
│       ├── study-template.tsx
│       └── project-template.tsx
├── gatsby-config.js      # Gatsby 설정
├── gatsby-node.js        # 페이지 생성 로직
└── package.json
```

## 📝 포스트 작성하기

### 스터디 포스트

`src/contents/study/` 디렉토리에 마크다운 파일을 생성하세요.

```markdown
---
title: '포스트 제목'
date: '2025-01-15'
category: 'study'
---

포스트 내용을 여기에 작성하세요.
```

### 프로젝트 포스트

`src/contents/project/` 디렉토리에 마크다운 파일을 생성하세요.

```markdown
---
title: '프로젝트 제목'
date: '2025-01-15'
category: 'project'
---

프로젝트 내용을 여기에 작성하세요.
```

## 🎨 테마 커스터마이징

`src/styles/theme.ts` 파일에서 색상, 폰트, 간격 등을 수정할 수 있습니다.

```typescript
export const theme = {
  colors: {
    primary: '#2563eb',
    secondary: '#7c3aed',
    // ...
  },
  breakpoints: {
    mobile: '320px',
    tablet: '768px',
    desktop: '1024px',
    // ...
  },
  // ...
};
```

## 📱 반응형 브레이크포인트

- **Mobile**: 320px ~
- **Tablet**: 768px ~
- **Desktop**: 1024px ~
- **Wide**: 1280px ~

## 🚀 배포

GitHub Pages에 자동 배포됩니다:

```bash
npm run deploy
```

이 명령어는 다음을 수행합니다:

1. `gatsby build`로 정적 사이트 생성
2. `public` 폴더를 `main` 브랜치에 배포

## 📄 라이선스

이 프로젝트는 개인 포트폴리오 및 블로그 용도로 만들어졌습니다.

## 🙏 감사의 말

- [Gatsby](https://www.gatsbyjs.com/)
- [React](https://reactjs.org/)
- [Emotion](https://emotion.sh/)
- [TypeScript](https://www.typescriptlang.org/)
