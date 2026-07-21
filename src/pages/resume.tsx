import React from 'react';
import styled from '@emotion/styled';
import Layout from 'src/components/GlobalLayout';
import { IconArrowRight } from 'src/components/icons';
import { HeroChip } from 'src/styles/PageStyles';

// ============================================================
// Resume — 이력서 뷰어
// PDF는 static/resume.pdf 에 두면 /resume.pdf 로 서빙된다.
// 데스크톱은 내장 뷰어로 바로 보여주고,
// 모바일은 브라우저 PDF 임베드가 대부분 깨져서 열기/받기 버튼만 준다.
// ============================================================

const RESUME_PATH = '/resume.pdf';
const UPDATED_AT = '2026년 7월';

const Page = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-16) var(--space-6) var(--space-20);

  @media (min-width: 768px) {
    padding: var(--space-20) var(--space-8) var(--space-24);
  }
`;

const HeadRow = styled.header`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-6);
  padding-bottom: var(--space-10);

  @media (min-width: 768px) {
    flex-direction: row;
    align-items: flex-end;
    justify-content: space-between;
  }
`;

const Titles = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const Title = styled.h1`
  font-size: var(--fs-display-md);
  font-weight: var(--fw-extrabold);
  letter-spacing: -0.035em;
  line-height: var(--lh-tight);
  color: var(--color-text-primary);
  margin: var(--space-6) 0 var(--space-3) 0;

  @media (min-width: 768px) {
    font-size: 44px;
  }
`;

const Updated = styled.p`
  font-size: var(--fs-body-md);
  color: var(--color-text-secondary);
  margin: 0;
`;

const Actions = styled.div`
  display: flex;
  gap: var(--space-2);
  flex-shrink: 0;
`;

const PrimaryAction = styled.a`
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
  transition: background var(--transition-fast);

  &:hover {
    background: var(--color-brand-hover);
  }
`;

const SecondaryAction = styled.a`
  display: inline-flex;
  align-items: center;
  padding: 14px var(--space-6);
  border: 1px solid var(--color-border-default);
  border-radius: 14px;
  color: var(--color-text-primary);
  font-size: var(--fs-body-md);
  font-weight: var(--fw-semibold);
  letter-spacing: var(--ls-tight);
  text-decoration: none;
  transition: border-color var(--transition-fast);

  &:hover {
    border-color: var(--color-border-strong);
  }
`;

const Viewer = styled.div`
  display: none;

  /* 모바일 브라우저는 PDF 임베드를 대부분 무시하거나 빈 화면을 띄운다 */
  @media (min-width: 768px) {
    display: block;
    width: 100%;
    height: 1080px;
    border-radius: var(--radius-xl);
    border: 1px solid var(--color-border-default);
    background: var(--color-bg-subtle);
    overflow: hidden;
  }

  object,
  iframe {
    width: 100%;
    height: 100%;
    border: none;
    display: block;
  }
`;

const MobileNotice = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-6);
  border-radius: var(--radius-xl);
  background: var(--color-bg-subtle);

  p {
    margin: 0;
    font-size: var(--fs-body-md);
    line-height: var(--lh-relaxed);
    color: var(--color-text-secondary);
    word-break: keep-all;
  }

  @media (min-width: 768px) {
    display: none;
  }
`;

const Fallback = styled.p`
  padding: var(--space-8);
  margin: 0;
  font-size: var(--fs-body-md);
  line-height: var(--lh-relaxed);
  color: var(--color-text-secondary);

  a {
    color: var(--color-brand-primary);
    font-weight: var(--fw-semibold);
  }
`;

const ResumePage = () => (
  <Layout>
      <Page>
        <HeadRow>
          <Titles>
            <HeroChip>{UPDATED_AT} 기준</HeroChip>
            <Title>이력서</Title>
            <Updated>화면에서 바로 보거나, 파일로 받아서 볼 수 있어요.</Updated>
          </Titles>

          <Actions>
            <PrimaryAction href={RESUME_PATH} download>
              다운로드
              <IconArrowRight />
            </PrimaryAction>
            <SecondaryAction href={RESUME_PATH} target="_blank" rel="noopener noreferrer">
              새 탭에서 열기
            </SecondaryAction>
          </Actions>
        </HeadRow>

        <Viewer>
          <object data={RESUME_PATH} type="application/pdf" aria-label="이력서 미리보기">
            <Fallback>
              브라우저가 PDF 미리보기를 지원하지 않습니다. <a href={RESUME_PATH}>이력서 내려받기</a>
            </Fallback>
          </object>
        </Viewer>

        <MobileNotice>
          <p>모바일에서는 미리보기가 제대로 뜨지 않는 경우가 많아, 위의 버튼으로 열거나 받아주세요.</p>
        </MobileNotice>
      </Page>
    </Layout>
);

export const Head = () => (
  <>
    <title>이력서 | Dev.log</title>
    <meta name="description" content="정유정 이력서" />
  </>
);

export default ResumePage;
