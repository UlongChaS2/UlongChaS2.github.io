import * as React from 'react';
import styled from '@emotion/styled';
import { GOATCOUNTER_CODE } from 'src/config/analytics';
import { IconEye } from './icons';

// ============================================================
// VisitorCount — 헤더 우측의 전체 방문자 배지.
//
// GoatCounter 공개 카운터(counter/TOTAL.json)로 누적 순 방문자 수를
// 실시간으로 읽는다. 서버가 필요 없다. 공개 카운터가 꺼져 있거나(403)
// 코드가 없으면 조용히 아무것도 그리지 않는다.
//
// 헤더는 좁아서 모바일에서는 로고·햄버거만 남기고 이 배지를 숨긴다.
// 기간별(오늘/주간)은 인증 API가 필요해 정적 사이트에선 못 하므로
// 전체 누적만 보여준다.
// ============================================================

const Badge = styled.span`
  display: none;

  @media (min-width: 768px) {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 7px 13px;
    border-radius: var(--radius-full);
    background: var(--color-bg-subtle);
    color: var(--color-text-tertiary);
    flex-shrink: 0;
  }

  .num {
    font-family: var(--font-mono);
    font-size: 13px;
    font-weight: var(--fw-semibold);
    letter-spacing: -0.01em;
    color: var(--color-text-secondary);
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
    <Badge title={`지금까지 ${visitors}명이 다녀갔어요`}>
      <IconEye size={15} />
      <span className="num">{visitors}</span>
    </Badge>
  );
};

export default VisitorCount;
