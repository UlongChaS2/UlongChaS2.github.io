// ============================================================
// Design Token System for Personal Blog
// Reference: Toss Feed (spacing/typo) + Daangn (rounding/cards)
//            + ChannelTalk (layout/trust)
// ============================================================

// ----------------------------------------------------------
// 1. Primitive Color Palette (원시 컬러 팔레트)
// ----------------------------------------------------------
export const primitives = {
  // 주의: 아래 값은 tokens.css와 짝을 맞춰야 한다.
  // 현재 Emotion theme을 읽는 컴포넌트는 없으므로 tokens.css가 사실상 단일 소스다.
  brand: {
    50: '#EAF2FE',
    100: '#D6E7FD',
    200: '#ADCCFB',
    300: '#7FAEF9',
    400: '#4E90F7',
    500: '#3182F6', // Primary brand color (Ink Blue)
    600: '#1B64DA', // Hover / active
    700: '#144BAA',
    800: '#0F3A83',
    900: '#0B2A60',
  },
  gray: {
    50: '#F9FAFB',
    100: '#F2F4F6',
    200: '#E5E8EB',
    300: '#D1D6DB',
    400: '#B0B8C1',
    500: '#8B95A1',
    600: '#6B7684',
    700: '#4E5968',
    800: '#333D4B',
    900: '#191F28',
    950: '#0F1319',
  },
  // GitHub-style semantic neutrals (for dark mode realism)
  neutral: {
    canvas: {
      default: '#FFFFFF',
      subtle: '#F6F8FA',
      muted: '#EAEEF2',
    },
    canvasDark: {
      default: '#0D1117',
      subtle: '#161B22',
      muted: '#21262D',
    },
  },
} as const;

// ----------------------------------------------------------
// 2. Semantic Color Tokens (시맨틱 컬러 - Light / Dark)
// ----------------------------------------------------------
export const semantic = {
  light: {
    background: {
      default: '#FFFFFF',
      subtle: '#F6F8FA',
      card: '#FFFFFF',
      code: '#F3F4F6',
    },
    text: {
      primary: '#0D1117',
      secondary: '#57606A',
      tertiary: '#8C959F',
      disabled: '#B1BAC4',
      inverse: '#FFFFFF',
      link: '#3B82F6',
    },
    border: {
      default: '#D0D7DE',
      subtle: '#EAEEF2',
      strong: '#9CA3AF',
    },
    interactive: {
      hover: '#F6F8FA',
      active: '#EFF6FF',
    },
    brand: {
      primary: '#3B82F6',
      hover: '#2563EB',
      subtle: '#EFF6FF',
    },
  },
  dark: {
    background: {
      default: '#0D1117',
      subtle: '#161B22',
      card: '#21262D',
      code: '#2D333B',
    },
    text: {
      primary: '#E6EDF3',
      secondary: '#8B949E',
      tertiary: '#6E7681',
      disabled: '#484F58',
      inverse: '#0D1117',
      link: '#60A5FA',
    },
    border: {
      default: '#30363D',
      subtle: '#21262D',
      strong: '#484F58',
    },
    interactive: {
      hover: '#1C252F',
      active: '#1E3A5F',
    },
    brand: {
      primary: '#60A5FA',
      hover: '#93C5FD',
      subtle: '#1E3A5F',
    },
  },
} as const;

// ----------------------------------------------------------
// 3. Typography (타이포그래피 - Toss-level precision)
// ----------------------------------------------------------
export const typography = {
  fontFamily: {
    // Pretendard: modern Korean sans-serif (CDN via gatsby-browser.js)
    base: "'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Courier New', monospace",
  },
  // Font size scale
  fontSize: {
    'display-lg': '3rem',       // 48px - Hero title
    'display-md': '2.25rem',    // 36px - Page title
    'title-xl': '1.875rem',     // 30px - Section title
    'title-lg': '1.5rem',       // 24px - Sub-section title
    'title-md': '1.25rem',      // 20px - Card title, H3
    'title-sm': '1.125rem',     // 18px - Small title, H4
    'body-lg': '1rem',          // 16px - Main body copy
    'body-md': '0.9375rem',     // 15px - Secondary body
    'body-sm': '0.875rem',      // 14px - Small text
    caption: '0.75rem',         // 12px - Labels, meta info
  },
  // Line height scale
  lineHeight: {
    tight: 1.2,
    snug: 1.3,
    normal: 1.4,
    relaxed: 1.6,
    loose: 1.75, // Toss-level: very readable body text
  },
  // Font weight
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  // Letter spacing
  letterSpacing: {
    tighter: '-0.03em', // Display headings
    tight: '-0.02em',   // Regular headings (Toss style)
    normal: '0em',      // Body text
    wide: '0.02em',     // Uppercase labels
  },
} as const;

// ----------------------------------------------------------
// 4. Spacing (여백 - 4px base, 13 steps)
// ----------------------------------------------------------
export const spacing = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',   // Base unit
  5: '20px',
  6: '24px',   // Primary gap
  8: '32px',   // Section gap (Toss-level generous)
  10: '40px',
  12: '48px',  // Section padding
  16: '64px',  // Large section spacing
  20: '80px',  // Hero / Header spacing
  24: '96px',  // Max page-level spacing
} as const;

// ----------------------------------------------------------
// 5. Border Radius (라운딩 - Daangn-inspired)
// ----------------------------------------------------------
export const borderRadius = {
  none: '0px',
  sm: '6px',     // Buttons, badges
  md: '10px',    // Inputs, small cards
  lg: '16px',    // Cards (Daangn signature)
  xl: '20px',    // Modals, large cards
  '2xl': '28px', // Extra large panels
  full: '9999px', // Tags, avatars, pills
} as const;

// ----------------------------------------------------------
// 6. Shadow (그림자 - 5 levels)
// ----------------------------------------------------------
export const shadow = {
  xs: '0 1px 2px rgba(0, 0, 0, 0.04)',
  sm: '0 2px 8px rgba(0, 0, 0, 0.06)',
  md: '0 4px 16px rgba(0, 0, 0, 0.08)',
  lg: '0 8px 32px rgba(0, 0, 0, 0.12)',
  cardHover: '0 12px 40px rgba(0, 0, 0, 0.14)',
  // Dark mode-appropriate shadows (lower opacity)
  darkSm: '0 2px 8px rgba(0, 0, 0, 0.24)',
  darkMd: '0 4px 16px rgba(0, 0, 0, 0.32)',
  darkLg: '0 8px 32px rgba(0, 0, 0, 0.40)',
} as const;

// ----------------------------------------------------------
// 7. Breakpoints (반응형)
// ----------------------------------------------------------
export const breakpoints = {
  mobile: '375px',
  tablet: '768px',
  desktop: '1024px',
  wide: '1280px',
  ultrawide: '1536px',
} as const;

// Media query helpers
export const media = {
  mobile: `@media (max-width: ${breakpoints.tablet})`,
  tablet: `@media (min-width: ${breakpoints.tablet}) and (max-width: ${breakpoints.desktop})`,
  desktop: `@media (min-width: ${breakpoints.desktop})`,
  wide: `@media (min-width: ${breakpoints.wide})`,
} as const;

// ----------------------------------------------------------
// 8. Transition (인터랙션 애니메이션)
// ----------------------------------------------------------
export const transition = {
  fast: '120ms ease-in-out',
  base: '200ms ease-in-out',
  slow: '320ms ease-in-out',
  spring: '400ms cubic-bezier(0.34, 1.56, 0.64, 1)', // Spring-like
} as const;

// ----------------------------------------------------------
// 9. z-index
// ----------------------------------------------------------
export const zIndex = {
  base: 0,
  dropdown: 100,
  sticky: 200,
  overlay: 300,
  modal: 400,
  toast: 500,
} as const;

// ----------------------------------------------------------
// 10. Unified theme export (Emotion ThemeProvider compatible)
// ----------------------------------------------------------
export const lightTheme = {
  colors: semantic.light,
  typography,
  spacing,
  borderRadius,
  shadow,
  breakpoints,
  media,
  transition,
  zIndex,
  primitives,
};

export const darkTheme = {
  colors: semantic.dark,
  typography,
  spacing,
  borderRadius,
  shadow: {
    ...shadow,
    sm: shadow.darkSm,
    md: shadow.darkMd,
    lg: shadow.darkLg,
  },
  breakpoints,
  media,
  transition,
  zIndex,
  primitives,
};

// Default export: light theme (backward compatibility)
export const theme = lightTheme;

export type Theme = typeof lightTheme;
