import * as React from 'react';
import styled from '@emotion/styled';
import { Link } from 'gatsby';
import { GatsbyImage, getImage, IGatsbyImageData } from 'gatsby-plugin-image';

// ============================================================
// PostCard — Daangn Blog Style
// - 16:9 이미지 비율
// - 오렌지 카테고리 태그
// - 굵고 큰 제목, 넉넉한 여백
// - 보더 없음, 호버 그림자
// ============================================================

const Card = styled.article`
  background: var(--color-bg-card);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition:
    transform var(--transition-base),
    box-shadow var(--transition-base);
  height: 100%;
  display: flex;
  flex-direction: column;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-card-hover);
  }
`;

const CardLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const ImageWrapper = styled.div`
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: var(--color-bg-subtle);
  flex-shrink: 0;

  .gatsby-image-wrapper {
    height: 100%;
    width: 100%;
  }

  img {
    transition: transform var(--transition-slow);
    object-fit: cover;
    width: 100%;
    height: 100%;
  }

  ${Card}:hover & img {
    transform: scale(1.04);
  }
`;

const NoThumbnail = styled.div`
  width: 100%;
  aspect-ratio: 16 / 9;
  background: linear-gradient(
    135deg,
    var(--color-bg-subtle) 0%,
    var(--color-brand-subtle) 100%
  );
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  color: var(--color-text-tertiary);
  font-size: var(--fs-body-sm);
  font-weight: var(--fw-medium);

  &::before {
    content: '✍️';
    font-size: 2rem;
    opacity: 0.5;
  }
`;

const CardContent = styled.div`
  padding: var(--space-5) var(--space-5) var(--space-6);
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: var(--space-3);

  @media (min-width: 768px) {
    padding: var(--space-5) var(--space-6) var(--space-6);
  }
`;

const CategoryTag = styled.span`
  display: inline-flex;
  align-items: center;
  padding: var(--space-1) var(--space-2);
  background-color: var(--color-brand-subtle);
  color: var(--color-brand-primary);
  border-radius: var(--radius-sm);
  font-size: var(--fs-caption);
  font-weight: var(--fw-semibold);
  letter-spacing: var(--ls-wide);
  text-transform: uppercase;
  width: max-content;
`;

const Title = styled.h3`
  font-size: var(--fs-title-sm);
  font-weight: var(--fw-bold);
  color: var(--color-text-primary);
  margin: 0;
  line-height: var(--lh-snug);
  letter-spacing: var(--ls-tight);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: keep-all;

  @media (min-width: 768px) {
    font-size: var(--fs-title-md);
  }
`;

const Excerpt = styled.p`
  color: var(--color-text-secondary);
  font-size: var(--fs-body-sm);
  line-height: var(--lh-relaxed);
  margin: 0;
  flex-grow: 1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: keep-all;

  @media (min-width: 768px) {
    font-size: var(--fs-body-md);
  }
`;

const Meta = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-3);
  font-size: var(--fs-caption);
  color: var(--color-text-tertiary);
  margin-top: auto;
  padding-top: var(--space-3);
`;

const Dot = styled.span`
  color: var(--color-border-default);
`;

export interface PostCardProps {
  title: string;
  excerpt: string;
  date: string;
  category: string;
  slug: string;
  readTime?: string;
  thumbnail?: IGatsbyImageData | null;
}

const PostCard: React.FC<PostCardProps> = ({
  title,
  excerpt,
  date,
  category,
  slug,
  readTime = '5분',
  thumbnail,
}) => {
  const fullPath = `/${category}${slug}`;
  const thumbnailImage = thumbnail ? getImage(thumbnail) : null;

  return (
    <Card>
      <CardLink to={fullPath}>
        <ImageWrapper>
          {thumbnailImage ? (
            <GatsbyImage image={thumbnailImage} alt={title} />
          ) : (
            <NoThumbnail>글 보기</NoThumbnail>
          )}
        </ImageWrapper>

        <CardContent>
          <CategoryTag>{category}</CategoryTag>
          <Title>{title}</Title>
          <Excerpt>{excerpt}</Excerpt>

          <Meta>
            <time>{date}</time>
            <Dot>·</Dot>
            <span>{readTime} 읽기</span>
          </Meta>
        </CardContent>
      </CardLink>
    </Card>
  );
};

export default PostCard;
