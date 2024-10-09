// src/pages/index.js

import React from "react";
import Layout from "../components/layout";
import { Helmet } from "react-helmet";
import GlobalStyles from "../components/GlobalStyles.js";

const IndexPage = () => {
  return (
    <>
      <GlobalStyles />

      <Layout>
        <Helmet>
          <title>Home | My Gatsby Blog</title>
          <meta
            name="description"
            content="This is the homepage of my Gatsby blog."
          />
        </Helmet>
        <h1>Welcome to my Gatsby Blog</h1>
        <p>This is my first blog post.</p>
      </Layout>
    </>
  );
};

export default IndexPage;
