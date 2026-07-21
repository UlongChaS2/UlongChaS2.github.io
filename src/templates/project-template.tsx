import * as React from 'react';
import { graphql, PageProps } from 'gatsby';
import PostTemplate, { AdjacentPost } from 'src/components/PostTemplate';

interface ProjectPostContext {
  slug: string;
  previous: AdjacentPost | null;
  next: AdjacentPost | null;
}

interface ProjectPostProps extends PageProps<any, ProjectPostContext> {
  data: {
    markdownRemark: {
      frontmatter: {
        title: string;
        date: string;
        category: string;
        keywords?: (string | null)[] | null;
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

const ProjectPost: React.FC<ProjectPostProps> = ({ data, pageContext }) => {
  const post = data.markdownRemark;

  return (
    <PostTemplate
      title={post.frontmatter.title}
      category={post.frontmatter.category}
      date={post.frontmatter.date}
      timeToRead={post.timeToRead}
      html={post.html}
      keywords={post.frontmatter.keywords}
      featuredImage={post.frontmatter.featuredImage?.childImageSharp?.gatsbyImageData}
      previous={pageContext.previous}
      next={pageContext.next}
    />
  );
};

export const query = graphql`
  query ($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      frontmatter {
        title
        date(formatString: "YYYY년 MM월 DD일")
        category
        keywords
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
