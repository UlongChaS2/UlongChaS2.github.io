---
title: '블로그 플랫폼 개발기'
date: '2025-01-10'
category: 'project'
---

Gatsby와 React를 활용하여 개인 블로그 플랫폼을 만든 과정을 공유합니다.

## 프로젝트 개요

이 프로젝트는 다음과 같은 목표로 시작되었습니다:

- 📝 마크다운으로 쉽게 글 작성
- 🎨 모던하고 반응형인 디자인
- ⚡ 빠른 로딩 속도
- 🔍 SEO 최적화

## 기술 스택

### Frontend

- **React**: UI 라이브러리
- **Gatsby**: 정적 사이트 생성
- **Emotion**: CSS-in-JS 스타일링
- **TypeScript**: 타입 안정성

### 주요 기능

1. **마크다운 지원**

   - 코드 하이라이팅
   - 이미지 최적화
   - 목차 자동 생성

2. **반응형 디자인**

   - 모바일 최적화
   - 태블릿 지원
   - 데스크톱 레이아웃

3. **성능 최적화**
   - 이미지 lazy loading
   - 코드 스플리팅
   - 프리페칭

## 배운 점

Gatsby의 GraphQL 데이터 레이어를 활용하여 효율적으로 데이터를 관리하는 방법을 배웠습니다.

```javascript
export const query = graphql`
  query {
    allMarkdownRemark(sort: { frontmatter: { date: DESC } }) {
      nodes {
        frontmatter {
          title
          date
        }
        excerpt
      }
    }
  }
`;
```

## 앞으로의 계획

- 다크 모드 추가
- 검색 기능 구현
- 댓글 시스템 도입
- RSS 피드 생성
