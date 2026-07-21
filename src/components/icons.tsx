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
 * 브랜드 로고 마크. favicon.svg와 완전히 같은 그림이라야 한다 —
 * 파란 라운드 사각형 + 흰 꺾쇠(프롬프트) + 노란 커서 블록.
 * 색은 마크의 정체성이라 테마에 딸려가지 않고 고정으로 둔다.
 */
export const LogoMark: React.FC<{ size?: number; className?: string }> = ({ size = 34, className }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden focusable={false} className={className}>
    <rect width="64" height="64" rx="20" fill="#3182F6" />
    <path d="M21 24 30 32 21 40" fill="none" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
    <rect x="36" y="35" width="12" height="7" rx="3.5" fill="#FFD84D" />
  </svg>
);

export const IconEye: React.FC<IconProps> = ({ size = 15, strokeWidth = 2, className }) => (
  <svg {...base(size)} strokeWidth={strokeWidth} className={className}>
    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z" />
    <circle cx="12" cy="12" r="3" />
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

export const IconMenu: React.FC<IconProps> = ({ size = 22, strokeWidth = 2, className }) => (
  <svg {...base(size)} strokeWidth={strokeWidth} className={className}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);

export const IconClose: React.FC<IconProps> = ({ size = 22, strokeWidth = 2, className }) => (
  <svg {...base(size)} strokeWidth={strokeWidth} className={className}>
    <path d="M6 6l12 12M18 6L6 18" />
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
