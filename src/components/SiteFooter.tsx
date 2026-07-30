import * as React from 'react';
import styled from '@emotion/styled';
import { Link } from 'gatsby';
import { IconArrowRight } from './icons';
import VisitorCount from './VisitorCount';

// ============================================================
// SiteFooter — 짧은 문구와 저작권을 한 줄로 정리한 하단 메타
// Layout이 모든 페이지 끝에 한 번 렌더한다.
// ============================================================

const Band = styled.footer`
  background: var(--color-bg-subtle);
  padding: var(--space-6) var(--space-6);

  @media (min-width: 768px) {
    padding: var(--space-8) var(--space-8);
  }
`;

const Inner = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
`;

const FooterTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-6);

  @media (max-width: 640px) {
    align-items: flex-start;
    flex-direction: column;
    gap: var(--space-4);
  }
`;

const MetaLine = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3);
  min-width: 0;
  font-size: var(--fs-caption);
  line-height: var(--lh-relaxed);
  color: var(--color-text-tertiary);
`;

const Tagline = styled.span`
  font-weight: var(--fw-semibold);
  color: var(--color-text-secondary);
`;

const Divider = styled.span`
  width: 1px;
  height: 12px;
  background: var(--color-border-default);

  @media (max-width: 480px) {
    display: none;
  }
`;

const Action = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: 9px var(--space-4);
  border-radius: 10px;
  background: var(--color-brand-primary);
  color: var(--color-text-inverse);
  font-size: var(--fs-body-sm);
  font-weight: var(--fw-bold);
  letter-spacing: var(--ls-tight);
  text-decoration: none;
  flex-shrink: 0;
  transition: background var(--transition-fast);

  &:hover {
    background: var(--color-brand-hover);
    color: var(--color-text-inverse);
  }
`;

const SiteFooter: React.FC = () => (
  <Band>
    <Inner>
      <FooterTop>
        <MetaLine>
          <Tagline>차근차근, 하나씩 쌓아가는 중</Tagline>
          <Divider />
          <span>© {new Date().getFullYear()} UlongChaS2.log · ulongchas2</span>
        </MetaLine>
        <Action to="/about/">
          소개 보기
          <IconArrowRight size={15} />
        </Action>
      </FooterTop>
      <VisitorCount />
    </Inner>
  </Band>
);

export default SiteFooter;
