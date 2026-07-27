import React from 'react';
import { graphql } from 'gatsby';
import PostListPage, { ListPost } from 'src/components/PostListPage';
import Seo from 'src/components/seo';

interface ProjectPageProps {
  data: {
    allMarkdownRemark: {
      nodes: ListPost[];
    };
  };
}

const ProjectPage: React.FC<ProjectPageProps> = () => (
  <PostListPage
    title="프로젝트"
    subtitle="직접 만든 것들의 과정과 결과를 남깁니다."
    posts={[]}
    emptyMessage="아직 프로젝트 포스트가 없습니다."
  />
);

export const query = graphql`
  query {
    allMarkdownRemark(filter: { frontmatter: { category: { eq: "project" } } }, sort: { frontmatter: { date: DESC } }) {
      nodes {
        id
        frontmatter {
          title
          date(formatString: "YYYY년 MM월 DD일")
          category
          keywords
          thumbVariant
        }
        excerpt(pruneLength: 140)
        fields {
          slug
        }
        timeToRead
      }
    }
  }
`;

export const Head = () => <Seo title="프로젝트" description="직접 만든 프로젝트의 과정과 결과를 정리한 포스트" pathname="/project/" />;

export default ProjectPage;
