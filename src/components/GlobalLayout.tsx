import * as React from 'react';
import { useStaticQuery, graphql } from 'gatsby';
import styled from '@emotion/styled';

import './layout.css';

import { ReactNode } from 'react';
import Header from './GlobalHeader2';

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

  const Container = styled.div`
    margin: 0 auto;
    max-width: var(--size-content);
    padding: var(--size-gutter);
  `;

  const Footer = styled.footer`
    margin-top: var(--space-5);
    font-size: var(--font-sx);
  `;

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
