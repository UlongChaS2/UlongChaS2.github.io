import React from 'react';
import styled from '@emotion/styled';
import { Link } from 'gatsby';
import Layout from 'src/components/GlobalLayout';
import GlobalStyles from 'src/components/GlobalStyles';
import { IconArrowRight } from 'src/components/icons';
import { accentVars } from 'src/styles/accents';
import { HeroChip, HeroHeadline, HeroHighlight, HeroLede } from 'src/styles/PageStyles';

// ============================================================
// About — 소개
// 항목마다 카드를 씌우지 않는다. 구분선과 여백만으로 나눈다.
// ============================================================

const Page = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-6) var(--space-20);

  @media (min-width: 768px) {
    padding: 0 var(--space-8) var(--space-24);
  }
`;

const Hero = styled.section`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: var(--space-16) 0 var(--space-12);

  @media (min-width: 768px) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-16);
    padding: var(--space-24) 0 var(--space-20);
  }
`;

const HeroCopy = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

/** 사진 대신 두는 도형 블록. 나중에 프로필 이미지로 교체할 자리다. */
const Portrait = styled.div`
  width: 100%;
  max-width: 320px;
  aspect-ratio: 1 / 1;
  border-radius: var(--radius-2xl);
  background: var(--card-accent-surface);
  color: var(--card-accent-ink);
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: var(--space-10);

  @media (min-width: 768px) {
    margin-top: 0;
  }

  &::before {
    content: '';
    position: absolute;
    left: -50px;
    bottom: -70px;
    width: 200px;
    height: 200px;
    border-radius: var(--radius-full);
    background: currentColor;
    opacity: 0.16;
  }

  &::after {
    content: '';
    position: absolute;
    right: 34px;
    top: 34px;
    width: 52px;
    height: 52px;
    border-radius: 17px;
    background: var(--color-highlighter);
  }
`;

const PortraitMark = styled.span`
  position: relative;
  font-family: var(--font-mono);
  font-size: 40px;
  font-weight: var(--fw-bold);
  letter-spacing: var(--ls-tight);
`;

const Block = styled.section`
  padding: var(--space-12) 0;
  border-top: 1px solid var(--color-border-subtle);
`;

const BlockTitle = styled.h2`
  font-size: var(--fs-title-lg);
  font-weight: var(--fw-extrabold);
  letter-spacing: var(--ls-tighter);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-8) 0;
`;

const Prose = styled.p`
  font-size: 17px;
  line-height: var(--lh-loose);
  color: var(--color-text-body);
  max-width: 700px;
  margin: 0 0 var(--space-5) 0;
  word-break: keep-all;

  &:last-of-type {
    margin-bottom: 0;
  }
`;

/** 번호를 매긴 원칙 목록. 제목과 설명이 같은 세로선에서 시작하도록 슬롯을 고정한다. */
const PrincipleList = styled.ol`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
  counter-reset: principle;
`;

const Principle = styled.li`
  display: flex;
  gap: var(--space-5);
  counter-increment: principle;
  max-width: 760px;

  &::before {
    content: counter(principle);
    width: 34px;
    height: 34px;
    border-radius: var(--radius-full);
    background: var(--color-bg-subtle);
    color: var(--color-text-secondary);
    font-size: var(--fs-body-sm);
    font-weight: var(--fw-bold);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  h3 {
    font-size: var(--fs-title-sm);
    font-weight: var(--fw-bold);
    letter-spacing: var(--ls-tight);
    color: var(--color-text-primary);
    margin: 4px 0 var(--space-2) 0;
    word-break: keep-all;
  }

  p {
    font-size: var(--fs-body-md);
    line-height: var(--lh-loose);
    color: var(--color-text-secondary);
    margin: 0;
    word-break: keep-all;
  }
`;

const SkillRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
`;

const SkillChip = styled.span`
  padding: 9px var(--space-4);
  border-radius: var(--radius-full);
  background: var(--card-accent-surface);
  color: var(--card-accent-ink);
  font-size: var(--fs-body-sm);
  font-weight: var(--fw-semibold);
  letter-spacing: var(--ls-tight);
`;

const ContactRow = styled.a`
  display: flex;
  align-items: center;
  gap: var(--space-5);
  padding: var(--space-5) 0;
  border-bottom: 1px solid var(--color-border-subtle);
  text-decoration: none;
  color: inherit;

  &:last-of-type {
    border-bottom: none;
  }

  &:hover .arrow {
    background: var(--color-brand-subtle);
    color: var(--color-brand-primary);
  }
`;

const ContactLabel = styled.span`
  width: 88px;
  flex-shrink: 0;
  font-size: var(--fs-caption);
  font-weight: var(--fw-bold);
  letter-spacing: var(--ls-wide);
  text-transform: uppercase;
  color: var(--color-text-tertiary);
`;

const ContactValue = styled.span`
  flex: 1;
  min-width: 0;
  font-size: var(--fs-body-lg);
  font-weight: var(--fw-semibold);
  letter-spacing: var(--ls-tight);
  color: var(--color-text-primary);
  overflow-wrap: anywhere;
`;

const ContactArrow = styled.span`
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  background: var(--color-bg-subtle);
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background var(--transition-fast), color var(--transition-fast);
`;

const SKILLS: Array<{ name: string; accent: Parameters<typeof accentVars>[0] }> = [
  { name: 'TypeScript', accent: 'blue' },
  { name: 'React', accent: 'blue' },
  { name: 'Next.js', accent: 'mint' },
  { name: 'Gatsby', accent: 'mint' },
  { name: 'Emotion', accent: 'pink' },
  { name: 'TanStack Query', accent: 'pink' },
  { name: 'Vite', accent: 'yellow' },
  { name: 'Playwright', accent: 'yellow' },
];

const CONTACTS: Array<{ label: string; value: string; href: string; internal?: boolean }> = [
  { label: 'GitHub', value: 'github.com/UlongChaS2', href: 'https://github.com/UlongChaS2' },
  { label: 'Email', value: 'jyujung2@gmail.com', href: 'mailto:jyujung2@gmail.com' },
  { label: 'Resume', value: '이력서 보기', href: '/resume/', internal: true },
];

const AboutPage = () => (
  <>
    <GlobalStyles />
    <Layout>
      <Page>
        <Hero>
          <HeroCopy>
            <HeroChip>지금은 프론트엔드</HeroChip>
            <HeroHeadline>
              코드를 짜고,
              <br />
              <HeroHighlight>배운 걸 적습니다</HeroHighlight>
            </HeroHeadline>
            <HeroLede>
              화면을 만드는 일을 합니다.
              <br />
              잘 안 됐던 것도 되도록 그대로 적어두려고 합니다.
            </HeroLede>
          </HeroCopy>

          <Portrait style={accentVars('blue')}>
            <PortraitMark>dev.log</PortraitMark>
          </Portrait>
        </Hero>

        <Block>
          <BlockTitle>이 블로그를 쓰는 이유</BlockTitle>
          <Prose>
            같은 문제를 두 번째 만났을 때 처음처럼 헤매는 게 싫었습니다. 그래서 해결한 방법만이 아니라, 왜 그렇게 했는지와
            중간에 틀렸던 판단까지 같이 남깁니다.
          </Prose>
          <Prose>
            정리된 결론만 있는 글은 나중의 저에게 별로 도움이 안 되더군요. 막혔던 지점이 적혀 있어야 다시 읽을 때 쓸모가
            있었습니다.
          </Prose>
        </Block>

        <Block>
          <BlockTitle>글 쓸 때 지키는 것</BlockTitle>
          <PrincipleList>
            <Principle>
              <div>
                <h3>재현되는 것만 적는다</h3>
                <p>직접 돌려보고 결과를 확인한 것만 씁니다. 확인 못 한 부분은 모른다고 적어둡니다.</p>
              </div>
            </Principle>
            <Principle>
              <div>
                <h3>숫자로 말한다</h3>
                <p>빨라졌다는 말 대신 몇 번에서 몇 번으로 줄었는지 적습니다. 측정 방법도 같이 남깁니다.</p>
              </div>
            </Principle>
            <Principle>
              <div>
                <h3>틀린 글은 고쳐 쓴다</h3>
                <p>나중에 잘못 안 게 드러나면 지우지 않고 무엇이 틀렸는지 덧붙입니다.</p>
              </div>
            </Principle>
          </PrincipleList>
        </Block>

        <Block>
          <BlockTitle>요즘 쓰는 것들</BlockTitle>
          <SkillRow>
            {SKILLS.map((skill) => (
              <SkillChip key={skill.name} style={accentVars(skill.accent)}>
                {skill.name}
              </SkillChip>
            ))}
          </SkillRow>
        </Block>

        <Block>
          <BlockTitle>연락</BlockTitle>
          {CONTACTS.map((contact) => (
            <ContactRow
              key={contact.label}
              /* 사이트 안으로 가는 링크는 새 탭으로 띄우지 않는다 */
              {...(contact.internal
                ? { as: Link, to: contact.href }
                : { href: contact.href, target: '_blank', rel: 'noopener noreferrer' })}
            >
              <ContactLabel>{contact.label}</ContactLabel>
              <ContactValue>{contact.value}</ContactValue>
              <ContactArrow className="arrow">
                <IconArrowRight size={15} />
              </ContactArrow>
            </ContactRow>
          ))}
        </Block>
      </Page>
    </Layout>
  </>
);

export const Head = () => (
  <>
    <title>소개 | Dev.log</title>
    <meta name="description" content="블로그를 쓰는 사람과 글 쓰는 원칙" />
  </>
);

export default AboutPage;
