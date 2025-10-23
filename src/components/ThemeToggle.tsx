import * as React from 'react';
import styled from '@emotion/styled';
import { useTheme } from 'src/contexts/ThemeContext';
import { theme } from 'src/styles/theme';

const ToggleContainer = styled.div`
  position: relative;
`;

const ToggleButton = styled.button`
  background: transparent;
  border: none;
  padding: ${theme.spacing.sm};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${theme.fontSize.xl};
  transition: transform ${theme.transition.fast};

  &:hover {
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const DropdownMenu = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: calc(100% + ${theme.spacing.sm});
  right: 0;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: ${theme.borderRadius.md};
  box-shadow: ${theme.shadow.lg};
  padding: ${theme.spacing.xs};
  min-width: 150px;
  display: ${(props) => (props.isOpen ? 'block' : 'none')};
  z-index: 1000;
`;

const MenuItem = styled.button<{ isActive: boolean }>`
  width: 100%;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background: ${(props) => (props.isActive ? 'var(--color-hover)' : 'transparent')};
  border: none;
  border-radius: ${theme.borderRadius.sm};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  font-size: ${theme.fontSize.sm};
  color: var(--color-text-primary);
  transition: background ${theme.transition.fast};
  text-align: left;

  &:hover {
    background: var(--color-hover);
  }

  .icon {
    font-size: ${theme.fontSize.lg};
  }

  .label {
    flex: 1;
  }

  .check {
    opacity: ${(props) => (props.isActive ? 1 : 0)};
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
