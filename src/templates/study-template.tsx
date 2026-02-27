import * as React from 'react';
import { graphql, Link } from 'gatsby';
import { PageProps } from 'gatsby';
import { GatsbyImage, getImage } from 'gatsby-plugin-image';
import Layout from 'src/components/GlobalLayout';
import GlobalStyles from 'src/components/GlobalStyles';
import TableOfContents from 'src/components/TableOfContents';
import {
  PostContainer,
  Breadcrumb,
  PostHeader,
  PostHeaderContent,
  FeaturedImage,
  PostTitle,
  PostMeta,
  PostLayout,
  PostContentWrapper,
  PostContent,
  PostBottomTags,
  AuthorProfile,
  PostNavigation,
  NavLink,
} from 'src/styles/PostStyles';

interface StudyPostProps extends PageProps {
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

const StudyPost: React.FC<StudyPostProps> = ({ data }) => {
  const post = data.markdownRemark;
  const featuredImage = post.frontmatter.featuredImage ? getImage(post.frontmatter.featuredImage.childImageSharp.gatsbyImageData) : null;

  return (
    <>
      <GlobalStyles />
      <Layout>
        <PostContainer>
          <Breadcrumb>
            <Link to="/">Home</Link>
            <span>›</span>
            <span>{post.frontmatter.category}</span>
          </Breadcrumb>

          <PostHeader>
            <PostHeaderContent>
              <PostTitle>{post.frontmatter.title}</PostTitle>
              <PostMeta>
                <time>{post.frontmatter.date}</time>
                <span className="dot">·</span>
                <span className="read-time">{post.timeToRead || 5} min read</span>
                <span className="dot">·</span>
                <span>Written by Dev Team</span>
              </PostMeta>
            </PostHeaderContent>
            
            {featuredImage && (
              <FeaturedImage>
                <GatsbyImage image={featuredImage} alt={post.frontmatter.title} />
              </FeaturedImage>
            )}
          </PostHeader>

          <PostLayout>
            <PostContentWrapper>
              <PostContent className="post-content" dangerouslySetInnerHTML={{ __html: post.html }} />

              <PostBottomTags>
                <span>#{post.frontmatter.category}</span>
                <span>#Tech</span>
              </PostBottomTags>

              <AuthorProfile>
                <div className="avatar">
                  <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuALJ0bPkakvXX5-7stfW738XvOTsLI3FSHu6sEY1O4zdUIM-J79b2gM6zAdiCTodqUUHdEw7ocRYa3ezYhd0YBxhv-zw5GTICccVA-oHp3mGTETNa8m6s8qljlURl43SCeGyWlVGcYKO0PTkJwNbymixhyVdBVJhlE0VrgqEo0aF5hF2l-LvkvvfM9zG1V9jsNCXjaHbUHo5sHCxCYhup-S398CRuS-HpijlP9R0eL5f4rxRH4TZbklbA4auZk8chW0ZaettZ1dTCU" alt="Author" />
                </div>
                <div className="info">
                  <h3>Dev.log 팀</h3>
                  <p>꾸준하게 학습하고 아카이빙합니다.</p>
                </div>
              </AuthorProfile>

              <PostNavigation>
                <Link to="/study/" style={{ textDecoration: 'none', flex: 1 }}>
                  <NavLink as="div" className="prev">
                    <div className="label">목록으로</div>
                    <div className="title">스터디 포스트</div>
                  </NavLink>
                </Link>
              </PostNavigation>
            </PostContentWrapper>

            {/* 오른쪽에 목차 배치 */}
            <TableOfContents html={post.html} />
          </PostLayout>
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
        date(formatString: "YYYY-MM-DD")
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

export const Head = ({ data }: StudyPostProps) => (
  <>
    <title>{data.markdownRemark.frontmatter.title} | Blog</title>
    <meta name="description" content={data.markdownRemark.frontmatter.title} />
  </>
);

export default StudyPost;
