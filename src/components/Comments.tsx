import * as React from 'react';
import styled from '@emotion/styled';
import { useTheme } from 'src/contexts/ThemeContext';

// ============================================================
// Comments — giscus (GitHub Discussions 기반 댓글)
//
// 방문자가 자기 GitHub 계정으로 로그인해 댓글을 남기면
// 이 저장소의 Discussions에 저장된다. 서버가 필요 없다.
//
// 동작하려면 아래 두 가지가 먼저 끝나 있어야 한다:
//   1. 저장소 Settings → Features → Discussions 체크
//   2. https://github.com/apps/giscus 에서 giscus 앱을 이 저장소에 설치
// 그 뒤 giscus.app 에서 안내하는 CATEGORY_ID 를 아래에 채운다.
// CATEGORY_ID 가 비어 있으면 이 컴포넌트는 아무것도 렌더하지 않는다.
// ============================================================

const REPO = 'UlongChaS2/UlongChaS2.github.io';
const REPO_ID = 'MDEwOlJlcG9zaXRvcnkzNTYzMDkxNDQ=';
// Announcements 카테고리 — 방문자가 최상위 토론을 못 만들고 giscus만
// 페이지별로 생성하게 하는 giscus 권장 설정.
const CATEGORY = 'Announcements';
const CATEGORY_ID = 'DIC_kwDOFTzYmM4DBnUo';

const GISCUS_ORIGIN = 'https://giscus.app';

/*
 * 본문과 같은 왼쪽 라인·폭(800px)에 맞춘다.
 * margin:0 auto로 두면 1200px 컨테이너 중앙에 떠서 본문과 어긋난다.
 * 좌우 padding은 PostContainer가 이미 주므로 여기선 위쪽만 띄운다.
 */
const Wrapper = styled.section`
  max-width: 800px;
  margin: 0;
  padding-top: var(--space-16);
`;

const Heading = styled.h2`
  font-size: var(--fs-title-md);
  font-weight: var(--fw-extrabold);
  letter-spacing: var(--ls-tight);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-6) 0;
`;

const giscusTheme = (resolved: string) => (resolved === 'dark' ? 'dark_dimmed' : 'light');

const postTheme = (theme: string) => {
  const frame = document.querySelector<HTMLIFrameElement>('iframe.giscus-frame');
  frame?.contentWindow?.postMessage({ giscus: { setConfig: { theme } } }, GISCUS_ORIGIN);
};

const Comments: React.FC = () => {
  const { resolvedTheme } = useTheme();
  const ref = React.useRef<HTMLDivElement>(null);
  // giscus 스크립트를 심을 당시의 테마가 이후 바뀌어도 최신값을 참조하기 위한 ref
  const themeRef = React.useRef(resolvedTheme);
  themeRef.current = resolvedTheme;

  // 최초 마운트 시 giscus 스크립트를 컨테이너 안에 심는다.
  React.useEffect(() => {
    if (!CATEGORY_ID || !ref.current) return;
    // React 리렌더로 두 번 붙는 것을 막는다.
    if (ref.current.querySelector('script')) return;

    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.async = true;
    script.crossOrigin = 'anonymous';
    const attrs: Record<string, string> = {
      'data-repo': REPO,
      'data-repo-id': REPO_ID,
      'data-category': CATEGORY,
      'data-category-id': CATEGORY_ID,
      'data-mapping': 'pathname',
      'data-strict': '1',
      'data-reactions-enabled': '1',
      'data-emit-metadata': '0',
      'data-input-position': 'top',
      'data-theme': giscusTheme(themeRef.current),
      'data-lang': 'ko',
      'data-loading': 'lazy',
    };
    Object.entries(attrs).forEach(([k, v]) => script.setAttribute(k, v));
    ref.current.appendChild(script);

    // giscus는 로드가 끝나면 'giscus' 메시지를 보낸다. 그 시점에 현재 테마를
    // 다시 밀어준다. 스크립트를 심을 때 테마가 아직 light 초기값이면
    // 다크 페이지에 밝은 위젯이 뜨는데, 이 sync가 그 어긋남을 바로잡는다.
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== GISCUS_ORIGIN) return;
      if (e.data && typeof e.data === 'object' && 'giscus' in e.data) {
        postTheme(giscusTheme(themeRef.current));
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 테마 토글 시 iframe을 다시 만들지 않고 메시지로만 바꾼다.
  React.useEffect(() => {
    if (!CATEGORY_ID) return;
    postTheme(giscusTheme(resolvedTheme));
  }, [resolvedTheme]);

  // 설정이 끝나기 전에는 조용히 아무것도 그리지 않는다.
  if (!CATEGORY_ID) return null;

  return (
    <Wrapper>
      <Heading>댓글</Heading>
      <div ref={ref} />
    </Wrapper>
  );
};

export default Comments;
