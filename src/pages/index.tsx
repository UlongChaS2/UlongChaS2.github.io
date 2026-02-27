import React from 'react';
import styled from '@emotion/styled';
import Layout from '../components/GlobalLayout';
import GlobalStyles from '../components/GlobalStyles';
import PostCard from '../components/PostCard';
import { graphql, useStaticQuery } from 'gatsby';
import { GatsbyImage, getImage } from 'gatsby-plugin-image';
import {
  FeaturedCard,
  FeaturedImageWrapper,
  FeaturedNoThumbnail,
  FeaturedContent,
  FeaturedBadge,
  FeaturedLabel,
  FeaturedCategoryTag,
  FeaturedTitle,
  FeaturedExcerpt,
  FeaturedMeta,
  FeaturedLink,
  SectionHeader,
  SectionTitle,
  SectionMore,
  PostGrid,
  Section,
  EmptyState,
} from 'src/styles/PageStyles';

// ============================================================
// index.tsx — Daangn 스타일 PostList 메인 페이지
// ============================================================

const PageInner = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-8) var(--space-6) var(--space-20);

  @media (min-width: 768px) {
    padding: var(--space-10) var(--space-8) var(--space-24);
  }
`;

const MetaDot = styled.span`
  color: var(--color-border-default);
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
    <>
      <GlobalStyles />
      <Layout>
        <PageInner>
          {/* ── Featured Post ── */}
          {featuredPost && (
            <FeaturedLink
              to={`/${featuredPost.frontmatter.category}${featuredPost.fields.slug}`}
            >
              <FeaturedCard>
                <FeaturedImageWrapper>
                  {getFeaturedImage(featuredPost) ? (
                    <GatsbyImage
                      image={getFeaturedImage(featuredPost)!}
                      alt={featuredPost.frontmatter.title}
                    />
                  ) : (
                    <FeaturedNoThumbnail>✍️</FeaturedNoThumbnail>
                  )}
                </FeaturedImageWrapper>

                <FeaturedContent>
                  <FeaturedBadge>
                    <FeaturedLabel>최신 글</FeaturedLabel>
                    <FeaturedCategoryTag>
                      {featuredPost.frontmatter.category}
                    </FeaturedCategoryTag>
                  </FeaturedBadge>

                  <FeaturedTitle>{featuredPost.frontmatter.title}</FeaturedTitle>
                  <FeaturedExcerpt>{featuredPost.excerpt}</FeaturedExcerpt>

                  <FeaturedMeta>
                    <time>{featuredPost.frontmatter.date}</time>
                    <MetaDot>·</MetaDot>
                    <span>
                      {featuredPost.timeToRead
                        ? `${featuredPost.timeToRead}분 읽기`
                        : '5분 읽기'}
                    </span>
                  </FeaturedMeta>
                </FeaturedContent>
              </FeaturedCard>
            </FeaturedLink>
          )}

          {/* ── 포스트 그리드 ── */}
          <Section>
            <SectionHeader>
              <SectionTitle>최근 글</SectionTitle>
              <SectionMore to="/study/">모두 보기</SectionMore>
            </SectionHeader>

            {restPosts.length > 0 ? (
              <PostGrid>
                {restPosts.map((post: any) => (
                  <PostCard
                    key={post.id}
                    title={post.frontmatter.title}
                    excerpt={post.excerpt}
                    date={post.frontmatter.date}
                    category={post.frontmatter.category}
                    slug={post.fields.slug}
                    readTime={
                      post.timeToRead ? `${post.timeToRead}분` : undefined
                    }
                    thumbnail={
                      post.frontmatter.thumbnail?.childImageSharp
                        ?.gatsbyImageData
                    }
                  />
                ))}
              </PostGrid>
            ) : posts.length === 0 ? (
              <EmptyState>
                <span className="emoji">✍️</span>
                <p>아직 작성된 글이 없어요.<br />첫 번째 글을 써보세요!</p>
              </EmptyState>
            ) : null}
          </Section>
        </PageInner>
      </Layout>
    </>
  );
};

export const Head = () => (
  <>
    <title>Dev.log</title>
    <meta name="description" content="개발 공부와 프로젝트를 기록하는 블로그" />
  </>
);

export default IndexPage;
