import * as React from 'react';
import { Link } from 'gatsby';
import Layout from '../components/GlobalLayout';
import styled from '@emotion/styled';

// ============================================================
// 404 Page — New Token API
// Uses CSS var() tokens from tokens.css for theme responsiveness
// ============================================================

const NotFoundContainer = styled.div`
  text-align: center;
  padding: var(--space-16) var(--space-4);
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const ErrorCode = styled.h1`
  font-size: 5rem;
  font-weight: var(--fw-extrabold);
  color: var(--color-brand-primary);
  margin: 0 0 var(--space-4) 0;
  letter-spacing: var(--ls-tighter);
  line-height: 1;

  @media (min-width: 768px) {
    font-size: 7rem;
  }
`;

const ErrorMessage = styled.h2`
  font-size: var(--fs-title-md);
  font-weight: var(--fw-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-4) 0;
  letter-spacing: var(--ls-tight);

  @media (min-width: 768px) {
    font-size: var(--fs-title-lg);
  }
`;

const ErrorDescription = styled.p`
  font-size: var(--fs-body-md);
  color: var(--color-text-secondary);
  margin: 0 0 var(--space-8) 0;
  max-width: 500px;
  line-height: var(--lh-relaxed);

  @media (min-width: 768px) {
    font-size: var(--fs-body-lg);
  }
`;

const LinksContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  width: 100%;
  max-width: 400px;

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: center;
  }
`;

const LinkButton = styled(Link)`
  display: inline-block;
  padding: var(--space-3) var(--space-6);
  background: var(--color-brand-primary);
  color: white;
  text-decoration: none;
  border-radius: var(--radius-md);
  font-weight: var(--fw-semibold);
  font-size: var(--fs-body-md);
  transition: all var(--transition-base);
  border: 1px solid transparent;

  &:hover {
    background: var(--color-brand-hover);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }

  &:active {
    transform: translateY(0);
  }
`;

const SecondaryButton = styled(Link)`
  display: inline-block;
  padding: var(--space-3) var(--space-6);
  background: var(--color-bg-subtle);
  color: var(--color-text-primary);
  text-decoration: none;
  border-radius: var(--radius-md);
  font-weight: var(--fw-semibold);
  font-size: var(--fs-body-md);
  border: 1px solid var(--color-border-default);
  transition: all var(--transition-base);

  &:hover {
    border-color: var(--color-brand-primary);
    background: var(--color-interactive-hover);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const Emoji = styled.div`
  font-size: 4rem;
  margin-bottom: var(--space-6);
  animation: bounce 2s ease-in-out infinite;

  @keyframes bounce {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-16px);
    }
  }
`;

const NotFoundPage = () => (
  <Layout>
      <NotFoundContainer>
        <Emoji>🔍</Emoji>
        <ErrorCode>404</ErrorCode>
        <ErrorMessage>페이지를 찾을 수 없습니다</ErrorMessage>
        <ErrorDescription>
          요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다. 아래 링크를 통해 원하시는 페이지로 이동해보세요.
        </ErrorDescription>
        <LinksContainer>
          <LinkButton to="/">홈으로 가기</LinkButton>
          <SecondaryButton to="/study/">스터디 보기</SecondaryButton>
          <SecondaryButton to="/project/">프로젝트 보기</SecondaryButton>
        </LinksContainer>
      </NotFoundContainer>
    </Layout>
);

export const Head = () => (
  <>
    <title>404 - 페이지를 찾을 수 없습니다 | UlongChaS2.log</title>
    <meta name="description" content="요청하신 페이지를 찾을 수 없습니다." />
  </>
);

export default NotFoundPage;
