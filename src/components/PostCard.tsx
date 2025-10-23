import * as React from 'react';
import styled from '@emotion/styled';

import { Link } from 'gatsby';
import { theme } from 'src/styles/theme';

const Card = styled.article`
  background: ${theme.colors.background};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.lg};
  transition: all ${theme.transition.base};
  height: 100%;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${theme.shadow.lg};
    border-color: ${theme.colors.primary};
  }

  @media (min-width: ${theme.breakpoints.tablet}) {
    padding: ${theme.spacing.xl};
  }
`;

const CardLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  display: block;
  height: 100%;
`;

const Category = styled.span`
  display: inline-block;
  padding: ${theme.spacing.xs} ${theme.spacing.md};
  background-color: ${theme.colors.surface};
  color: ${theme.colors.primary};
  border-radius: ${theme.borderRadius.full};
  font-size: ${theme.fontSize.xs};
  font-weight: ${theme.fontWeight.semibold};
  margin-bottom: ${theme.spacing.md};
  text-transform: uppercase;
`;

const Title = styled.h3`
  font-size: ${theme.fontSize.xl};
  font-weight: ${theme.fontWeight.bold};
  color: ${theme.colors.text.primary};
  margin: 0 0 ${theme.spacing.sm} 0;
  line-height: 1.4;

  @media (min-width: ${theme.breakpoints.tablet}) {
    font-size: ${theme.fontSize['2xl']};
  }
`;

const Excerpt = styled.p`
  color: ${theme.colors.text.secondary};
  font-size: ${theme.fontSize.sm};
  line-height: 1.6;
  margin: 0 0 ${theme.spacing.md} 0;
  flex-grow: 1;

  @media (min-width: ${theme.breakpoints.tablet}) {
    font-size: ${theme.fontSize.base};
  }
`;

const Meta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: ${theme.spacing.md};
  border-top: 1px solid ${theme.colors.border};
  font-size: ${theme.fontSize.sm};
  color: ${theme.colors.text.tertiary};
`;

const Date = styled.time`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};

  &::before {
    content: '📅';
  }
`;

const ReadTime = styled.span`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};

  &::before {
    content: '⏱️';
  }
`;

interface PostCardProps {
  title: string;
  excerpt: string;
  date: string;
  category: string;
  slug: string;
  readTime?: string;
}

const PostCard: React.FC<PostCardProps> = ({ title, excerpt, date, category, slug, readTime = '5분' }) => {
  // category를 기반으로 올바른 경로 생성
  const fullPath = `/${category}${slug}`;

  return (
    <Card>
      <CardLink to={fullPath}>
        <Category>{category}</Category>
        <Title>{title}</Title>
        <Excerpt>{excerpt}</Excerpt>
        <Meta>
          <Date>{date}</Date>
          <ReadTime>{readTime}</ReadTime>
        </Meta>
      </CardLink>
    </Card>
  );
};

export default PostCard;
