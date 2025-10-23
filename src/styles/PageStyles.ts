import styled from '@emotion/styled';
import { theme } from './theme';

export const PageHeader = styled.div`
  text-align: center;
  margin-bottom: ${theme.spacing['2xl']};

  @media (min-width: ${theme.breakpoints.tablet}) {
    margin-bottom: ${theme.spacing['3xl']};
  }
`;

export const PageTitle = styled.h1`
  font-size: ${theme.fontSize['3xl']};
  font-weight: ${theme.fontWeight.bold};
  color: ${theme.colors.text.primary};
  margin: 0 0 ${theme.spacing.md} 0;

  @media (min-width: ${theme.breakpoints.tablet}) {
    font-size: ${theme.fontSize['5xl']};
  }
`;

export const PageSubtitle = styled.p`
  font-size: ${theme.fontSize.base};
  color: ${theme.colors.text.secondary};
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;

  @media (min-width: ${theme.breakpoints.tablet}) {
    font-size: ${theme.fontSize.lg};
  }
`;

export const PostGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${theme.spacing.lg};

  @media (min-width: ${theme.breakpoints.tablet}) {
    grid-template-columns: repeat(2, 1fr);
    gap: ${theme.spacing.xl};
  }

  @media (min-width: ${theme.breakpoints.desktop}) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

export const Hero = styled.section`
  background: linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%);
  color: white;
  padding: ${theme.spacing['2xl']} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.xl};
  margin-bottom: ${theme.spacing['2xl']};
  text-align: center;

  @media (min-width: ${theme.breakpoints.tablet}) {
    padding: ${theme.spacing['3xl']} ${theme.spacing['2xl']};
    margin-bottom: ${theme.spacing['3xl']};
  }
`;

export const HeroTitle = styled.h1`
  font-size: ${theme.fontSize['3xl']};
  font-weight: ${theme.fontWeight.bold};
  margin: 0 0 ${theme.spacing.lg} 0;

  @media (min-width: ${theme.breakpoints.tablet}) {
    font-size: ${theme.fontSize['5xl']};
  }
`;

export const HeroSubtitle = styled.p`
  font-size: ${theme.fontSize.base};
  opacity: 0.9;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;

  @media (min-width: ${theme.breakpoints.tablet}) {
    font-size: ${theme.fontSize.xl};
  }
`;

export const Section = styled.section`
  margin-bottom: ${theme.spacing['3xl']};
`;

export const SectionTitle = styled.h2`
  font-size: ${theme.fontSize['2xl']};
  font-weight: ${theme.fontWeight.bold};
  color: ${theme.colors.text.primary};
  margin: 0 0 ${theme.spacing.xl} 0;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};

  @media (min-width: ${theme.breakpoints.tablet}) {
    font-size: ${theme.fontSize['3xl']};
  }

  &::after {
    content: '';
    flex: 1;
    height: 2px;
    background: linear-gradient(to right, ${theme.colors.border}, transparent);
  }
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: ${theme.spacing['3xl']} ${theme.spacing.md};
  color: ${theme.colors.text.tertiary};

  p {
    font-size: ${theme.fontSize.lg};
    margin: ${theme.spacing.md} 0;
  }

  .emoji {
    font-size: ${theme.fontSize['5xl']};
    margin-bottom: ${theme.spacing.md};
  }
`;
