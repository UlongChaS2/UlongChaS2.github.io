import styled from '@emotion/styled';

// ============================================================
// Post Detail Styles — New Token API
// Uses CSS var() tokens from tokens.css for theme responsiveness
// ============================================================

export const PostContainer = styled.article`
  max-width: 800px;
  margin: 0 auto;
  padding: var(--space-10) var(--space-6);

  @media (min-width: 768px) {
    padding: var(--space-12) var(--space-8);
  }
`;

export const PostHeader = styled.header`
  margin-bottom: var(--space-10);
`;

export const FeaturedImage = styled.div`
  width: 100%;
  margin-bottom: var(--space-10);
  border-radius: var(--radius-lg);
  overflow: hidden;

  .gatsby-image-wrapper {
    width: 100%;
    max-height: 400px;
  }

  @media (min-width: 768px) {
    .gatsby-image-wrapper {
      max-height: 500px;
    }
  }
`;

export const PostHeaderContent = styled.div`
  padding-bottom: var(--space-6);
  border-bottom: 1px solid var(--color-border-subtle);
  margin-bottom: var(--space-8);
`;

export const PostCategory = styled.span`
  display: inline-flex;
  align-items: center;
  padding: var(--space-1) var(--space-3);
  background-color: var(--color-brand-subtle);
  color: var(--color-brand-primary);
  border-radius: var(--radius-sm);
  font-size: var(--fs-caption);
  font-weight: var(--fw-semibold);
  margin-bottom: var(--space-4);
  text-transform: uppercase;
  letter-spacing: var(--ls-wide);
`;

export const PostTitle = styled.h1`
  font-size: var(--fs-title-xl);
  font-weight: var(--fw-extrabold);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-5) 0;
  line-height: var(--lh-snug);
  letter-spacing: var(--ls-tight);
  word-break: keep-all;

  @media (min-width: 768px) {
    font-size: var(--fs-display-md);
  }
`;

export const PostMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3);
  color: var(--color-text-tertiary);
  font-size: var(--fs-body-sm);

  time,
  .read-time {
    display: flex;
    align-items: center;
  }

  .dot {
    color: var(--color-border-default);
  }
`;

export const PostContent = styled.div`
  font-size: var(--fs-body-lg);
  line-height: var(--lh-loose);
  color: var(--color-text-primary);
  font-family: var(--font-base);

  h1, h2, h3, h4, h5, h6 {
    font-weight: var(--fw-bold);
    color: var(--color-text-primary);
    margin-top: var(--space-12);
    margin-bottom: var(--space-4);
    line-height: var(--lh-snug);
    letter-spacing: var(--ls-tight);
    scroll-margin-top: 100px;
    word-break: keep-all;
  }

  h1 { font-size: var(--fs-title-xl); }
  h2 {
    font-size: var(--fs-title-lg);
    padding-bottom: var(--space-3);
    border-bottom: 1px solid var(--color-border-subtle);
  }
  h3 { font-size: var(--fs-title-md); }
  h4 { font-size: var(--fs-title-sm); }

  p {
    margin-bottom: var(--space-6);
    word-break: keep-all;
  }

  a {
    color: var(--color-brand-primary);
    text-decoration: underline;
    text-underline-offset: 3px;
    transition: opacity var(--transition-fast);
    &:hover { opacity: 0.75; }
  }

  ul, ol {
    margin-bottom: var(--space-6);
    padding-left: var(--space-6);
    li {
      margin-bottom: var(--space-2);
      line-height: var(--lh-relaxed);
    }
  }

  code {
    background: var(--color-bg-code);
    padding: 2px var(--space-2);
    border-radius: var(--radius-sm);
    font-family: var(--font-mono);
    font-size: 0.875em;
    color: var(--color-brand-primary);
    border: 1px solid var(--color-border-subtle);
  }

  pre {
    background: var(--color-bg-code);
    padding: var(--space-6);
    border-radius: var(--radius-lg);
    overflow-x: auto;
    margin-bottom: var(--space-6);
    border: 1px solid var(--color-border-default);
    box-shadow: var(--shadow-sm);

    code {
      background: none;
      padding: 0;
      border: none;
      color: var(--color-text-primary);
      font-size: var(--fs-body-sm);
    }
  }

  blockquote {
    border-left: 3px solid var(--color-brand-primary);
    padding: var(--space-4) var(--space-6);
    margin: var(--space-8) 0;
    background: var(--color-brand-subtle);
    border-radius: 0 var(--radius-md) var(--radius-md) 0;
    color: var(--color-text-secondary);
    font-style: italic;
    line-height: var(--lh-relaxed);
  }

  img {
    max-width: 100%;
    height: auto;
    border-radius: var(--radius-lg);
    margin: var(--space-8) 0;
    box-shadow: var(--shadow-md);
  }

  hr {
    border: none;
    border-top: 1px solid var(--color-border-subtle);
    margin: var(--space-12) 0;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: var(--space-6);
    overflow-x: auto;
    display: block;
    font-size: var(--fs-body-sm);

    @media (min-width: 768px) { display: table; }

    th, td {
      padding: var(--space-2) var(--space-4);
      border: 1px solid var(--color-border-default);
      text-align: left;
    }
    th {
      background: var(--color-bg-subtle);
      font-weight: var(--fw-semibold);
      color: var(--color-text-primary);
    }
    tr:nth-of-type(even) td {
      background: var(--color-interactive-hover);
    }
  }
`;

export const PostNavigation = styled.nav`
  display: flex;
  justify-content: space-between;
  gap: var(--space-4);
  margin-top: var(--space-16);
  padding-top: var(--space-8);
  border-top: 1px solid var(--color-border-subtle);

  @media (max-width: 768px) { flex-direction: column; }
`;

export const NavLink = styled.a`
  flex: 1;
  padding: var(--space-4) var(--space-5);
  background: var(--color-bg-subtle);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
  text-decoration: none;
  transition: all var(--transition-base);

  &:hover {
    border-color: var(--color-brand-primary);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
    background: var(--color-interactive-hover);
  }

  .label {
    font-size: var(--fs-caption);
    color: var(--color-text-tertiary);
    text-transform: uppercase;
    letter-spacing: var(--ls-wide);
    margin-bottom: var(--space-1);
  }

  .title {
    font-size: var(--fs-body-md);
    font-weight: var(--fw-semibold);
    color: var(--color-text-primary);
    line-height: var(--lh-snug);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  &.prev .label::before { content: '← '; }
  &.next { text-align: right; .label::after { content: ' →'; } }
`;
