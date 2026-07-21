import * as React from 'react';
import { Link } from 'gatsby';
import styled from '@emotion/styled';
import { HeaderContainer, HeaderInner, Logo, Nav } from 'src/styles/HeaderStyles';
import ThemeToggle from './ThemeToggle';
import VisitorBadge from './VisitorCount';
import { LogoMark, IconMenu, IconClose } from './icons';

// ============================================================
// GlobalHeader — Daangn Blog Style
// - 투명 → 스크롤시 흰색/다크 배경 + 그림자
// - 밑줄 애니 네비
// ============================================================

const MobileMenuBtn = styled.button`
  display: none;
  background: transparent;
  border: none;
  padding: var(--space-2);
  cursor: pointer;
  color: var(--color-text-secondary);
  font-size: 1.25rem;
  border-radius: var(--radius-sm);
  transition: background var(--transition-fast);
  line-height: 1;

  &:hover {
    background: var(--color-interactive-hover);
    color: var(--color-text-primary);
  }

  @media (max-width: 767px) {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
  }
`;

const MobileMenu = styled.div<{ isOpen: boolean }>`
  display: none;

  @media (max-width: 767px) {
    display: ${(p) => (p.isOpen ? 'flex' : 'none')};
    flex-direction: column;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background-color: var(--color-bg-default);
    border-bottom: 1px solid var(--color-border-subtle);
    padding: var(--space-3) var(--space-6);
    gap: var(--space-1);
    z-index: var(--z-dropdown);
    box-shadow: var(--shadow-md);

    a {
      display: block;
      padding: var(--space-3) var(--space-4);
      color: var(--color-text-secondary);
      text-decoration: none;
      font-weight: var(--fw-medium);
      font-size: var(--fs-body-md);
      border-radius: var(--radius-md);
      transition: all var(--transition-fast);

      &:hover {
        color: var(--color-text-primary);
        background-color: var(--color-interactive-hover);
      }

      &.active {
        color: var(--color-brand-primary);
        font-weight: var(--fw-semibold);
      }
    }
  }
`;

const DesktopNav = styled(Nav)`
  @media (max-width: 767px) {
    display: none;
  }
`;

const RightActions = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-1);
`;

const Header: React.FC = () => {
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { to: '/', label: '홈' },
    { to: '/study/', label: '스터디', partial: true },
    { to: '/project/', label: '프로젝트', partial: true },
    { to: '/about/', label: '소개', partial: true },
  ];

  return (
    <HeaderContainer scrolled={isScrolled} style={{ position: 'sticky' }}>
      <HeaderInner>
        <Logo>
          <Link to="/">
            <LogoMark size={34} />
            UlongChaS2.log
          </Link>
        </Logo>

        {/* Desktop Nav */}
        <DesktopNav>
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              activeClassName="active"
              partiallyActive={link.partial}
            >
              {link.label}
            </Link>
          ))}
        </DesktopNav>

        <RightActions>
          <VisitorBadge />
          <ThemeToggle />
          <MobileMenuBtn
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            aria-label={isMobileOpen ? '메뉴 닫기' : '메뉴 열기'}
          >
            {isMobileOpen ? <IconClose /> : <IconMenu />}
          </MobileMenuBtn>
        </RightActions>
      </HeaderInner>

      {/* Mobile Dropdown */}
      <MobileMenu isOpen={isMobileOpen}>
        {navLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            activeClassName="active"
            partiallyActive={link.partial}
            onClick={() => setIsMobileOpen(false)}
          >
            {link.label}
          </Link>
        ))}
      </MobileMenu>
    </HeaderContainer>
  );
};

export default Header;
