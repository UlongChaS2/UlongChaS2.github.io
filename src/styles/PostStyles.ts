import styled from '@emotion/styled';
import { Link } from 'gatsby';

// ============================================================
// Post Detail Styles — Blog Style
// Uses CSS var() tokens from tokens.css
// ============================================================

export const PostContainer = styled.article`
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-10) var(--space-6);

  @media (min-width: 768px) {
    padding: var(--space-12) var(--space-8);
  }
`;

export const Breadcrumb = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-tertiary);
  margin-bottom: 32px;

  a {
    color: inherit;
    text-decoration: none;
    transition: color 0.2s;
    &:hover {
      color: var(--color-brand-primary);
    }
  }

  span {
    color: var(--color-text-primary);
  }
`;

export const PostHeader = styled.header`
  position: relative;
`;

export const PostHeaderContent = styled.div`
  max-width: 800px;
  margin-bottom: 48px;
`;

export const PostTitle = styled.h1`
  font-size: 32px;
  font-weight: var(--fw-extrabold);
  letter-spacing: -0.035em;
  color: var(--color-text-primary);
  margin: 0 0 20px 0;
  line-height: 1.35;
  word-break: keep-all;

  @media (min-width: 768px) {
    font-size: 42px;
  }
`;

export const PostCategoryBadge = styled.span`
  display: inline-flex;
  padding: 6px var(--space-3);
  border-radius: var(--radius-full);
  background: var(--color-brand-subtle);
  color: var(--color-brand-primary);
  font-size: var(--fs-caption);
  font-weight: var(--fw-bold);
  letter-spacing: var(--ls-wide);
  text-transform: uppercase;
  margin-bottom: 20px;
`;

export const PostMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--color-text-tertiary);
  font-size: var(--fs-body-sm);

  .dot {
    width: 3px;
    height: 3px;
    border-radius: var(--radius-full);
    background: var(--color-border-strong);
    flex-shrink: 0;
  }

  .author {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: var(--fw-semibold);
    color: var(--color-text-secondary);

    &::before {
      content: '';
      width: 30px;
      height: 30px;
      border-radius: var(--radius-full);
      background: var(--color-highlighter);
      flex-shrink: 0;
    }
  }
`;

export const FeaturedImage = styled.div`
  width: 100%;
  margin-bottom: 64px;
  border-radius: 24px;
  overflow: hidden;
  background: var(--color-bg-subtle);

  .gatsby-image-wrapper {
    width: 100%;
    aspect-ratio: 21 / 9;
  }
`;

export const PostLayout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 40px;

  @media (min-width: 1024px) {
    flex-direction: row;
    align-items: flex-start;
    gap: 80px;
  }
`;

export const PostContentWrapper = styled.div`
  max-width: 800px;
  flex: 1;
`;

export const PostContent = styled.div`
  font-size: 18px;
  line-height: 1.8;
  color: var(--color-text-primary);
  font-family: var(--font-base);

  h1, h2, h3, h4, h5, h6 {
    font-weight: 800;
    color: var(--color-text-primary);
    margin-top: 48px;
    margin-bottom: 24px;
    line-height: 1.3;
    word-break: keep-all;
  }

  h1 { font-size: 36px; }
  h2 { font-size: 30px; }
  h3 { font-size: 24px; }
  h4 { font-size: 20px; }

  p {
    margin-bottom: 32px;
    color: var(--color-text-body);
    font-size: 18px;
    line-height: var(--lh-loose);
    word-break: keep-all;
  }

  a {
    color: var(--color-brand-primary);
    text-decoration: underline;
    text-underline-offset: 3px;
    transition: opacity 0.2s;
    &:hover { opacity: 0.75; }
  }

  ul, ol {
    margin-bottom: 32px;
    padding-left: 24px;
    li {
      margin-bottom: 8px;
      line-height: 1.8;
    }
  }

  code {
    background: var(--color-brand-subtle);
    padding: 2px 8px;
    border-radius: 6px;
    font-family: var(--font-mono);
    font-size: 0.875em;
    color: var(--color-brand-primary);
  }

  /* 코드 블록은 라이트 모드에서도 어둡게 둔다 — 본문에서 유일한 다크 서피스 */
  pre {
    background: var(--color-bg-code-block);
    padding: 24px 26px;
    border-radius: 16px;
    overflow-x: auto;
    margin-bottom: 32px;

    code {
      background: none;
      padding: 0;
      border: none;
      color: var(--color-text-on-code);
      font-size: 13.5px;
      line-height: 24px;
    }
  }

  /* 인용문은 형광펜 콜아웃으로 쓴다 */
  blockquote {
    border: none;
    padding: 22px 24px;
    margin: 40px 0;
    background: var(--color-highlighter-subtle);
    border-radius: 16px;
    color: var(--color-text-body);
    line-height: var(--lh-relaxed);
    font-size: var(--fs-body-lg);

    p {
      margin: 0;
      font-size: var(--fs-body-lg);
      color: inherit;
    }

    p + p {
      margin-top: var(--space-3);
    }
  }

  /* ----------------------------------------------------------
     표
     마크다운 표는 래퍼 없이 <table>만 나오므로 table 자체에
     스크롤을 건다. 세로선을 긋지 않고 행 구분선만 두는 편이
     열 폭이 들쭉날쭉해도 덜 어지럽다.
     ---------------------------------------------------------- */
  table {
    width: 100%;
    margin: 40px 0;
    border-collapse: collapse;
    font-size: var(--fs-body-md);
    line-height: var(--lh-relaxed);
    display: block;
    overflow-x: auto;
  }

  thead th {
    padding: 0 16px 12px;
    border-bottom: 1px solid var(--color-border-strong);
    color: var(--color-text-tertiary);
    font-size: 13px;
    font-weight: var(--fw-bold);
    letter-spacing: var(--ls-wide);
    text-align: left;
    white-space: nowrap;
    vertical-align: bottom;
  }

  tbody td {
    padding: 16px;
    border-bottom: 1px solid var(--color-border-subtle);
    color: var(--color-text-body);
    vertical-align: top;
    word-break: keep-all;
  }

  tbody tr:last-child td {
    border-bottom: none;
  }

  /* 번호·기호처럼 짧은 첫 열이 본문 폭을 뺏지 않게 눌러둔다 */
  tbody td:first-of-type,
  thead th:first-of-type {
    padding-left: 0;
    width: 1%;
    white-space: nowrap;
    color: var(--color-text-tertiary);
    font-variant-numeric: tabular-nums;
  }

  tbody td strong {
    color: var(--color-text-primary);
    font-weight: var(--fw-bold);
  }

  /* 표 안에서는 인라인 코드가 줄을 밀어내지 않도록 조금 줄인다 */
  td code,
  th code {
    font-size: 0.82em;
    padding: 1px 6px;
    white-space: nowrap;
  }

  /* ----------------------------------------------------------
     좁은 화면의 표
     폭이 모자라면 브라우저가 열을 눌러 "10+ / 파일"처럼 단어를
     세로로 쪼갠다. 열에 하한을 줘서 눌리는 대신 가로로 넘치게
     하고, 넘친 만큼은 위에 걸어둔 overflow-x로 밀어서 본다.
     ---------------------------------------------------------- */
  @media (max-width: 767px) {
    table {
      margin: 28px 0;
      font-size: var(--fs-body-sm);
    }

    thead th,
    tbody td {
      min-width: 108px;
      padding-left: 12px;
      padding-right: 12px;
    }

    /* 첫 열은 대개 이름이라 길다. 한 줄로 붙들면 폭을 다 먹으므로
       여기서만 줄바꿈을 허용한다. */
    thead th:first-of-type,
    tbody td:first-of-type {
      width: auto;
      min-width: 116px;
      white-space: normal;
      padding-left: 0;
    }
  }

  img {
    max-width: 100%;
    height: auto;
    border-radius: 16px;
    margin: 48px 0;
  }

  hr {
    border: none;
    border-top: 1px solid var(--color-border-subtle);
    margin: 64px 0;
  }
`;

export const AuthorProfile = styled.div`
  margin-top: 80px;
  padding-top: 48px;
  border-top: 1px solid var(--color-border-subtle);
  display: flex;
  align-items: center;
  gap: 24px;

  .avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: var(--color-bg-subtle);
    overflow: hidden;
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .info {
    h3 {
      font-size: 20px;
      font-weight: 700;
      color: var(--color-text-primary);
      margin: 0 0 4px 0;
    }
    p {
      color: var(--color-text-tertiary);
      margin: 0;
      font-size: 16px;
    }
  }
`;

export const PostBottomTags = styled.div`
  margin-top: 64px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  span {
    padding: 6px 16px;
    border-radius: 9999px;
    background: var(--color-bg-subtle);
    color: var(--color-text-secondary);
    font-size: 14px;
    font-weight: 500;
  }
`;

export const PostNavigation = styled.nav`
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-top: 64px;
  padding-top: 32px;
  border-top: 1px solid var(--color-border-subtle);
`;

export const NavLink = styled.a`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 24px 26px;
  background: transparent;
  border: 1px solid var(--color-border-default);
  border-radius: 18px;
  text-decoration: none;
  transition: border-color var(--transition-base);

  &:hover {
    border-color: var(--color-border-strong);
  }

  .label {
    font-size: var(--fs-caption);
    font-weight: var(--fw-semibold);
    letter-spacing: var(--ls-wide);
    color: var(--color-text-tertiary);
  }

  .title {
    font-size: 17px;
    font-weight: var(--fw-bold);
    letter-spacing: var(--ls-tight);
    color: var(--color-text-primary);
    line-height: 1.55;
    word-break: keep-all;
  }

  &.next {
    align-items: flex-end;
    text-align: right;
  }
`;

/* 제목 아래 #태그 (글의 keywords). 클릭하면 해당 카테고리 목록의 그 태그로 이동한다. */
export const PostTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 20px;
`;

export const PostTag = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 6px 13px;
  border-radius: var(--radius-full);
  background: var(--color-bg-subtle);
  font-size: 13px;
  font-weight: var(--fw-semibold);
  letter-spacing: -0.01em;
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: background var(--transition-fast), color var(--transition-fast);

  .hash {
    color: var(--color-text-tertiary);
  }

  &:hover {
    background: var(--color-brand-subtle);
    color: var(--color-brand-primary);
    .hash {
      color: var(--color-brand-primary);
    }
  }
`;
