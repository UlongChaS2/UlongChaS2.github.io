import React from 'react';
import styled from '@emotion/styled';
import Layout from '../components/GlobalLayout';
import PostCard from '../components/PostCard';
import { graphql, useStaticQuery, Link } from 'gatsby';
import { GatsbyImage, getImage } from 'gatsby-plugin-image';
import { pickAccent, postLabel } from 'src/styles/accents';
import {
  FeaturedCard,
  FeaturedImageWrapper,
  FeaturedNoThumbnail,
  FeaturedContent,
  FeaturedBadge,
  FeaturedLabel,
  FeaturedTitle,
  FeaturedExcerpt,
  FeaturedMeta,
  FeaturedLink,
  SectionTitle,
  PostGrid,
  Section,
  EmptyState,
  HomeHero,
  HeroChip,
  HeroHeadline,
  HeroHighlight,
  HeroLede,
} from 'src/styles/PageStyles';

// ============================================================
// index.tsx — 홈
// 히어로 → Featured 포스트 → 최근 글 그리드
// (하단 소개 CTA·저작권은 Layout의 SiteFooter가 담당)
// ============================================================

const PageInner = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-6) var(--space-20);

  @media (min-width: 768px) {
    padding: 0 var(--space-8) var(--space-24);
  }
`;

const SectionHeadRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: var(--space-8);
`;

const SectionCount = styled.span`
  font-size: var(--fs-body-lg);
  font-weight: var(--fw-semibold);
  color: var(--color-brand-primary);
  margin-left: var(--space-2);
`;

const MoreLink = styled(Link)`
  font-size: var(--fs-body-md);
  font-weight: var(--fw-semibold);
  color: var(--color-text-tertiary);
  text-decoration: none;
  transition: color var(--transition-fast);

  &:hover {
    color: var(--color-text-primary);
  }
`;

const MetaDot = styled.span`
  color: var(--color-border-strong);
`;

const IndexPage = () => {
  const data = useStaticQuery(graphql`
    query {
      allMarkdownRemark(sort: { frontmatter: { date: DESC } }, limit: 10) {
        nodes {
          id
          frontmatter {
            title
            date(formatString: "YYYY년 MM월 DD일")
            category
            keywords
            thumbnail {
              childImageSharp {
                gatsbyImageData(width: 800, height: 500, placeholder: BLURRED)
              }
            }
          }
          excerpt(pruneLength: 160)
          fields {
            slug
          }
          timeToRead
        }
        totalCount
      }
    }
  `);

  const posts = data.allMarkdownRemark.nodes;
  const featuredPost = posts[0];
  const restPosts = posts.slice(1);

  const getFeaturedImage = (post: any) => {
    const img = post?.frontmatter?.thumbnail?.childImageSharp?.gatsbyImageData;
    return img ? getImage(img) : null;
  };

  return (
    <Layout>
        <PageInner>
          <HomeHero>
            <HeroChip>오늘도 한 개 배웠어요</HeroChip>
            <HeroHeadline>
              배운 걸 잊지 않으려고
              <br />
              <HeroHighlight>기록해두는 곳</HeroHighlight>
            </HeroHeadline>
            <HeroLede>
              React, TypeScript, 그리고 매일 부딪히는 문제들.
              <br />
              삽질한 과정까지 그대로 남겨둡니다.
            </HeroLede>
          </HomeHero>

          {/* ── Featured Post ── */}
          {featuredPost && (
            <FeaturedLink to={`/${featuredPost.frontmatter.category}${featuredPost.fields.slug}`}>
              <FeaturedCard style={pickAccent(featuredPost.fields.slug)}>
                {getFeaturedImage(featuredPost) ? (
                  <FeaturedImageWrapper>
                    <GatsbyImage image={getFeaturedImage(featuredPost)!} alt={featuredPost.frontmatter.title} />
                  </FeaturedImageWrapper>
                ) : (
                  <FeaturedNoThumbnail>
                    {postLabel(featuredPost.frontmatter.keywords, featuredPost.frontmatter.category)}
                  </FeaturedNoThumbnail>
                )}

                <FeaturedContent>
                  <FeaturedBadge>
                    <FeaturedLabel>{featuredPost.frontmatter.category}</FeaturedLabel>
                  </FeaturedBadge>
                  <FeaturedTitle>{featuredPost.frontmatter.title}</FeaturedTitle>
                  <FeaturedExcerpt>{featuredPost.excerpt}</FeaturedExcerpt>

                  <FeaturedMeta>
                    <time>{featuredPost.frontmatter.date}</time>
                    <MetaDot>·</MetaDot>
                    <span>{featuredPost.timeToRead || 5}분</span>
                  </FeaturedMeta>
                </FeaturedContent>
              </FeaturedCard>
            </FeaturedLink>
          )}

          {/* ── 최근 글 그리드 ── */}
          <Section>
            {restPosts.length > 0 ? (
              <>
                <SectionHeadRow>
                  <SectionTitle>
                    최근에 쓴 글
                    <SectionCount>{data.allMarkdownRemark.totalCount}</SectionCount>
                  </SectionTitle>
                  <MoreLink to="/study/">전체 보기</MoreLink>
                </SectionHeadRow>

                <PostGrid>
                  {restPosts.map((post: any) => (
                    <PostCard
                      key={post.id}
                      title={post.frontmatter.title}
                      excerpt={post.excerpt}
                      date={post.frontmatter.date}
                      category={post.frontmatter.category}
                      slug={post.fields.slug}
                      keywords={post.frontmatter.keywords}
                      readTime={post.timeToRead ? `${post.timeToRead}분` : undefined}
                      thumbnail={post.frontmatter.thumbnail?.childImageSharp?.gatsbyImageData}
                    />
                  ))}
                </PostGrid>
              </>
            ) : posts.length === 0 ? (
              <EmptyState>
                <p>
                  아직 작성된 글이 없어요.
                  <br />첫 번째 글을 써보세요!
                </p>
              </EmptyState>
            ) : null}
          </Section>
        </PageInner>
      </Layout>
  );
};

export const Head = () => (
  <>
    <title>Dev.log</title>
    <meta name="description" content="개발 공부와 프로젝트를 기록하는 블로그" />
  </>
);

export default IndexPage;
