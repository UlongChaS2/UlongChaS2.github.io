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

`Array` 자체는 **생성자 함수(constructor)**다. `new`를 붙여 호출하면 새 배열 객체를 만들어 반환한다.

```js
const a = new Array(3);      // [ <3 empty items> ]  길이 3짜리 빈 배열
const b = new Array(1, 2, 3); // [1, 2, 3]
```

여기서 `Array`는 두 가지 얼굴을 가진다.

- **인자가 하나이고 숫자면** → 그 숫자를 *길이*로 해석한다. `new Array(3)`은 값 3을 담은 게 아니라 length가 3인 빈 배열이다.
- **그 외에는** → 인자들을 원소로 담는다.

이 이중 동작 때문에 `new Array(3)`과 `new Array(3, 4)`의 결과가 완전히 달라진다. 헷갈리기 쉬워서 실무에서는 리터럴 `[]`이나 `Array.of`, `Array.from`을 더 선호한다.

```js
Array.of(3);   // [3]        숫자 하나도 그냥 원소로 담는다
Array.from({ length: 3 }); // [undefined, undefined, undefined]
```

중요한 건 `Array`가 `new` 없이도 호출된다는 점이다. `Array(3)`은 `new Array(3)`과 같은 결과를 낸다. 이건 `Array`가 생성자로도, 일반 함수로도 동작하도록 명세에 정의돼 있기 때문이다. 반면 `Array.from`은 뒤에서 보듯 오직 일반 함수로만 동작한다.

## new 키워드의 의미

`new`는 단순히 "객체를 만들어라"가 아니다. 함수를 **생성자로서 호출**하는 연산자이고, 내부적으로 다음 단계를 밟는다.

1. 빈 객체 `{}`를 새로 만든다.
2. 그 객체의 프로토타입을 함수의 `prototype` 프로퍼티로 연결한다.
3. 함수 본문을 실행하되, `this`를 1번 객체로 바인딩한다.
4. 함수가 객체를 명시적으로 반환하지 않으면, 1번 객체를 반환한다.

이 절차가 성립하려면 대상 함수가 **`[[Construct]]` 내부 메서드**를 가지고 있어야 한다. 일반 함수 선언과 클래스는 이걸 가진다. 그러나 화살표 함수, 그리고 **대부분의 내장 정적 메서드**는 가지고 있지 않다.

```js
const arrow = () => {};
new arrow(); // TypeError: arrow is not a constructor
```

즉 `new`를 붙일 수 있느냐 없느냐는 "그 함수에 `[[Construct]]`가 있느냐"로 결정된다. 이게 이 글의 핵심 열쇠다.

## Array.from의 내부 동작

`Array.from`은 유사 배열(array-like)이나 이터러블(iterable)을 받아 **새 배열을 만들어 반환하는 함수**다.

```js
Array.from('abc');              // ['a', 'b', 'c']
Array.from(new Set([1, 1, 2])); // [1, 2]
Array.from({ length: 2 }, (_, i) => i); // [0, 1]
```

동작을 개념적으로 풀면 이렇다.

- **`Array.from`이 배열을 생성하는 방식**: 인자가 이터러블이면 이터레이터를 돌며 값을 하나씩 꺼내 담고, 유사 배열이면 `length`만큼 인덱스를 훑어 담는다. 두 번째 인자로 매핑 함수를 주면 담기 전에 각 원소에 적용한다. 결과물로 **내부에서 새로 만든 배열을 반환**한다. 이 반환이 핵심이다 — `Array.from`은 `this`에 뭔가를 채우는 게 아니라, 값을 반환하는 함수다.
- **정적 메서드로 설계된 이유**: `from`은 특정 배열 *인스턴스*의 동작이 아니라 "여러 소스로부터 배열을 만든다"는 **생성 헬퍼**다. 이런 팩토리 성격의 기능은 개별 인스턴스(`[].from(...)`)가 아니라 `Array` 생성자 자체에 붙이는 게 자연스럽다. 그래서 프로토타입 메서드(`Array.prototype.map` 등)가 아니라 `Array`에 직접 달린 **정적 메서드**로 정의됐다. 정적 메서드는 값을 반환하는 함수일 뿐, `new`로 인스턴스를 찍어내는 생성자가 아니다.

이 지점에서 답이 드러난다. `Array.from`은 `[[Construct]]`를 갖지 않는 일반 함수라서, `new`의 4단계 절차를 실행할 자격이 없다.

## 왜 `new Array.from()`이 불가능한가?

앞의 두 조각을 합치면 답이 나온다.

- `new`는 대상 함수의 `[[Construct]]`를 필요로 한다.
- `Array.from`은 값을 반환하는 정적 메서드일 뿐, `[[Construct]]`가 없다.

그래서 엔진은 `new Array.from()`을 만나는 순간 "이건 생성자가 아니다"라며 거부한다.

```js
Array.from;       // 정적 메서드 (그냥 호출은 OK)
new Array.from(); // TypeError: Array.from is not a constructor
```

주의할 점은 이 에러가 `Array`가 아니라 `Array.from`에서 난다는 것이다. `new Array()`는 멀쩡히 동작한다. `Array`에는 `[[Construct]]`가 있고 `Array.from`에는 없기 때문이다.

같은 이유로 다른 내장 정적 메서드도 전부 똑같이 막힌다.

```js
new Math.max();     // TypeError: Math.max is not a constructor
new Object.keys();  // TypeError: Object.keys is not a constructor
new Number.isNaN(); // TypeError: Number.isNaN is not a constructor
```

이들은 전부 "값을 계산해 반환하는 도구 함수"지, "인스턴스를 찍는 틀"이 아니다.

## Array.from과 Array 생성자의 차이

둘 다 배열을 만들지만 목적과 호출 방식이 다르다.

| | `new Array(...)` | `Array.from(...)` |
|---|---|---|
| 정체 | 생성자 | 정적 메서드(팩토리) |
| `new` | 필요 (없어도 됨) | 붙이면 에러 |
| 인자 해석 | 숫자 하나면 length | 소스를 순회해 원소로 |
| 매핑 | 불가 | 두 번째 인자로 가능 |
| 주 용도 | 길이 지정·희소 배열 | 유사 배열·이터러블 → 진짜 배열 |

```js
new Array(3);              // [ <3 empty items> ]  — 길이만 3
Array.from({ length: 3 }); // [undefined, undefined, undefined] — 실제 원소 3개
Array.from({ length: 3 }, (_, i) => i * 2); // [0, 2, 4]
```

`new Array`는 "길이를 정해 틀을 잡는" 쪽에, `Array.from`은 "다른 걸 배열로 변환하는" 쪽에 강하다.

## 결론

- `Array.from`은 정적 메서드이고, 정적 메서드에는 `[[Construct]]`가 없어서 `new`를 붙일 수 없다. 반면 `Array`는 생성자라서 `new Array()`가 된다.
- `new`가 되느냐는 "생성자처럼 생겼나"가 아니라 "`[[Construct]]`를 가졌나"로 갈린다. `Math.max`, `Object.keys`도 같은 이유로 막힌다.
- 헷갈리지 않으려면 이렇게 기억하면 된다 — **정적 메서드는 그냥 호출해서 결과를 받는 것**이고, `new`는 생성자에게만 쓴다. 배열 변환이 필요하면 `Array.from(...)`을, 길이 지정이 필요하면 `new Array(n)` 대신 되도록 `Array.from({ length: n })`이나 리터럴을 쓰는 편이 의도가 분명하다.
