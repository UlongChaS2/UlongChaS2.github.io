import * as React from 'react';
import { graphql } from 'gatsby';

import { PageProps } from 'gatsby';
import Layout from 'src/components/GlobalLayout';

interface ProjectPostProps extends PageProps {
  data: {
    markdownRemark: {
      frontmatter: {
        title: string;
        date: string;
      };
      html: string;
    };
  };
}

const ProjectPost: React.FC<ProjectPostProps> = ({ data }) => {
  const post = data.markdownRemark;

  return (
    <Layout>
      <h1>{post.frontmatter.title}</h1>
      <p>
        <strong>작성일:</strong> {post.frontmatter.date}
      </p>
      <div dangerouslySetInnerHTML={{ __html: post.html }} />
    </Layout>
  );
};

export const query = graphql`
  query ($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      frontmatter {
        title
        date(formatString: "YYYY-MM-DD")
      }
      html
    }
  }
`;

export default ProjectPost;
