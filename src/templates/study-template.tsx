import * as React from 'react';
import { graphql, PageProps } from 'gatsby';
import PostTemplate, { AdjacentPost } from 'src/components/PostTemplate';
import Seo from 'src/components/seo';

interface StudyPostContext {
  slug: string;
  previous: AdjacentPost | null;
  next: AdjacentPost | null;
}

interface StudyPostProps extends PageProps<any, StudyPostContext> {
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
      excerpt: string;
      html: string;
      timeToRead: number;
      fields: {
        slug: string;
      };
    };
  };
}

const StudyPost: React.FC<StudyPostProps> = ({ data, pageContext }) => {
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
      excerpt(pruneLength: 150)
      html
      timeToRead
      fields {
        slug
      }
    }
  }
`;

export const Head = ({ data }: StudyPostProps) => (
  <Seo
    title={data.markdownRemark.frontmatter.title}
    description={data.markdownRemark.excerpt}
    pathname={`/study${data.markdownRemark.fields.slug}`}
    type="article"
  />
);

export default StudyPost;
