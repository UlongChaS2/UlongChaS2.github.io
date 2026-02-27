import { graphql, useStaticQuery } from 'gatsby';
import * as React from 'react';
import 'src/styles/tokens.css';
import './layout.css';

import { ReactNode } from 'react';
import { Container, Footer } from 'src/styles/LayoutStyles';
import Header from './GlobalHeader';

const Layout = ({ children }: { children: ReactNode }) => {
  useStaticQuery(graphql`
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
      </Container>
      <Footer>
        <p>© {new Date().getFullYear()} Dev.log · ulongchas2</p>
        <p style={{ marginTop: '4px', fontSize: '0.75rem', opacity: 0.6 }}>
          Built with Gatsby & ❤️
        </p>
      </Footer>
    </>
  );
};

export default Layout;
