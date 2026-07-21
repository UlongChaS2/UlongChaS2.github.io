/**
 * Implement Gatsby's Browser APIs in this file.
 *
 * See: https://www.gatsbyjs.com/docs/reference/config-files/gatsby-browser/
 */

import * as React from 'react';
import { ThemeProvider as EmotionThemeProvider } from '@emotion/react';
import { ThemeProvider, useThemeTokens } from './src/contexts/ThemeContext';
import GlobalStyles from './src/components/GlobalStyles';

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

/**
 * GlobalStyles는 페이지가 아니라 여기(페이지 바깥)에서 한 번만 렌더한다.
 * 각 페이지가 개별로 렌더하면 페이지 전환 때 Emotion Global이 통째로
 * 빠졌다 다시 붙어 화면이 번쩍인다. wrapPageElement는 전환에도
 * 유지되므로 스타일이 사라지지 않는다.
 */
export const wrapPageElement = ({ element }) => {
  return (
    <>
      <GlobalStyles />
      {element}
    </>
  );
};
