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
// 배지에는 전체 누적을, 툴팁에는 오늘 수를 함께 보여준다.
// 오늘 수는 공개 카운터의 ?start= 파라미터로 받는다 — 인증 불필요.
// ============================================================

const Badge = styled.span`
  display: none;

  @media (min-width: 768px) {
    display: inline-flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
    /* 로딩→숫자 등장 시 폭이 안 변하도록 자리를 미리 확보 */
    min-width: 52px;
    padding: 7px 13px;
    border-radius: var(--radius-full);
    background: var(--color-bg-subtle);
    color: var(--color-text-tertiary);
    flex-shrink: 0;
  }

  .num {
    min-width: 18px;
    text-align: right;
    font-family: var(--font-mono);
    font-size: 13px;
    font-weight: var(--fw-semibold);
    letter-spacing: -0.01em;
    color: var(--color-text-secondary);
    font-variant-numeric: tabular-nums;
  }
`;

type State = 'loading' | 'ok' | 'hide';

// count_unique = 순 방문자, count = 총 조회수. 방문자 우선.
// GoatCounter가 자리 구분자를 섞어 주는 경우가 있어 숫자만 추린 뒤 콤마를 다시 찍는다.
const parseCount = (d: { count_unique?: unknown; count?: unknown } | null): string => {
  const digits = String(d?.count_unique ?? d?.count ?? '').replace(/\D/g, '');
  return digits ? Number(digits).toLocaleString('ko-KR') : '';
};

const fetchCount = (query = ''): Promise<string> =>
  fetch(`https://${GOATCOUNTER_CODE}.goatcounter.com/counter/TOTAL.json${query}`)
    .then((r) => (r.ok ? r.json() : null))
    .then(parseCount)
    .catch(() => '');

const VisitorCount: React.FC = () => {
  const [visitors, setVisitors] = React.useState('');
  const [today, setToday] = React.useState('');
  const [state, setState] = React.useState<State>('loading');

  React.useEffect(() => {
    if (!GOATCOUNTER_CODE) {
      setState('hide');
      return;
    }
    let cancelled = false;

    fetchCount().then((total) => {
      if (cancelled) return;
      if (total) {
        setVisitors(total);
        setState('ok');
      } else {
        // 공개 카운터가 꺼져 있으면(403) 배지 자체를 숨긴다.
        setState('hide');
      }
    });

    // 오늘 0시(로컬)부터의 수. 실패해도 툴팁에서만 빠지면 되니 조용히 무시.
    const now = new Date();
    const ymd = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    fetchCount(`?start=${ymd}`).then((n) => {
      if (!cancelled) setToday(n);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  // 코드가 없거나 조회에 실패하면 아예 그리지 않는다.
  // 로딩 중에는 min-width로 자리만 잡은 빈 배지를 둔다(덜컹임 방지).
  if (state === 'hide') return null;

  return (
    <Badge
      title={
        visitors
          ? today
            ? `오늘 ${today}명 · 지금까지 ${visitors}명이 다녀갔어요`
            : `지금까지 ${visitors}명이 다녀갔어요`
          : undefined
      }
    >
      <IconEye size={15} />
      <span className="num">{visitors}</span>
    </Badge>
  );
};

export default VisitorCount;
