import styled from '@emotion/styled';

// ============================================================
// LayoutStyles — Daangn Blog Style
// ============================================================

/* Layout shell — 각 페이지/템플릿이 자체 max-width·padding 제어 */
export const Container = styled.div`
  min-height: calc(100vh - 200px);
`;

export const Footer = styled.footer`
  border-top: 1px solid var(--color-border-subtle);
  padding: var(--space-10) var(--space-6);
  text-align: center;
  color: var(--color-text-tertiary);
  font-size: var(--fs-body-sm);
  line-height: var(--lh-relaxed);

  @media (min-width: 768px) {
    padding: var(--space-10) var(--space-8);
  }
`;
