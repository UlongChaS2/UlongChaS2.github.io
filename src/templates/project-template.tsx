import * as React from 'react';
import { graphql, Link } from 'gatsby';
import { PageProps } from 'gatsby';
import { GatsbyImage, getImage } from 'gatsby-plugin-image';
import Layout from 'src/components/GlobalLayout';
import GlobalStyles from 'src/components/GlobalStyles';
import TableOfContents from 'src/components/TableOfContents';
import {
  PostContainer,
  PostHeader,
  PostHeaderContent,
  FeaturedImage,
  PostCategory,
  PostTitle,
  PostMeta,
  PostContent,
  PostNavigation,
  NavLink,
} from 'src/styles/PostStyles';

interface ProjectPostProps extends PageProps {
  data: {
    markdownRemark: {
      frontmatter: {
        title: string;
        date: string;
        category: string;
        featuredImage?: {
          childImageSharp: {
            gatsbyImageData: any;
          };
        };
      };
      html: string;
      timeToRead: number;
    };
  };
}

const ProjectPost: React.FC<ProjectPostProps> = ({ data }) => {
  const post = data.markdownRemark;
  const featuredImage = post.frontmatter.featuredImage ? getImage(post.frontmatter.featuredImage.childImageSharp.gatsbyImageData) : null;

  return (
    <>
      <GlobalStyles />
      <Layout>
        <TableOfContents html={post.html} />
        <PostContainer>
          <PostHeader>
            <PostHeaderContent>
              <PostCategory>{post.frontmatter.category}</PostCategory>
              <PostTitle>{post.frontmatter.title}</PostTitle>
              <PostMeta>
                <time>{post.frontmatter.date}</time>
                <span className="read-time">{post.timeToRead}분 읽기</span>
              </PostMeta>
            </PostHeaderContent>
            {featuredImage && (
              <FeaturedImage>
                <GatsbyImage image={featuredImage} alt={post.frontmatter.title} />
              </FeaturedImage>
            )}
          </PostHeader>

          <PostContent className="post-content" dangerouslySetInnerHTML={{ __html: post.html }} />

          <PostNavigation>
            <Link to="/project/" style={{ textDecoration: 'none' }}>
              <NavLink as="div" className="prev">
                <div className="label">목록으로</div>
                <div className="title">프로젝트 포스트</div>
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
        featuredImage {
          childImageSharp {
            gatsbyImageData(width: 1200, placeholder: BLURRED)
          }
        }
      }
      html
      timeToRead
    }
  }
`;

export const Head = ({ data }: ProjectPostProps) => (
  <>
    <title>{data.markdownRemark.frontmatter.title} | Dev.log</title>
    <meta name="description" content={data.markdownRemark.frontmatter.title} />
  </>
);

export default ProjectPost;
