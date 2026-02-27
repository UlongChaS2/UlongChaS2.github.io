import styled from '@emotion/styled';

// ============================================================
// GlobalHeader Styles — Daangn Blog Style
// - 투명 배경, 스크롤 시 흰색+그림자
// - 미니멀한 링크 스타일
// ============================================================

export const HeaderContainer = styled.header<{ scrolled?: boolean }>`
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  background-color: ${(p) =>
    p.scrolled ? 'var(--color-bg-default)' : 'transparent'};
  border-bottom: 1px solid ${(p) =>
    p.scrolled ? 'var(--color-border-subtle)' : 'transparent'};
  backdrop-filter: ${(p) => (p.scrolled ? 'blur(12px)' : 'none')};
  -webkit-backdrop-filter: ${(p) => (p.scrolled ? 'blur(12px)' : 'none')};
  transition:
    background-color var(--transition-base),
    border-color var(--transition-base),
    box-shadow var(--transition-base);
  box-shadow: ${(p) => (p.scrolled ? 'var(--shadow-sm)' : 'none')};
`;

export const HeaderInner = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-4) var(--space-6);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-6);

  @media (min-width: 768px) {
    padding: var(--space-5) var(--space-8);
  }
`;

export const Logo = styled.div`
  font-size: var(--fs-title-md);
  font-weight: var(--fw-bold);
  letter-spacing: var(--ls-tight);
  flex-shrink: 0;

  a {
    text-decoration: none;
    color: var(--color-text-primary);
    display: flex;
    align-items: center;
    gap: var(--space-2);
    transition: opacity var(--transition-fast);

    &::before {
      content: '●';
      color: var(--color-brand-primary);
      font-size: 0.6em;
    }

    &:hover {
      opacity: 0.75;
    }
  }
`;

export const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: var(--space-1);

  @media (min-width: 768px) {
    gap: var(--space-2);
  }

  a {
    padding: var(--space-2) var(--space-3);
    color: var(--color-text-secondary);
    text-decoration: none;
    font-weight: var(--fw-medium);
    font-size: var(--fs-body-sm);
    border-radius: var(--radius-md);
    transition: all var(--transition-fast);
    white-space: nowrap;
    position: relative;

    @media (min-width: 768px) {
      font-size: var(--fs-body-md);
      padding: var(--space-2) var(--space-4);
    }

    &::after {
      content: '';
      position: absolute;
      bottom: 4px;
      left: var(--space-3);
      right: var(--space-3);
      height: 2px;
      background: var(--color-brand-primary);
      transform: scaleX(0);
      transition: transform var(--transition-fast);
      border-radius: var(--radius-full);
    }

    &:hover {
      color: var(--color-text-primary);

      &::after {
        transform: scaleX(1);
      }
    }

    &.active {
      color: var(--color-brand-primary);
      font-weight: var(--fw-semibold);

      &::after {
        transform: scaleX(1);
      }
    }
  }
`;
