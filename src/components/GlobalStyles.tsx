import React from 'react';
import { Global, css } from '@emotion/react';
import 'normalize.css';
import { theme } from 'src/styles/theme';

const GlobalStyles = () => (
  <Global
    styles={css`
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      html {
        scroll-behavior: smooth;
      }

      body {
        font-family:
          'Inter',
          -apple-system,
          BlinkMacSystemFont,
          'Segoe UI',
          Roboto,
          'Helvetica Neue',
          Arial,
          sans-serif;
        background-color: ${theme.colors.background};
        color: ${theme.colors.text.primary};
        line-height: 1.6;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }

      h1,
      h2,
      h3,
      h4,
      h5,
      h6 {
        font-weight: ${theme.fontWeight.bold};
        line-height: 1.2;
      }

      a {
        color: ${theme.colors.primary};
        text-decoration: none;
        transition: color ${theme.transition.fast};

        &:hover {
          color: ${theme.colors.secondary};
        }
      }

      img {
        max-width: 100%;
        height: auto;
        display: block;
      }

      button {
        font-family: inherit;
        cursor: pointer;
      }

      ::selection {
        background-color: ${theme.colors.primary};
        color: white;
      }

      /* Scrollbar 스타일 */
      ::-webkit-scrollbar {
        width: 10px;
      }

      ::-webkit-scrollbar-track {
        background: ${theme.colors.surface};
      }

      ::-webkit-scrollbar-thumb {
        background: ${theme.colors.border};
        border-radius: ${theme.borderRadius.full};

        &:hover {
          background: ${theme.colors.text.tertiary};
        }
      }
    `}
  />
);

export default GlobalStyles;
