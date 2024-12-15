// src/pages/index.js

import React from 'react';
import Layout from '../components/GlobalLayout';
import GlobalStyles from '../components/GlobalStyles';
import { graphql, useStaticQuery } from 'gatsby';

const IndexPage = () => {
  const data = useStaticQuery(graphql`
    query {
      allMarkdownRemark(sort: { order: DESC, fields: [frontmatter___date] }, limit: 5) {
        edges {
          node {
            id
            frontmatter {
              title
              date(formatString: "YYYY-MM-DD")
            }
            excerpt
            fields {
              slug
            }
          }
        }
      }
    }
  `);

  const posts = data.allMarkdownRemark.edges;
  console.log(data, posts);
  return (
    <>
      <GlobalStyles />
      <Layout>
        <h1>Welcome to my Gatsby Blog</h1>
        <p>This is my first blog post.</p>
      </Layout>
    </>
  );
};

// Gatsby의 내장 Head API 사용
export const Head = () => (
  <>
    <title>Home | My Gatsby Blog</title>
    <meta name="description" content="This is the homepage of my Gatsby blog." />
  </>
);

export default IndexPage;
