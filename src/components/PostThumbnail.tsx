import * as React from 'react';
import styled from '@emotion/styled';
import { IconAlert, IconCheck, IconSun, IconMoon } from 'src/components/icons';
import { thumbForSlug } from 'src/components/thumbs';
import type { ThumbVariant } from 'src/styles/accents';

// ============================================================
// PostThumbnail — 이미지 없는 글의 "디자인된 커버"
// 글마다 전용 일러스트(thumbs/ 레지스트리)를 먼저 찾고,
// 없는 글(새 글)만 변형 프리셋 6종으로 폴백한다.
// 색은 부모가 pickAccent로 주입한 --card-accent-* 변수를 그대로 쓴다.
// 전부 벡터라 다크 모드는 토큰이 바뀌면 공짜로 따라온다.
// ============================================================

const Wrapper = styled.div<{ featured?: boolean }>`
  width: 100%;
  aspect-ratio: ${({ featured }) => (featured ? '16 / 10' : '16 / 9')};
  border-radius: ${({ featured }) => (featured ? 'var(--radius-2xl)' : '0')};
  background: var(--card-accent-surface);
  color: var(--card-accent-ink);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  flex-shrink: 0;

  /* 데코 원 — 카드는 우상단, Featured는 좌하단(기존 규칙 유지) */
  &::before {
    content: '';
    position: absolute;
    border-radius: var(--radius-full);
    background: currentColor;
    ${({ featured }) =>
      featured
        ? 'left: -40px; bottom: -60px; width: 180px; height: 180px; opacity: 0.16;'
        : 'right: -30px; top: -30px; width: 120px; height: 120px; opacity: 0.14;'}
  }

  /* Featured 전용 우상단 형광 사각형 */
  ${({ featured }) =>
    featured &&
    `&::after {
      content: '';
      position: absolute;
      right: 36px;
      top: 36px;
      width: 56px;
      height: 56px;
      border-radius: 18px;
      background: var(--color-highlighter);
    }`}
`;

const Caption = styled.span<{ featured?: boolean }>`
  position: absolute;
  left: ${({ featured }) => (featured ? '28px' : '20px')};
  bottom: ${({ featured }) => (featured ? '20px' : '14px')};
  font-family: var(--font-mono);
  font-size: ${({ featured }) => (featured ? '18px' : '14px')};
  font-weight: var(--fw-semibold);
  letter-spacing: var(--ls-tight);
  z-index: 1;
`;

/* Featured는 같은 목업을 1.5배로 키워서 쓴다. 벡터라 깨지지 않는다. */
const MockScale = styled.div<{ featured?: boolean }>`
  transform: ${({ featured }) => (featured ? 'scale(1.5)' : 'none')};
`;

const MockSurface = styled.div`
  width: 170px;
  background: var(--color-bg-card);
  border: 1px solid color-mix(in srgb, var(--card-accent-ink) 22%, transparent);
  border-radius: var(--radius-md);
  overflow: hidden;
  position: relative;
`;

const Bar = styled.span<{ w: number; tone?: 'muted' | 'accent' | 'soft' }>`
  display: block;
  width: ${({ w }) => w}px;
  height: 7px;
  border-radius: 4px;
  background: ${({ tone = 'muted' }) =>
    tone === 'accent'
      ? 'var(--card-accent-ink)'
      : tone === 'soft'
        ? 'color-mix(in srgb, var(--card-accent-ink) 30%, transparent)'
        : 'var(--color-border-default)'};
`;

const MockRow = styled.div`
  display: flex;
  align-items: center;
  gap: 7px;
`;

/* ---------- 변형 1. browser — 포커스 링 걸린 버튼이 있는 브라우저 창 ---------- */

const BrowserBar = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 7px 10px;
  background: var(--color-bg-subtle);
  border-bottom: 1px solid var(--color-border-subtle);

  span {
    width: 6px;
    height: 6px;
    border-radius: var(--radius-full);
    background: var(--color-border-strong);
  }
`;

const BrowserBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 14px;
`;

const FocusButton = styled.span`
  width: 64px;
  height: 22px;
  border-radius: 7px;
  background: var(--card-accent-ink);
  outline: 2px solid var(--card-accent-ink);
  outline-offset: 2px;
  /* outline이 잘리지 않게 한 칸 띄운다 */
  margin: 3px;
`;

const MockBrowser = () => (
  <MockSurface>
    <BrowserBar>
      <span />
      <span />
      <span />
    </BrowserBar>
    <BrowserBody>
      <Bar w={100} />
      <Bar w={130} />
      <FocusButton />
    </BrowserBody>
  </MockSurface>
);

/* ---------- 변형 2. code-check — 코드 라인 + 검증 통과 배지 ---------- */

const CodeBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 9px;
  padding: 14px;
`;

const CheckedLine = styled.span`
  width: 74px;
  height: 9px;
  border-radius: 4px;
  background: var(--card-accent-surface);
  border: 1px solid var(--card-accent-ink);
`;

const CheckBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 15px;
  height: 15px;
  border-radius: var(--radius-full);
  background: var(--card-accent-ink);
  color: var(--color-bg-card);
`;

const MockCodeCheck = () => (
  <MockSurface>
    <CodeBody>
      <MockRow>
        <Bar w={46} />
        <Bar w={62} />
      </MockRow>
      <MockRow>
        <Bar w={30} />
        <CheckedLine />
        <CheckBadge>
          <IconCheck size={9} strokeWidth={3} />
        </CheckBadge>
      </MockRow>
      <MockRow>
        <Bar w={58} />
        <Bar w={38} />
      </MockRow>
    </CodeBody>
  </MockSurface>
);

/* ---------- 변형 3. warning-list — 경고 목록, 한 줄 하이라이트 ---------- */

const WarningRow = styled.div<{ active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 8px 12px;
  color: var(--card-accent-ink);
  background: ${({ active }) => (active ? 'var(--color-highlighter-subtle)' : 'transparent')};

  &:not(:last-of-type) {
    border-bottom: 1px solid var(--color-border-subtle);
  }
`;

const MockWarningList = () => (
  <MockSurface>
    <WarningRow>
      <IconAlert size={12} />
      <Bar w={96} />
    </WarningRow>
    <WarningRow active>
      <IconAlert size={12} />
      <Bar w={74} tone="soft" />
    </WarningRow>
    <WarningRow>
      <IconAlert size={12} />
      <Bar w={88} />
    </WarningRow>
  </MockSurface>
);

/* ---------- 변형 4. table — 가상 스크롤 그리드 + 스크롤바 ---------- */

const TableBody = styled.div`
  display: flex;
  gap: 8px;
  padding: 10px;
`;

const TableRows = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;

  span {
    width: 100%;
    height: 9px;
    border-radius: 4px;
  }
`;

const TableRow = styled.span<{ strength?: number }>`
  background: ${({ strength }) =>
    strength
      ? `color-mix(in srgb, var(--card-accent-ink) ${strength}%, transparent)`
      : 'var(--color-bg-subtle)'};
`;

const ScrollTrack = styled.div`
  width: 5px;
  border-radius: 3px;
  background: var(--color-bg-subtle);
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 30%;
    left: 0;
    width: 5px;
    height: 35%;
    border-radius: 3px;
    background: var(--card-accent-ink);
  }
`;

const MockTable = () => (
  <MockSurface>
    <TableBody>
      <TableRows>
        <TableRow />
        <TableRow strength={25} />
        <TableRow strength={55} />
        <TableRow strength={25} />
        <TableRow />
      </TableRows>
      <ScrollTrack />
    </TableBody>
  </MockSurface>
);

/* ---------- 변형 5. pipeline — CI 스텝: 완료 → 완료 → 진행 중 ---------- */

const PipelineBody = styled.div`
  display: flex;
  align-items: center;
  padding: 16px 14px;
`;

const StepCircle = styled.span<{ active?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: var(--radius-full);
  flex-shrink: 0;
  background: ${({ active }) => (active ? 'var(--color-highlighter-subtle)' : 'var(--card-accent-surface)')};
  border: 1px solid ${({ active }) => (active ? 'var(--color-highlighter)' : 'var(--card-accent-ink)')};
  color: var(--card-accent-ink);

  &::after {
    content: ${({ active }) => (active ? "''" : 'none')};
    width: 6px;
    height: 6px;
    border-radius: var(--radius-full);
    background: var(--color-highlighter);
  }
`;

const StepLine = styled.span<{ done?: boolean }>`
  width: 30px;
  height: 2px;
  background: ${({ done }) => (done ? 'var(--card-accent-ink)' : 'var(--color-border-default)')};
`;

const MockPipeline = () => (
  <MockSurface>
    <PipelineBody>
      <StepCircle>
        <IconCheck size={10} strokeWidth={2.6} />
      </StepCircle>
      <StepLine done />
      <StepCircle>
        <IconCheck size={10} strokeWidth={2.6} />
      </StepCircle>
      <StepLine />
      <StepCircle active />
    </PipelineBody>
  </MockSurface>
);

/* ---------- 변형 6. theme-split — 라이트/다크 반반 화면 ---------- */
/* 라이트/다크 UI "그림"이므로 모드를 안 타는 gray 스케일 토큰을 쓴다 */

const SplitHalf = styled.div<{ dark?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 85px;
  padding: 14px 12px;
  background: ${({ dark }) => (dark ? 'var(--color-gray-900)' : 'var(--color-gray-50)')};
  color: ${({ dark }) => (dark ? 'var(--color-gray-200)' : 'var(--color-highlighter)')};

  span {
    width: 52px;
    height: 6px;
    border-radius: 3px;
    background: ${({ dark }) => (dark ? 'var(--color-gray-700)' : 'var(--color-gray-200)')};
  }

  span + span {
    width: 40px;
  }
`;

const MockThemeSplit = () => (
  <MockSurface style={{ display: 'flex' }}>
    <SplitHalf>
      <IconSun size={16} />
      <span />
      <span />
    </SplitHalf>
    <SplitHalf dark>
      <IconMoon size={16} />
      <span />
      <span />
    </SplitHalf>
  </MockSurface>
);

/* ---------- 조립 ---------- */

const MOCKS: Record<ThumbVariant, React.FC> = {
  browser: MockBrowser,
  'code-check': MockCodeCheck,
  'warning-list': MockWarningList,
  table: MockTable,
  pipeline: MockPipeline,
  'theme-split': MockThemeSplit,
};

/** 일러스트만 필요할 때(목록 행처럼 캡션·배경을 자체 처리하는 곳)를 위한 렌더러 */
export const ThumbMock: React.FC<{ variant: ThumbVariant; slug?: string }> = ({ variant, slug }) => {
  const Mock = (slug && thumbForSlug(slug)) || MOCKS[variant];
  return <Mock />;
};

export interface PostThumbnailProps {
  variant: ThumbVariant;
  label: string;
  slug?: string;
  featured?: boolean;
}

const PostThumbnail: React.FC<PostThumbnailProps> = ({ variant, label, slug, featured }) => {
  const Mock = (slug && thumbForSlug(slug)) || MOCKS[variant];
  return (
    <Wrapper featured={featured}>
      <MockScale featured={featured}>
        <Mock />
      </MockScale>
      <Caption featured={featured}>{label}</Caption>
    </Wrapper>
  );
};

export default PostThumbnail;
