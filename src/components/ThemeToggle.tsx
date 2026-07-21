import * as React from 'react';
import styled from '@emotion/styled';
import { useTheme } from 'src/contexts/ThemeContext';
import { IconSun, IconMoon, IconMonitor, IconCheck } from './icons';

const THEME_ICON = {
  light: IconSun,
  dark: IconMoon,
  system: IconMonitor,
} as const;

// ============================================================
// ThemeToggle — New Token API
// Uses CSS var() tokens from tokens.css for theme responsiveness
// ============================================================

const ToggleContainer = styled.div`
  position: relative;
`;

const ToggleButton = styled.button`
  background: var(--color-bg-subtle);
  border: none;
  width: 36px;
  height: 36px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  transition: background var(--transition-fast), color var(--transition-fast);
  border-radius: var(--radius-md);
  flex-shrink: 0;

  &:hover {
    background: var(--color-interactive-hover);
    color: var(--color-text-primary);
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
    display: inline-flex;
    color: var(--color-text-secondary);
  }

  .label {
    flex: 1;
  }

  .check {
    display: inline-flex;
    opacity: ${(props) => (props.isActive ? 1 : 0)};
    color: var(--color-brand-primary);
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

  const CurrentIcon = THEME_ICON[currentTheme];

  const options = [
    { value: 'light', label: '라이트' },
    { value: 'dark', label: '다크' },
    { value: 'system', label: '시스템' },
  ] as const;

  return (
    <ToggleContainer ref={containerRef}>
      <ToggleButton onClick={() => setIsOpen(!isOpen)} aria-label="테마 선택">
        <CurrentIcon size={18} />
      </ToggleButton>

      <DropdownMenu isOpen={isOpen}>
        {options.map(({ value, label }) => {
          const Icon = THEME_ICON[value];
          return (
            <MenuItem
              key={value}
              isActive={currentTheme === value}
              onClick={() => {
                setTheme(value);
                setIsOpen(false);
              }}
            >
              <span className="icon">
                <Icon size={17} />
              </span>
              <span className="label">{label}</span>
              <span className="check">
                <IconCheck size={16} />
              </span>
            </MenuItem>
          );
        })}
      </DropdownMenu>
    </ToggleContainer>
  );
};

export default ThemeToggle;
