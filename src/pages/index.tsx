import React from 'react';
import styled from '@emotion/styled';
import Layout from '../components/GlobalLayout';
import PostCard from '../components/PostCard';
import FeaturedSlider, { SliderPost } from '../components/FeaturedSlider';
import { graphql, useStaticQuery, Link } from 'gatsby';
import {
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
// 히어로 → Featured 슬라이더 → 스터디 최근 3 → 프로젝트 최근 3
// (하단 소개 CTA·저작권은 Layout의 SiteFooter가 담당)
// 디자인 원본: Paper "Home v2 — 슬라이드" 아트보드.
// ============================================================

/** 슬라이더에 태울 최근 글 수 */
const FEATURED_COUNT = 5;
/** 카테고리 섹션당 카드 수 */
const SECTION_COUNT = 3;

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

/** 스터디/프로젝트 공용 최근 글 섹션 */
const RecentSection: React.FC<{ title: string; to: string; posts: SliderPost[] }> = ({ title, to, posts }) => {
  if (posts.length === 0) return null;
  return (
    <Section>
      <SectionHeadRow>
        <SectionTitle>
          {title}
          <SectionCount>최신글 {posts.length}</SectionCount>
        </SectionTitle>
        <MoreLink to={to}>전체 보기</MoreLink>
      </SectionHeadRow>

      <PostGrid>
        {posts.map((post) => (
          <PostCard
            key={post.id}
            title={post.frontmatter.title}
            excerpt={post.excerpt}
            date={post.frontmatter.date}
            category={post.frontmatter.category}
            slug={post.fields.slug}
            keywords={post.frontmatter.keywords}
            thumbVariant={post.frontmatter.thumbVariant}
            readTime={post.timeToRead ? `${post.timeToRead}분` : undefined}
            thumbnail={post.frontmatter.thumbnail?.childImageSharp?.gatsbyImageData}
          />
        ))}
      </PostGrid>
    </Section>
  );
};

const IndexPage = () => {
  const data = useStaticQuery(graphql`
    query {
      allMarkdownRemark(sort: { frontmatter: { date: DESC } }, limit: 20) {
        nodes {
          id
          frontmatter {
            title
            date(formatString: "YYYY년 MM월 DD일")
            category
            keywords
            thumbVariant
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
      }
    }
  `);

  const posts: SliderPost[] = data.allMarkdownRemark.nodes;
  const featuredPosts = posts.slice(0, FEATURED_COUNT);
  const studyPosts = posts.filter((p) => p.frontmatter.category === 'study').slice(0, SECTION_COUNT);
  const projectPosts = posts.filter((p) => p.frontmatter.category === 'project').slice(0, SECTION_COUNT);

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

        <FeaturedSlider posts={featuredPosts} />

        {posts.length === 0 ? (
          <EmptyState>
            <p>
              아직 작성된 글이 없어요.
              <br />첫 번째 글을 써보세요!
            </p>
          </EmptyState>
        ) : (
          <>
            <RecentSection title="스터디" to="/study/" posts={studyPosts} />
            <RecentSection title="프로젝트" to="/project/" posts={projectPosts} />
          </>
        )}
      </PageInner>
    </Layout>
  );
};

export const Head = () => (
  <>
    <title>UlongChaS2.log</title>
    <meta name="description" content="개발 공부와 프로젝트를 기록하는 블로그" />
  </>
);

export default IndexPage;
