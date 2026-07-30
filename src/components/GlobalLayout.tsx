import * as React from 'react';
import { ReactNode } from 'react';
import 'src/styles/tokens.css';
import './layout.css';

import { Container } from 'src/styles/LayoutStyles';
import Header from './GlobalHeader';
import SiteFooter from './SiteFooter';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => (
  <>
    <Header />
    <Container>
      <main>{children}</main>
    </Container>
    <SiteFooter />
  </>
);

export default Layout;
