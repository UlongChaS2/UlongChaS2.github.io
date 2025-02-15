import styled from '@emotion/styled';
import * as React from 'react';
import { Link } from 'gatsby';
import { HeaderContainer, Nav } from 'src/styles/HeaderStyles';

const Header = () => {
  return (
    <HeaderContainer>
      logo
      <Nav>
        <Link to="/study">study</Link>
        <Link to="/project">project</Link>
        <Link to="/about">about</Link>
      </Nav>
    </HeaderContainer>
  );
};

export default Header;
