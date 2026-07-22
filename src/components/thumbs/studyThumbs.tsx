import * as React from 'react';
import styled from '@emotion/styled';
import { IconCheck, IconClose, IconSearch, IconEye } from 'src/components/icons';
import {
  Surface,
  Bar,
  HStack,
  VStack,
  WindowDots,
  Mono,
  Chip,
  Badge,
  StepLine,
  ArrowRightSm,
  ArrowUturnSm,
  FolderIcon,
} from './primitives';

// ============================================================
// study 글별 전용 일러스트
// 슬러그 하나당 그림 하나. 글 내용이 바뀌면 여기 그림도 같이 손본다.
// ============================================================

/** Array.from은 왜 앞에 new가 붙으면 안 되나 — new는 ✕, 그냥 호출은 ✓ */
export const ArrayFromWithoutNew: React.FC = () => (
  <Surface>
    <VStack gap={9} pad="14px">
      <HStack>
        <Chip>
          <Mono>new</Mono>
        </Chip>
        <Bar w={76} />
        <Badge>
          <IconClose size={8} strokeWidth={3} />
        </Badge>
      </HStack>
      <HStack>
        <Bar w={118} tone="soft" />
        <Badge filled>
          <IconCheck size={9} strokeWidth={3} />
        </Badge>
      </HStack>
    </VStack>
  </Surface>
);

/** 백엔드 검색·배치 디버깅 — 검색창 + 결과 중 한 줄을 잡아냄 */
export const BackendSearchBatchDebugging: React.FC = () => (
  <Surface>
    <VStack gap={8} pad="12px 14px">
      <HStack gap={6}>
        <IconSearch size={11} />
        <Bar w={118} tone="soft" />
      </HStack>
      <Bar w={142} />
      <Bar w={120} tone="accent" />
      <Bar w={132} />
    </VStack>
  </Surface>
);

/** 공통 로직 추출 — 두 모듈에서 공통 블록을 위로 뽑아낸다 */
const LiftedBlock = styled.div`
  align-self: center;
  display: flex;
  align-items: center;
  gap: 5px;
`;

export const ExtractingCommonLogic: React.FC = () => (
  <Surface>
    <VStack gap={8} pad="12px 14px">
      <LiftedBlock>
        <Bar w={44} tone="accent" />
      </LiftedBlock>
      <LiftedBlock style={{ transform: 'rotate(-90deg)', color: 'var(--card-accent-ink)' }}>
        <ArrowRightSm size={11} />
      </LiftedBlock>
      <HStack gap={10}>
        <VStack gap={5} pad="0">
          <Bar w={64} />
          <Bar w={52} tone="soft" />
          <Bar w={58} />
        </VStack>
        <VStack gap={5} pad="0">
          <Bar w={64} />
          <Bar w={52} tone="soft" />
          <Bar w={58} />
        </VStack>
      </HStack>
    </VStack>
  </Surface>
);

/** 파일 전송 프로토콜 — 두 서버 사이를 오가는 화살표 */
const ServerBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px;
  border: 1px solid var(--card-accent-ink);
  border-radius: var(--radius-sm);
`;

export const FileTransferProtocols: React.FC = () => (
  <Surface>
    <HStack gap={10} style={{ padding: '14px' }}>
      <ServerBox>
        <Bar w={28} tone="soft" />
        <Bar w={28} tone="soft" />
      </ServerBox>
      <VStack gap={5} pad="0" style={{ alignItems: 'center', color: 'var(--card-accent-ink)' }}>
        <ArrowRightSm />
        <span style={{ transform: 'rotate(180deg)', display: 'inline-flex' }}>
          <ArrowRightSm />
        </span>
      </VStack>
      <ServerBox>
        <Bar w={28} tone="soft" />
        <Bar w={28} tone="soft" />
      </ServerBox>
    </HStack>
  </Surface>
);

/** 멱등성 키 UUID — 같은 요청 두 번, 결과는 하나 */
export const IdempotencyKeyUuid: React.FC = () => (
  <Surface>
    <VStack gap={8} pad="12px 14px">
      <HStack>
        <Chip>
          <Mono>key</Mono>
        </Chip>
        <Bar w={62} tone="soft" />
        <span style={{ color: 'var(--card-accent-ink)', display: 'inline-flex' }}>
          <ArrowRightSm size={10} />
        </span>
        <Badge filled>
          <IconCheck size={9} strokeWidth={3} />
        </Badge>
      </HStack>
      <HStack>
        <Chip>
          <Mono>key</Mono>
        </Chip>
        <Bar w={62} tone="soft" />
        <span style={{ color: 'var(--color-border-strong)', display: 'inline-flex' }}>
          <ArrowRightSm size={10} />
        </span>
        <Badge>
          <IconClose size={8} strokeWidth={3} />
        </Badge>
      </HStack>
    </VStack>
  </Surface>
);

/** JPA 엔티티 vs Value Object — ID 있는 카드와 없는 카드 */
export const JpaEntityValueObject: React.FC = () => (
  <Surface>
    <HStack gap={10} style={{ padding: '13px 14px', alignItems: 'stretch' }}>
      <VStack gap={5} pad="8px" style={{ border: '1px solid var(--card-accent-ink)', borderRadius: 6 }}>
        <Chip filled>
          <Mono size={8}>ID</Mono>
        </Chip>
        <Bar w={44} />
        <Bar w={36} />
      </VStack>
      <VStack gap={5} pad="8px" style={{ border: '1px dashed var(--color-border-strong)', borderRadius: 6 }}>
        <Bar w={44} tone="soft" />
        <Bar w={44} />
        <Bar w={36} />
      </VStack>
    </HStack>
  </Surface>
);

/** 최소 배포 QA 파이프라인 — 빌드 ✓ → 검수(눈) → 배포 대기 */
export const MinimumDeploymentQaPipeline: React.FC = () => (
  <Surface>
    <HStack gap={0} style={{ padding: '16px 14px', justifyContent: 'center' }}>
      <Badge>
        <IconCheck size={9} strokeWidth={2.6} />
      </Badge>
      <StepLine done />
      <Badge filled size={17}>
        <IconEye size={11} strokeWidth={2.2} />
      </Badge>
      <StepLine />
      <Badge style={{ borderStyle: 'dashed' }} />
    </HStack>
  </Surface>
);

/** Next.js 입문 — 주소창과 파일 기반 라우트 */
export const NextjsIntroForReactDevs: React.FC = () => (
  <Surface>
    <WindowDots />
    <VStack gap={7} pad="10px 14px 12px">
      <Chip>
        <Mono size={8}>/pages</Mono>
      </Chip>
      <HStack gap={6} style={{ paddingLeft: 10 }}>
        <FolderIcon size={10} />
        <Bar w={88} tone="soft" />
      </HStack>
      <HStack gap={6} style={{ paddingLeft: 10 }}>
        <FolderIcon size={10} />
        <Bar w={108} />
      </HStack>
    </VStack>
  </Surface>
);

/** React Concurrent Mode — 긴 작업을 제치고 끼어드는 우선 작업 */
export const ReactConcurrentMode: React.FC = () => (
  <Surface>
    <VStack gap={9} pad="14px">
      <HStack gap={4}>
        <Bar w={70} />
        <Bar w={56} style={{ opacity: 0.35 }} />
      </HStack>
      <HStack gap={4} style={{ paddingLeft: 30 }}>
        <Bar w={92} tone="accent" />
        <span style={{ color: 'var(--card-accent-ink)', display: 'inline-flex' }}>
          <ArrowRightSm size={10} />
        </span>
      </HStack>
      <HStack gap={4}>
        <Bar w={122} style={{ opacity: 0.35 }} />
      </HStack>
    </VStack>
  </Surface>
);

/** React.memo comparator vs useMemo — 두 값을 비교하는 저울 */
export const ReactMemoComparatorVsUsememo: React.FC = () => (
  <Surface>
    <HStack gap={9} style={{ padding: '14px', justifyContent: 'center' }}>
      <VStack gap={5} pad="0">
        <Bar w={44} tone="soft" />
        <Bar w={44} />
      </VStack>
      <Badge filled size={17}>
        <Mono size={9} style={{ color: 'inherit' }}>
          =
        </Mono>
      </Badge>
      <VStack gap={5} pad="0">
        <Bar w={44} tone="soft" />
        <Bar w={44} />
      </VStack>
    </HStack>
  </Surface>
);

/** Spring 백엔드 코드 흐름 읽기 — 컨트롤러→서비스→리포지토리 계단 */
export const ReadingSpringBackendCodeFlow: React.FC = () => (
  <Surface>
    <VStack gap={7} pad="12px 14px">
      <Bar w={110} tone="accent" />
      <HStack gap={5} style={{ paddingLeft: 14 }}>
        <span style={{ color: 'var(--card-accent-ink)', display: 'inline-flex' }}>
          <ArrowRightSm size={9} />
        </span>
        <Bar w={96} tone="soft" />
      </HStack>
      <HStack gap={5} style={{ paddingLeft: 28 }}>
        <span style={{ color: 'var(--card-accent-ink)', display: 'inline-flex' }}>
          <ArrowRightSm size={9} />
        </span>
        <Bar w={82} />
      </HStack>
    </VStack>
  </Surface>
);

/** Spring Boot 아키텍처 기초 — 계층 슬래브 3단 */
const Slab = styled.div<{ tone?: 'accent' | 'soft' | 'muted' }>`
  height: 14px;
  border-radius: 4px;
  background: ${({ tone = 'muted' }) =>
    tone === 'accent'
      ? 'var(--card-accent-ink)'
      : tone === 'soft'
        ? 'color-mix(in srgb, var(--card-accent-ink) 30%, transparent)'
        : 'var(--color-border-default)'};
`;

export const SpringBootArchitectureBasics: React.FC = () => (
  <Surface>
    <VStack gap={6} pad="13px 14px">
      <Slab tone="accent" style={{ width: 96, alignSelf: 'center' }} />
      <Slab tone="soft" style={{ width: 118, alignSelf: 'center' }} />
      <Slab style={{ width: 140, alignSelf: 'center' }} />
    </VStack>
  </Surface>
);

/** Spring Boot 백엔드 구조 — 패키지 폴더 트리 */
export const SpringBootBackendStructure: React.FC = () => (
  <Surface>
    <VStack gap={6} pad="12px 14px">
      <HStack gap={6} style={{ color: 'var(--card-accent-ink)' }}>
        <FolderIcon />
        <Bar w={92} tone="soft" />
      </HStack>
      <HStack gap={6} style={{ paddingLeft: 14, color: 'var(--card-accent-ink)' }}>
        <FolderIcon size={10} />
        <Bar w={108} />
      </HStack>
      <HStack gap={6} style={{ paddingLeft: 14, color: 'var(--card-accent-ink)' }}>
        <FolderIcon size={10} />
        <Bar w={84} />
      </HStack>
    </VStack>
  </Surface>
);

/** 언더스코어 prefix 관례 — _파일은 숨긴다 */
export const UnderscorePrefixConvention: React.FC = () => (
  <Surface>
    <VStack gap={7} pad="12px 14px">
      <HStack gap={6}>
        <Bar w={118} />
      </HStack>
      <HStack gap={6}>
        <Chip filled>
          <Mono size={9} style={{ transform: 'translateY(-2px)' }}>
            _
          </Mono>
        </Chip>
        <Bar w={86} tone="soft" />
        <span style={{ color: 'var(--color-text-tertiary)', display: 'inline-flex' }}>
          <IconClose size={8} strokeWidth={2.6} />
        </span>
      </HStack>
      <HStack gap={6}>
        <Bar w={104} />
      </HStack>
    </VStack>
  </Surface>
);

/** 웹 접근성 a11y — 포커스 링이 걸린 버튼 */
const FocusButton = styled.span`
  width: 64px;
  height: 22px;
  border-radius: 7px;
  background: var(--card-accent-ink);
  outline: 2px solid var(--card-accent-ink);
  outline-offset: 2px;
  margin: 3px;
`;

export const WebAccessibilityA11y: React.FC = () => (
  <Surface>
    <WindowDots />
    <VStack gap={8} pad="12px 14px">
      <Bar w={100} />
      <Bar w={130} />
      <FocusButton />
    </VStack>
  </Surface>
);
