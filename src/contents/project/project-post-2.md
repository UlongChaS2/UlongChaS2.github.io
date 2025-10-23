---
title: '할 일 관리 앱 만들기'
date: '2025-01-22'
category: 'project'
---

React와 Local Storage를 활용한 간단하지만 실용적인 할 일 관리 앱을 만들어봤습니다.

## 프로젝트 소개

일상적인 할 일을 관리할 수 있는 웹 애플리케이션입니다.

### 주요 기능

- ✅ 할 일 추가/삭제/완료
- 🏷️ 카테고리별 분류
- 🔍 검색 기능
- 💾 로컬 스토리지 저장

## 구현 과정

### 1. 상태 관리

React Hooks를 활용하여 상태를 관리했습니다.

```javascript
const [todos, setTodos] = useState([]);
const [filter, setFilter] = useState('all');

const addTodo = (text) => {
  const newTodo = {
    id: Date.now(),
    text,
    completed: false,
    createdAt: new Date().toISOString(),
  };
  setTodos([...todos, newTodo]);
};
```

### 2. 로컬 스토리지 연동

데이터를 브라우저에 저장하여 새로고침 후에도 데이터를 유지합니다.

```javascript
useEffect(() => {
  const savedTodos = localStorage.getItem('todos');
  if (savedTodos) {
    setTodos(JSON.parse(savedTodos));
  }
}, []);

useEffect(() => {
  localStorage.setItem('todos', JSON.stringify(todos));
}, [todos]);
```

### 3. 필터링 기능

완료된 할 일과 미완료 할 일을 필터링할 수 있습니다.

```javascript
const filteredTodos = todos.filter((todo) => {
  if (filter === 'completed') return todo.completed;
  if (filter === 'active') return !todo.completed;
  return true;
});
```

## 개선 사항

- 드래그 앤 드롭으로 순서 변경
- 마감일 설정 기능
- 중요도 표시
- 모바일 앱으로 확장

## 마무리

간단한 프로젝트였지만 React의 기본 개념을 실습하기에 좋은 프로젝트였습니다.
