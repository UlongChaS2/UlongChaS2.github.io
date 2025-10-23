---
title: 'React Hooks 완벽 가이드'
date: '2025-01-15'
category: 'study'
---

React Hooks는 함수형 컴포넌트에서 상태와 생명주기 기능을 사용할 수 있게 해주는 강력한 기능입니다.

## useState - 상태 관리

`useState`는 가장 기본적인 Hook으로, 함수형 컴포넌트에서 상태를 관리할 수 있게 해줍니다.

```javascript
const [count, setCount] = useState(0);
```

## useEffect - 사이드 이펙트 처리

`useEffect`를 사용하면 컴포넌트의 생명주기에 따른 작업을 수행할 수 있습니다.

```javascript
useEffect(() => {
  document.title = `You clicked ${count} times`;
}, [count]);
```

## 커스텀 Hooks

재사용 가능한 로직을 커스텀 Hook으로 만들 수 있습니다.

```javascript
function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return width;
}
```

## 마무리

React Hooks를 활용하면 더 깔끔하고 재사용 가능한 코드를 작성할 수 있습니다.
