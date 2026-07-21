import * as React from 'react';
import styled from '@emotion/styled';
import { GOATCOUNTER_CODE } from 'src/config/analytics';
import { IconEye } from './icons';

// ============================================================
// VisitorCount — 헤더 우측의 전체 방문자 배지.
//
// GoatCounter 공개 카운터(counter/TOTAL.json)로 누적 순 방문자 수를
// 실시간으로 읽는다. 서버가 필요 없다.
//
// 페이지를 옮길 때마다 헤더가 다시 마운트되어 매번 새로 fetch한다.
// 숫자가 뒤늦게 채워지며 배지 폭이 늘어나면 헤더가 덜컹인다. 그래서
// 배지에 min-width를 줘서 로딩 중에도 자리를 미리 잡아둔다.
//
// 헤더는 좁아 모바일에서는 로고·햄버거만 남기고 이 배지를 숨긴다.
// 기간별(오늘/주간)은 인증 API가 필요해 정적 사이트에선 못 하므로
// 전체 누적만 보여준다.
// ============================================================

const Badge = styled.span`
  display: none;

  @media (min-width: 768px) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    /* 로딩→숫자 등장 시 폭이 안 변하도록 자리를 미리 확보 */
    min-width: 68px;
    padding: 7px 13px;
    border-radius: var(--radius-full);
    background: var(--color-bg-subtle);
    color: var(--color-text-tertiary);
    flex-shrink: 0;
  }

  .num {
    min-width: 18px;
    text-align: left;
    font-family: var(--font-mono);
    font-size: 13px;
    font-weight: var(--fw-semibold);
    letter-spacing: -0.01em;
    color: var(--color-text-secondary);
    font-variant-numeric: tabular-nums;
  }
`;

type State = 'loading' | 'ok' | 'hide';

const VisitorCount: React.FC = () => {
  const [visitors, setVisitors] = React.useState('');
  const [state, setState] = React.useState<State>('loading');

  React.useEffect(() => {
    if (!GOATCOUNTER_CODE) {
      setState('hide');
      return;
    }
    let cancelled = false;
    fetch(`https://${GOATCOUNTER_CODE}.goatcounter.com/counter/TOTAL.json`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (cancelled) return;
        // count_unique = 순 방문자, count = 총 조회수. 방문자 우선.
        const n = d?.count_unique ?? d?.count;
        if (n) {
          setVisitors(String(n));
          setState('ok');
        } else {
          setState('hide');
        }
      })
      .catch(() => {
        // 공개 카운터가 꺼져 있으면(403) 배지 자체를 숨긴다.
        if (!cancelled) setState('hide');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // 코드가 없거나 조회에 실패하면 아예 그리지 않는다.
  // 로딩 중에는 min-width로 자리만 잡은 빈 배지를 둔다(덜컹임 방지).
  if (state === 'hide') return null;

  return (
    <Badge title={visitors ? `지금까지 ${visitors}명이 다녀갔어요` : undefined}>
      <IconEye size={15} />
      <span className="num">{visitors}</span>
    </Badge>
  );
};

export default VisitorCount;
