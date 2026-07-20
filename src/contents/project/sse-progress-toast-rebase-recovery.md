---
title: '외부 데이터 동기화를 비동기 job으로 — 멱등, 실패 UX, 다중 소스'
date: '2026-07-15'
category: 'project'
keywords: ['비동기 job', 'SSE', 'FE']
---

> 느린 외부 연동을 "동기 요청/응답"에서 "식별 가능한 비동기 job(즉시 반환 + SSE 진행 관측 + 폴링 폴백 + timeout)"으로 바꾸고, 연타 방어(멱등)·명확한 실패 UX·다중 소스 일반화까지 끌고 간 실전 기록.

<!--more-->

## 개요

브라우저는 15초쯤에 요청을 timeout 하는데 백엔드는 그 뒤로도 계속 돌아 DB에 저장을 끝낸다. 그러면 **화면(실패)과 실제(성공)가 어긋난다.** 이걸 고치려고 동기화를 비동기 job으로 전환했고, 그 위에 연타/중복 방어, 실패 표시, 소스 확장까지 얹었다. 도메인은 예시로 "문서 동기화"(외부 시스템에서 문서를 긁어와 저장)로 치환한다.

핵심 교훈은 세 덩어리다: (1) 비동기 job + SSE 진행 관측 패턴, (2) **멱등 vs 쿨다운**의 진짜 차이, (3) "무한 로딩/성공 위장" 실패 안티패턴을 명확한 실패 상태로 바꾸기. 마지막에 실기동에서만 드러난 버그들과 자동 코드리뷰가 잡은 회귀도 정리한다.

## 핵심 개념

### 1. 비동기 job + 진행 관측

```
[클릭] → POST /sync/documents → 즉시 200 {jobId, alreadyRunning, reused}
                                    ↓ (백그라운드 @Async)
      상태머신: QUEUED → FETCHING → PERSISTING → DONE|FAILED
                                    ↓ 매 전이마다
      SSE push(sync-progress, userKey 채널) → FE 토스트 in-place 갱신
                                    ↓ 종료 시
      관련 쿼리 invalidate → 그리드/지표 최신화
```

- **toastId = jobId**: 같은 job은 새 토스트가 쌓이는 게 아니라 하나가 갱신됨.
- **app-level 토스트**: 진행 UI를 페이지 안이 아니라 인증 레이아웃(상시 마운트)에 올리면 **화면을 이동해도 진행이 이어져 보인다.** 페이지 안 인라인 진행바는 벗어나면 사라짐.
- **폴백**: SSE 두절 시에만 상태 조회(GET job)로 폴링. 재연결 시 1회 reconcile. 항상 병행 아님.
- **timeout**: job 60초 월클록(외부 read-timeout 30초와 별개 층). 초과 시 FAILED(TIMEOUT).
- **리퍼(reaper)**: active 상태로 갇힌 job(예: 킥 실패·재시작)을 주기적으로 FAILED로 정리 → **영구 락아웃 방지**.

### 2. 왜 200 + alreadyRunning 인가 (409 아님)

HTTP 클라이언트(ky 등)의 `afterResponse` 훅이 non-ok 응답 body를 소비하고 에러를 던지면, FE가 409 body 안의 jobId를 못 읽는다. **200으로 두면 정상/중복 둘 다 jobId를 확보**해 재구독이 가능하다. 재시도 안전성에도 유리 — timeout 나서 클라이언트가 재요청해도 같은 jobId를 회수한다(이게 원래 문제의 해결이기도).

### 3. 멱등(결과 재사용) vs 쿨다운 — 핵심 구분

연타/중복 클릭 시 외부를 매번 긁으면 안 된다. 두 방법의 차이가 중요하다.

| | 쿨다운 | 멱등(결과 재사용) |
|---|---|---|
| 판단 기준 | 마지막 실행 **시각** | 요청 **identity**(자연키/멱등키) |
| 응답 | 거부("N초 뒤") | 성공(**기존 결과 재사용**) |
| 조건 바꿔 재요청 | 똑같이 막힘 ❌ | 다른 요청이라 **실행됨** ✅ |
| 네트워크 재시도 | 결과 못 받음 | 원래 결과 회수 ✅ |
| 성격 | 정책(rate limit) | 계약(contract) |

**결정적 시나리오:** 사용자가 `7/1~7/20` 동기화 → 곧바로 `6/1~6/30`으로 바꿔 다시 누름.
- 쿨다운: 시간만 보니 **막음** → "왜 기간 바꿨는데 안 되지?" 오작동에 가까움.
- 멱등: 기간이 다르니 **다른 요청** → 정상 실행. 같은 기간 재클릭만 재사용.

이 기능엔 **의미 있는 자연키(지점·소스·종류·기간)**가 있어서 "같은 요청"을 정의할 수 있다 → 멱등이 맞다. 창은 짧게(2분): 연타·중복·재시도는 흡수하되 정상 재동기화는 안 막는다. 실패(FAILED)는 재사용 안 함 — 재시도가 정상 기대라서.

> 용어 주의: 엄밀히는 Stripe식 Idempotency-Key가 아니라 **"결과 재사용 창(dedup window)"**이다. 면접에선 "자연키 기준으로 최근 성공을 재사용했고, 클라이언트 생성 키 방식은 이 화면엔 과하다고 판단"까지 말하면 오히려 점수.

### 4. 클릭엔 반드시 반응 — 무반응·중복 토스트 방어

- **비활성 버튼 금지**: 진행 중이라고 버튼을 `disabled` 하면, 사용자는 "왜 안 되지?"만 보고 더 누른다. 클릭은 항상 받고, **서버 판정을 안내 토스트로 돌려준다** — 진행 중이면 "진행 중이에요", 최근 성공이면 "이미 최신이에요".
- **고정 슬롯 하나**: 안내 토스트는 진행/완료 토스트(toastId=jobId)와 겹치지 않게 **고정 toastId**를 쓴다. jobId로 쓰면 완료 토스트와 id가 겹쳐 react-toastify가 무시 → 연타 시 무반응이 된다.
- **중복 종료 이벤트 방어**: 종료 처리한 jobId를 기억(Set)해, 같은 DONE/FAILED가 재도착(SSE 재연결·폴링 겹침·구독자 둘)해도 결과 토스트를 다시 만들지 않는다.

### 5. 실패 UX — "무한 로딩/성공 위장" 안티패턴

실기동으로 확인한 두 소스의 실패 방식이 정반대였다:
- **스크래핑 소스**: job-레벨 timeout이 없으면 "처리 중…"에 **무한 로딩**.
- **마스터데이터 소스**: 서비스가 예외를 `catch { markFailed(); return 200 }` 로 **삼켜서** 실패가 "완료"로 위장. 무한 로딩보다 나쁨.

job 모델이 둘 다 고친다(60s timeout + FAILED + errorMsg + SSE/폴링). 핵심 행동 변화: **어댑터가 삼키지 말고 throw** 해야 실패가 드러난다.

표시는 **카드 상태 + 토스트** 둘 다:
- 카드에 빨강 "동기화 실패" 배지 + 분류 사유 + `[다시 시도]`.
- errorCode를 사용자 메시지로 분류(TIMEOUT→"응답 없음", AUTH→"인증 만료", 그 외→"수집 중 오류"). **원문 errorMsg는 툴팁/더보기에 보존** — 분류가 generic으로 붕괴할 때 유일한 단서라서(뒤 "리뷰가 잡은 회귀" 참고).

### 6. 다중 소스 일반화 — 전략 레지스트리

소스가 하나일 땐 하드코딩(YAGNI), **두 번째가 오면 그때 일반화**한다(좋은 진화, 성급한 추상화 아님).

```java
interface SyncSourceAdapter {
  SyncSourceKey key();                 // (source, svcType)
  FetchResult fetch(Job job);          // 외부 조회+파싱 (여기 timeout)
  Outcome persist(FetchResult, Session);
  void recordStatus(Job, Outcome, long durationMs);  // 소스별 상태 스냅샷
}
// 레지스트리: List<Adapter> 주입 → key로 인덱싱. 소스 추가 = 어댑터 빈 1개.
```

- 러너는 `registry.get(source, svcType)`로 어댑터만 갈아끼우고 **timeout·SSE·리퍼·멱등은 소스 무관 로직이라 그대로**. 개방-폐쇄.
- 어댑터가 "throw instead of swallow"의 자리이기도 하다(실패 UX의 핵심).
- **표기 이원화 주의**: job의 svcType은 enum name(예: `ORDER`), 상태 테이블은 짧은 코드(`OD`). 변환을 어댑터 경계에서 흡수.

## 실기동에서만 드러난 버그 (정적 검증으론 못 잡음)

컴파일·유닛테스트는 통과했는데 앱이 아예 안 떴다. 실행이 진실.

1. **마이그레이션 번호 충돌** — 다른 브랜치가 먼저 머지한 `V40`과 내 `V40`이 공유 DB에서 checksum mismatch → Flyway validate 실패로 기동 불가. `git cherry`로 "원격 것이 내 히스토리에 내용상 포함됐는지" 확인 후 V41로 비킴.
2. **컬럼 타입 불일치** — 이 코드베이스는 `@Converter(autoApply=true)`로 `LocalDate`를 VARCHAR로 저장하는데, 마이그레이션은 `DATE`로 선언 → Hibernate 스키마 검증 실패로 기동 불가. 기존 테이블 관례(`VARCHAR(8)`)로 정렬.
3. **연타 시 N번 스크래핑** — 동시성 방어(active 1개)만 있고 연타 방어(멱등)가 없어, dev 스크래핑이 0.6초에 끝나니 재클릭 시점엔 이미 DONE → 매번 새 job. → 멱등으로 해결(위 §3).

## 자동 코드리뷰가 잡은 회귀 (두 번째 소스 이식 시)

멀티에이전트 리뷰(finder × verify)가 잡은 것들. 대부분 "한 소스에 맞춰 짠 코드를 공용 경로로 옮기며" 생김:

- **재시도가 검증 우회** → 빈 날짜로 POST해서 400. 일반 버튼은 validation 타는데 재시도 버튼은 직접 트리거.
- **서버 원인(errorMsg)을 버림** → 실제 errorCode가 소수라 거의 다 "generic"으로 붕괴 → 이전보다 정보가 줄었다. (분류 + 원문 병기가 정답)
- **재시도 버튼이 도달 불가** → 토스트에 onRetry를 안 넘겨 죽은 코드.
- **실패 시 상태 스냅샷 미기록** → 카드가 "어제 성공"을 계속 표시(=성공 위장 재발). 기존 동기 경로는 `finally`로 실패도 기록했음.
- **안내 토스트 슬롯 공유** → 두 카드가 서로 메시지 덮어씀.
- **EventSource가 카드마다 1개** → 페이지당 3개, 소스가 5개 더 붙으면 8개 > 브라우저 6개/origin 한도 → 페이지 멈춤. **다음 확장의 선행조건 = SSE 구독을 단일 provider로 hoist**.
- **자기 풀 기아** — `@Async(taskExecutor)` 러너가 같은 풀에 fetch를 제출하고 블로킹 → 동시 job이 코어 스레드를 다 차지하면 fetch가 큐에서 못 나옴. 풀 분리 필요.

교훈: **일반화는 회귀의 온상.** "한 소스에 맞춰 짠 것"을 옮길 때마다 전 소스에서 재검증. 그리고 컴파일 통과 ≠ 동작 — 실패 경로는 특히 실기동으로 봐야 한다.

## 코드 예시 (진행 토스터 — 견고한 버전)

```ts
// ❌ SSE만 믿고 disabled로 막는 취약 버전 — 무반응/무한로딩
// ✅ 상태머신 위임 + 폴백 + 안내 토스트
const { connected } = useSyncProgressSse(applyDto)   // 규칙은 applyDto 한 곳
useEffect(() => {
  if (connected || !isRunning) return
  const id = setInterval(pollOnce, 2000)             // SSE 두절 시에만 폴링
  return () => clearInterval(id)
}, [connected, isRunning])

// 트리거 결과로 안내 (SSE가 안 오는 경우: 진행 중/재사용)
const onSync = () => trigger(body).then(r => {
  if (r.reused) notify('uptodate')          // "이미 최신이에요"
  else if (r.alreadyRunning) notify('running')  // "진행 중이에요"
}).catch(() => toast.error('시작 실패'))     // 무피드백 금지
```

## Git: 이미 push한 커밋을 rebase하면

`git push` 거부(non-fast-forward), 로컬/원격 갈라짐. 진단:
- `git cherry HEAD origin/<branch>` — `-` 접두 = 내용상 이미 로컬에 포함(중복), `+` = 진짜 새것.
- `git reflog -30` — `rebase (start): checkout origin/main` 같은 줄이 범인.

원리: `git rebase origin/main`은 **이미 push된 커밋도 베이스가 바뀌며 해시가 새로 찍힌다.** 원격=옛 해시, 로컬=같은 내용 새 해시.
복구: `git cherry`가 원격을 `-`(중복)로 확인했다면 `git push --force-with-lease`로 손실 0(로컬 정본으로 덮기). 혼자 쓰는 브랜치일 때만. 아니면 `merge`(지저분).
주의: pushed 커밋은 rebase 금지, main 최신화는 `merge`로.

## 주의사항 / 자주 하는 실수
- **실시간 채널(SSE)을 유일한 truth로 삼기** — 끊기면 영구 고착. 항상 조회로 닫을 수 있게.
- **에러를 `.catch(()=>{})`/`catch{return 200}`로 삼키기** — 무피드백/성공위장. 최소한 실패를 드러내라.
- **성급한 일반화 vs 방치** — 소스 1개면 하드코딩, 2개째에 일반화. 근데 일반화하면 전 소스 재검증.
- **정적 검증만 믿기** — 마이그레이션·컨버터·async·실패경로는 실기동으로만 드러남.
- **비활성 버튼으로 연타 막기** — 무반응처럼 보임. 클릭 받고 안내로 응답.

## 관련 개념
- SSE(Server-Sent Events) 기본
- 멱등성과 재시도 안전성
- 전략 패턴과 레지스트리
- react-query invalidateQueries 패턴
- git rebase vs merge
- 낙관적 UI와 상태 동기화
