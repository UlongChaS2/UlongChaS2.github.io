import * as React from "react";
import { useStaticQuery, graphql } from "gatsby";
import { css } from "@emotion/react"; // Emotion의 css 함수 사용

import Header from "./header";
import "./layout.css";

const Layout = ({ children }) => {
  const data = useStaticQuery(graphql`
    query SiteTitleQuery {
      site {
        siteMetadata {
          title
        }
      }
    }
  `);

  // Emotion으로 스타일 정의
  const containerStyle = css`
    margin: 0 auto;
    max-width: var(--size-content);
    padding: var(--size-gutter);
  `;

  const footerStyle = css`
    margin-top: var(--space-5);
    font-size: var(--font-sm);
  `;

  return (
    <>
      <Header siteTitle={data.site.siteMetadata?.title || `Title`} />
      <div css={containerStyle}>
        <main>{children}</main>
        <footer css={footerStyle}>
          © {new Date().getFullYear()} &middot; Built with {` `}
          <a href="https://www.gatsbyjs.com">Gatsby</a>
        </footer>
      </div>
    </>
  );
};

export default Layout;
