import * as React from 'react';
import { ReactNode } from 'react';
import 'src/styles/tokens.css';
import './layout.css';

import { Container } from 'src/styles/LayoutStyles';
import Header from './GlobalHeader';
import SiteFooter from './SiteFooter';

interface LayoutProps {
  children: ReactNode;
  /** 소개 페이지처럼 CTA가 무의미한 곳은 저작권만 남긴다. */
  hideCta?: boolean;
}

const Layout = ({ children, hideCta = false }: LayoutProps) => (
  <>
    <Header />
    <Container>
      <main>{children}</main>
    </Container>
    <SiteFooter showCta={!hideCta} />
  </>
);

export default Layout;
