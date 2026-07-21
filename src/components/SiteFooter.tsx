import * as React from 'react';
import styled from '@emotion/styled';
import { Link } from 'gatsby';
import { IconArrowRight } from './icons';
import VisitorCount from './VisitorCount';

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

/*
 * 저작권 줄. 구분선을 긋지 않는다 — 선이 있으면 CTA와 저작권이
 * 두 개의 상자처럼 갈라져 보인다. 여백과 옅은 색으로만 가라앉힌다.
 */
const Meta = styled.div<{ divided: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-top: ${(p) => (p.divided ? 'var(--space-12)' : '0')};
  color: var(--color-text-tertiary);
  font-size: var(--fs-caption);
  line-height: var(--lh-relaxed);

  .sub {
    opacity: 0.6;
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
            <Title>차근차근, 하나씩 쌓아가는 중</Title>
            <Description>무엇을 만들고, 무엇에 부딪혔는지.</Description>
          </Copy>
          <Action to="/about/">
            소개 보기
            <IconArrowRight />
          </Action>
        </Cta>
      )}

      <Meta divided={showCta}>
        <VisitorCount />
        <span>© {new Date().getFullYear()} Dev.log · ulongchas2</span>
        <span className="sub">Built with Gatsby & ❤️</span>
      </Meta>
    </Inner>
  </Band>
);

export default SiteFooter;
