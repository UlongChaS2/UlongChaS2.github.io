import React from 'react';
import Layout from 'src/components/GlobalLayout';
import GlobalStyles from 'src/components/GlobalStyles';
import PostCard from 'src/components/PostCard';
import { graphql } from 'gatsby';
import { PageHeader, PageTitle, PageSubtitle, PostGrid, EmptyState } from 'src/styles/PageStyles';

interface ProjectPageProps {
  data: {
    allMarkdownRemark: {
      nodes: Array<{
        id: string;
        frontmatter: {
          title: string;
          date: string;
          category: string;
        };
        excerpt: string;
        fields: {
          slug: string;
        };
      }>;
    };
  };
}

const ProjectPage: React.FC<ProjectPageProps> = ({ data }) => {
  const posts = data.allMarkdownRemark.nodes;

  return (
    <>
      <GlobalStyles />
      <Layout>
        <PageHeader>
          <PageTitle>🚀 프로젝트</PageTitle>
          <PageSubtitle>직접 진행한 프로젝트들의 과정과 결과를 공유합니다</PageSubtitle>
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
              />
            ))}
          </PostGrid>
        ) : (
          <EmptyState>
            <div className="emoji">🔨</div>
            <p>아직 프로젝트 포스트가 없습니다.</p>
          </EmptyState>
        )}
      </Layout>
    </>
  );
};

export const query = graphql`
  query {
    allMarkdownRemark(filter: { frontmatter: { category: { eq: "project" } } }, sort: { frontmatter: { date: DESC } }) {
      nodes {
        id
        frontmatter {
          title
          date(formatString: "YYYY년 MM월 DD일")
          category
        }
        excerpt(pruneLength: 150)
        fields {
          slug
        }
      }
    }
  }
`;

export const Head = () => (
  <>
    <title>프로젝트 | Dev.log</title>
    <meta name="description" content="진행한 프로젝트들을 정리한 포스트" />
  </>
);

export default ProjectPage;
