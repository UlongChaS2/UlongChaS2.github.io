import styled from '@emotion/styled';
import { theme } from './theme';

export const HeaderContainer = styled.header`
  background-color: var(--color-background);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(10px);
  background-color: var(--color-background);
  opacity: 0.95;
  transition: all ${theme.transition.fast};
`;

export const HeaderInner = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${theme.spacing.lg} ${theme.spacing.md};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${theme.spacing.md};

  @media (min-width: ${theme.breakpoints.tablet}) {
    padding: ${theme.spacing.lg} ${theme.spacing.xl};
  }
`;

export const Logo = styled.div`
  font-size: ${theme.fontSize['2xl']};
  font-weight: ${theme.fontWeight.bold};
  color: ${theme.colors.primary};

  a {
    text-decoration: none;
    color: inherit;
    transition: opacity ${theme.transition.fast};

    &:hover {
      opacity: 0.8;
    }
  }
`;

export const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};

  @media (min-width: ${theme.breakpoints.tablet}) {
    gap: ${theme.spacing.md};
  }

  a {
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    color: var(--color-text-secondary);
    text-decoration: none;
    font-weight: ${theme.fontWeight.medium};
    border-radius: ${theme.borderRadius.md};
    transition: all ${theme.transition.fast};
    font-size: ${theme.fontSize.sm};

    @media (min-width: ${theme.breakpoints.tablet}) {
      font-size: ${theme.fontSize.base};
    }

    &:hover {
      color: var(--color-text-primary);
      background-color: var(--color-hover);
    }

    &.active {
      color: ${theme.colors.primary};
      background-color: var(--color-surface);
    }
  }
`;
