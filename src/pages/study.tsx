import React from 'react';
import Layout from 'src/components/GlobalLayout';
import GlobalStyles from 'src/components/GlobalStyles';
import PostCard from 'src/components/PostCard';
import { graphql } from 'gatsby';
import { PageHeader, PageTitle, PageSubtitle, PostGrid, EmptyState } from 'src/styles/PageStyles';

interface StudyPageProps {
  data: {
    allMarkdownRemark: {
      nodes: Array<{
        id: string;
        frontmatter: {
          title: string;
          date: string;
          category: string;
          thumbnail?: { childImageSharp: { gatsbyImageData: any } };
        };
        excerpt: string;
        fields: { slug: string };
      }>;
    };
  };
}

const StudyPage: React.FC<StudyPageProps> = ({ data }) => {
  const posts = data.allMarkdownRemark.nodes;

  return (
    <>
      <GlobalStyles />
      <Layout>
        <PageHeader>
          <PageTitle>📚 스터디</PageTitle>
          <PageSubtitle>새로운 기술과 개념을 학습하며 정리한 내용들입니다</PageSubtitle>
        </PageHeader>

        {posts.length > 0 ? (
          <PostGrid>
            {posts.map((post) => (
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
          <EmptyState>
            <div className="emoji">📝</div>
            <p>아직 스터디 포스트가 없습니다.</p>
          </EmptyState>
        )}
      </Layout>
    </>
  );
};

export const query = graphql`
  query {
    allMarkdownRemark(filter: { frontmatter: { category: { eq: "study" } } }, sort: { frontmatter: { date: DESC } }) {
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
`;

export const Head = () => (
  <>
    <title>스터디 | Dev.log</title>
    <meta name="description" content="개발 학습 내용을 정리한 포스트" />
  </>
);

export default StudyPage;
