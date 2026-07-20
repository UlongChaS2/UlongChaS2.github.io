---
title: 'React에서 findDOMNode() 사용이 제한된 이유와 해결 과정'
date: '2025-11-18'
category: 'study'
keywords: ['React', 'DOM']
---

> recharts로 두 개의 Stacked Bar Chart를 비교하는 작업에서 결국 `findDOMNode()`를 쓸 수밖에 없었던 이유와 그 과정을 정리한다.

<!--more-->

## 개요

`findDOMNode()`는 **컴포넌트의 실제 DOM 노드를 직접 가져오는 API**로, 예전에는 특정 컴포넌트가 실제로 렌더링된 DOM을 가져와야 할 때 유용했다. 그러나 React 16 이후로 점진적으로 사용이 제한되었고, React 18에서는 Strict Mode에서 아예 사용할 수 없게 되었다.

하지만 현실적으로 UI를 개발하다 보면 React의 원칙과 다소 어긋나더라도 DOM을 직접 조작해야 하는 경우가 존재한다. 특히, 차트나 애니메이션을 다룰 때 이러한 문제가 자주 발생한다.

이번 사례에서는 차트 라이브러리인 recharts로 **두 개의 Stacked Bar Chart를 비교하면서 특정 값의 차이를 실선과 라벨로 시각화하는 작업**을 진행하면서 `findDOMNode()`를 사용해야만 했던 이유를 살펴본다.

## React에서 `findDOMNode()` 사용이 금지된 이유

### 1. React의 철학과 맞지 않음

React의 가장 큰 특징은 **선언형 UI와 명시적 데이터 흐름**(one-way data flow: 단방향 데이터 흐름)이다.
즉, 상태가 변경되면 React가 알아서 필요한 부분만 업데이트하는 방식으로 동작한다.

그러나 `findDOMNode()`는 직접 DOM을 가져와 조작하는 방식이므로

- **React의 렌더링 흐름을 깨뜨릴 수 있음**
- **데이터 흐름이 예측하기 어려워짐**
- **컴포넌트 트리와 별개로 DOM을 직접 수정하면 React의 업데이트 방식과 충돌 가능**

이러한 이유로 `findDOMNode()`는 React팀이 의도한 **선언형 UI 철학**과 맞지 않으며, React 팀은 대신 `ref`를 사용하도록 권장한다.

### 2. Concurrent Mode와의 충돌

Concurrent Mode(동시성 모드)는 React 18에서 도입된 개념으로, UI의 응답성을 향상시키고 여러 개의 업데이트를 비동기적으로 실행하여 보다 부드럽고 유연하게 처리하기 위한 새로운 렌더링 방식이다.

React 18의 Concurrent Mode는 렌더링을 비동기적으로 처리하여 UI의 응답성을 높이는 기능을 제공한다. 하지만 `findDOMNode()`는 **렌더링 중인 컴포넌트의 현재 DOM을 직접 조회**하는 방식이라 React의 새로운 동시성 처리 방식과 맞지 않는다.

예를 들어, Concurrent Mode에서는 React가 한 번에 여러 개의 업데이트를 처리하며 렌더링을 최적화하는데, 이 과정에서 `findDOMNode()`가 **잘못된(아직 완전히 렌더링되지 않은) DOM 노드를 가져올 가능성**이 있다.

이는 UI 버그를 유발할 수 있으며, React 팀이 `findDOMNode()`를 사용하지 않도록 권장하는 중요한 이유 중 하나다. 실제로 차트가 완전히 그려지기 전에 DOM을 직접 조회해서 제대로 된 x, y축 값을 얻지 못하는 상황을 의심해 볼 수 있다.

### 3. Strict Mode와 호환되지 않음

React 18의 **Strict Mode**에서는 `findDOMNode()`가 권장 대상이 아니라 아예 사용할 수 없다.

Strict Mode는 의도적으로 두 번 렌더링하여 **부작용을 감지**하는 방식으로 동작한다. 하지만 `findDOMNode()`는 **컴포넌트가 마운트될 때만 동작**하도록 설계되었기 때문에, Strict Mode를 사용할 때와 아닐 때의 동작이 달라지고 의도한 동작과 충돌할 가능성이 크다.

즉, **Strict Mode가 활성화된 환경에서는 `findDOMNode()`가 아예 동작하지 않도록 변경**되었다.

> 하지만 현실은 React 철학과 맞지 않을 때가 많다. 내 케이스는 recharts로 두 개의 stacked bar chart의 각 요소의 차이점을 실선과 라벨로 표현하는 것이었다. 결론적으로 나는 `findDOMNode()`를 사용하여 이 문제를 해결했는데, 왜 결국 저 많은 단점과 React 18 Strict Mode에서는 아예 사라진 `findDOMNode()`를 꼭 써야만 했는지, 사용하지 않으려고 어떤 시도를 했는데 결국 승복하고 말았는지에 대해서 설명한다.

---

## 문제 상황: Stacked Bar Chart의 차이를 시각적으로 나타내기

이번 문제는 **Recharts를 사용하여 두 개의 Stacked Bar Chart를 비교하는 작업**에서 발생했다.

구현하고자 했던 기능:

1. 두 개의 차트에서 각 항목의 차이를 실선(Line)과 라벨(Label)로 표시
2. 정확한 위치에 실선과 라벨을 배치하기 위해 **각 바의 위치를 직접 계산해야 함**
3. 이 과정에서 각 차트의 특정 DOM 요소에 접근해야 했음

**문제 발생:**

- React의 상태(state) 기반 렌더링만으로는 정확한 좌표를 얻기 어려웠음
- `ref`를 사용해 보았지만, 차트 내부의 개별 바(bar) 요소에는 직접 접근이 어려웠음

이 때문에 `findDOMNode()`를 사용하여 **렌더링된 DOM을 직접 가져와 위치를 계산**하는 방식을 고려하게 되었다.

---

## 사용하지 않으려 했던 시도들

### 1. `ref`를 활용한 접근

가장 먼저 고려한 방법은 **`ref`를 사용하여 특정 요소에 접근하는 것**이었다.

```jsx
const barRef = useRef(null);

useEffect(() => {
  if (barRef.current) {
    const barElement = barRef.current;
    console.log(barElement.getBoundingClientRect());
  }
}, []);
```

**문제점:**

- `ref`는 **컴포넌트의 루트 요소**에만 적용할 수 있음
- **차트 내부의 개별 요소(bar)에는 직접 접근할 수 없음**
- Recharts 내부적으로 생성된 `<g>` 요소들에는 ref를 직접 할당할 수 없음

결국, `ref`만으로는 원하는 데이터를 얻을 수 없었다.

---

### 2. 상태 기반으로 렌더링을 조정하는 방식

차트 데이터를 **state에 저장한 후 계산**하여 위치를 조정하는 방식도 고려했다.

```jsx
const [barPositions, setBarPositions] = useState([]);

useEffect(() => {
  const positions = data.map((item) => calculatePosition(item));
  setBarPositions(positions);
}, [data]);
```

**문제점:**

- Recharts의 내부 레이아웃이 동적으로 변하므로, **렌더링 후 정확한 위치를 얻기 어려움**
- **`calculatePosition()`에서 정확한 DOM 좌표를 가져올 방법이 없음**
- Concurrent Mode 환경에서는 **React의 상태 업데이트가 비동기적으로 실행**되어 타이밍 문제가 발생

이 방식 역시 실패했다.

---

## 결국 `findDOMNode()`를 사용해야만 했던 이유

위의 방법들이 모두 실패하면서 결국 `findDOMNode()`를 사용하게 되었다.

```jsx
import { findDOMNode } from 'react-dom';

useEffect(() => {
  const node = findDOMNode(chartRef.current);
  if (node) {
    const bars = node.querySelectorAll('.recharts-bar-rectangles');
    console.log(bars);
  }
}, []);
```

**왜 `findDOMNode()`가 필요했는가?**

- Recharts 내부의 `<g>` 요소들은 `ref`로 직접 접근이 불가능했음
- 차트가 렌더링된 이후 DOM을 직접 읽어야 정확한 위치를 얻을 수 있었음
- `useEffect()`를 활용하여 DOM이 완전히 그려진 후 좌표를 가져올 수 있었음

결국, React의 철학과는 맞지 않지만, UI 구현을 위해서는 `findDOMNode()`가 필요한 상황이었다.

---

## 마무리 및 배운 점

- `findDOMNode()`는 React의 철학과 맞지 않지만, 실무에서는 여전히 필요한 경우가 있음
- Recharts와 같은 외부 라이브러리는 **React의 `ref`만으로는 제어하기 어려운 경우가 많음**
- `findDOMNode()`를 사용할 때는 Strict Mode와의 호환성 문제를 고려해야 함

결론적으로, React에서 `findDOMNode()`를 지양해야 하지만, 불가피한 경우에는 신중하게 사용할 필요가 있다.
