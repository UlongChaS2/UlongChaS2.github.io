import React from 'react';
import { graphql } from 'gatsby';
import PostListPage, { ListPost } from 'src/components/PostListPage';

interface ProjectPageProps {
  data: {
    allMarkdownRemark: {
      nodes: ListPost[];
    };
  };
}

const ProjectPage: React.FC<ProjectPageProps> = ({ data }) => (
  <PostListPage
    title="프로젝트"
    subtitle="직접 만든 것들의 과정과 결과를 남깁니다."
    posts={data.allMarkdownRemark.nodes}
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

export const Head = () => (
  <>
    <title>프로젝트 | UlongChaS2.log</title>
    <meta name="description" content="진행한 프로젝트들을 정리한 포스트" />
  </>
);

export default ProjectPage;
