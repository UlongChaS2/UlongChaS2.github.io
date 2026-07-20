---
title: 'Array.from은 왜 앞에 new가 붙으면 안 되나?'
date: '2025-06-10'
category: 'study'
keywords: ['JavaScript', 'Array']
---

> `Array.from`은 정적 메서드라 생성자가 아니며, 그래서 앞에 `new`를 붙일 수 없다.

<!--more-->

## 개요

JavaScript에서 배열을 생성하는 방법은 다양하며, 특히 `Array.from()`은 **정적 메서드**이며, 배열 변환 작업을 위해 설계되었다. 하지만 많은 개발자가 궁금해하는 점 중 하나는 "**왜** `Array.from` **앞에** `new`**를 붙일 수 없는가?**"다. 이 글에서는 `Array.from`의 작동 방식과 정적 메서드는 무엇인지, `new` 키워드의 의미, 그리고 이를 둘러싼 주요 개념들을 다루며 명확한 이유를 설명한다.

## Array() 생성자와 생성 방법

## new 키워드의 의미

## Array.from의 내부 동작

- `Array.from`이 배열을 생성하는 방식
- 정적 메서드로 설계된 이유

## 왜 `new Array.from()`이 불가능한가?

- `Array.from`이 정적 메서드로 동작하는 이유
- 정적 메서드와 생성자의 차이점
- `TypeError: Array.from is not a constructor`의 의미

```jsx
Array.from; // 정적 메서드
new Array.from(); // TypeError: Array.from is not a constructor
```

비슷한 사례를 보자면:

```jsx
Math.max; // 정적 메서드
new Math.max(); // TypeError: Math.max is not a constructor
```

## Array.from과 Array 생성자의 차이

- `Array`와 `Array.from`의 사용 목적 비교, `new Array`와의 올바른 사용 차이

## 결론

- `Array.from`과 `new`의 관계 요약
- 개발자가 혼동하지 않기 위한 팁
