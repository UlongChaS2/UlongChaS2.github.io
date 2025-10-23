import React from 'react';
import Layout from '../components/GlobalLayout';
import GlobalStyles from '../components/GlobalStyles';
import PostCard from '../components/PostCard';
import { graphql, useStaticQuery } from 'gatsby';
import { Hero, HeroTitle, HeroSubtitle, Section, SectionTitle, PostGrid } from 'src/styles/PageStyles';

const IndexPage = () => {
  const data = useStaticQuery(graphql`
    query {
      allMarkdownRemark(sort: { frontmatter: { date: DESC } }, limit: 6) {
        nodes {
          id
          frontmatter {
            title
            date(formatString: "YYYY년 MM월 DD일")
            category
            thumbnail {
              childImageSharp {
                gatsbyImageData(width: 400, height: 200, placeholder: BLURRED)
              }
            }
          }
          excerpt(pruneLength: 140)
          fields {
            slug
          }
        }
      }
    }
  `);

  const posts = data.allMarkdownRemark.nodes;

  return (
    <>
      <GlobalStyles />
      <Layout>
        <Hero>
          <HeroTitle>데브로그에 오신 것을 환영합니다</HeroTitle>
          <HeroSubtitle>개발 공부와 프로젝트 경험을 기록하고 공유하는 공간입니다</HeroSubtitle>
        </Hero>

        <Section>
          <SectionTitle>최근 포스트</SectionTitle>
          {posts.length > 0 ? (
            <PostGrid>
              {posts.map((post: any) => (
                <PostCard
                  key={post.id}
                  title={post.frontmatter.title}
                  excerpt={post.excerpt}
                  date={post.frontmatter.date}
                  category={post.frontmatter.category}
                  slug={post.fields.slug}
                  thumbnail={post.frontmatter.thumbnail?.childImageSharp?.gatsbyImageData}
                />
              ))}
            </PostGrid>
          ) : (
            <div style={{ textAlign: 'center', padding: '48px 0', color: '#94a3b8' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
              <p>아직 작성된 포스트가 없습니다.</p>
            </div>
          )}
        </Section>
      </Layout>
    </>
  );
};

export const Head = () => (
  <>
    <title>홈 | Dev.log</title>
    <meta name="description" content="개발 공부와 프로젝트를 기록하는 블로그" />
  </>
);

export default IndexPage;
