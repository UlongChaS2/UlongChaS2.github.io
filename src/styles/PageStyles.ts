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
  font-size: var(--fs-title-xl);
  font-weight: var(--fw-extrabold);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-3) 0;
  letter-spacing: var(--ls-tight);
  line-height: var(--lh-tight);
  word-break: keep-all;

  @media (min-width: 768px) {
    font-size: var(--fs-display-md);
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
  border-radius: var(--radius-xl);
  overflow: hidden;
  margin-bottom: var(--space-16);
  background: var(--color-bg-card);
  box-shadow: var(--shadow-sm);
  transition: box-shadow var(--transition-base), transform var(--transition-base);

  &:hover {
    box-shadow: var(--shadow-card-hover);
    transform: translateY(-2px);
  }

  @media (min-width: 768px) {
    display: grid;
    grid-template-columns: 1fr 1fr;
    min-height: 400px;
  }

  @media (min-width: 1024px) {
    grid-template-columns: 1.2fr 1fr;
    min-height: 440px;
  }
`;

export const FeaturedImageWrapper = styled.div`
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: var(--color-bg-subtle);
  flex-shrink: 0;

  @media (min-width: 768px) {
    aspect-ratio: unset;
    height: 100%;
  }

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

export const FeaturedNoThumbnail = styled.div`
  width: 100%;
  height: 100%;
  min-height: 240px;
  background: linear-gradient(
    135deg,
    var(--color-brand-subtle) 0%,
    var(--color-interactive-hover) 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  opacity: 0.4;
`;

export const FeaturedContent = styled.div`
  padding: var(--space-8) var(--space-6);
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: var(--space-4);

  @media (min-width: 768px) {
    padding: var(--space-10) var(--space-8);
  }
`;

export const FeaturedBadge = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-3);
`;

export const FeaturedLabel = styled.span`
  font-size: var(--fs-caption);
  font-weight: var(--fw-semibold);
  color: var(--color-brand-primary);
  letter-spacing: var(--ls-wide);
  text-transform: uppercase;
  background: var(--color-brand-subtle);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
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

  .emoji {
    font-size: 3rem;
    margin-bottom: var(--space-6);
    display: block;
    opacity: 0.5;
  }

  p {
    font-size: var(--fs-title-sm);
    color: var(--color-text-secondary);
    line-height: var(--lh-relaxed);
    word-break: keep-all;
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
