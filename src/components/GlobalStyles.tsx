import React from 'react';
import { Global, css } from '@emotion/react';
import 'normalize.css';

// ============================================================
// GlobalStyles — Emotion Global CSS
// NOTE: 색상/스페이싱 토큰(--color-*, --space-* 등)은
//       tokens.css (gatsby-browser.js에서 import)에서 관리합니다.
//       theme 객체를 직접 참조하지 않고 CSS var()를 사용합니다.
// ============================================================

const GlobalStyles = () => (
  <Global
    styles={css`
      @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/variable/pretendardvariable.css');

      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      html {
        scroll-behavior: smooth;
        font-size: 16px;
        -webkit-text-size-adjust: 100%;
      }

      body {
        font-family: var(--font-base);
        background-color: var(--color-bg-default);
        color: var(--color-text-primary);
        line-height: var(--lh-relaxed);
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        transition:
          background-color 0.3s ease,
          color 0.3s ease;
        word-wrap: break-word;
      }

      h1,
      h2,
      h3,
      h4,
      h5,
      h6 {
        font-weight: var(--fw-bold);
        line-height: var(--lh-snug);
        letter-spacing: var(--ls-tight);
        color: var(--color-text-primary);
      }

      a {
        color: var(--color-text-link);
        text-decoration: none;
        transition: color var(--transition-fast);

        &:hover {
          color: var(--color-text-link-hover);
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

      code,
      kbd,
      samp,
      pre {
        font-family: var(--font-mono);
        font-size: 0.875em;
      }

      pre {
        background: var(--color-bg-code);
        border-radius: var(--radius-md);
        padding: var(--space-4);
        overflow-x: auto;
        line-height: var(--lh-relaxed);
      }

      code {
        background: var(--color-bg-code);
        border-radius: var(--radius-sm);
        padding: 0.2em 0.4em;
        font-size: 0.875em;
      }

      pre code {
        background: none;
        padding: 0;
        border-radius: 0;
      }

      ::selection {
        background-color: var(--color-brand-primary);
        color: var(--color-text-inverse);
      }

      /* Scrollbar 스타일 */
      ::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }

      ::-webkit-scrollbar-track {
        background: var(--color-bg-subtle);
      }

      ::-webkit-scrollbar-thumb {
        background: var(--color-border-default);
        border-radius: var(--radius-full);

        &:hover {
          background: var(--color-text-tertiary);
        }
      }

      /* Focus 스타일 (접근성) */
      :focus-visible {
        outline: 2px solid var(--color-brand-primary);
        outline-offset: 2px;
        border-radius: var(--radius-sm);
      }
    `}
  />
);

export default GlobalStyles;
