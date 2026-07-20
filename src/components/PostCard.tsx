import * as React from 'react';
import styled from '@emotion/styled';
import { Link } from 'gatsby';
import { GatsbyImage, getImage, IGatsbyImageData } from 'gatsby-plugin-image';
import { pickAccent, postLabel } from 'src/styles/accents';

// ============================================================
// PostCard
// - 그림자 대신 1px 보더 (다크 모드에서 토큰 하나만 바뀌면 따라온다)
// - 썸네일 이미지가 없으면 accent 표면 + 모노 키워드로 대체
// ============================================================

const Card = styled.article`
  background: var(--color-bg-card);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-xl);
  overflow: hidden;
  transition:
    transform var(--transition-base),
    border-color var(--transition-base);
  height: 100%;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-2px);
    border-color: var(--color-border-strong);
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

/**
 * 이미지가 없는 포스트의 대체 썸네일.
 * 배경/글자색은 accent 토큰을 CSS 변수로 주입받는다.
 */
const KeywordThumb = styled.div`
  width: 100%;
  aspect-ratio: 16 / 9;
  background: var(--card-accent-surface);
  color: var(--card-accent-ink);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  flex-shrink: 0;

  /* 우측 상단 원형 도형 — 카드마다 같은 자리에 두어 리듬을 만든다 */
  &::before {
    content: '';
    position: absolute;
    right: -30px;
    top: -30px;
    width: 120px;
    height: 120px;
    border-radius: var(--radius-full);
    background: currentColor;
    opacity: 0.14;
  }
`;

const KeywordText = styled.span`
  position: relative;
  font-family: var(--font-mono);
  font-size: 26px;
  font-weight: var(--fw-semibold);
  letter-spacing: var(--ls-tight);
`;

const CardContent = styled.div`
  padding: var(--space-5) var(--space-6) var(--space-6);
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: var(--space-3);
`;

const CategoryBadge = styled.span`
  align-self: flex-start;
  padding: 5px 10px;
  border-radius: var(--radius-full);
  background: var(--card-accent-surface);
  color: var(--card-accent-ink);
  font-size: 11px;
  font-weight: var(--fw-bold);
  letter-spacing: var(--ls-wide);
  text-transform: uppercase;
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
`;

const Meta = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: 13px;
  font-weight: var(--fw-medium);
  color: var(--color-text-tertiary);
  margin-top: auto;
`;

export interface PostCardProps {
  title: string;
  excerpt: string;
  date: string;
  category: string;
  slug: string;
  readTime?: string;
  keywords?: (string | null)[] | null;
  thumbnail?: IGatsbyImageData | null;
}

const PostCard: React.FC<PostCardProps> = ({
  title,
  excerpt,
  date,
  category,
  slug,
  readTime = '5분',
  keywords,
  thumbnail,
}) => {
  const fullPath = `/${category}${slug}`;
  const thumbnailImage = thumbnail ? getImage(thumbnail) : null;

  return (
    <Card style={pickAccent(slug)}>
      <CardLink to={fullPath}>
        {thumbnailImage ? (
          <ImageWrapper>
            <GatsbyImage image={thumbnailImage} alt={title} />
          </ImageWrapper>
        ) : (
          <KeywordThumb>
            <KeywordText>{postLabel(keywords, category)}</KeywordText>
          </KeywordThumb>
        )}

        <CardContent>
          <CategoryBadge>{category}</CategoryBadge>
          <Title>{title}</Title>
          <Excerpt>{excerpt}</Excerpt>

          <Meta>
            <time>{date}</time>
            <span>·</span>
            <span>{readTime}</span>
          </Meta>
        </CardContent>
      </CardLink>
    </Card>
  );
};

export default PostCard;
