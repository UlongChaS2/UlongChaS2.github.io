import * as React from 'react';
import styled from '@emotion/styled';
import { GOATCOUNTER_CODE } from 'src/config/analytics';
import { IconEye } from './icons';

// ============================================================
// VisitorCount — 푸터에 작게 두는 방문자 메타.
//
// GoatCounter 공개 카운터(counter/TOTAL.json)로 최근 7일/이번 달 순 방문자 수를
// 실시간으로 읽는다. 서버가 필요 없다.
//
// 페이지를 옮길 때마다 헤더가 다시 마운트되어 매번 새로 fetch한다.
// 숫자가 뒤늦게 채워지며 폭이 늘어나지 않게 숫자 영역에 min-width를 둔다.
//
// 최근 7일/이번 달 수는 공개 카운터의 ?start= 파라미터로 받는다 — 인증 불필요.
//
// '오늘'이 아니라 '최근 7일'인 이유: 공개 카운터는 날짜를 UTC로 나누고 시각을 받지 않아서
// '오늘'이 한국 시간 오전 9시부터만 셌고, 방문자가 적어 거의 매일 0이었다.
// ============================================================

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  gap: 4px;
  width: fit-content;
  margin-top: 2px;
  color: var(--color-text-tertiary);
  opacity: 0.48;

  .num {
    display: inline-block;
    min-width: 3ch;
    text-align: right;
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: var(--fw-semibold);
    letter-spacing: -0.01em;
    color: var(--color-text-tertiary);
    font-variant-numeric: tabular-nums;
  }

  .label {
    font-family: var(--font-base);
    font-size: 10px;
    font-weight: var(--fw-medium);
    color: var(--color-text-tertiary);
  }

  .divider {
    width: 1px;
    height: 9px;
    background: var(--color-border-default);
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
  const [month, setMonth] = React.useState('');
  const [week, setWeek] = React.useState('');
  const [state, setState] = React.useState<State>('loading');

  React.useEffect(() => {
    if (!GOATCOUNTER_CODE) {
      setState('hide');
      return;
    }
    let cancelled = false;

    const ymd = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const now = new Date();
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
    const monthStart = `${ymd(now).slice(0, 8)}01`;

    fetchCount(`?start=${monthStart}`).then((monthly) => {
      if (cancelled) return;
      if (monthly) {
        setMonth(monthly);
        setState('ok');
      } else {
        // 공개 카운터가 꺼져 있으면(403) 배지 자체를 숨긴다.
        setState('hide');
      }
    });

    // 오늘 포함 7일. 실패하면 '-'로 두고 조용히 넘어간다.
    fetchCount(`?start=${ymd(weekStart)}`).then((n) => {
      if (!cancelled) setWeek(n);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  // 코드가 없거나 조회에 실패하면 아예 그리지 않는다.
  // 로딩 중에는 min-width로 자리만 잡은 빈 배지를 둔다(덜컹임 방지).
  if (state === 'hide') return null;

  return (
    <Badge>
      <IconEye size={12} />
      <span>
        <span className="label">최근 7일 </span>
        <span className="num">{week || '-'}</span>
      </span>
      <span className="divider" />
      <span>
        <span className="label">이번달 </span>
        <span className="num">{month || '-'}</span>
      </span>
    </Badge>
  );
};

export default VisitorCount;
