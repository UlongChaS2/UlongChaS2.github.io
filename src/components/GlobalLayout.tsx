import { graphql, useStaticQuery } from 'gatsby';
import * as React from 'react';
import './layout.css';

import { ReactNode } from 'react';
import { Container, Footer } from 'src/styles/LayoutStyles';
import Header from './GlobalHeader';

const Layout = ({ children }: { children: ReactNode }) => {
  const data = useStaticQuery(graphql`
    query SiteTitleQuery {
      site {
        siteMetadata {
          title
        }
      }
    }
  `);

  return (
    <>
      <Header />
      <Container>
        <main>{children}</main>
        <Footer>© {new Date().getFullYear()} &middot; ulongchas2 all rights reserved.</Footer>
      </Container>
    </>
  );
};

export default Layout;
