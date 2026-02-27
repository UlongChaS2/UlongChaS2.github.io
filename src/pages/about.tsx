import React from 'react';
import Layout from 'src/components/GlobalLayout';
import GlobalStyles from 'src/components/GlobalStyles';
import styled from '@emotion/styled';
import { PageHeader, PageTitle, PageSubtitle } from 'src/styles/PageStyles';

// ============================================================
// About Page — New Token API
// Uses CSS var() tokens from tokens.css for theme responsiveness
// ============================================================

const AboutSection = styled.section`
  max-width: 800px;
  margin: 0 auto;
`;

const Card = styled.div`
  background: var(--color-bg-card);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  margin-bottom: var(--space-6);
  transition: box-shadow var(--transition-base);

  &:hover {
    box-shadow: var(--shadow-sm);
  }

  @media (min-width: 768px) {
    padding: var(--space-8);
  }
`;

const SectionTitle = styled.h2`
  font-size: var(--fs-title-md);
  font-weight: var(--fw-bold);
  color: var(--color-text-primary);
  margin-bottom: var(--space-4);
  display: flex;
  align-items: center;
  gap: var(--space-3);
  letter-spacing: var(--ls-tight);

  @media (min-width: 768px) {
    font-size: var(--fs-title-lg);
  }
`;

const Text = styled.p`
  font-size: var(--fs-body-md);
  color: var(--color-text-secondary);
  line-height: var(--lh-loose);
  margin-bottom: var(--space-4);

  &:last-child {
    margin-bottom: 0;
  }
`;

const SkillGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: var(--space-3);
  margin-top: var(--space-4);

  @media (min-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
`;

const SkillTag = styled.div`
  background: var(--color-bg-subtle);
  color: var(--color-text-primary);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  text-align: center;
  font-size: var(--fs-body-sm);
  font-weight: var(--fw-medium);
  border: 1px solid var(--color-border-subtle);
  transition: all var(--transition-fast);
  cursor: default;

  &:hover {
    border-color: var(--color-brand-primary);
    background: var(--color-brand-subtle);
    color: var(--color-brand-primary);
  }
`;

const ContactList = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin-top: var(--space-4);
`;

const ContactItem = styled.a`
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4);
  background: var(--color-bg-subtle);
  border-radius: var(--radius-md);
  text-decoration: none;
  color: var(--color-text-primary);
  transition: all var(--transition-fast);
  border: 1px solid var(--color-border-subtle);

  &:hover {
    border-color: var(--color-brand-primary);
    background: var(--color-interactive-hover);
    transform: translateX(4px);
  }

  .icon {
    font-size: var(--fs-title-lg);
    flex-shrink: 0;
  }

  .content {
    flex: 1;

    .label {
      font-size: var(--fs-caption);
      color: var(--color-text-tertiary);
      margin-bottom: 2px;
      letter-spacing: var(--ls-wide);
      text-transform: uppercase;
    }

    .value {
      font-size: var(--fs-body-md);
      font-weight: var(--fw-medium);
      color: var(--color-text-primary);
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
              안녕하세요! 새로운 기술을 배우고 성장하는 것을 좋아하는 개발자입니다. 이 블로그는 제가 공부하고 경험한
              내용들을 정리하고 공유하기 위해 만들었습니다.
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
