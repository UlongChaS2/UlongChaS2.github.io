---
title: 'SSE 진행 토스트 구현과 rebase 사고 복구기'
date: '2026-07-15'
category: 'project'
---

> 외부 데이터 동기화를 비동기 job으로 돌리고 SSE로 진행상황을 화면 넘어 토스트로 보여주는 패턴 + 이미 push한 커밋을 rebase했을 때 생기는 히스토리 갈라짐 진단·복구.

## 개요

느린 외부 연동(스크래핑·대용량 pull)을 동기 요청/응답으로 처리하면 timeout·UX 지옥이 된다. 해법은 **즉시 jobId 반환 + 백그라운드 실행 + 진행상황 관측(SSE 주경로 / 폴링 폴백)**. 이 노트는 그 FE 구현에서 나온 설계 교훈(특히 SSE-only UI의 함정 9가지)과, 작업 중 터진 git rebase 사고의 진단·복구법을 정리한다. (도메인은 예시로 "주문 동기화"로 치환.)

## 핵심 개념

### 1. 비동기 job + 진행 관측 패턴

```
[클릭] → POST /sync/orders → 즉시 200 {jobId, alreadyRunning}
                                  ↓ (백그라운드)
        BE: QUEUED → FETCHING → PERSISTING → DONE|FAILED
                                  ↓ 매 전이마다
        SSE push (sync-progress, jobId 채널) → FE 토스트 in-place 갱신
                                  ↓ 종료 시
        FE: 관련 쿼리 invalidate → 그리드/지표 최신화
```

- **중복 방지**: 같은 (테넌트, 소스, 서비스)에 active job 있으면 새로 안 켜고 기존 jobId 반환(`alreadyRunning=true`).
- **왜 409가 아니라 200 + flag인가**: HTTP 클라이언트(ky 등)의 `afterResponse` 훅이 non-ok 응답 body를 소비하고 에러를 던지면, FE가 409 body의 jobId를 못 읽는다. 200으로 두면 두 경우 다 jobId 확보 → 재구독 가능.

### 2. app-level 진행 토스트 (화면을 넘어가는 진행 표시)

페이지 안 인라인 진행바는 **페이지를 벗어나면 사라진다.** 그래서 진행 UI를 인증 레이아웃(상시 마운트)에 올린 **전역 토스트**로 승격. `toastId = jobId`로 같은 job은 in-place 갱신(대기→조회→저장→완료).

### 3. SSE-only 진행 UI의 함정 (⭐ 재사용 가능한 교훈)

멀티에이전트 코드리뷰가 잡은 결함들 — SSE만 믿고 짠 진행 토스트가 구조적으로 취약한 이유:

| # | 결함 | 왜 터지나 |
|---|---|---|
| 1 | **첫 이벤트가 terminal이면 영구 스피너** | 리로드/2번째 탭 → dedup Set 비어있음 → 공유 채널의 다음 이벤트가 DONE이면 "처음 본 job"이라 로딩 토스트만 띄우고 return. `closeButton:false`+autoClose 없음 = 못 닫음 |
| 2 | **폴링 폴백 없음** | SSE가 N회 재연결 실패 후 포기 → terminal 이벤트 못 받음 → 로딩 토스트 영구 잔존. `connected` flag를 노출하고도 안 씀 |
| 3 | **트리거 실패 무피드백** | `trigger().catch(() => {})` → POST 실패 시 상태 세팅 안 됨, job 시작 안 돼 SSE도 없음 = 완전 무반응 no-op |
| 4 | **2번째 사용자 reconcile 불가** | job은 A의 개인 채널로만 push → B는 `alreadyRunning`으로 버튼 잠기지만 이벤트를 못 받음. `connected=true`라 폴링도 단락 → QUEUED 영구 고착 |
| 5 | **`alreadyRunning` 무시** | 진행중 job인데 trigger가 무조건 QUEUED로 리셋 → 단계 역행 오표시 |
| 6 | **상태머신 중복 재구현** | 토스터가 자체 Set으로 dedup/terminal 판정 → 중앙 상태머신(applyDto)과 규칙 이원화·drift |
| 7 | **SSE 훅 중복** | 기존 알림 SSE 훅과 재연결 보일러플레이트 복붙 → 같은 유저가 동일 엔드포인트에 다중 커넥션 |
| 8 | **이중 invalidate** | 종료 시 훅과 토스터가 같은 쿼리키 각자 무효화 → 1초 내 2회 refetch |
| 9 | **단계 순서 이중 인코딩** | 진행바 ORDER와 상태머신 STAGE_ORDER 따로 → 단계 추가 시 한쪽만 고치면 타입에러 없이 깨짐 |

**교훈:** 실시간 채널(SSE)은 *보조*여야 한다. terminal/reconcile은 항상 **명시적 상태 조회(폴링)** 로 닫을 수 있어야 한다. 진행 규칙은 **단일 진입점(state machine)** 에 두고 UI는 그걸 구독만. 도메인 상수(단계 순서)는 한 곳에.

### 4. 확장 판단 — 전부 job으로 바꾸지 마라

동기화 소스가 여럿(주문·상품·마스터데이터 등)이라도 **job 모델의 명분은 "동기 요청이 timeout 나는 느린 연동"**. 빠른 마스터데이터 pull까지 job으로 감싸는 건 over-engineering. **실측(느린가?) 후 선별 전환.** 계약에 `svcType`/`sourceSystem`을 두면 확장 여지는 열되, 실제 전환은 필요한 것만.

## Git: 이미 push한 커밋을 rebase하면 (사고 복구)

### 증상
`git push` 거부 — `non-fast-forward`. 로컬 N개 앞, 원격 1개 앞으로 **갈라짐**.

### 진단 3종

```bash
# 1) 원격 tip이 이미 로컬에 내용상 포함됐는지 (patch-id 기준)
git cherry HEAD origin/<branch>
#  '-' 접두 = 이미 로컬에 있음(중복), '+' = 진짜 새 커밋

# 2) 무슨 일이 있었는지 (rebase/merge/reset 흔적)
git reflog -30
#  'rebase (start): checkout origin/main' 같은 줄이 범인

# 3) 공통 조상 확인
git merge-base HEAD origin/<branch>
```

### 원리
`git rebase origin/main`을 돌리면 **이미 push된 커밋도 베이스가 바뀌며 해시가 새로 찍힌다.** 원격엔 옛 해시, 로컬엔 같은 내용의 새 해시 → 일반 push는 "원격 tip이 내 히스토리에 없다"며 거부.

### 복구 옵션
- **`git push --force-with-lease`** — 로컬 정본으로 원격 덮기. `git cherry`가 원격 커밋을 `-`(중복)로 확인했다면 손실 0. `--force-with-lease`는 fetch 이후 원격이 또 움직였으면 거부 → 맹목적 `--force`보다 안전.
- **`git merge origin/<branch>`** — force 없이. 대신 낡은 중복 커밋이 머지 커밋으로 히스토리에 남아 지저분.

### 주의 (안전 규칙)
- force push는 **공유 브랜치면 다른 사람 작업을 깬다** → 혼자 쓰는 브랜치인지 먼저 확인.
- pushed 커밋은 웬만하면 rebase 금지. main 최신화는 `merge`로.

## 코드 예시 (진행 토스터 — 개선 방향)

```ts
// ❌ SSE만 믿는 취약 버전
useSyncProgressSse((dto) => {
  if (!created.has(dto.jobId)) { created.add(dto.jobId); toast.loading(...); return } // 첫 이벤트가 DONE이면 영구 스피너
  if (dto.status === 'DONE') { /* ... */ }
})

// ✅ 상태머신 위임 + 폴링 폴백
const { connected } = useSyncProgressSse(applyDto) // 규칙은 applyDto 한 곳
useEffect(() => {
  if (connected || !isRunning) return
  const id = setInterval(pollOnce, 2000) // SSE 두절 시에만 폴링
  return () => clearInterval(id)
}, [connected, isRunning])
// terminal 판정·dedup·invalidate 전부 applyDto 안에서 단일 처리
```

## 주의사항 / 자주 하는 실수
- **실시간 채널을 유일한 truth로 삼기** — 끊기면 UI가 영구 고착. 항상 조회로 닫을 수 있게.
- **에러를 `.catch(()=>{})`로 삼키기** — 최소한 사용자 피드백(토스트)은 남겨라.
- **pushed 커밋 rebase** — 히스토리 갈라짐. `merge`를 기본으로.
- **성급한 일반화** — 느리지 않은 것까지 job으로 감싸기.

## 관련 개념
- SSE(Server-Sent Events) 기본
- react-query invalidateQueries 패턴
- git rebase vs merge
- 낙관적 UI와 상태 동기화
