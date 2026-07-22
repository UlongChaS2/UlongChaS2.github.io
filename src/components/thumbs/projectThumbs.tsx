import * as React from 'react';
import styled from '@emotion/styled';
import { IconCheck, IconClose, IconAlert } from 'src/components/icons';
import {
  Surface,
  Bar,
  HStack,
  VStack,
  WindowDots,
  Mono,
  Chip,
  Badge,
  SeriesBadge,
  StepLine,
  GithubMark,
  DbCylinder,
  BellIcon,
  PulseLine,
  ArrowRightSm,
  ArrowUturnSm,
} from './primitives';

// ============================================================
// project 글별 전용 일러스트
// ============================================================

/** 외부 데이터 동기화 비동기 job — 완료·진행·대기 잡 큐 */
const SpinDot = styled.span`
  width: 6px;
  height: 6px;
  border-radius: var(--radius-full);
  background: var(--color-highlighter);
`;

export const AsyncSyncJob: React.FC = () => (
  <Surface>
    <VStack gap={7} pad="12px 14px">
      <HStack>
        <Badge filled>
          <IconCheck size={9} strokeWidth={3} />
        </Badge>
        <Bar w={104} />
      </HStack>
      <HStack>
        <Badge style={{ borderColor: 'var(--color-highlighter)', background: 'var(--color-highlighter-subtle)' }}>
          <SpinDot />
        </Badge>
        <Bar w={120} tone="soft" />
      </HStack>
      <HStack>
        <Badge style={{ borderStyle: 'dashed' }} />
        <Bar w={88} />
      </HStack>
    </VStack>
  </Surface>
);

/** CSS Grid 통계 카드 — 반응형 타일 그리드 */
const Tile = styled.div<{ accent?: boolean; w: number }>`
  width: ${({ w }) => w}px;
  height: 26px;
  border-radius: var(--radius-sm);
  background: ${({ accent }) =>
    accent ? 'color-mix(in srgb, var(--card-accent-ink) 30%, transparent)' : 'var(--color-bg-subtle)'};
  border: 1px solid ${({ accent }) => (accent ? 'var(--card-accent-ink)' : 'var(--color-border-default)')};
`;

export const CssGridResponsiveStatsCards: React.FC = () => (
  <Surface>
    <VStack gap={6} pad="12px 14px">
      <HStack gap={6}>
        <Tile accent w={42} />
        <Tile w={42} />
        <Tile w={42} />
      </HStack>
      <HStack gap={6}>
        <Tile w={42} />
        <Tile accent w={90} />
      </HStack>
    </VStack>
  </Surface>
);

/** 데이터 그리드 최적화 — 셀 하나만 다시 그려진 그리드 */
const GridHead = styled.div`
  display: flex;
  gap: 8px;
  padding: 8px 12px;
  background: var(--color-bg-subtle);
  border-bottom: 1px solid var(--color-border-subtle);
`;

const GridRow = styled.div<{ active?: boolean }>`
  display: flex;
  gap: 8px;
  padding: 7px 12px;
  background: ${({ active }) => (active ? 'var(--card-accent-surface)' : 'transparent')};
`;

export const DatagridContextUserefOptimization: React.FC = () => (
  <Surface>
    <GridHead>
      <Bar w={30} tone="soft" />
      <Bar w={42} tone="soft" />
      <Bar w={34} tone="soft" />
    </GridHead>
    <GridRow>
      <Bar w={30} />
      <Bar w={42} />
      <Bar w={34} />
    </GridRow>
    <GridRow active>
      <Bar w={30} tone="soft" />
      <Bar w={42} style={{ background: 'var(--color-highlighter)' }} />
      <Bar w={34} tone="soft" />
    </GridRow>
  </Surface>
);

/** 운영 배포 안정화기 (1) — 삭제 후 재업로드에서 벗어나기 */
export const DeploymentStabilization1: React.FC = () => (
  <Surface>
    <VStack gap={9} pad="13px 14px">
      <HStack gap={8}>
        <SeriesBadge n={1} />
        <Bar w={116} tone="soft" />
      </HStack>
      <HStack gap={8}>
        <Chip>
          <Mono size={8}>jar</Mono>
        </Chip>
        <span style={{ color: 'var(--card-accent-ink)', display: 'inline-flex' }}>
          <ArrowUturnSm size={12} />
        </span>
        <Chip filled>
          <Mono size={8}>jar</Mono>
        </Chip>
        <Bar w={38} />
      </HStack>
    </VStack>
  </Surface>
);

/** 운영 배포 안정화기 (2) — CI/CD 파이프라인 붙이기 */
export const DeploymentStabilization2: React.FC = () => (
  <Surface>
    <VStack gap={8} pad="12px 14px">
      <HStack gap={8}>
        <SeriesBadge n={2} />
        <Bar w={116} tone="soft" />
      </HStack>
      <HStack gap={0}>
        <Badge>
          <IconCheck size={9} strokeWidth={2.6} />
        </Badge>
        <StepLine done w={20} />
        <Badge>
          <IconCheck size={9} strokeWidth={2.6} />
        </Badge>
        <StepLine w={20} />
        <Badge style={{ borderColor: 'var(--color-highlighter)', background: 'var(--color-highlighter-subtle)' }}>
          <SpinDot />
        </Badge>
      </HStack>
    </VStack>
  </Surface>
);

/** DevExtreme DataGrid 무한 스크롤 — 이어지는 행과 스크롤바 */
const ScrollTrack = styled.div`
  width: 5px;
  border-radius: 3px;
  background: var(--color-bg-subtle);
  position: relative;
  align-self: stretch;

  &::after {
    content: '';
    position: absolute;
    top: 20%;
    left: 0;
    width: 5px;
    height: 35%;
    border-radius: 3px;
    background: var(--card-accent-ink);
  }
`;

export const DevextremeDatagridInfiniteScroll: React.FC = () => (
  <Surface>
    <HStack gap={8} style={{ padding: '10px', alignItems: 'stretch' }}>
      <VStack gap={6} pad="0" style={{ flex: 1 }}>
        <Bar w={999} style={{ width: '100%' }} />
        <Bar w={999} tone="soft" style={{ width: '100%' }} />
        <Bar w={999} style={{ width: '100%' }} />
        <Bar w={999} style={{ width: '100%', opacity: 0.45 }} />
        <Bar w={999} style={{ width: '100%', opacity: 0.2 }} />
      </VStack>
      <ScrollTrack />
    </HStack>
  </Surface>
);

/** FastAPI 백엔드 온보딩 — uvicorn 뜨는 터미널 */
export const FastapiBackendOnboarding: React.FC = () => (
  <Surface>
    <WindowDots />
    <VStack gap={7} pad="10px 14px 12px">
      <HStack gap={6}>
        <Mono size={9}>$</Mono>
        <Bar w={106} tone="soft" />
      </HStack>
      <HStack gap={6}>
        <Bar w={130} />
      </HStack>
      <HStack gap={6}>
        <Badge filled size={13}>
          <IconCheck size={7} strokeWidth={3} />
        </Badge>
        <Bar w={88} />
      </HStack>
    </VStack>
  </Surface>
);

/** Flyway 마이그레이션 관리 — V1 → V2 → V3 버전 사다리 */
export const FlywayMigrationManagement: React.FC = () => (
  <Surface>
    <HStack gap={6} style={{ padding: '15px 14px', justifyContent: 'center' }}>
      <Chip>
        <Mono size={8}>V1</Mono>
      </Chip>
      <span style={{ color: 'var(--color-border-strong)', display: 'inline-flex' }}>
        <ArrowRightSm size={10} />
      </span>
      <Chip>
        <Mono size={8}>V2</Mono>
      </Chip>
      <span style={{ color: 'var(--card-accent-ink)', display: 'inline-flex' }}>
        <ArrowRightSm size={10} />
      </span>
      <Chip filled>
        <Mono size={8}>V3</Mono>
      </Chip>
    </HStack>
  </Surface>
);

/** GitHub Actions self-hosted runner — 가운데 GitHub, 양옆 러너 */
export const GithubActionsSelfHostedRunner: React.FC = () => (
  <Surface>
    <HStack gap={0} style={{ padding: '13px 14px', justifyContent: 'center' }}>
      <VStack gap={4} pad="7px" style={{ border: '1px solid var(--card-accent-ink)', borderRadius: 6 }}>
        <Bar w={26} tone="soft" />
        <Bar w={26} tone="soft" />
      </VStack>
      <StepLine done w={16} />
      <span style={{ color: 'var(--card-accent-ink)', display: 'inline-flex' }}>
        <GithubMark size={26} />
      </span>
      <StepLine w={16} />
      <VStack gap={4} pad="7px" style={{ border: '1px dashed var(--color-border-strong)', borderRadius: 6 }}>
        <Bar w={26} />
        <Bar w={26} />
      </VStack>
    </HStack>
  </Surface>
);

/** JAR 롤백 + Actuator health check — 심박 그래프에 체크 */
export const JarRollbackActuatorHealthcheck: React.FC = () => (
  <Surface>
    <VStack gap={9} pad="13px 14px" style={{ alignItems: 'center' }}>
      <HStack gap={8}>
        <span style={{ color: 'var(--card-accent-ink)', display: 'inline-flex' }}>
          <PulseLine w={104} h={18} />
        </span>
        <Badge filled>
          <IconCheck size={9} strokeWidth={3} />
        </Badge>
      </HStack>
      <HStack gap={8}>
        <Chip>
          <Mono size={8}>v12</Mono>
        </Chip>
        <span style={{ color: 'var(--card-accent-ink)', display: 'inline-flex', transform: 'rotate(180deg)' }}>
          <ArrowRightSm size={11} />
        </span>
        <Chip filled>
          <Mono size={8}>v11</Mono>
        </Chip>
      </HStack>
    </VStack>
  </Surface>
);

/** JVM 클래스 로딩 · Gradle — 클래스로더 계층 상자 속 경고 */
const NestBox = styled.div<{ level: number }>`
  border: 1px solid
    ${({ level }) => (level === 2 ? 'var(--card-accent-ink)' : 'color-mix(in srgb, var(--card-accent-ink) 35%, transparent)')};
  border-radius: var(--radius-sm);
  padding: 7px;
`;

export const JvmClassloadingGradleTroubleshooting: React.FC = () => (
  <Surface>
    <VStack pad="12px 14px" style={{ alignItems: 'stretch' }}>
      <NestBox level={0}>
        <NestBox level={1}>
          <NestBox level={2}>
            <HStack gap={6} style={{ color: 'var(--card-accent-ink)', justifyContent: 'center' }}>
              <IconAlert size={11} />
              <Bar w={64} tone="soft" />
            </HStack>
          </NestBox>
        </NestBox>
      </NestBox>
    </VStack>
  </Surface>
);

/** openapi-typescript + zod — 어긋난 타입 줄을 잡아 맞춘다 */
export const OpenapiTypescriptZodTypeDrift: React.FC = () => (
  <Surface>
    <VStack gap={8} pad="12px 14px">
      <HStack gap={7}>
        <Bar w={54} />
        <Badge size={13}>
          <IconClose size={7} strokeWidth={3} />
        </Badge>
        <Bar w={48} tone="soft" style={{ transform: 'translateY(3px)' }} />
      </HStack>
      <HStack gap={7}>
        <Bar w={54} />
        <Badge filled size={13}>
          <IconCheck size={7} strokeWidth={3} />
        </Badge>
        <Bar w={48} tone="accent" />
      </HStack>
    </VStack>
  </Surface>
);

/** react-compiler & ESLint — 쌓인 경고 목록 */
const WarnRow = styled.div<{ active?: boolean }>`
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

export const ReactCompilerEslintUseeffect: React.FC = () => (
  <Surface>
    <WarnRow>
      <IconAlert size={12} />
      <Bar w={96} />
    </WarnRow>
    <WarnRow active>
      <IconAlert size={12} />
      <Bar w={74} tone="soft" />
    </WarnRow>
    <WarnRow>
      <IconAlert size={12} />
      <Bar w={88} />
    </WarnRow>
  </Surface>
);

/** findDOMNode 제한 — 줄 그어진 옛 API와 대체 코드 */
const Strike = styled.span`
  position: relative;
  display: inline-flex;

  &::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    top: 50%;
    height: 1.6px;
    background: var(--card-accent-ink);
  }
`;

export const ReactFinddomnodeDeprecation: React.FC = () => (
  <Surface>
    <VStack gap={9} pad="14px">
      <HStack>
        <Strike>
          <Bar w={115} />
        </Strike>
        <Badge size={13}>
          <IconClose size={7} strokeWidth={3} />
        </Badge>
      </HStack>
      <HStack>
        <Chip>
          <Mono size={8}>ref</Mono>
        </Chip>
        <Bar w={80} tone="soft" />
        <Badge filled size={13}>
          <IconCheck size={7} strokeWidth={3} />
        </Badge>
      </HStack>
    </VStack>
  </Surface>
);

/** 실행 스크립트 개선 — 터미널과 dev DB 동기화 */
export const RunShProfileDbSync: React.FC = () => (
  <Surface>
    <WindowDots />
    <HStack gap={9} style={{ padding: '10px 14px 12px' }}>
      <VStack gap={6} pad="0">
        <HStack gap={5}>
          <Mono size={9}>$</Mono>
          <Bar w={56} tone="soft" />
        </HStack>
        <Bar w={72} />
      </VStack>
      <span style={{ color: 'var(--card-accent-ink)', display: 'inline-flex' }}>
        <ArrowRightSm size={11} />
      </span>
      <span style={{ color: 'var(--card-accent-ink)', display: 'inline-flex' }}>
        <DbCylinder size={24} />
      </span>
    </HStack>
  </Surface>
);

/** 배포 후 502 — 에러 페이지와 놓친 마이그레이션 */
export const SpringBoot502FlywayTroubleshooting: React.FC = () => (
  <Surface>
    <WindowDots />
    <HStack gap={10} style={{ padding: '11px 14px 13px' }}>
      <Mono size={20}>502</Mono>
      <VStack gap={5} pad="0">
        <HStack gap={5} style={{ color: 'var(--card-accent-ink)' }}>
          <IconAlert size={10} />
          <Bar w={66} tone="soft" />
        </HStack>
        <Bar w={82} />
      </VStack>
    </HStack>
  </Surface>
);

/** SSE 실시간 알림 — 흘러들어오는 이벤트와 벨 */
const StreamDot = styled.span<{ o: number }>`
  width: 5px;
  height: 5px;
  border-radius: var(--radius-full);
  background: var(--card-accent-ink);
  opacity: ${({ o }) => o};
`;

export const SseRealtimeNotification: React.FC = () => (
  <Surface>
    <HStack gap={7} style={{ padding: '15px 14px', justifyContent: 'center' }}>
      <StreamDot o={0.25} />
      <StreamDot o={0.5} />
      <StreamDot o={1} />
      <span style={{ color: 'var(--card-accent-ink)', display: 'inline-flex' }}>
        <ArrowRightSm size={10} />
      </span>
      <Badge filled size={26}>
        <BellIcon size={14} />
      </Badge>
      <Chip>
        <Mono size={8}>+3</Mono>
      </Chip>
    </HStack>
  </Surface>
);
