import React from 'react';
import { Global, css } from '@emotion/react';
import 'normalize.css';

const GlobalStyles = () => (
  <Global
    styles={css`
      body {
        font-family: Arial, sans-serif;
        background-color: white;
        line-height: 1.6;
      }
    `}
  />
);

export default GlobalStyles;
