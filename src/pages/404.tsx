import * as React from 'react';
import { Link } from 'gatsby';
import Layout from '../components/GlobalLayout';
import GlobalStyles from '../components/GlobalStyles';
import styled from '@emotion/styled';
import { theme } from 'src/styles/theme';

const NotFoundContainer = styled.div`
  text-align: center;
  padding: ${theme.spacing['3xl']} ${theme.spacing.md};
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const ErrorCode = styled.h1`
  font-size: ${theme.fontSize['5xl']};
  font-weight: ${theme.fontWeight.bold};
  color: ${theme.colors.primary};
  margin: 0 0 ${theme.spacing.lg} 0;

  @media (min-width: ${theme.breakpoints.tablet}) {
    font-size: 6rem;
  }
`;

const ErrorMessage = styled.h2`
  font-size: ${theme.fontSize['2xl']};
  font-weight: ${theme.fontWeight.semibold};
  color: var(--color-text-primary);
  margin: 0 0 ${theme.spacing.md} 0;

  @media (min-width: ${theme.breakpoints.tablet}) {
    font-size: ${theme.fontSize['3xl']};
  }
`;

const ErrorDescription = styled.p`
  font-size: ${theme.fontSize.base};
  color: var(--color-text-secondary);
  margin: 0 0 ${theme.spacing['2xl']} 0;
  max-width: 600px;
  line-height: 1.6;

  @media (min-width: ${theme.breakpoints.tablet}) {
    font-size: ${theme.fontSize.lg};
  }
`;

const LinksContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  width: 100%;
  max-width: 400px;

  @media (min-width: ${theme.breakpoints.tablet}) {
    flex-direction: row;
    justify-content: center;
  }
`;

const LinkButton = styled(Link)`
  display: inline-block;
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  background: ${theme.colors.primary};
  color: white;
  text-decoration: none;
  border-radius: ${theme.borderRadius.md};
  font-weight: ${theme.fontWeight.semibold};
  transition: all ${theme.transition.base};

  &:hover {
    background: ${theme.colors.secondary};
    transform: translateY(-2px);
    box-shadow: ${theme.shadow.md};
  }
`;

const SecondaryButton = styled(Link)`
  display: inline-block;
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  background: var(--color-surface);
  color: var(--color-text-primary);
  text-decoration: none;
  border-radius: ${theme.borderRadius.md};
  font-weight: ${theme.fontWeight.semibold};
  border: 1px solid var(--color-border);
  transition: all ${theme.transition.base};

  &:hover {
    border-color: ${theme.colors.primary};
    background: var(--color-hover);
  }
`;

const Emoji = styled.div`
  font-size: 5rem;
  margin-bottom: ${theme.spacing.xl};
  animation: bounce 2s ease-in-out infinite;

  @keyframes bounce {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-20px);
    }
  }
`;

const NotFoundPage = () => (
  <>
    <GlobalStyles />
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
  </>
);

export const Head = () => (
  <>
    <title>404 - 페이지를 찾을 수 없습니다 | Dev.log</title>
    <meta name="description" content="요청하신 페이지를 찾을 수 없습니다." />
  </>
);

export default NotFoundPage;
