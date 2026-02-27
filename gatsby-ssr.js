/**
 * Implement Gatsby's SSR (Server Side Rendering) APIs in this file.
 *
 * See: https://www.gatsbyjs.com/docs/reference/config-files/gatsby-ssr/
 */

import * as React from 'react';
import { ThemeProvider as EmotionThemeProvider } from '@emotion/react';
import { ThemeProvider, useThemeTokens } from './src/contexts/ThemeContext';

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
