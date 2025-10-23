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

      /* CSS Variables for theming */
      :root,
      [data-theme='light'] {
        --color-background: ${theme.colors.light.background};
        --color-surface: ${theme.colors.light.surface};
        --color-text-primary: ${theme.colors.light.text.primary};
        --color-text-secondary: ${theme.colors.light.text.secondary};
        --color-text-tertiary: ${theme.colors.light.text.tertiary};
        --color-border: ${theme.colors.light.border};
        --color-hover: ${theme.colors.light.hover};
      }

      [data-theme='dark'] {
        --color-background: ${theme.colors.dark.background};
        --color-surface: ${theme.colors.dark.surface};
        --color-text-primary: ${theme.colors.dark.text.primary};
        --color-text-secondary: ${theme.colors.dark.text.secondary};
        --color-text-tertiary: ${theme.colors.dark.text.tertiary};
        --color-border: ${theme.colors.dark.border};
        --color-hover: ${theme.colors.dark.hover};
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
        background-color: var(--color-background);
        color: var(--color-text-primary);
        line-height: 1.6;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        transition:
          background-color 0.3s ease,
          color 0.3s ease;
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
        background: var(--color-surface);
      }

      ::-webkit-scrollbar-thumb {
        background: var(--color-border);
        border-radius: ${theme.borderRadius.full};

        &:hover {
          background: var(--color-text-tertiary);
        }
      }
    `}
  />
);

export default GlobalStyles;
