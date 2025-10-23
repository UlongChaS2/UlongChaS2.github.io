import React from 'react';
import Layout from 'src/components/GlobalLayout';
import GlobalStyles from 'src/components/GlobalStyles';
import styled from '@emotion/styled';
import { theme } from 'src/styles/theme';
import { PageHeader, PageTitle, PageSubtitle } from 'src/styles/PageStyles';

const AboutSection = styled.section`
  max-width: 800px;
  margin: 0 auto;
`;

const Card = styled.div`
  background: ${theme.colors.background};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.xl};
  margin-bottom: ${theme.spacing.xl};

  @media (min-width: ${theme.breakpoints.tablet}) {
    padding: ${theme.spacing['2xl']};
  }
`;

const SectionTitle = styled.h2`
  font-size: ${theme.fontSize['2xl']};
  font-weight: ${theme.fontWeight.bold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.lg};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
`;

const Text = styled.p`
  font-size: ${theme.fontSize.base};
  color: ${theme.colors.text.secondary};
  line-height: 1.8;
  margin-bottom: ${theme.spacing.md};

  &:last-child {
    margin-bottom: 0;
  }
`;

const SkillGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: ${theme.spacing.md};
  margin-top: ${theme.spacing.lg};

  @media (min-width: ${theme.breakpoints.tablet}) {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
`;

const SkillTag = styled.div`
  background: ${theme.colors.surface};
  color: ${theme.colors.text.primary};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  text-align: center;
  font-size: ${theme.fontSize.sm};
  font-weight: ${theme.fontWeight.medium};
  border: 1px solid ${theme.colors.border};
  transition: all ${theme.transition.fast};

  &:hover {
    border-color: ${theme.colors.primary};
    background: ${theme.colors.primary};
    color: white;
  }
`;

const ContactList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  margin-top: ${theme.spacing.lg};
`;

const ContactItem = styled.a`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.md};
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.md};
  text-decoration: none;
  color: ${theme.colors.text.primary};
  transition: all ${theme.transition.fast};
  border: 1px solid ${theme.colors.border};

  &:hover {
    border-color: ${theme.colors.primary};
    background: ${theme.colors.hover};
  }

  .icon {
    font-size: ${theme.fontSize['2xl']};
  }

  .content {
    flex: 1;

    .label {
      font-size: ${theme.fontSize.sm};
      color: ${theme.colors.text.tertiary};
    }

    .value {
      font-size: ${theme.fontSize.base};
      font-weight: ${theme.fontWeight.medium};
      color: ${theme.colors.text.primary};
    }
  }
`;

const AboutPage = () => {
  return (
    <>
      <GlobalStyles />
      <Layout>
        <PageHeader>
          <PageTitle>👋 소개</PageTitle>
          <PageSubtitle>안녕하세요! 개발자 블로그를 방문해주셔서 감사합니다</PageSubtitle>
        </PageHeader>

        <AboutSection>
          <Card>
            <SectionTitle>💡 About Me</SectionTitle>
            <Text>
              안녕하세요! 새로운 기술을 배우고 성장하는 것을 좋아하는 개발자입니다. 이 블로그는 제가 공부하고 경험한 내용들을 정리하고
              공유하기 위해 만들었습니다.
            </Text>
            <Text>코드를 작성하는 것뿐만 아니라, 문제를 해결하는 과정에서 배운 것들을 기록하고 다른 사람들과 나누는 것을 즐깁니다.</Text>
          </Card>

          <Card>
            <SectionTitle>🛠️ Skills</SectionTitle>
            <SkillGrid>
              <SkillTag>JavaScript</SkillTag>
              <SkillTag>TypeScript</SkillTag>
              <SkillTag>React</SkillTag>
              <SkillTag>Node.js</SkillTag>
              <SkillTag>Gatsby</SkillTag>
              <SkillTag>HTML/CSS</SkillTag>
              <SkillTag>Git</SkillTag>
              <SkillTag>Emotion</SkillTag>
            </SkillGrid>
          </Card>

          <Card>
            <SectionTitle>📬 Contact</SectionTitle>
            <ContactList>
              <ContactItem href="https://github.com" target="_blank" rel="noopener noreferrer">
                <div className="icon">💻</div>
                <div className="content">
                  <div className="label">GitHub</div>
                  <div className="value">github.com/username</div>
                </div>
              </ContactItem>
              <ContactItem href="mailto:your.email@example.com">
                <div className="icon">✉️</div>
                <div className="content">
                  <div className="label">Email</div>
                  <div className="value">your.email@example.com</div>
                </div>
              </ContactItem>
            </ContactList>
          </Card>
        </AboutSection>
      </Layout>
    </>
  );
};

export const Head = () => (
  <>
    <title>소개 | Dev.log</title>
    <meta name="description" content="개발자 소개 페이지" />
  </>
);

export default AboutPage;
