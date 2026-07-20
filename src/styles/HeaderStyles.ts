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
    border-color var(--transition-base);
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
  font-size: 19px;
  font-weight: var(--fw-extrabold);
  letter-spacing: var(--ls-tighter);
  flex-shrink: 0;

  a {
    text-decoration: none;
    color: var(--color-text-primary);
    display: flex;
    align-items: center;
    gap: var(--space-2);
    transition: opacity var(--transition-fast);

    &:hover {
      opacity: 0.75;
    }
  }
`;

export const LogoMark = styled.span`
  width: 34px;
  height: 34px;
  border-radius: 11px;
  background: var(--color-brand-primary);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

export const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: var(--space-1);

  @media (min-width: 768px) {
    gap: var(--space-2);
  }

  /* 밑줄 애니메이션 대신 굵기/명도 대비로만 현재 위치를 표시한다. */
  a {
    padding: var(--space-2) var(--space-3);
    color: var(--color-text-tertiary);
    text-decoration: none;
    font-weight: var(--fw-medium);
    font-size: var(--fs-body-sm);
    border-radius: var(--radius-md);
    transition: color var(--transition-fast);
    white-space: nowrap;

    @media (min-width: 768px) {
      font-size: var(--fs-body-md);
      padding: var(--space-2) var(--space-4);
    }

    &:hover {
      color: var(--color-text-primary);
    }

    &.active {
      color: var(--color-text-primary);
      font-weight: var(--fw-semibold);
    }
  }
`;
