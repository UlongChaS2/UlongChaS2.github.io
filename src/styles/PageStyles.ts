import styled from '@emotion/styled';
import { Link } from 'gatsby';

// ============================================================
// Page Layout Styles — Daangn Blog Style
// ============================================================

export const PageWrapper = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-10) var(--space-6);

  @media (min-width: 768px) {
    padding: var(--space-12) var(--space-8);
  }
`;

export const PageHeader = styled.div`
  margin-bottom: var(--space-10);

  @media (min-width: 768px) {
    margin-bottom: var(--space-12);
  }
`;

export const PageTitle = styled.h1`
  font-size: var(--fs-display-md);
  font-weight: var(--fw-extrabold);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-3) 0;
  letter-spacing: -0.035em;
  line-height: var(--lh-tight);
  word-break: keep-all;

  @media (min-width: 768px) {
    font-size: 44px;
  }
`;

export const PageSubtitle = styled.p`
  font-size: var(--fs-body-md);
  color: var(--color-text-secondary);
  max-width: 560px;
  margin: 0;
  line-height: var(--lh-relaxed);
  word-break: keep-all;
`;

/* ----------------------------------------------------------
   Featured Post (최상단 대형 카드 — 당근 블로그 스타일)
   ---------------------------------------------------------- */
export const FeaturedCard = styled.article`
  position: relative;
  margin-bottom: var(--space-16);
  background: var(--color-bg-default);

  /* 카드 껍데기를 씌우지 않는다. 썸네일만 라운드를 갖고 본문은 배경 위에 그대로 앉는다. */
  @media (min-width: 768px) {
    display: grid;
    grid-template-columns: 520px 1fr;
    gap: var(--space-12);
    align-items: center;
  }
`;

export const FeaturedImageWrapper = styled.div`
  width: 100%;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  border-radius: var(--radius-2xl);
  background: var(--color-bg-subtle);
  flex-shrink: 0;

  .gatsby-image-wrapper {
    width: 100%;
    height: 100%;
  }

  img {
    object-fit: cover;
    width: 100%;
    height: 100%;
    transition: transform var(--transition-slow);
  }

  ${FeaturedCard}:hover & img {
    transform: scale(1.03);
  }
`;

export const FeaturedContent = styled.div`
  padding: var(--space-6) 0 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: var(--space-4);

  @media (min-width: 768px) {
    padding: 0;
  }
`;

export const FeaturedBadge = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-3);
`;

export const FeaturedLabel = styled.span`
  font-size: var(--fs-caption);
  font-weight: var(--fw-bold);
  color: var(--color-text-inverse);
  letter-spacing: var(--ls-wide);
  text-transform: uppercase;
  background: var(--color-brand-primary);
  padding: 6px var(--space-3);
  border-radius: var(--radius-full);
`;

export const FeaturedCategoryTag = styled.span`
  font-size: var(--fs-caption);
  font-weight: var(--fw-medium);
  color: var(--color-text-tertiary);
  letter-spacing: var(--ls-normal);
  text-transform: uppercase;
`;

export const FeaturedTitle = styled.h2`
  font-size: var(--fs-title-lg);
  font-weight: var(--fw-extrabold);
  color: var(--color-text-primary);
  margin: 0;
  line-height: var(--lh-snug);
  letter-spacing: var(--ls-tight);
  word-break: keep-all;

  @media (min-width: 768px) {
    font-size: var(--fs-title-xl);
  }
`;

export const FeaturedExcerpt = styled.p`
  font-size: var(--fs-body-md);
  color: var(--color-text-secondary);
  margin: 0;
  line-height: var(--lh-relaxed);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: keep-all;
`;

export const FeaturedMeta = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-3);
  font-size: var(--fs-body-sm);
  color: var(--color-text-tertiary);
  margin-top: var(--space-2);
`;

export const FeaturedLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  display: contents;
`;

/* ----------------------------------------------------------
   Section Header
   ---------------------------------------------------------- */
export const SectionHeader = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: var(--space-8);
`;

export const SectionTitle = styled.h2`
  font-size: var(--fs-title-md);
  font-weight: var(--fw-bold);
  color: var(--color-text-primary);
  margin: 0;
  letter-spacing: var(--ls-tight);

  @media (min-width: 768px) {
    font-size: var(--fs-title-lg);
  }
`;

export const SectionMore = styled(Link)`
  font-size: var(--fs-body-sm);
  color: var(--color-brand-primary);
  text-decoration: none;
  font-weight: var(--fw-medium);
  display: flex;
  align-items: center;
  gap: var(--space-1);
  transition: gap var(--transition-fast);

  &:hover {
    gap: var(--space-2);
  }

  &::after {
    content: '→';
  }
`;

/* ----------------------------------------------------------
   Post Grid
   ---------------------------------------------------------- */
export const PostGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-8);

  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-8) var(--space-6);
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

export const Section = styled.section`
  margin-bottom: var(--space-20);
`;

/* ----------------------------------------------------------
   Empty State
   ---------------------------------------------------------- */
export const EmptyState = styled.div`
  text-align: center;
  padding: var(--space-20) var(--space-4);
  color: var(--color-text-tertiary);

  p {
    font-size: var(--fs-title-sm);
    color: var(--color-text-secondary);
    line-height: var(--lh-relaxed);
    word-break: keep-all;
  }
`;

/* ----------------------------------------------------------
   Home Hero
   ---------------------------------------------------------- */
export const HomeHero = styled.section`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: var(--space-16) 0 var(--space-12);

  @media (min-width: 768px) {
    padding: var(--space-24) 0 var(--space-16);
  }
`;

export const HeroChip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: 7px var(--space-4) 7px 10px;
  border-radius: var(--radius-full);
  background: var(--color-bg-subtle);
  color: var(--color-text-secondary);
  font-size: 13px;
  font-weight: var(--fw-semibold);
  margin-bottom: var(--space-6);

  &::before {
    content: '';
    width: 18px;
    height: 18px;
    border-radius: var(--radius-full);
    background: var(--color-highlighter);
    flex-shrink: 0;
  }
`;

export const HeroHeadline = styled.h1`
  font-size: 36px;
  font-weight: var(--fw-extrabold);
  letter-spacing: -0.035em;
  line-height: 1.25;
  color: var(--color-text-primary);
  margin: 0;
  word-break: keep-all;

  @media (min-width: 768px) {
    font-size: 56px;
  }
`;

/**
 * 형광펜 밑줄. 글자 뒤에 깔리므로 배경 그라디언트로 처리한다.
 * 별도 요소를 절대배치하면 줄바꿈 지점이 바뀔 때 어긋난다.
 */
export const HeroHighlight = styled.span`
  /*
   * 두께는 background-size로 잡는다.
   * inline 요소의 background 박스는 line-height가 아니라 font-size를 따라가므로
   * position을 em으로 밀면 글자 크기가 바뀔 때마다 어긋난다.
   */
  background-image: linear-gradient(var(--color-highlighter), var(--color-highlighter));
  background-size: 100% 0.24em;
  background-position: 0 88%;
  background-repeat: no-repeat;
`;

export const HeroLede = styled.p`
  font-size: var(--fs-body-lg);
  font-weight: var(--fw-normal);
  line-height: var(--lh-loose);
  color: var(--color-text-secondary);
  max-width: 520px;
  margin: var(--space-5) 0 0;
  word-break: keep-all;

  @media (min-width: 768px) {
    font-size: 18px;
  }
`;

/* ----------------------------------------------------------
   Filter Chips (목록 페이지)
   ---------------------------------------------------------- */
export const ChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-bottom: var(--space-10);
`;

export const Chip = styled.button<{ selected?: boolean }>`
  padding: 10px var(--space-5);
  border: none;
  border-radius: var(--radius-full);
  cursor: pointer;
  font-family: inherit;
  font-size: var(--fs-body-sm);
  letter-spacing: var(--ls-tight);
  transition: background var(--transition-fast), color var(--transition-fast);
  background: ${(p) => (p.selected ? 'var(--color-text-primary)' : 'var(--color-bg-subtle)')};
  color: ${(p) => (p.selected ? 'var(--color-bg-default)' : 'var(--color-text-secondary)')};
  font-weight: ${(p) => (p.selected ? 'var(--fw-semibold)' : 'var(--fw-medium)')};

  &:hover {
    color: ${(p) => (p.selected ? 'var(--color-bg-default)' : 'var(--color-text-primary)')};
  }
`;

/* ----------------------------------------------------------
   Post List (목록 페이지 — 카드 대신 행)
   ---------------------------------------------------------- */
export const PostList = styled.div`
  display: flex;
  flex-direction: column;
`;

export const PostRowLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: var(--space-8);
  padding: var(--space-6) 0;
  border-bottom: 1px solid var(--color-border-subtle);
  text-decoration: none;
  color: inherit;

  &:last-of-type {
    border-bottom: none;
  }

  @media (max-width: 639px) {
    gap: var(--space-4);
  }
`;

/** 고정 폭 슬롯 — 행마다 제목 시작점이 같은 세로선에 놓이도록 한다. */
export const RowThumb = styled.div`
  width: 104px;
  height: 104px;
  border-radius: 18px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--card-accent-surface);
  color: var(--card-accent-ink);
  font-family: var(--font-mono);
  font-size: 17px;
  font-weight: var(--fw-semibold);
  overflow: hidden;

  @media (max-width: 639px) {
    width: 72px;
    height: 72px;
    font-size: 13px;
  }
`;

export const RowBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  flex: 1;
  max-width: 820px;
  min-width: 0;
`;

export const RowTitle = styled.h2`
  font-size: var(--fs-title-md);
  font-weight: var(--fw-bold);
  letter-spacing: var(--ls-tight);
  line-height: var(--lh-snug);
  color: var(--color-text-primary);
  margin: 0;
  word-break: keep-all;

  @media (min-width: 768px) {
    font-size: 21px;
  }
`;

export const RowExcerpt = styled.p`
  font-size: var(--fs-body-md);
  line-height: var(--lh-relaxed);
  color: var(--color-text-secondary);
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: keep-all;
`;

export const RowMeta = styled.span`
  font-size: 13px;
  font-weight: var(--fw-medium);
  color: var(--color-text-tertiary);
`;

/** 비어 보여도 유지되는 고정 슬롯 — 행마다 화살표가 같은 세로선에 선다. */
export const RowAction = styled.span`
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  background: var(--color-bg-subtle);
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  @media (max-width: 639px) {
    display: none;
  }
`;

export const SearchButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: 11px var(--space-5);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--color-text-tertiary);
  font-family: inherit;
  font-size: var(--fs-body-sm);
  font-weight: var(--fw-medium);
  cursor: pointer;
  flex-shrink: 0;
  transition: border-color var(--transition-fast), color var(--transition-fast);

  &:hover {
    border-color: var(--color-border-strong);
    color: var(--color-text-primary);
  }
`;

/* ---------- 아래는 하위 호환용 (기존 페이지에서 사용) ---------- */
export const Hero = styled.section`
  padding: var(--space-12) 0 var(--space-10);
`;

export const HeroTitle = styled.h1`
  font-size: var(--fs-title-xl);
  font-weight: var(--fw-extrabold);
  letter-spacing: var(--ls-tight);
  line-height: var(--lh-tight);
  margin: 0 0 var(--space-4) 0;
  color: var(--color-text-primary);
  word-break: keep-all;

  @media (min-width: 768px) {
    font-size: var(--fs-display-md);
  }
`;

export const HeroSubtitle = styled.p`
  font-size: var(--fs-body-lg);
  color: var(--color-text-secondary);
  max-width: 560px;
  margin: 0;
  line-height: var(--lh-relaxed);
  word-break: keep-all;
`;
