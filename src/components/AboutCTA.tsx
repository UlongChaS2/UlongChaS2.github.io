import * as React from 'react';
import styled from '@emotion/styled';
import { Link } from 'gatsby';
import { IconArrowRight } from './icons';

// ============================================================
// AboutCTA — 홈/목록/포스트 하단 공통 푸터 배너
// 소개 페이지로 보내는 것이 유일한 목적이다.
// ============================================================

const Band = styled.section`
  background: var(--color-bg-subtle);
  padding: var(--space-12) var(--space-6);

  @media (min-width: 768px) {
    padding: var(--space-16) 0;
  }
`;

const Inner = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-6);

  @media (min-width: 768px) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 0 var(--space-8);
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

const AboutCTA: React.FC = () => (
  <Band>
    <Inner>
      <Copy>
        <Title>천천히, 그렇지만 매주 하나씩</Title>
        <Description>어떤 사람이 쓰는 글인지 궁금하다면.</Description>
      </Copy>
      <Action to="/about/">
        소개 보기
        <IconArrowRight />
      </Action>
    </Inner>
  </Band>
);

export default AboutCTA;
