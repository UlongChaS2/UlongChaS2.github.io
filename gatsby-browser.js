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

/**
 * GoatCounter 방문 카운트 (클라이언트 라우팅 전환용).
 * 초기 로드는 count.js가 스스로 세므로 여기서 첫 호출은 건너뛴다.
 * 그 뒤 페이지 이동마다 한 번씩 센다 — 중복 없이 정확히 집계된다.
 */
let skipFirstRouteCount = true;
export const onRouteUpdate = ({ location }) => {
  if (typeof window === 'undefined') return;
  if (skipFirstRouteCount) {
    skipFirstRouteCount = false;
    return;
  }
  const gc = window.goatcounter;
  if (gc && typeof gc.count === 'function') {
    gc.count({ path: location.pathname + location.search + location.hash });
  }
};
