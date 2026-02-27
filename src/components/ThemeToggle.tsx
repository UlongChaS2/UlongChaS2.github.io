import * as React from 'react';
import styled from '@emotion/styled';
import { useTheme } from 'src/contexts/ThemeContext';

// ============================================================
// ThemeToggle — New Token API
// Uses CSS var() tokens from tokens.css for theme responsiveness
// ============================================================

const ToggleContainer = styled.div`
  position: relative;
`;

const ToggleButton = styled.button`
  background: transparent;
  border: none;
  padding: var(--space-2);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--fs-title-md);
  transition: transform var(--transition-fast);
  border-radius: var(--radius-sm);

  &:hover {
    transform: scale(1.1);
    background: var(--color-interactive-hover);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const DropdownMenu = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: calc(100% + var(--space-2));
  right: 0;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  padding: var(--space-1);
  min-width: 150px;
  display: ${(props) => (props.isOpen ? 'block' : 'none')};
  z-index: var(--z-dropdown);
`;

const MenuItem = styled.button<{ isActive: boolean }>`
  width: 100%;
  padding: var(--space-2) var(--space-4);
  background: ${(props) => (props.isActive ? 'var(--color-interactive-active)' : 'transparent')};
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--fs-body-sm);
  color: var(--color-text-primary);
  transition: background var(--transition-fast);
  text-align: left;
  font-family: var(--font-base);

  &:hover {
    background: var(--color-interactive-hover);
  }

  .icon {
    font-size: var(--fs-title-sm);
  }

  .label {
    flex: 1;
  }

  .check {
    opacity: ${(props) => (props.isActive ? 1 : 0)};
    color: var(--color-brand-primary);
    font-weight: var(--fw-bold);
  }
`;

const ThemeToggle: React.FC = () => {
  const { theme: currentTheme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // 외부 클릭 감지
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = () => {
    switch (currentTheme) {
      case 'light':
        return '☀️';
      case 'dark':
        return '🌙';
      case 'system':
        return '💻';
    }
  };

  return (
    <ToggleContainer ref={containerRef}>
      <ToggleButton onClick={() => setIsOpen(!isOpen)} aria-label="테마 선택">
        {getIcon()}
      </ToggleButton>

      <DropdownMenu isOpen={isOpen}>
        <MenuItem
          isActive={currentTheme === 'light'}
          onClick={() => {
            setTheme('light');
            setIsOpen(false);
          }}
        >
          <span className="icon">☀️</span>
          <span className="label">라이트</span>
          <span className="check">✓</span>
        </MenuItem>

        <MenuItem
          isActive={currentTheme === 'dark'}
          onClick={() => {
            setTheme('dark');
            setIsOpen(false);
          }}
        >
          <span className="icon">🌙</span>
          <span className="label">다크</span>
          <span className="check">✓</span>
        </MenuItem>

        <MenuItem
          isActive={currentTheme === 'system'}
          onClick={() => {
            setTheme('system');
            setIsOpen(false);
          }}
        >
          <span className="icon">💻</span>
          <span className="label">시스템</span>
          <span className="check">✓</span>
        </MenuItem>
      </DropdownMenu>
    </ToggleContainer>
  );
};

export default ThemeToggle;
