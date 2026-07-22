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

/** 문자열 → 0 이상의 안정적인 해시. 빌드마다 같은 결과가 나와야 하므로 난수를 쓰지 않는다. */
const stableHash = (seed: string): number => {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 100000;
  }
  return hash;
};

/** 문자열 → 안정적인 accent. */
export const pickAccent = (seed: string): CSSProperties => accentVars(ACCENTS[stableHash(seed) % ACCENTS.length]);

// ============================================================
// 썸네일 일러스트 변형 (PostThumbnail)
// frontmatter의 thumbVariant가 있으면 그대로, 없으면
// 키워드·제목에서 추론하고, 그것도 안 되면 슬러그 해시로 돌린다.
// ============================================================

const THUMB_VARIANTS = ['browser', 'code-check', 'warning-list', 'table', 'pipeline', 'theme-split'] as const;

export type ThumbVariant = (typeof THUMB_VARIANTS)[number];

/** 주제 → 변형 추론 규칙. 위에서부터 먼저 걸리는 쪽이 이긴다.
 *  UUID의 "ui", Context API의 "api"처럼 단어 안 부분 일치로 새는 걸 막으려고
 *  영문 약어에는 \b 바운더리를 건다. */
const VARIANT_RULES: ReadonlyArray<readonly [RegExp, ThumbVariant]> = [
  [/다크|테마|theme|css|스타일|디자인|반응형|\bui\b|\bux\b/i, 'theme-split'],
  [/eslint|lint|경고|warning|compiler|디버깅|debug|에러|error|트러블/i, 'warning-list'],
  [/grid|table|테이블|scroll|스크롤|jpa|entity|\bdb\b|sql|batch|데이터/i, 'table'],
  [/zod|타입|\btype\b|schema|openapi|\bapi\b|검증|\btest\b|테스트|idempoten|멱등/i, 'code-check'],
  [/\bci\b|배포|deploy|actions|runner|pipeline|flyway|rollback|infra|\bftp\b|프로토콜/i, 'pipeline'],
  [/브라우저|접근성|a11y|웹|react|next|프론트|렌더|\bfe\b|\bsse\b|실시간/i, 'browser'],
];

const isThumbVariant = (value: string): value is ThumbVariant =>
  (THUMB_VARIANTS as readonly string[]).includes(value);

export const pickVariant = (
  explicit: string | null | undefined,
  keywords: (string | null)[] | null | undefined,
  title: string,
  slug: string,
): ThumbVariant => {
  if (explicit && isThumbVariant(explicit)) return explicit;

  const haystack = [...(keywords ?? []), title].filter(Boolean).join(' ');
  const matched = VARIANT_RULES.find(([pattern]) => pattern.test(haystack));
  if (matched) return matched[1];

  return THUMB_VARIANTS[stableHash(slug) % THUMB_VARIANTS.length];
};
