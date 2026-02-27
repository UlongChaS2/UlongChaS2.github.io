import styled from '@emotion/styled';

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
  font-size: 36px;
  font-weight: 900;
  color: var(--color-text-primary);
  margin: 0 0 24px 0;
  line-height: 1.2;
  word-break: keep-all;

  @media (min-width: 768px) {
    font-size: 48px;
  }
`;

export const PostMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  color: var(--color-text-tertiary);
  font-size: 16px;
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
    color: #333;
    font-size: 18px;
    word-break: keep-all;
  }

  .dark & p {
    color: #ccc;
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
    background: var(--color-bg-code);
    padding: 2px 8px;
    border-radius: 6px;
    font-family: var(--font-mono);
    font-size: 0.875em;
    color: var(--color-brand-primary);
    border: 1px solid var(--color-border-subtle);
  }

  pre {
    background: var(--color-bg-code);
    padding: 24px;
    border-radius: 16px;
    overflow-x: auto;
    margin-bottom: 32px;
    border: 1px solid var(--color-border-default);

    code {
      background: none;
      padding: 0;
      border: none;
      color: var(--color-text-primary);
      font-size: 14px;
    }
  }

  blockquote {
    border-left: 3px solid var(--color-brand-primary);
    padding: 16px 24px;
    margin: 48px 0;
    background: var(--color-brand-subtle);
    border-radius: 0 10px 10px 0;
    color: var(--color-text-secondary);
    font-style: italic;
    line-height: 1.6;
    font-size: 20px;
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
  padding: 16px 20px;
  background: var(--color-bg-subtle);
  border: 1px solid var(--color-border-subtle);
  border-radius: 16px;
  text-decoration: none;
  transition: all 0.2s;

  &:hover {
    border-color: var(--color-brand-primary);
    transform: translateY(-2px);
    background: var(--color-interactive-hover);
  }

  .label {
    font-size: 12px;
    color: var(--color-text-tertiary);
    text-transform: uppercase;
    margin-bottom: 4px;
  }

  .title {
    font-size: 16px;
    font-weight: 600;
    color: var(--color-text-primary);
    line-height: 1.3;
  }

  &.prev .label::before { content: '← '; }
  &.next { text-align: right; .label::after { content: ' →'; } }
`;
