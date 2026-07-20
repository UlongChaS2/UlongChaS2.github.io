import * as React from 'react';

// ============================================================
// Icons — 프로젝트에 아이콘 라이브러리가 없어 필요한 것만 직접 둔다.
// 색은 currentColor를 따르므로 부모에서 color만 지정하면 된다.
// 개수가 10개를 넘어가면 lucide-react 같은 라이브러리 도입을 검토할 것.
// ============================================================

interface IconProps {
  size?: number;
  strokeWidth?: number;
  className?: string;
}

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  focusable: false,
});

/**
 * 파비콘과 같은 그림이다. 꺾쇠는 currentColor를 따르지만 커서만은
 * 노란색을 고정으로 쓴다 — 이 두 색 대비가 마크의 정체성이라
 * 부모 색에 딸려가면 그냥 꺾쇠가 되어버린다.
 */
export const IconPrompt: React.FC<IconProps> = ({ size = 18, strokeWidth = 3, className }) => (
  <svg {...base(size)} strokeWidth={strokeWidth} className={className}>
    <path d="M7 7.5l3.5 4.5L7 16.5" />
    <rect x="13" y="13.5" width="4.5" height="2.8" rx="1.4" fill="#FFD84D" stroke="none" />
  </svg>
);

export const IconChevronRight: React.FC<IconProps> = ({ size = 16, strokeWidth = 2.4, className }) => (
  <svg {...base(size)} strokeWidth={strokeWidth} className={className}>
    <path d="M9 6l6 6-6 6" />
  </svg>
);

export const IconArrowRight: React.FC<IconProps> = ({ size = 16, strokeWidth = 2.4, className }) => (
  <svg {...base(size)} strokeWidth={strokeWidth} className={className}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export const IconSearch: React.FC<IconProps> = ({ size = 15, strokeWidth = 2.2, className }) => (
  <svg {...base(size)} strokeWidth={strokeWidth} className={className}>
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.3-4.3" />
  </svg>
);

export const IconAlert: React.FC<IconProps> = ({ size = 14, strokeWidth = 2.6, className }) => (
  <svg {...base(size)} strokeWidth={strokeWidth} className={className}>
    <path d="M12 8v5M12 16.5v.5" />
  </svg>
);
