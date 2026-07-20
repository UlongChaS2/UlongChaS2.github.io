---
title: 'React Concurrent Mode 파헤치기'
date: '2026-02-24'
category: 'study'
keywords: ['React', 'Concurrent']
---

> React 18의 Concurrent Mode가 무엇이고, 어떤 특징과 API로 UI 응답성을 높이는지 정리한다.

<!--more-->

## 개요

**Concurrent Mode**(동시성 모드)는 React 18에서 도입된 개념으로, **UI의 응답성을 향상**시키고, 여러 개의 업데이트를 보다 **부드럽고 유연하게 처리**하기 위한 새로운 렌더링 방식이다.

**기존 React(Rendering 방식)와의 차이점**

- **기존 React(Fiber 이전)**: 렌더링이 **단일 스레드**(Synchronous, 동기식)로 진행됨 → 하나의 업데이트가 실행되면 그게 끝날 때까지 다른 작업을 못 함.
- **Concurrent Mode**: React가 업데이트를 **비동기적으로 처리**(Asynchronous)할 수 있도록 개선 → 중간에 렌더링을 **일시 중단**(pausing)하고, **우선순위**(priority)가 높은 작업을 먼저 실행할 수 있음.

---

## Concurrent Mode의 핵심 특징

### 1. 렌더링 중단(Pausing) 및 재개(Resuming)

기존 React는 한 번 렌더링이 시작되면 끝까지 완료해야 했지만, **Concurrent Mode에서는 렌더링을 중단하고 다시 시작할 수 있음**.

예제: 사용자가 입력하는 동안 다른 무거운 작업이 진행 중이라면, React는 **입력 관련 렌더링을 우선 실행**하고 무거운 작업을 나중에 처리할 수 있음.

### 2. 우선순위 기반 렌더링(Priority-based Rendering)

React 18부터 **업데이트의 우선순위를 다르게 설정할 수 있음**. 중요한 작업(예: 사용자의 입력)과 덜 중요한 작업(예: 백그라운드 데이터 로드)을 구분하여 먼저 실행해야 할 작업을 우선 처리함.

예제:

- 사용자가 버튼을 클릭해서 페이지를 전환하면, 화면 전환을 **최우선적으로 실행**.
- 이후 백그라운드에서 데이터가 로드되도록 함.

### 3. 유휴 시간 활용(Time-Slicing)

React 18에서는 브라우저가 **유휴 시간**(Idle Time)을 활용해서 작업을 조금씩 나눠 실행할 수 있음. 이를 **Time-Slicing**(시간 분할)이라고 함.

예제:

- 예전에는 하나의 컴포넌트 렌더링이 오래 걸리면, 그동안 UI가 멈춘 것처럼 보였음.
- **Concurrent Mode에서는 한 번에 모든 렌더링을 수행하지 않고, 일정 부분만 처리한 후 다음 프레임에서 다시 렌더링함.**
- 이 방식 덕분에 **사용자가 UI를 더 부드럽게 경험**할 수 있음.

### 4. Suspense를 활용한 비동기 데이터 처리

Concurrent Mode에서는 `Suspense`를 활용하여 **비동기 데이터를 처리하는 동안 UI를 멈추지 않고 부드럽게 보여줄 수 있음**.

예제:

- 데이터가 로딩 중이면, 기존 방식은 "로딩 스피너"가 필요했지만, `Suspense`를 사용하면 **컴포넌트를 자연스럽게 대체하면서 스무스하게 렌더링**할 수 있음.

---

## Concurrent Mode를 활용하는 기능

### 1. `startTransition()`

`startTransition()`을 사용하면, UI 업데이트를 **우선순위가 낮은 트랜지션(Transition)으로 처리**할 수 있음.

**예제:** 사용자의 입력이 끝나면, 그때 화면을 업데이트하도록 설정.

```jsx
import { useState, startTransition } from 'react';

function SearchComponent() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  function handleChange(e) {
    setQuery(e.target.value); // 입력값 즉시 업데이트 (높은 우선순위)

    startTransition(() => {
      // 검색 결과는 우선순위 낮은 트랜지션으로 업데이트
      setResults(fetchResults(e.target.value));
    });
  }

  return (
    <div>
      <input type="text" value={query} onChange={handleChange} />
      <ul>
        {results.map((result) => (
          <li key={result.id}>{result.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

**효과:**

- 입력(input) 변화는 즉시 반영(높은 우선순위)
- 검색 결과는 입력이 끝난 후 업데이트(낮은 우선순위)

---

### 2. `useDeferredValue()`

`useDeferredValue()`는 **입력값을 지연(Defer)시켜서, 높은 우선순위 작업(예: 타이핑)을 방해하지 않도록 함**.

**예제:** 사용자가 검색어를 입력할 때, 검색어를 즉시 반영하지만 결과는 지연됨.

```jsx
import { useState, useDeferredValue } from 'react';

function SearchComponent({ results }) {
  const deferredResults = useDeferredValue(results); // 검색 결과 업데이트를 지연

  return (
    <ul>
      {deferredResults.map((result) => (
        <li key={result.id}>{result.name}</li>
      ))}
    </ul>
  );
}
```

**효과:**

- 입력은 빠르게 반영되지만, 결과 업데이트는 늦게 반영되어 **부드러운 사용자 경험** 제공.

---

## Concurrent Mode가 필요한 이유

### 기존 React의 문제점

1. **큰 컴포넌트가 렌더링될 때, UI가 멈추는 현상 (Blocking UI)**
2. **업데이트가 일어나면 모든 UI가 한꺼번에 갱신되면서 프레임 드랍(Frame Drop) 발생**
3. **데이터 로딩이 끝날 때까지 화면이 멈추는 문제**

### Concurrent Mode의 해결 방법

1. **Time-Slicing:** 하나의 큰 렌더링 작업을 잘게 쪼개서 브라우저가 멈추지 않도록 함.
2. **Transition:** 낮은 우선순위 작업(예: 데이터 갱신)과 높은 우선순위 작업(예: UI 인터랙션)을 구분.
3. **Suspense 활용:** 데이터 로딩 중에도 UI가 부드럽게 동작하도록 관리.

---

## 결론

**Concurrent Mode는 React 18에서 UI의 성능을 최적화하는 핵심적인 렌더링 방식**이다.

- 렌더링을 **비동기적으로 실행**하여 성능을 높임.
- **우선순위가 높은 작업**(예: 사용자 입력)을 먼저 실행.
- UI가 멈추지 않도록 **시간을 쪼개서 렌더링(Time-Slicing)**.
- `startTransition()`, `useDeferredValue()`, `Suspense` 등의 API를 활용하여 **보다 부드러운 사용자 경험 제공**.

즉, 사용자 인터랙션이 많은 애플리케이션에서 UI를 더욱 자연스럽고 부드럽게 만드는 기술이다.

React 18부터 기본적으로 적용되는 개념이니, **최신 React 프로젝트에서는 필수적으로 고려해야 할 요소**다.
