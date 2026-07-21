import * as React from 'react';
import styled from '@emotion/styled';
import { Link } from 'gatsby';
import { IconArrowRight } from './icons';

// ============================================================
// SiteFooter — 소개 CTA + 저작권을 한 밴드로 묶은 하단 영역
// Layout이 모든 페이지 끝에 한 번 렌더한다.
// about 페이지처럼 CTA가 무의미한 곳은 showCta={false}로 저작권만 남긴다.
// ============================================================

const Band = styled.footer`
  background: var(--color-bg-subtle);
  padding: var(--space-12) var(--space-6) var(--space-8);

  @media (min-width: 768px) {
    padding: var(--space-16) var(--space-8) var(--space-10);
  }
`;

const Inner = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
`;

const Cta = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-6);

  @media (min-width: 768px) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
`;

const Copy = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
`;

const Title = styled.p`
  font-size: 22px;
  font-weight: var(--fw-extrabold);
  letter-spacing: var(--ls-tighter);
  color: var(--color-text-primary);
  margin: 0;
  word-break: keep-all;
`;

const Description = styled.p`
  font-size: var(--fs-body-md);
  line-height: var(--lh-relaxed);
  color: var(--color-text-secondary);
  margin: 0;
  word-break: keep-all;
`;

const Action = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: 14px var(--space-6);
  border-radius: 14px;
  background: var(--color-brand-primary);
  color: var(--color-text-inverse);
  font-size: var(--fs-body-md);
  font-weight: var(--fw-bold);
  letter-spacing: var(--ls-tight);
  text-decoration: none;
  flex-shrink: 0;
  transition: background var(--transition-fast);

  &:hover {
    background: var(--color-brand-hover);
  }
`;

/** CTA와 저작권 사이 구분선. CTA가 없으면 위쪽 여백만 남긴다. */
const Meta = styled.div<{ divided: boolean }>`
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  margin-top: ${(p) => (p.divided ? 'var(--space-10)' : '0')};
  padding-top: ${(p) => (p.divided ? 'var(--space-8)' : '0')};
  border-top: ${(p) => (p.divided ? '1px solid var(--color-border-default)' : 'none')};
  color: var(--color-text-tertiary);
  font-size: var(--fs-body-sm);
  line-height: var(--lh-relaxed);

  .sub {
    font-size: var(--fs-caption);
    opacity: 0.7;
  }
`;

interface SiteFooterProps {
  showCta?: boolean;
}

const SiteFooter: React.FC<SiteFooterProps> = ({ showCta = true }) => (
  <Band>
    <Inner>
      {showCta && (
        <Cta>
          <Copy>
            <Title>천천히, 그렇지만 매주 하나씩</Title>
            <Description>어떤 사람이 쓰는 글인지 궁금하다면.</Description>
          </Copy>
          <Action to="/about/">
            소개 보기
            <IconArrowRight />
          </Action>
        </Cta>
      )}

      <Meta divided={showCta}>
        <span>© {new Date().getFullYear()} Dev.log · ulongchas2</span>
        <span className="sub">Built with Gatsby & ❤️</span>
      </Meta>
    </Inner>
  </Band>
);

export default SiteFooter;
