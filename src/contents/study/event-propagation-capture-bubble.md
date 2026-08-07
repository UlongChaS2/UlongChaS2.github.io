---
title: 'scroll 이벤트는 왜 window에서 잡히지 않을까 — 이벤트 전파 3단계와 캡처의 존재 이유'
date: '2026-08-07'
category: 'study'
keywords: ['JavaScript', 'Event Bubbling', 'Event Capturing', 'Event Delegation', 'React']
---

> 이벤트가 DOM 트리를 어떻게 여행하는지(캡처 → 타깃 → 버블), 왜 어떤 이벤트는 버블링하지 않는지, 그리고 버블링하지 않는 이벤트를 상위에서 잡는 유일한 방법이 왜 캡처인지를 실전 사례에서 출발해 정리합니다.

<!--more-->

## 발단 — 분명히 window에 리스너를 걸었는데

Shift 드래그 다중 선택 기능을 만들다가 겪은 일입니다. 드래그 성능을 위해 각 행의 좌표를 캐싱해 뒀는데, 사용자가 드래그 중에 휠을 돌리면 캐시가 실제 화면과 어긋납니다. 그래서 "스크롤이 일어나면 캐시를 무효화하자"고 window에 리스너를 걸었습니다.

```js
window.addEventListener('scroll', invalidateCache);
```

그런데 동작하지 않았습니다. 페이지 전체를 스크롤하면 잡히는데, **목록 컨테이너 안에서 스크롤하면 리스너가 아예 호출되지 않았습니다.** click이든 keydown이든 지금까지 window에 걸면 다 잡혔는데, scroll만 왜 안 잡힐까요.

이 한 줄이 동작하지 않는 이유를 이해하려면, 이벤트가 DOM 트리를 어떻게 여행하는지부터 봐야 합니다. (이 기능을 만든 전체 이야기는 [Shift 드래그 다중 선택 만들기](/project/shift-drag-multi-select)에 있습니다.)

## 이벤트는 세 단계를 여행한다

버튼을 클릭하면 이벤트는 버튼에서 태어나 버튼에서 끝날 것 같지만, 실제로는 문서 전체를 관통하는 여행을 합니다. DOM 표준은 이 여행을 세 단계로 정의합니다.

```text
<html>
  <body>
    <div class="list">
      <button>클릭!</button>       ← 여기서 클릭 발생 (target)
    </div>
  </body>
</html>

1. 캡처 단계 (capturing)   window → document → html → body → div → button
                           위에서 아래로 내려감

2. 타깃 단계 (at target)   button
                           이벤트가 태어난 바로 그 요소

3. 버블 단계 (bubbling)    button → div → body → html → document → window
                           아래에서 위로 올라감
```

![이벤트 전파 3단계 — 캡처·타깃·버블](/images/event-propagation-capture-bubble/propagation-phases.svg)

이벤트가 발생하면 브라우저는 먼저 **전파 경로(propagation path)** 를 계산합니다. 타깃에서 window까지의 조상 체인입니다. 그리고 그 경로를 캡처 방향으로 한 번 내려갔다가, 버블 방향으로 한 번 올라옵니다. 리스너가 어느 단계에서 호출됐는지는 `event.eventPhase`로 직접 확인할 수 있습니다.

```js
// 1 = CAPTURING_PHASE, 2 = AT_TARGET, 3 = BUBBLING_PHASE
document.body.addEventListener('click', (e) => {
  console.log('버블에서 잡음:', e.eventPhase); // 3
});
document.body.addEventListener(
  'click',
  (e) => {
    console.log('캡처에서 잡음:', e.eventPhase); // 1
  },
  { capture: true },
);
```

`addEventListener`의 세 번째 인자가 바로 "어느 방향의 여행에서 잡을 것인가"의 선택입니다. 기본값은 `false`(버블), `true` 또는 `{ capture: true }`를 주면 캡처 단계에서 잡습니다.

### 왜 두 방향이나 있을까 — 브라우저 전쟁의 유산

세 단계 구조는 처음부터 설계된 것이 아니라 타협의 산물입니다. 1990년대 후반 Netscape Navigator는 **캡처 방식**(위에서 아래로)을, Internet Explorer는 **버블 방식**(아래에서 위로)을 각각 구현했습니다. 두 브라우저에서 이벤트가 반대 방향으로 흘렀던 겁니다. W3C가 DOM Level 2 Events 표준을 만들면서 둘 다 수용해 "내려갔다가 올라온다"는 현재의 모델이 됐고, `addEventListener`의 세 번째 인자는 그 타협의 흔적입니다.

실무 감각으로는 이렇게 정리됩니다. **기본은 버블**이고, 캡처는 특수한 상황에서 꺼내는 도구입니다. 그 특수한 상황이 무엇인지가 이 글의 후반부입니다.

## 버블링이 공짜로 주는 것 — 이벤트 위임

버블링 덕분에 조상 요소 하나가 자손 전체의 이벤트를 대신 받을 수 있습니다. 이것이 **이벤트 위임(event delegation)** 패턴입니다.

```js
// 항목 1,000개에 리스너 1,000개를 거는 대신
list.addEventListener('click', (e) => {
  const item = e.target.closest('li');
  if (!item) return;
  handleSelect(item.dataset.id);
});
```

리스너가 하나뿐이니 메모리가 절약되고, 나중에 `li`가 동적으로 추가돼도 리스너를 다시 걸 필요가 없습니다. 이벤트가 "어디서 태어났는지"는 `e.target`으로, "지금 어느 요소의 리스너가 실행 중인지"는 `e.currentTarget`으로 구분합니다.

이 패턴이 성립하는 전제가 중요합니다. **이벤트가 조상까지 올라와 준다**는 것. 그런데 이 전제가 깨지는 이벤트들이 있습니다.

## 모든 이벤트가 버블링하는 것은 아니다

제 scroll 리스너가 동작하지 않은 이유가 여기에 있습니다. 이벤트마다 `bubbles`라는 속성이 있고, 이것이 `false`인 이벤트는 타깃에서 여행을 멈춥니다. 버블 단계 자체가 없습니다.

```js
el.addEventListener('scroll', (e) => console.log(e.bubbles)); // false
el.addEventListener('click', (e) => console.log(e.bubbles));  // true
```

대표적인 비버블링 이벤트들입니다.

- **`scroll`** — 요소 스크롤은 그 요소에서 멈춥니다 (문서 전체 스크롤만 예외적으로 document에서 발생해 window까지 전달됩니다. "페이지 스크롤은 잡히는데 내부 컨테이너는 안 잡히던" 제 증상이 정확히 이것입니다)
- **`focus` / `blur`** — 버블링하지 않습니다. 대신 같은 의미로 버블링하는 쌍둥이 `focusin` / `focusout`이 따로 있습니다
- **`mouseenter` / `mouseleave`** — 버블링하지 않습니다. 버블링하는 쌍둥이는 `mouseover` / `mouseout`
- **`load` / `unload` / `error`** — 리소스 로딩 계열도 버블링하지 않습니다

### 왜 이렇게 설계됐을까

버그가 아니라 의도입니다. 두 가지 이유로 이해할 수 있습니다.

**의미가 요소 고유의 것이기 때문입니다.** "이 div가 스크롤됐다"가 body까지 올라가서 "body가 스크롤됐다"로 읽히면 오히려 혼란입니다. click은 "그 지점을 클릭했다"는 사실이 조상에게도 유효하지만, scroll·focus는 특정 요소의 상태 변화라서 올라갈수록 의미가 왜곡됩니다. mouseenter가 버블링하지 않는 것도 같은 맥락입니다. 자식으로 마우스가 옮겨갈 때마다 조상들에게 enter가 연쇄로 올라오면 "내 영역에 들어왔다"는 의미가 무너집니다.

**빈도와 비용 문제도 있습니다.** scroll은 초당 수십~수백 번 발생하는 고빈도 이벤트입니다. 이것이 매번 트리 꼭대기까지 버블링하며 경로상 모든 리스너를 깨운다면 비용이 상당합니다.

## 그래도 상위에서 잡아야 한다면 — 캡처

다시 처음 문제로 돌아옵니다. 캐시 무효화 리스너는 "문서 안 **어디서** 스크롤이 일어나든" 알아야 합니다. 스크롤되는 컨테이너가 무엇인지 미리 알 수 없으니 개별 등록도 어렵습니다. 버블링은 안 올라오고, 그럼 방법이 없을까요?

여기서 앞의 전파 모델이 답을 줍니다. `bubbles: false`가 없애는 것은 **버블 단계뿐입니다. 캡처 단계는 모든 이벤트가 통과합니다.** 이벤트는 어떤 경우든 window에서 출발해 타깃까지 내려가는 길을 지나갑니다. 그 길목에 서 있으면 됩니다.

```js
// 세 번째 인자 true = 캡처 단계에서 잡기
window.addEventListener('scroll', invalidateCache, true);
```

```text
버블로 잡기 (실패):
  발생: [목록 컨테이너] → 버블 단계 없음 → window 도달 ❌

캡처로 잡기 (성공):
  window → body → … → [목록 컨테이너]
  ↑ 내려가는 길목의 출발점이 window — 반드시 지나감 ✅
```

이것이 "비버블링 이벤트를 상위에서 잡는" 표준 기법입니다. 같은 원리로 `focus`를 위임하고 싶을 때도 캡처를 쓰거나, 버블링하는 쌍둥이 `focusin`을 쓰는 두 가지 선택지가 있습니다.

한 가지 함정: 캡처로 등록한 리스너는 **해제할 때도 같은 플래그**를 줘야 합니다. `addEventListener`와 `removeEventListener`는 (타입, 콜백, capture 여부) 세 가지가 모두 일치해야 같은 리스너로 취급합니다.

```js
window.addEventListener('scroll', invalidateCache, true);
window.removeEventListener('scroll', invalidateCache);      // ❌ 해제 안 됨
window.removeEventListener('scroll', invalidateCache, true); // ✅
```

## React는 이 구조 위에서 무엇을 하고 있나

React를 쓰면 `onClick={...}`만 적으니 이 전파 구조가 안 보이지만, React 이벤트 시스템 전체가 방금 본 위임 패턴 위에 서 있습니다.

React는 각 요소에 리스너를 붙이지 않습니다. **루트 컨테이너 한 곳에 이벤트 타입별 리스너를 걸어두고**(React 17부터. 16까지는 document에 걸었습니다), 버블링으로 올라온 이벤트를 받아 컴포넌트 트리를 따라 합성 이벤트(SyntheticEvent)를 발송합니다. 항목 1,000개짜리 리스트에 `onClick`을 1,000번 적어도 실제 DOM 리스너는 루트에 몇 개뿐인 이유입니다.

그러면 궁금해집니다. 버블링하지 않는 이벤트는 React가 어떻게 위임할까요? 답은 방금 본 것과 같습니다.

- `onScroll`, `onFocus` 같은 비버블링 이벤트는 루트에 **캡처로** 등록하거나, 버블링하는 쌍둥이로 바꿔 듣습니다. React 17부터 `onFocus`/`onBlur`는 내부적으로 `focusin`/`focusout`을 사용합니다
- React 16까지는 `onScroll`이 (실제 DOM과 달리) 컴포넌트 트리를 따라 **버블링되는 버그**가 있었고, React 17에서 브라우저 동작과 일치하도록 수정됐습니다

React 17이 위임 지점을 document에서 루트 컨테이너로 옮긴 것도 전파 모델을 알면 이해가 됩니다. document에 걸려 있던 시절에는 React 밖에서 `e.stopPropagation()`을 해도 React 리스너에 이미 도달한 뒤라 막을 수 없는 문제, 한 페이지에 서로 다른 React 버전이 공존할 때 이벤트가 얽히는 문제가 있었습니다. 루트로 내리면 "이 React 트리의 이벤트는 이 루트가 받는다"로 경계가 명확해집니다.

정리하면, React의 이벤트 시스템은 마법이 아니라 **버블링 + 위임 + (비버블링 이벤트를 위한) 캡처**라는, 이 글에서 본 재료들의 조합입니다.

## 마치며

- 이벤트는 캡처(내려감) → 타깃 → 버블(올라감) 세 단계를 여행하고, `addEventListener`의 `capture` 옵션은 어느 방향에서 잡을지의 선택입니다
- `scroll`, `focus`/`blur`, `mouseenter`/`mouseleave`는 버블링하지 않습니다 — 요소 고유의 의미이거나 고빈도라서, 의도된 설계입니다
- 비버블링 이벤트가 없애는 것은 버블 단계뿐입니다. **캡처 단계는 모든 이벤트가 통과하므로**, 상위에서 잡으려면 캡처로 등록합니다. 해제 시에도 같은 capture 플래그가 필요합니다
- React의 이벤트 시스템은 이 전파 모델 위의 위임 패턴입니다. 루트 위임, `focusin` 전환, React 17의 변경 이유까지 전파 모델 하나로 설명됩니다

window에 건 리스너가 조용할 때 가장 먼저 볼 것은 `event.bubbles`입니다. 버블링하지 않는 이벤트라면, 길목은 캡처에 있습니다.
