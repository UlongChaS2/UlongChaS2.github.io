import styled from '@emotion/styled';
import { theme } from './theme';

export const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${theme.spacing.xl} ${theme.spacing.md};
  min-height: calc(100vh - 200px);

  @media (min-width: ${theme.breakpoints.tablet}) {
    padding: ${theme.spacing['2xl']} ${theme.spacing.xl};
  }
`;

export const Footer = styled.footer`
  background-color: ${theme.colors.surface};
  border-top: 1px solid ${theme.colors.border};
  padding: ${theme.spacing.xl} ${theme.spacing.md};
  text-align: center;
  color: ${theme.colors.text.secondary};
  font-size: ${theme.fontSize.sm};
  margin-top: ${theme.spacing['3xl']};

  @media (min-width: ${theme.breakpoints.tablet}) {
    padding: ${theme.spacing['2xl']} ${theme.spacing.xl};
  }
`;
