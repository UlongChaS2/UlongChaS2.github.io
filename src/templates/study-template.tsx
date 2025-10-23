import * as React from 'react';
import { graphql, Link } from 'gatsby';
import { PageProps } from 'gatsby';
import Layout from 'src/components/GlobalLayout';
import GlobalStyles from 'src/components/GlobalStyles';
import { PostContainer, PostHeader, PostCategory, PostTitle, PostMeta, PostContent, PostNavigation, NavLink } from 'src/styles/PostStyles';

interface StudyPostProps extends PageProps {
  data: {
    markdownRemark: {
      frontmatter: {
        title: string;
        date: string;
        category: string;
      };
      html: string;
      timeToRead: number;
    };
  };
}

const StudyPost: React.FC<StudyPostProps> = ({ data }) => {
  const post = data.markdownRemark;

  return (
    <>
      <GlobalStyles />
      <Layout>
        <PostContainer>
          <PostHeader>
            <PostCategory>{post.frontmatter.category}</PostCategory>
            <PostTitle>{post.frontmatter.title}</PostTitle>
            <PostMeta>
              <time>{post.frontmatter.date}</time>
              <span className="read-time">{post.timeToRead}분 읽기</span>
            </PostMeta>
          </PostHeader>

          <PostContent dangerouslySetInnerHTML={{ __html: post.html }} />

          <PostNavigation>
            <Link to="/study" style={{ textDecoration: 'none' }}>
              <NavLink as="div" className="prev">
                <div className="label">목록으로</div>
                <div className="title">스터디 포스트</div>
              </NavLink>
            </Link>
          </PostNavigation>
        </PostContainer>
      </Layout>
    </>
  );
};

export const query = graphql`
  query ($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      frontmatter {
        title
        date(formatString: "YYYY년 MM월 DD일")
        category
      }
      html
      timeToRead
    }
  }
`;

export const Head = ({ data }: StudyPostProps) => (
  <>
    <title>{data.markdownRemark.frontmatter.title} | Dev.log</title>
    <meta name="description" content={data.markdownRemark.frontmatter.title} />
  </>
);

export default StudyPost;
