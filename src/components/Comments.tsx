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

const Wrapper = styled.section`
  max-width: 800px;
  margin: 0 auto;
  padding: var(--space-16) var(--space-6) 0;

  @media (min-width: 768px) {
    padding: var(--space-16) var(--space-8) 0;
  }
`;

const Heading = styled.h2`
  font-size: var(--fs-title-md);
  font-weight: var(--fw-extrabold);
  letter-spacing: var(--ls-tight);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-6) 0;
`;

const giscusTheme = (resolved: string) => (resolved === 'dark' ? 'dark_dimmed' : 'light');

const Comments: React.FC = () => {
  const { resolvedTheme } = useTheme();
  const ref = React.useRef<HTMLDivElement>(null);

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
      'data-theme': giscusTheme(resolvedTheme),
      'data-lang': 'ko',
      'data-loading': 'lazy',
    };
    Object.entries(attrs).forEach(([k, v]) => script.setAttribute(k, v));
    ref.current.appendChild(script);
    // resolvedTheme는 아래 별도 effect에서 postMessage로 갱신하므로
    // 여기서는 의존성에 넣지 않는다(스크립트를 다시 심으면 안 된다).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 테마 토글 시 iframe을 다시 만들지 않고 메시지로만 바꾼다.
  React.useEffect(() => {
    if (!CATEGORY_ID) return;
    const frame = document.querySelector<HTMLIFrameElement>('iframe.giscus-frame');
    frame?.contentWindow?.postMessage(
      { giscus: { setConfig: { theme: giscusTheme(resolvedTheme) } } },
      GISCUS_ORIGIN,
    );
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
