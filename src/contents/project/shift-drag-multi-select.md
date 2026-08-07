---
title: 'Shift 드래그 다중 선택 만들기 — 이벤트 함정과 mousemove 최적화'
date: '2026-08-05'
category: 'project'
keywords: ['React', 'UX', 'mousemove', 'rAF', 'Binary Search', 'overflow-hidden', 'getBoundingClientRect']
---

> 체크리스트에서 Shift 드래그 범위 선택을 구현하며 만난 브라우저 이벤트의 함정 4가지, 고빈도 mousemove를 감당하기 위한 최적화 3종 세트(좌표 캐싱·rAF 스로틀·이진 탐색), 그리고 배포 후 그룹 리스트에서 터진 "보이지 않는 항목까지 선택되는" 버그를 잡기까지의 기록입니다.

<!--more-->

## 개요

파일 탐색기처럼 "Shift를 누른 채 드래그하면 지나는 항목이 한 번에 선택"되는 UX를 React 체크박스 리스트에 구현했습니다. 겉보기에는 단순한 기능인데, 실제로는 브라우저 이벤트 시스템의 함정과 초당 수천 번 발생하는 이벤트의 성능 문제를 전부 만나게 되는 소재였습니다.

먼저 이 기능이 해결하는 문제부터 보면 이렇습니다.

![클릭 7번 vs Shift 드래그 1번](/images/shift-drag-multi-select/click-vs-shift-drag.svg)

연속된 항목 7개를 선택하려면 기존에는 7번 클릭해야 했습니다. Shift 드래그면 한 번에 끝납니다.

## 인터랙션 설계 — "토글"이 아니라 "목표값 적용"

처음에는 드래그로 지나는 행마다 체크 상태를 토글하는 방식으로 만들었습니다. 그런데 이미 체크된 행이 섞여 있으면, 드래그가 지나갈 때 체크된 행은 풀리고 안 된 행은 켜져서 결과가 뒤죽박죽이 됩니다.

해결은 **시작 시점에 목표 상태를 고정**하고, 지나는 모든 행에 같은 값을 적용하는 것입니다.

```text
Shift + 드래그            → 전부 선택 (target = true)
Ctrl/Cmd + Shift + 드래그 → 전부 해제 (target = false)
```

이벤트 생명주기는 다음과 같습니다.

```text
mousedown  — Shift 확인, 스윕 시작, preventDefault로 텍스트 선택 방지
   ↓
mousemove  — 행 위를 지날 때마다 목표값 적용
   ↓
mouseup 또는 Shift keyup — 스윕 종료
```

리스너는 행이 아니라 **window에 등록**합니다. 드래그 중 마우스가 컴포넌트 밖으로 나가도 mouseup을 놓치면 안 되기 때문입니다. 종료 시 removeEventListener를 반드시 호출하고, React라면 unmount cleanup까지 챙깁니다.

## state vs ref — 화면에 쓰이냐가 전부

기준은 하나입니다. 화면에 안 보이는 값(스윕 목표값, 앵커 인덱스, 클릭 억제 플래그)은 ref로 듭니다. 리렌더가 필요 없고, window에 한 번 등록한 리스너도 항상 최신 값을 읽습니다. 화면에 보이는 값(체크 여부)만 state로 갑니다.

```tsx
const sweepTargetRef = React.useRef<boolean | null>(null);
```

그리고 진짜 중요한 건 **정리(cleanup)**입니다. window에 건 리스너와 rAF는 컴포넌트가 사라져도 살아남기 때문에, 반드시 unmount에서 제거해야 합니다.

```tsx
React.useEffect(() => removeSweepListeners, []); // unmount 시 리스너 해제
// cleanup 안에서: removeEventListener 전부 + cancelAnimationFrame
```

이걸 안 하면 언마운트된 컴포넌트의 핸들러가 계속 실행되고, ref를 붙잡은 클로저 때문에 메모리 누수까지 이어집니다.

## 브라우저 이벤트의 함정 4가지

| 함정 | 원인 | 해결 |
|---|---|---|
| 시작 행이 두 번 토글됨 | label 클릭 시 체크박스가 자동 토글 — mouseup 직후 click이 한 번 더 옴 | 플래그(ref) + `onClickCapture`에서 `preventDefault`. 해제는 `setTimeout(0)`으로 한 틱 뒤 |
| 빠르게 끌면 항목이 빠짐 | 브라우저는 샘플링된 위치에서만 이벤트를 발생 — 중간 행의 mouseenter가 누락됨 | ① 직전 인덱스부터 구간 채우기 ② mousemove 좌표로 행을 직접 계산 |
| 맥에서 Ctrl+Shift 조합이 죽음 | macOS가 Ctrl+클릭을 우클릭으로 변환 (`button === 2`, 컨텍스트 메뉴) | 해당 조합은 `button 2`도 허용 + `onContextMenu` 차단 + `Cmd`(`metaKey`)도 지원 |
| Shift를 떼도 스윕이 계속됨 | 창 포커스가 빠지면 keyup을 놓침 | window keyup + 매 이동마다 `e.shiftKey` 재확인 (이중 방어) |

각각의 핵심 코드만 남기면 다음과 같습니다.

```tsx
// 이중 토글 억제
const handleClickCapture = (e: React.MouseEvent) => {
  if (!suppressClickRef.current) return;
  suppressClickRef.current = false;
  e.preventDefault();
};

// 구간 채우기 — 빠르게 끌어도 중간 행이 빠지지 않게
const [from, to] = last < cur ? [last + 1, cur] : [cur, last - 1];
for (let i = from; i <= to; i++) applyTarget(rows[i]);

// 맥 Ctrl+클릭 대응
const isRangeUncheck = e.button === 2 && e.ctrlKey && e.shiftKey;
if (e.button !== 0 && !isRangeUncheck) return;
const target = !(e.ctrlKey || e.metaKey);
```

특히 두 번째 함정이 인상 깊었습니다. 처음에는 각 행의 mouseenter로 구현했는데, 마우스를 빠르게 끌면 중간 행이 듬성듬성 빠졌습니다. 브라우저는 마우스가 지나간 모든 픽셀에서 이벤트를 만들어주지 않고, 프레임마다 샘플링된 위치에서만 이벤트를 발생시키기 때문입니다. (이 "구간 채우기" 보정은 글 뒷부분에서 더 단순한 모델로 통째로 대체됩니다.)

## 성능 최적화 3종 세트

mousemove 좌표로 행을 직접 계산하기로 하면서 성능 문제가 시작됐습니다. mousemove는 초당 수십~수백 번 발생하는데, 매번 모든 행의 위치를 다시 재면 프레임이 밀립니다. 고빈도 이벤트를 다룰 때의 표준 패턴 세 가지를 적용했고, 각각 **다른 축**을 줄입니다.

| 기법 | 줄이는 것 | 이 사례에서 |
|---|---|---|
| 좌표 캐싱 | 레이아웃 측정 횟수 | 초당 수천 회 → 드래그당 1회 |
| rAF 스로틀 | 처리 횟수 | 초당 ~120회 → 프레임당 1회 |
| 이진 탐색 | 1회 처리 비용 | O(n) → O(log n) |

### 좌표 캐싱 — forced reflow 회피

`getBoundingClientRect()`는 호출 시점에 밀려 있던 스타일·레이아웃 계산을 전부 끝내야 값을 돌려줍니다 (forced synchronous layout). mousemove마다 전체 행에 호출하면 그 비용이 프레임을 밀어냅니다.

드래그 중에 행 위치는 변하지 않으므로 **시작할 때 한 번만 측정**합니다.

```tsx
let rowRects: { top: number; bottom: number }[] | null = null;

const measure = () => {
  rowRects = rowElements.map((el) => {
    const r = el.getBoundingClientRect();
    return { top: r.top, bottom: r.bottom };
  });
};

// 좌표가 틀어지는 순간에만 무효화
window.addEventListener('scroll', () => { rowRects = null; }, true); // 캡처!
window.addEventListener('resize', () => { rowRects = null; });
```

#### 왜 scroll에만 캡처(true)를 주는가 — 드래그 중 휠 시나리오

Shift 드래그 중에 휠을 돌리면 캐시가 거짓말을 하게 됩니다. `getBoundingClientRect()`의 top은 **뷰포트 기준**이라, 스크롤하면 캐시된 좌표와 실제 화면 위치가 어긋나 엉뚱한 행이 선택됩니다.

```text
캐시 시점:  [항목 3]의 top = 200px
     ↓ 드래그 중 휠로 100px 스크롤
실제 화면:  [항목 3]의 top = 100px   ← 진짜
캐시:       여전히 200px              ← 거짓
→ 마우스 y=200 → 캐시는 "항목 3", 실제로는 항목 6 위
```

그래서 scroll이 일어나면 캐시를 무효화해야 하는데, 문제가 하나 더 있습니다. **scroll은 버블링하지 않는 이벤트**라서, 목록 컨테이너에서 발생한 scroll이 window까지 올라오지 않습니다. 하지만 버블링이 없어도 캡처 단계(window에서 타깃으로 내려가는 길)는 모든 이벤트가 통과하므로, 캡처로 등록하면 어디서 난 scroll이든 잡을 수 있습니다 — 위 코드의 세 번째 인자 `true`가 그것입니다. 반면 resize는 window 자체에서 발생하는 이벤트라 일반 등록으로 충분합니다.

이벤트가 왜 세 단계로 여행하는지, 어떤 이벤트가 왜 버블링하지 않는지는 별도 글에서 깊게 다뤘습니다: [scroll 이벤트는 왜 window에서 잡히지 않을까 — 이벤트 전파 3단계와 캡처의 존재 이유](/study/event-propagation-capture-bubble)

무효화 방식도 포인트입니다. 스크롤마다 재측정하면 scroll도 고빈도 이벤트라 같은 성능 문제가 재발합니다. **무효화(null 대입)만 해두고 실제 측정은 다음 마우스 이동 때 한 번**만 합니다 (lazy invalidation). "비싼 일은 미루고, 싸게 표시만 해두기" — 캐시를 다루는 곳 어디서나 나오는 패턴입니다.

### rAF 스로틀 — 프레임당 한 번만

화면은 어차피 프레임당 한 번 그려집니다. mousemove가 한 프레임에 여러 번 와도 마지막 좌표만 의미가 있습니다.

```tsx
let frame = 0;
let pending: { x: number; y: number } | null = null;

const process = () => {
  frame = 0;              // 다음 예약 허용
  const point = pending;
  pending = null;
  if (point) handle(point);
};

const onMouseMove = (e: MouseEvent) => {
  pending = { x: e.clientX, y: e.clientY };            // 덮어쓰기만 (저렴)
  if (!frame) frame = requestAnimationFrame(process);  // 중복 예약 방지
};

// cleanup 시 반드시
if (frame) cancelAnimationFrame(frame);
```

`if (!frame)` 가드가 핵심입니다. setTimeout 기반 throttle과 달리 rAF는 렌더링 주기와 정확히 동기화되고, 탭이 백그라운드로 가면 자동으로 멈춥니다. 브라우저 렌더링 주기가 어떻게 돌고 왜 setTimeout 스로틀이 아니라 rAF인지는 별도 글에서 깊게 다뤘습니다: [고빈도 이벤트에 requestAnimationFrame 스로틀을 쓰는 이유](/study/raf-throttle-high-frequency-events)

### 이진 탐색 — 정렬된 데이터에서 위치 찾기

행은 위에서 아래로 정렬되어 있습니다 (top 좌표가 증가). 정렬된 배열에서 값이 속한 위치를 찾는 것은 이진 탐색의 교과서적인 적용처입니다.

먼저 고전적인 형태로 보면, 정렬된 배열에서 target 값을 찾는 과정은 이렇습니다.

![이진 탐색 흐름](/images/shift-drag-multi-select/binary-search-flow.svg)

가운데 값(mid)과 비교해서 target이 더 작으면 오른쪽 절반을, 더 크면 왼쪽 절반을 통째로 버립니다. 남은 구간이 절반씩 줄어드니 9개 배열도 3번 비교로 끝납니다.

실전에서는 이 구조를 그대로 "마우스 y좌표가 어느 행 구간에 속하는가"에 썼습니다. 값 대신 각 행의 `top`/`bottom` 구간과 비교한다는 점만 다릅니다.

```tsx
const findRowIndex = (y: number) => {
  if (y < rects[0].top) return 0;                     // 경계 밖 처리 먼저
  if (y > rects[rects.length - 1].bottom) return rects.length - 1;

  let lo = 0, hi = rects.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;                       // 비트 시프트 = 정수 나눗셈
    if (y < rects[mid].top) hi = mid - 1;
    else if (y > rects[mid].bottom) lo = mid + 1;
    else return mid;
  }
  return -1;  // 행 사이 간격에 걸림 — "못 찾음"을 명시적으로 처리
};
```

솔직한 평가도 남깁니다. 행이 30개 수준이면 선형 탐색으로도 충분합니다. 실제 병목은 레이아웃 측정이었고, 그건 좌표 캐싱이 해결했습니다. 이진 탐색은 비용이 거의 없으면서 원칙적으로 맞는 코드이자 데이터가 커질 때의 보험으로 넣은 것입니다.

> 최적화는 병목부터. 병목이 아닌 곳의 알고리즘 개선은 숫자에 나타나지 않습니다

여기까지 만들고 자동 테스트도 통과시킨 뒤 스테이징에 배포했습니다. 다 끝난 줄 알았습니다.

## 배포하니 터졌다 — 보이지 않는 항목이 선택되는 버그

스테이징에 올리자 이상한 제보가 왔습니다.

> "한 그룹에서 항목 하나만 드래그했는데, **접혀 있는 다른 그룹들의 항목이 2개씩 같이 선택돼요.** 클릭은 멀쩡한데 드래그만 그래요."

단일 리스트에서는 완벽했는데, 그룹이 있는 리스트(아코디언식으로 펼치고 접는)에서만 이랬습니다. 접힌 그룹이면 화면에 보이지도 않는데 어떻게 선택이 될까요? 원인을 파 보니 범인은 셋이었습니다.

![버그 재현 — 접힌 그룹의 보이지 않는 행이 함께 선택된다](/images/shift-drag-multi-select/bug-hidden-selection.svg)

### 범인 1: 접힌 그룹은 사라진 게 아니라 숨겨져 있었다

그룹 리스트의 렌더 구조를 열어보니 이렇게 돼 있었습니다.

```tsx
{groups.map((group) => (
  <div key={group.id}>
    <GroupHeader ... />
    {/* 접힌 그룹도 언마운트하지 않고 높이 0으로 숨긴다 */}
    <div className={isOpen(group) ? '' : 'h-0 overflow-hidden'}>
      <CheckboxList items={group.items} ... />
    </div>
  </div>
))}
```

접힌 그룹의 리스트는 **언마운트되는 게 아니라 `height: 0; overflow: hidden` 아래 그대로 살아 있었습니다.** DOM에도 있고, React 인스턴스도 있고, 이벤트 리스너도 살아 있습니다. 안 보일 뿐입니다. 이 자체는 흔한 패턴이고 죄가 없습니다. 문제는 제 코드가 이 구조를 몰랐다는 것입니다.

### 범인 2: 모든 인스턴스가 같은 요소에 리스너를 걸었다

"목록의 빈 영역에서도 드래그를 시작할 수 있어야 한다"는 요구 때문에, 각 리스트 인스턴스가 자기 목록 div가 아니라 **공유 스크롤 컨테이너**에 mousedown 리스너를 걸게 했습니다. 단일 리스트에서는 인스턴스가 하나라 문제가 없었지만, 그룹 리스트에서는 컨테이너 하나에 **그룹 수만큼 인스턴스가 전부 리스너를 겁니다** — 숨겨진 그룹의 인스턴스까지요. 드래그를 한 번 시작하면 모든 그룹이 동시에 "내 드래그"라고 믿고 스윕을 시작합니다.

### 범인 3: getBoundingClientRect는 잘린 요소도 원래 크기를 말한다

그래도 이상합니다. 숨겨진 그룹은 높이가 0인데, 좌표 계산에서 걸릴 게 없지 않을까요? 처음에는 숨겨진 인스턴스를 이렇게 걸러내려 했습니다.

```tsx
// 이 필터는 동작하지 않습니다
const visibleRoots = roots.filter(
  (el) => el.getBoundingClientRect().height > 0,
);
```

그런데 필터가 아무것도 거르지 못했습니다. **`overflow: hidden`으로 잘린 요소의 자식들은 `getBoundingClientRect()`가 여전히 원래 크기를 반환하기 때문입니다.** 부모가 `height: 0`이어도 자식은 자기 본래 레이아웃 크기를 그대로 보고합니다. 그리기만 잘릴 뿐, 기하 정보는 남아 있는 것입니다.

```text
화면에 보이는 것:   [그룹B 헤더][그룹B 행들...]
좌표 공간의 실제:   [그룹A 행들(높이 0 지점에 뭉개져 겹침)][그룹B 헤더][그룹B 행들...]
```

숨겨진 그룹 A의 행들이 그룹 B 영역 위에 유령처럼 겹쳐 있고, 드래그 좌표가 그 유령 행들과 교차하면서 "보이지 않는 선택"이 일어난 것입니다. 클릭이 멀쩡했던 이유도 설명됩니다. 클릭은 실제 이벤트 타깃(보이는 행)에만 적용되고, 좌표 계산 경로를 타지 않으니까요.

## 두 번째 수정 — 가시성 판정과 모델 교체

### 숨김 판정은 rect가 아니라 조상의 offsetHeight로

rect로는 판별이 안 되므로, 조상 중에 높이가 0인 요소가 있는지를 봅니다.

```tsx
const isEffectivelyVisible = (el: Element, boundary: Element): boolean => {
  let cur: Element | null = el;
  while (cur && cur !== boundary) {
    if (cur instanceof HTMLElement && cur.offsetHeight === 0) return false;
    cur = cur.parentElement;
  }
  return true;
};
```

`offsetHeight`는 실제 레이아웃 높이라서 `height: 0` 컨테이너를 정직하게 0으로 보고합니다. 이 판정을 드래그 시작 조건에 넣어, **숨겨진 인스턴스는 아예 스윕에 참여하지 못하게** 막았습니다.

### 추적 방식 자체를 단순하게: "훑은 구간"

고치는 김에, 앞에서 만든 "직전 인덱스부터 구간 채우기" 보정을 버리고 모델을 바꿨습니다.

> 드래그 시작점 y ~ 현재 y 사이의 세로 구간과 겹치는, **보이는** 행 전부에 목표 상태를 적용한다.

```tsx
const range = findIntersectingRange(   // 정렬된 행 좌표에서 이진 탐색 2회 (구간 양 끝)
  Math.min(startY, currentY),
  Math.max(startY, currentY),
);
for (let i = range[0]; i <= range[1]; i++) {
  if (isChecked(rows[i]) !== target) applyCheck(target, rows[i]);
}
```

앞의 이진 탐색이 "y좌표 하나 → 행 하나"였다면, 이번에는 같은 탐색을 구간의 양 끝에 두 번 돌려 "y구간 → 행 범위"를 얻습니다. 구간 방식이 되자 부수 효과가 좋았습니다.

- 마우스를 아무리 빨리 끌어도 (이벤트가 누락돼도) 구간은 연속이라 **항목이 빠질 수 없습니다** — 구간 채우기 보정이 통째로 사라졌습니다
- 여러 그룹이 펼쳐져 있으면 각 인스턴스가 자기 행 중 구간에 걸친 것만 적용하므로, **그룹 경계를 넘는 드래그가 공짜로 됩니다**

코드가 버그 수정 전보다 오히려 50줄 줄었습니다. 좋은 모델은 예외 처리를 지웁니다.

![수정 후 — 드래그 y구간과 겹치는 보이는 행만 선택된다](/images/shift-drag-multi-select/fixed-range-sweep.svg)

## 정리

- 드래그 다중 선택은 토글이 아니라 **시작 시점에 고정한 목표값을 적용**해야 결과가 일관됩니다
- 리스너는 window에 걸고, 드래그 중 공유 상태는 state가 아니라 **ref**로 듭니다 — 그리고 unmount cleanup이 ref보다 중요합니다
- scroll은 버블링하지 않습니다 — window에서 잡으려면 **캡처 등록**이 필수입니다
- label 이중 토글, 이벤트 샘플링 누락, macOS의 Ctrl+클릭 변환, keyup 유실 — 브라우저 이벤트에는 문서만 봐서는 모르는 함정이 많습니다
- 고빈도 이벤트 최적화는 축이 다른 세 가지를 조합합니다: **측정 횟수**(좌표 캐싱), **처리 횟수**(rAF 스로틀), **1회 비용**(이진 탐색)
- 공유 요소에 리스너를 걸 때는 **"이 컴포넌트가 동시에 몇 개 마운트되나"**를 먼저 확인하세요 — 접힌 아코디언, 탭, 가상 리스트에는 안 보이는 인스턴스가 살아 있습니다
- 가시성 판정에 `getBoundingClientRect().height`를 쓰지 마세요 — **overflow로 잘린 요소는 원래 크기를 반환합니다.** `offsetHeight`(조상 포함) 또는 `checkVisibility()`를 쓰세요
- 버그의 뿌리는 코드 한 줄이 아니라 가정이었습니다. "내 컴포넌트는 하나만 렌더된다", "안 보이면 크기가 0이다" — 단일 리스트에서는 둘 다 참이었고, 그룹 리스트에서 동시에 거짓이 됐습니다
