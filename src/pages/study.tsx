import React from 'react';
import { graphql } from 'gatsby';
import PostListPage, { ListPost } from 'src/components/PostListPage';

interface StudyPageProps {
  data: {
    allMarkdownRemark: {
      nodes: ListPost[];
    };
  };
}

const StudyPage: React.FC<StudyPageProps> = ({ data }) => (
  <PostListPage
    title="스터디"
    subtitle="새로 배운 개념을 내 말로 다시 써봤습니다."
    posts={data.allMarkdownRemark.nodes}
    emptyMessage="아직 스터디 포스트가 없습니다."
  />
);

export const query = graphql`
  query {
    allMarkdownRemark(filter: { frontmatter: { category: { eq: "study" } } }, sort: { frontmatter: { date: DESC } }) {
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
    <title>스터디 | UlongChaS2.log</title>
    <meta name="description" content="개발 학습 내용을 정리한 포스트" />
  </>
);

export default StudyPage;
