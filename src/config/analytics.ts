// ============================================================
// 방문자 통계 (GoatCounter)
//
// 1. https://www.goatcounter.com 에서 무료 가입하면 사이트 코드를 정한다.
//    예: 코드가 'ulongchas2'이면 대시보드는 ulongchas2.goatcounter.com
// 2. 아래 GOATCOUNTER_CODE에 그 코드를 넣는다.
//
// 코드가 비어 있으면 추적 스크립트를 넣지 않는다(개발 중엔 조용히 꺼짐).
// 쿠키를 쓰지 않으므로 동의 배너가 필요 없다.
// ============================================================

export const GOATCOUNTER_CODE = 'ulongcha';

/** 추적 엔드포인트. 코드가 없으면 빈 문자열. */
export const goatcounterEndpoint = (): string =>
  GOATCOUNTER_CODE ? `https://${GOATCOUNTER_CODE}.goatcounter.com/count` : '';
