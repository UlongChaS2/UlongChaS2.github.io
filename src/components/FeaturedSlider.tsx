import * as React from 'react';
import styled from '@emotion/styled';
import { GatsbyImage, getImage, IGatsbyImageData } from 'gatsby-plugin-image';
import PostThumbnail from 'src/components/PostThumbnail';
import { pickAccent, pickVariant, postLabel } from 'src/styles/accents';
import {
  FeaturedCard,
  FeaturedImageWrapper,
  FeaturedContent,
  FeaturedBadge,
  FeaturedLabel,
  FeaturedTitle,
  FeaturedExcerpt,
  FeaturedMeta,
  FeaturedLink,
} from 'src/styles/PageStyles';

// ============================================================
// FeaturedSlider — 홈 최상단 대형 카드 슬라이더
// 최근 글 몇 개를 한 장씩 넘겨 본다. 자동 재생은 없다 —
// 읽는 사람이 넘기는 물건이라 저절로 움직이면 오히려 방해다.
// 디자인 원본: Paper "Home v2 — 슬라이드" 아트보드.
// ============================================================

const SliderSection = styled.section`
  margin-bottom: var(--space-16);
`;

const Viewport = styled.div`
  overflow: hidden;
`;

const Track = styled.div`
  display: flex;
  transition: transform var(--transition-slow);
`;

const Slide = styled.div`
  flex: 0 0 100%;
  min-width: 0;

  /* 카드 하단 여백은 슬라이더의 컨트롤 줄이 대신 가진다 */
  ${FeaturedCard} {
    margin-bottom: 0;
  }
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: var(--space-6);
`;

const Dots = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-2);
`;

const Dot = styled.button<{ active?: boolean }>`
  width: ${({ active }) => (active ? '24px' : '8px')};
  height: 8px;
  border-radius: var(--radius-full);
  border: none;
  padding: 0;
  cursor: pointer;
  background: ${({ active }) => (active ? 'var(--color-brand-primary)' : 'var(--color-border-strong)')};
  transition:
    width var(--transition-base),
    background var(--transition-base);
`;

const ArrowGroup = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-4);
`;

const Counter = styled.span`
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: var(--fw-medium);
  letter-spacing: var(--ls-wide);
  color: var(--color-text-tertiary);
`;

const ArrowButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  border: 1px solid var(--color-border-default);
  background: var(--color-bg-card);
  color: var(--color-text-primary);
  cursor: pointer;
  transition:
    border-color var(--transition-fast),
    color var(--transition-fast);

  &:hover:not(:disabled) {
    border-color: var(--color-border-strong);
  }

  &:disabled {
    color: var(--color-text-disabled);
    cursor: default;
  }
`;

const Chevron: React.FC<{ flip?: boolean }> = ({ flip }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden
    style={flip ? { transform: 'rotate(180deg)' } : undefined}
  >
    <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export interface SliderPost {
  id: string;
  frontmatter: {
    title: string;
    date: string;
    category: string;
    keywords?: (string | null)[] | null;
    thumbVariant?: string | null;
    thumbnail?: { childImageSharp?: { gatsbyImageData: IGatsbyImageData } | null } | null;
  };
  excerpt: string;
  fields: { slug: string };
  timeToRead?: number | null;
}

const FeaturedSlider: React.FC<{ posts: SliderPost[] }> = ({ posts }) => {
  const [index, setIndex] = React.useState(0);
  const last = posts.length - 1;

  if (posts.length === 0) return null;

  return (
    <SliderSection aria-roledescription="carousel" aria-label="추천 글">
      <Viewport>
        <Track style={{ transform: `translateX(-${index * 100}%)` }}>
          {posts.map((post, i) => {
            const image = post.frontmatter.thumbnail?.childImageSharp?.gatsbyImageData;
            const gatsbyImage = image ? getImage(image) : null;
            return (
              <Slide key={post.id} aria-hidden={i !== index}>
                <FeaturedLink to={`/${post.frontmatter.category}${post.fields.slug}`} tabIndex={i === index ? 0 : -1}>
                  <FeaturedCard style={pickAccent(post.fields.slug)}>
                    {gatsbyImage ? (
                      <FeaturedImageWrapper>
                        <GatsbyImage image={gatsbyImage} alt={post.frontmatter.title} />
                      </FeaturedImageWrapper>
                    ) : (
                      <PostThumbnail
                        featured
                        variant={pickVariant(
                          post.frontmatter.thumbVariant,
                          post.frontmatter.keywords,
                          post.frontmatter.title,
                          post.fields.slug,
                        )}
                        label={postLabel(post.frontmatter.keywords, post.frontmatter.category)}
                        slug={post.fields.slug}
                      />
                    )}

                    <FeaturedContent>
                      <FeaturedBadge>
                        <FeaturedLabel>{post.frontmatter.category}</FeaturedLabel>
                      </FeaturedBadge>
                      <FeaturedTitle>{post.frontmatter.title}</FeaturedTitle>
                      <FeaturedExcerpt>{post.excerpt}</FeaturedExcerpt>
                      <FeaturedMeta>
                        <time>{post.frontmatter.date}</time>
                        <span>·</span>
                        <span>{post.timeToRead || 5}분</span>
                      </FeaturedMeta>
                    </FeaturedContent>
                  </FeaturedCard>
                </FeaturedLink>
              </Slide>
            );
          })}
        </Track>
      </Viewport>

      <Controls>
        <Dots>
          {posts.map((post, i) => (
            <Dot
              key={post.id}
              type="button"
              active={i === index}
              aria-label={`${i + 1}번째 글로 이동`}
              aria-current={i === index}
              onClick={() => setIndex(i)}
            />
          ))}
        </Dots>

        <ArrowGroup>
          <Counter>
            {String(index + 1).padStart(2, '0')} / {String(posts.length).padStart(2, '0')}
          </Counter>
          <ArrowButton
            type="button"
            aria-label="이전 글"
            disabled={index === 0}
            onClick={() => setIndex((v) => Math.max(0, v - 1))}
          >
            <Chevron flip />
          </ArrowButton>
          <ArrowButton
            type="button"
            aria-label="다음 글"
            disabled={index === last}
            onClick={() => setIndex((v) => Math.min(last, v + 1))}
          >
            <Chevron />
          </ArrowButton>
        </ArrowGroup>
      </Controls>
    </SliderSection>
  );
};

export default FeaturedSlider;
