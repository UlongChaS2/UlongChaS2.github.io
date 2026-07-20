---
title: '파일명 언더스코어 prefix 관례와 내부 구현 은닉'
date: '2026-05-13'
category: 'project'
keywords: ['컨벤션', '캡슐화', 'FE']
---

> 파일명 앞에 `_`를 붙이면 "이 파일은 내부 구현용이니 직접 import하지 마라"라는 팀 내 약속이 된다. 은닉화(information hiding)가 아니라 **관례적 접근 제어**다.

## 개요

JavaScript/TypeScript에서 진짜 은닉화(외부에서 물리적으로 접근 불가)는 클래스의 `#` private으로 구현한다. 반면 파일/모듈 단위에서는 언어 차원의 강제 수단이 없기 때문에 `_` prefix + `index.ts` export 제한이라는 **관례**로 대신한다.

## 핵심 개념

### 진짜 은닉화 — 클래스 `#` private

```typescript
class Counter {
  #count = 0  // 외부에서 접근 자체가 불가능

  increment() { this.#count++ }
  get value() { return this.#count }
}

const c = new Counter()
c.#count  // SyntaxError: 런타임에서 실제로 막힘
```

`#`은 JS 언어 스펙이 보장하는 진짜 은닉화다. 컴파일러와 런타임 모두 접근을 막는다.

### `_` prefix — 관례적 접근 제어

```typescript
// _createHook.ts
// 누구든 import할 수 있다 — 언어가 막지 않는다
// 하지만 "_"를 보고 "직접 쓰면 안 되는구나"를 알 수 있다
export function createHook() { ... }
```

`_` prefix는 컴파일러가 막아주지 않는다. 팀이 관례를 따를 때만 효과가 있다.

### 왜 `#` 대신 `_` prefix를 쓰나?

`#`은 **클래스 멤버**에만 사용 가능하다. 파일/모듈 수준에서는 쓸 수 없다:

```typescript
// 이런 건 불가능
#export function createHook() { ... }  // 문법 오류
```

파일 단위로 "내부 구현"을 표시할 방법이 언어에 없기 때문에 `_` prefix + `index.ts` 미노출 조합으로 대신하는 것이다.

| 수준 | 방법 | 강제 여부 |
|------|------|-----------|
| 클래스 멤버 | `#private` | 언어가 강제 |
| 파일/모듈 | `_` prefix + index.ts 미노출 | 관례로만 보호 |
| 슬라이스 외부 | `index.ts`만 export (FSD) | ESLint 규칙으로 보강 가능 |

### 내부 구현을 숨겨야 하는 이유

공통 로직을 내부 헬퍼로 추출했는데 외부에서 직접 import해버리면:
- 내부 구현 변경 시 외부 의존이 깨진다
- 어떤 게 공개 API인지 알기 어려워진다
- 팀원이 실수로 잘못된 진입점을 사용할 수 있다

## 이 케이스에서 왜 `_` prefix를 사용했나

한 프로젝트에서 여러 namespace별 번역 훅(`useNotificationMessage`, `usePostMessage` 등)이 내부 구현이 완전히 동일했다. 중복을 없애기 위해 팩토리 함수로 추출했는데, 이 팩토리는:

- 외부에서 직접 쓸 필요가 없다
- 각 훅 파일들만 내부적으로 import하면 된다
- `index.ts`에 export하지 않는다

`#`을 쓰고 싶어도 파일 수준에서는 쓸 수 없으니, `_createMessageHook.ts`처럼 `_` prefix를 붙여서 "이건 내부 구현이니 직접 import하지 마라"를 관례로 표시한 것이다.

## 코드 예시

```typescript
// _createMessageHook.ts (내부 팩토리 — 직접 import 금지)
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

export function createMessageHook(namespace: string) {
  return function () {
    const { t: translate } = useTranslation(namespace)
    const t = useCallback(
      (key: string, options?: Record<string, string>): string => translate(key, options),
      [translate],
    )
    return { t }
  }
}
```

```typescript
// useNotificationMessage.ts (공개 훅 — index.ts에서 export)
import { createMessageHook } from './_createMessageHook'

export default createMessageHook('notification')
```

```typescript
// index.ts (공개 API만 노출)
export { default as useNotificationMessage } from './useNotificationMessage'
// _createMessageHook은 여기에 넣지 않는다
```

## 주의사항 / 자주 하는 실수

- `_` prefix는 관례일 뿐 — ESLint나 TypeScript가 막아주지 않는다. 팀 컨벤션에 명시해야 효과 있음
- `index.ts`에 실수로 `_` 파일을 export하면 관례가 무너진다
- `_` 파일을 너무 많이 만들면 오히려 디렉토리가 복잡해진다 — 진짜 내부 구현에만 쓸 것

## 관련 개념

- JS `#` private field — 클래스 멤버 수준의 진짜 은닉화
- FSD(Feature-Sliced Design)의 public API 원칙 — `index.ts`만 외부 진입점
- 팩토리 패턴 — 동일한 구조를 파라미터만 다르게 여러 개 생성
- 캡슐화 — 구현 세부사항을 숨기고 인터페이스만 노출
