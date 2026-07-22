import * as React from 'react';
import styled from '@emotion/styled';

// ============================================================
// 썸네일 일러스트 공용 프리미티브
// 모든 그림은 이 조각들로만 조립한다 — 카드마다 그림이 달라도
// 시각 언어(흰 표면, 둥근 막대, 액센트 잉크)는 하나로 유지된다.
// 색은 부모(PostThumbnail)가 주입한 --card-accent-* 변수를 쓴다.
// ============================================================

/** 흰 목업 카드 표면. 그림 하나당 보통 한 장. */
export const Surface = styled.div`
  width: 170px;
  background: var(--color-bg-card);
  border: 1px solid color-mix(in srgb, var(--card-accent-ink) 22%, transparent);
  border-radius: var(--radius-md);
  overflow: hidden;
  position: relative;
`;

/** 텍스트를 추상화한 둥근 막대 */
export const Bar = styled.span<{ w: number; tone?: 'muted' | 'accent' | 'soft' }>`
  display: block;
  width: ${({ w }) => w}px;
  height: 7px;
  border-radius: 4px;
  flex-shrink: 0;
  background: ${({ tone = 'muted' }) =>
    tone === 'accent'
      ? 'var(--card-accent-ink)'
      : tone === 'soft'
        ? 'color-mix(in srgb, var(--card-accent-ink) 30%, transparent)'
        : 'var(--color-border-default)'};
`;

export const HStack = styled.div<{ gap?: number }>`
  display: flex;
  align-items: center;
  gap: ${({ gap = 7 }) => gap}px;
`;

export const VStack = styled.div<{ gap?: number; pad?: string }>`
  display: flex;
  flex-direction: column;
  /* stretch 기본값이면 칩·배지가 폭 전체로 늘어난다 */
  align-items: flex-start;
  gap: ${({ gap = 8 }) => gap}px;
  padding: ${({ pad = '12px 14px' }) => pad};
`;

/** 브라우저/터미널 상단 바 (신호등 점 3개) */
export const WindowBar = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 7px 10px;
  background: var(--color-bg-subtle);
  border-bottom: 1px solid var(--color-border-subtle);

  span {
    width: 6px;
    height: 6px;
    border-radius: var(--radius-full);
    background: var(--color-border-strong);
  }
`;

export const WindowDots: React.FC = () => (
  <WindowBar>
    <span />
    <span />
    <span />
  </WindowBar>
);

/** 짧은 모노 텍스트 라벨 (V2, 502, new 같은 실제 글자가 필요할 때) */
export const Mono = styled.span<{ size?: number; tone?: 'accent' | 'muted' }>`
  font-family: var(--font-mono);
  font-size: ${({ size = 9 }) => size}px;
  font-weight: var(--fw-bold);
  line-height: 1;
  color: ${({ tone = 'accent' }) => (tone === 'accent' ? 'var(--card-accent-ink)' : 'var(--color-text-tertiary)')};
`;

/** 모노 라벨 칩 */
export const Chip = styled.span<{ filled?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 3px 6px;
  border-radius: var(--radius-sm);
  flex-shrink: 0;
  background: ${({ filled }) => (filled ? 'var(--card-accent-ink)' : 'var(--card-accent-surface)')};
  border: 1px solid var(--card-accent-ink);

  ${Mono} {
    color: ${({ filled }) => (filled ? 'var(--color-bg-card)' : 'var(--card-accent-ink)')};
  }
`;

/** 아이콘을 담는 동그란 배지 */
export const Badge = styled.span<{ filled?: boolean; size?: number }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${({ size = 15 }) => size}px;
  height: ${({ size = 15 }) => size}px;
  border-radius: var(--radius-full);
  flex-shrink: 0;
  background: ${({ filled }) => (filled ? 'var(--card-accent-ink)' : 'var(--card-accent-surface)')};
  border: 1px solid var(--card-accent-ink);
  color: ${({ filled }) => (filled ? 'var(--color-bg-card)' : 'var(--card-accent-ink)')};
`;

/** 시리즈 번호 배지 — 안정화기 (1)/(2)처럼 연작 표시용 */
export const SeriesBadge: React.FC<{ n: number }> = ({ n }) => (
  <Badge filled size={18}>
    <Mono size={10} style={{ color: 'inherit' }}>
      {n}
    </Mono>
  </Badge>
);

/** 파이프라인 스텝 연결선 */
export const StepLine = styled.span<{ done?: boolean; w?: number }>`
  width: ${({ w = 24 }) => w}px;
  height: 2px;
  flex-shrink: 0;
  background: ${({ done }) => (done ? 'var(--card-accent-ink)' : 'var(--color-border-default)')};
`;

/* ---------- 그림 전용 미니 svg 아이콘 ----------
   사이트 UI용 icons.tsx와 달리 썸네일 그림에서만 쓰는 모양들 */

export const GithubMark: React.FC<{ size?: number }> = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" aria-hidden>
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
  </svg>
);

export const DbCylinder: React.FC<{ size?: number }> = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
    <ellipse cx="10" cy="4.5" rx="6.5" ry="2.5" />
    <path d="M3.5 4.5V15.5C3.5 16.88 6.41 18 10 18C13.59 18 16.5 16.88 16.5 15.5V4.5" />
    <path d="M3.5 10C3.5 11.38 6.41 12.5 10 12.5C13.59 12.5 16.5 11.38 16.5 10" />
  </svg>
);

export const BellIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
    <path d="M5 8a5 5 0 0 1 10 0c0 3 1 4.5 1.8 5.4.3.3.1 1.1-.4 1.1H3.6c-.5 0-.7-.8-.4-1.1C4 12.5 5 11 5 8Z" strokeLinejoin="round" />
    <path d="M8.5 17a1.8 1.8 0 0 0 3 0" strokeLinecap="round" />
  </svg>
);

export const FolderIcon: React.FC<{ size?: number }> = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" aria-hidden>
    <path d="M1.5 3.5C1.5 2.95 1.95 2.5 2.5 2.5H6L7.5 4H13.5C14.05 4 14.5 4.45 14.5 5V12C14.5 12.55 14.05 13 13.5 13H2.5C1.95 13 1.5 12.55 1.5 12V3.5Z" />
  </svg>
);

export const PulseLine: React.FC<{ w?: number; h?: number }> = ({ w = 64, h = 20 }) => (
  <svg width={w} height={h} viewBox="0 0 64 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
    <path d="M0 10H14L19 4L26 16L32 7L36 10H64" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ArrowRightSm: React.FC<{ size?: number }> = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
    <path d="M2 7H12M8 3L12 7L8 11" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ArrowUturnSm: React.FC<{ size?: number }> = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
    <path d="M12 4H5A3 3 0 0 0 5 10H8M6 2L4 4L6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
