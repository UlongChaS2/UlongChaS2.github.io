import * as React from 'react';
import { Link } from 'gatsby';
import { HeaderContainer, HeaderInner, Logo, Nav } from 'src/styles/HeaderStyles';
import ThemeToggle from './ThemeToggle';

const Header = () => {
  return (
    <HeaderContainer>
      <HeaderInner>
        <Logo>
          <Link to="/">Dev.log</Link>
        </Logo>
        <Nav>
          <Link to="/" activeClassName="active">
            홈
          </Link>
          <Link to="/study/" activeClassName="active" partiallyActive={true}>
            스터디
          </Link>
          <Link to="/project/" activeClassName="active" partiallyActive={true}>
            프로젝트
          </Link>
          <Link to="/about/" activeClassName="active" partiallyActive={true}>
            소개
          </Link>
          <ThemeToggle />
        </Nav>
      </HeaderInner>
    </HeaderContainer>
  );
};

export default Header;
