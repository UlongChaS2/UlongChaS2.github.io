/**
 * Implement Gatsby's SSR (Server Side Rendering) APIs in this file.
 *
 * See: https://www.gatsbyjs.com/docs/reference/config-files/gatsby-ssr/
 */

import * as React from 'react';
import { ThemeProvider as EmotionThemeProvider } from '@emotion/react';
import { ThemeProvider, useThemeTokens } from './src/contexts/ThemeContext';
import GlobalStyles from './src/components/GlobalStyles';

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

// GlobalStyles를 페이지 바깥에서 한 번만 렌더한다(브라우저와 동일).
export const wrapPageElement = ({ element }) => {
  return (
    <>
      <GlobalStyles />
      {element}
    </>
  );
};

/**
 * 하이드레이션 전에 data-theme을 심는다.
 * ThemeContext는 useEffect에서 속성을 붙이므로, 이 스크립트가 없으면
 * 다크 모드 사용자에게 첫 페인트가 흰 화면으로 번쩍인다(FOUC).
 * 이게 있어야 tokens.css에서 prefers-color-scheme 폴백 블록을 지울 수 있다.
 */
const setInitialTheme = `
(function () {
  try {
    var saved = localStorage.getItem('theme');
    var mode = saved === 'light' || saved === 'dark'
      ? saved
      : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', mode);
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'light');
  }
})();
`;

export const onRenderBody = ({ setPreBodyComponents, setHeadComponents }) => {
  setPreBodyComponents([
    <script
      key="initial-theme"
      dangerouslySetInnerHTML={{ __html: setInitialTheme }}
    />,
  ]);

  // SVG 파비콘. manifest 플러그인이 넣어주는 PNG는 고해상도 화면에서 뭉개진다.
  // SVG를 먼저 선언하면 지원하는 브라우저가 이걸 쓰고, 나머지는 PNG로 내려간다.
  setHeadComponents([
    <link
      key="favicon-svg"
      rel="icon"
      type="image/svg+xml"
      href="/favicon.svg"
    />,
  ]);
};
