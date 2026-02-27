/**
 * Implement Gatsby's Browser APIs in this file.
 *
 * See: https://www.gatsbyjs.com/docs/reference/config-files/gatsby-browser/
 */

import * as React from 'react';
import { ThemeProvider as EmotionThemeProvider } from '@emotion/react';
import { ThemeProvider, useThemeTokens } from './src/contexts/ThemeContext';

// Import design tokens as CSS Custom Properties
import './src/styles/tokens.css';

/**
 * Inner wrapper that reads the resolved theme and provides it to Emotion
 */
const EmotionWrapper = ({ children }) => {
  const tokens = useThemeTokens();
  return <EmotionThemeProvider theme={tokens}>{children}</EmotionThemeProvider>;
};

export const wrapRootElement = ({ element }) => {
  return (
    <ThemeProvider>
      <EmotionWrapper>{element}</EmotionWrapper>
    </ThemeProvider>
  );
};
