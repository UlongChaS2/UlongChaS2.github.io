import styled from '@emotion/styled';
import { theme } from './theme';

export const PostContainer = styled.article`
  max-width: 800px;
  margin: 0 auto;
`;

export const PostHeader = styled.header`
  margin-bottom: ${theme.spacing['2xl']};
`;

export const FeaturedImage = styled.div`
  width: 100%;
  margin-bottom: ${theme.spacing['2xl']};
  border-radius: ${theme.borderRadius.lg};
  overflow: hidden;

  .gatsby-image-wrapper {
    width: 100%;
    max-height: 400px;
  }

  @media (min-width: ${theme.breakpoints.tablet}) {
    .gatsby-image-wrapper {
      max-height: 500px;
    }
  }
`;

export const PostHeaderContent = styled.div`
  padding-bottom: ${theme.spacing.xl};
  border-bottom: 2px solid var(--color-border);
  margin-bottom: ${theme.spacing['2xl']};
`;

export const PostCategory = styled.span`
  display: inline-block;
  padding: ${theme.spacing.xs} ${theme.spacing.md};
  background-color: var(--color-surface);
  color: ${theme.colors.primary};
  border-radius: ${theme.borderRadius.full};
  font-size: ${theme.fontSize.xs};
  font-weight: ${theme.fontWeight.semibold};
  margin-bottom: ${theme.spacing.md};
  text-transform: uppercase;
`;

export const PostTitle = styled.h1`
  font-size: ${theme.fontSize['3xl']};
  font-weight: ${theme.fontWeight.bold};
  color: var(--color-text-primary);
  margin: 0 0 ${theme.spacing.lg} 0;
  line-height: 1.3;

  @media (min-width: ${theme.breakpoints.tablet}) {
    font-size: ${theme.fontSize['4xl']};
  }
`;

export const PostMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing.md};
  color: var(--color-text-tertiary);
  font-size: ${theme.fontSize.sm};

  time {
    display: flex;
    align-items: center;
    gap: ${theme.spacing.xs};

    &::before {
      content: '📅';
    }
  }

  .read-time {
    display: flex;
    align-items: center;
    gap: ${theme.spacing.xs};

    &::before {
      content: '⏱️';
    }
  }
`;

export const PostContent = styled.div`
  font-size: ${theme.fontSize.base};
  line-height: 1.8;
  color: var(--color-text-primary);
  scroll-margin-top: 80px; /* 스크롤 시 헤더 아래로 위치 조정 */

  @media (min-width: ${theme.breakpoints.tablet}) {
    font-size: ${theme.fontSize.lg};
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    font-weight: ${theme.fontWeight.bold};
    color: var(--color-text-primary);
    margin-top: ${theme.spacing['2xl']};
    margin-bottom: ${theme.spacing.lg};
    line-height: 1.3;
    scroll-margin-top: 100px; /* 앵커 링크 클릭 시 헤더 아래로 위치 */
  }

  h1 {
    font-size: ${theme.fontSize['3xl']};

    @media (min-width: ${theme.breakpoints.tablet}) {
      font-size: ${theme.fontSize['4xl']};
    }
  }

  h2 {
    font-size: ${theme.fontSize['2xl']};
    padding-bottom: ${theme.spacing.sm};
    border-bottom: 2px solid var(--color-border);

    @media (min-width: ${theme.breakpoints.tablet}) {
      font-size: ${theme.fontSize['3xl']};
    }
  }

  h3 {
    font-size: ${theme.fontSize.xl};

    @media (min-width: ${theme.breakpoints.tablet}) {
      font-size: ${theme.fontSize['2xl']};
    }
  }

  h4 {
    font-size: ${theme.fontSize.lg};

    @media (min-width: ${theme.breakpoints.tablet}) {
      font-size: ${theme.fontSize.xl};
    }
  }

  p {
    margin-bottom: ${theme.spacing.lg};
  }

  a {
    color: ${theme.colors.primary};
    text-decoration: underline;
    transition: color ${theme.transition.fast};

    &:hover {
      color: ${theme.colors.secondary};
    }
  }

  ul,
  ol {
    margin-bottom: ${theme.spacing.lg};
    padding-left: ${theme.spacing.xl};

    li {
      margin-bottom: ${theme.spacing.sm};
    }
  }

  code {
    background: var(--color-surface);
    padding: ${theme.spacing.xs} ${theme.spacing.sm};
    border-radius: ${theme.borderRadius.sm};
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 0.9em;
    color: ${theme.colors.secondary};
  }

  pre {
    background: var(--color-surface);
    padding: ${theme.spacing.lg};
    border-radius: ${theme.borderRadius.md};
    overflow-x: auto;
    margin-bottom: ${theme.spacing.lg};
    border: 1px solid var(--color-border);

    code {
      background: none;
      padding: 0;
      color: var(--color-text-primary);
    }
  }

  blockquote {
    border-left: 4px solid ${theme.colors.primary};
    padding-left: ${theme.spacing.lg};
    margin: ${theme.spacing.xl} 0;
    color: var(--color-text-secondary);
    font-style: italic;
  }

  img {
    max-width: 100%;
    height: auto;
    border-radius: ${theme.borderRadius.md};
    margin: ${theme.spacing.xl} 0;
  }

  hr {
    border: none;
    border-top: 2px solid var(--color-border);
    margin: ${theme.spacing['2xl']} 0;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: ${theme.spacing.lg};
    overflow-x: auto;
    display: block;

    @media (min-width: ${theme.breakpoints.tablet}) {
      display: table;
    }

    th,
    td {
      padding: ${theme.spacing.sm} ${theme.spacing.md};
      border: 1px solid var(--color-border);
      text-align: left;
    }

    th {
      background: var(--color-surface);
      font-weight: ${theme.fontWeight.semibold};
    }
  }
`;

export const PostNavigation = styled.nav`
  display: flex;
  justify-content: space-between;
  gap: ${theme.spacing.md};
  margin-top: ${theme.spacing['3xl']};
  padding-top: ${theme.spacing['2xl']};
  border-top: 2px solid var(--color-border);

  @media (max-width: ${theme.breakpoints.tablet}) {
    flex-direction: column;
  }
`;

export const NavLink = styled.a`
  flex: 1;
  padding: ${theme.spacing.lg};
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: ${theme.borderRadius.md};
  text-decoration: none;
  transition: all ${theme.transition.base};

  &:hover {
    border-color: ${theme.colors.primary};
    transform: translateY(-2px);
    box-shadow: ${theme.shadow.md};
  }

  .label {
    font-size: ${theme.fontSize.xs};
    color: var(--color-text-tertiary);
    text-transform: uppercase;
    margin-bottom: ${theme.spacing.xs};
  }

  .title {
    font-size: ${theme.fontSize.base};
    font-weight: ${theme.fontWeight.semibold};
    color: var(--color-text-primary);
  }

  &.prev {
    text-align: left;

    .label::before {
      content: '← ';
    }
  }

  &.next {
    text-align: right;

    .label::after {
      content: ' →';
    }
  }
`;
