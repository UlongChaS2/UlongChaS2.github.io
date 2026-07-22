import type * as React from 'react';
import * as study from './studyThumbs';
import * as project from './projectThumbs';

// ============================================================
// 슬러그 → 전용 일러스트 레지스트리
// 새 글을 쓰면: (1) 해당 카테고리 파일에 그림 컴포넌트 추가
//              (2) 여기 슬러그 키로 등록
// 등록하지 않으면 PostThumbnail이 변형 프리셋으로 폴백한다.
// ============================================================

export const THUMB_REGISTRY: Record<string, React.FC> = {
  // --- study ---
  'array-from-without-new': study.ArrayFromWithoutNew,
  'backend-search-batch-debugging': study.BackendSearchBatchDebugging,
  'extracting-common-logic': study.ExtractingCommonLogic,
  'file-transfer-protocols': study.FileTransferProtocols,
  'idempotency-key-uuid': study.IdempotencyKeyUuid,
  'jpa-entity-value-object': study.JpaEntityValueObject,
  'minimum-deployment-qa-pipeline': study.MinimumDeploymentQaPipeline,
  'nextjs-intro-for-react-devs': study.NextjsIntroForReactDevs,
  'react-concurrent-mode': study.ReactConcurrentMode,
  'react-memo-comparator-vs-usememo': study.ReactMemoComparatorVsUsememo,
  'reading-spring-backend-code-flow': study.ReadingSpringBackendCodeFlow,
  'spring-boot-architecture-basics': study.SpringBootArchitectureBasics,
  'spring-boot-backend-structure': study.SpringBootBackendStructure,
  'underscore-prefix-convention': study.UnderscorePrefixConvention,
  'web-accessibility-a11y': study.WebAccessibilityA11y,
  // --- project ---
  'async-sync-job': project.AsyncSyncJob,
  'css-grid-responsive-stats-cards': project.CssGridResponsiveStatsCards,
  'datagrid-context-useref-optimization': project.DatagridContextUserefOptimization,
  'deployment-stabilization-1': project.DeploymentStabilization1,
  'deployment-stabilization-2': project.DeploymentStabilization2,
  'devextreme-datagrid-infinite-scroll': project.DevextremeDatagridInfiniteScroll,
  'fastapi-backend-onboarding': project.FastapiBackendOnboarding,
  'flyway-migration-management': project.FlywayMigrationManagement,
  'github-actions-self-hosted-runner': project.GithubActionsSelfHostedRunner,
  'jar-rollback-actuator-healthcheck': project.JarRollbackActuatorHealthcheck,
  'jvm-classloading-gradle-troubleshooting': project.JvmClassloadingGradleTroubleshooting,
  'openapi-typescript-zod-type-drift': project.OpenapiTypescriptZodTypeDrift,
  'react-compiler-eslint-useeffect': project.ReactCompilerEslintUseeffect,
  'react-finddomnode-deprecation': project.ReactFinddomnodeDeprecation,
  'run-sh-profile-db-sync': project.RunShProfileDbSync,
  'spring-boot-502-flyway-troubleshooting': project.SpringBoot502FlywayTroubleshooting,
  'sse-realtime-notification': project.SseRealtimeNotification,
};

/** fields.slug('/foo/')를 레지스트리 키('foo')로 정규화 */
export const thumbForSlug = (slug: string): React.FC | null =>
  THUMB_REGISTRY[slug.replace(/^\/+|\/+$/g, '')] ?? null;
