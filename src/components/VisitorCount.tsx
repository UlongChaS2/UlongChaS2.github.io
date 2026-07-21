import * as React from 'react';
import styled from '@emotion/styled';
import { GOATCOUNTER_CODE } from 'src/config/analytics';

// ============================================================
// VisitorCount — GoatCounter 공개 카운터로 전체 방문 수를 보여준다.
//
// GoatCounter 대시보드 Settings에서 공개 카운터(counter endpoint)를
// 켜둬야 /counter/TOTAL.json 이 열린다. 꺼져 있거나 코드가 없으면
// 이 컴포넌트는 조용히 아무것도 그리지 않는다.
//
// 기간별(오늘/주간)은 인증 API가 필요해 정적 사이트에선 못 한다.
// 여기서는 전체 누적 순 방문자 수만 실시간으로 읽는다.
// ============================================================

const Count = styled.span`
  color: var(--color-text-tertiary);
  font-size: var(--fs-caption);

  strong {
    color: var(--color-text-secondary);
    font-weight: var(--fw-bold);
    font-variant-numeric: tabular-nums;
  }
`;

const VisitorCount: React.FC = () => {
  const [visitors, setVisitors] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!GOATCOUNTER_CODE) return;
    let cancelled = false;
    fetch(`https://${GOATCOUNTER_CODE}.goatcounter.com/counter/TOTAL.json`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        // count_unique = 순 방문자, count = 총 조회수. 방문자 우선.
        const n = d?.count_unique ?? d?.count;
        if (!cancelled && n) setVisitors(String(n));
      })
      .catch(() => {
        /* 공개 카운터가 꺼져 있으면(403) 조용히 넘어간다 */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!visitors) return null;

  return (
    <Count>
      지금까지 <strong>{visitors}</strong>명 다녀갔어요
    </Count>
  );
};

export default VisitorCount;
