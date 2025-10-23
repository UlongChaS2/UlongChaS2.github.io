---
title: 'TypeScript 기초부터 활용까지'
date: '2025-01-20'
category: 'study'
---

TypeScript는 JavaScript에 타입 시스템을 추가한 언어로, 대규모 애플리케이션 개발에 매우 유용합니다.

## 타입 정의

기본 타입들을 정의하는 방법을 알아봅시다.

```typescript
let age: number = 25;
let name: string = 'John';
let isActive: boolean = true;
```

## 인터페이스

객체의 구조를 정의할 수 있습니다.

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

const user: User = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
};
```

## 제네릭

재사용 가능한 컴포넌트를 만들 때 제네릭을 활용할 수 있습니다.

```typescript
function identity<T>(arg: T): T {
  return arg;
}

const result = identity<string>('hello');
```

## 유틸리티 타입

TypeScript는 유용한 내장 유틸리티 타입들을 제공합니다.

- `Partial<T>`: 모든 속성을 선택적으로 만듭니다
- `Required<T>`: 모든 속성을 필수로 만듭니다
- `Pick<T, K>`: 특정 속성만 선택합니다
- `Omit<T, K>`: 특정 속성을 제외합니다

## 결론

TypeScript를 사용하면 코드의 안정성과 유지보수성을 크게 향상시킬 수 있습니다.
