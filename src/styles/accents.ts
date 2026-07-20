import type { CSSProperties } from 'react';

// ============================================================
// Accent 배정
// 썸네일 이미지가 없는 포스트에 색을 입힌다.
// 슬러그 해시로 고르므로 같은 글은 항상 같은 색이고,
// 목록에서 색이 반복되지 않게 4종을 돌린다.
// ============================================================

const ACCENTS = ['mint', 'pink', 'yellow', 'blue'] as const;

export type AccentName = (typeof ACCENTS)[number];

/** 실제 색은 tokens.css가 모드별로 정의한다. 여기서는 변수 이름만 연결한다. */
export const accentVars = (name: AccentName): CSSProperties =>
  ({
    '--card-accent-surface': `var(--color-accent-${name}-surface)`,
    '--card-accent-ink': `var(--color-accent-${name}-ink)`,
  }) as CSSProperties;

/**
 * 썸네일에 박을 라벨.
 * frontmatter의 keywords 첫 항목을 쓰고, 없으면 카테고리로 떨어진다.
 * 카드·리스트·Featured가 같은 규칙을 쓰도록 여기 한 곳에만 둔다.
 */
export const postLabel = (keywords: (string | null)[] | null | undefined, category: string): string => {
  const first = keywords?.find((k) => typeof k === 'string' && k.trim().length > 0);
  return first ? first.trim() : category;
};

/** 문자열 → 안정적인 accent. 빌드마다 같은 결과가 나와야 하므로 난수를 쓰지 않는다. */
export const pickAccent = (seed: string): CSSProperties => {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 100000;
  }
  return accentVars(ACCENTS[hash % ACCENTS.length]);
};
