---
title: '리스트 하나로 다 되는데 왜 스택·큐·해시를 따로 쓸까 — 직접 구현하며 확인한 존재 이유'
date: '2026-08-07'
category: 'study'
keywords: ['Algorithm', 'Stack', 'Queue', 'Hash', 'Python']
---

> Python 리스트만 있으면 넣고 빼는 건 다 됩니다. 그런데도 스택·큐·해시 테이블이 따로 존재하는 이유를, 연결 리스트로 밑바닥부터 구현하고 같은 문제를 두 가지 방식으로 풀어 보며 확인합니다. 해시 충돌로 값이 사라지는 버그를 직접 재현하고 체이닝으로 고치는 과정까지.

<!--more-->

## 개요

알고리즘 스터디 3주차 기록입니다. [지난주 정렬](/study/sorting-algorithm-comparison)에 이어 이번 주제는 자료구조 — 스택, 큐, 해시 테이블입니다.

공부 전의 솔직한 의문은 이거였습니다. **"Python 리스트로 `append`, `pop`, `in` 다 되는데, 왜 굳이 따로 배우지?"** 실제로 리스트만으로 모든 문제를 풀 수는 있습니다. 하지만 밑바닥부터 구현해 보니, 이 자료구조들은 "기능"이 아니라 **"어떤 연산을 싸게 만들 것인가"라는 계약**이었습니다. 같은 문제를 자료구조 없이/있이 두 번씩 풀면서 그 차이를 확인했습니다.

## 스택 — 마지막에 넣은 것을 먼저 꺼낸다 (LIFO)

스택은 접시 더미입니다. 넣는 곳과 빼는 곳이 같은 쪽(top)이고, 그래서 마지막에 넣은 것이 먼저 나옵니다(Last In, First Out).

연결 리스트로 구현하면 핵심이 잘 보입니다. **head 쪽에서만 넣고 빼면** 둘 다 O(1)입니다.

```python
class Node:
    def __init__(self, data):
        self.data = data
        self.next = None


class Stack:
    def __init__(self):
        self.head = None

    def push(self, value):          # 새 노드가 head 앞에 선다
        new_head = Node(value)
        new_head.next = self.head
        self.head = new_head

    def pop(self):                  # head를 떼어내고 다음 노드가 head가 된다
        if self.is_empty():
            return None
        origin_head = self.head
        self.head = self.head.next
        return origin_head.data

    def is_empty(self):
        return self.head is None
```

순회가 전혀 없다는 점이 포인트입니다. push도 pop도 head 포인터 조작 두어 번으로 끝납니다. Python에서는 리스트의 `append()`/`pop()`이 끝쪽에서 O(1)로 동작하므로 리스트를 그대로 스택으로 씁니다.

### 스택이 문제를 푸는 방식 — 괄호 검사

스택의 대표 문제인 올바른 괄호 검사입니다. "가장 최근에 열린 괄호가 먼저 닫혀야 한다"는 규칙 자체가 LIFO입니다.

```python
def is_correct_parenthesis(string):
    stack = []
    for ch in string:
        if ch == "(":
            stack.append(ch)
        elif ch == ")":
            if len(stack) == 0:     # 닫을 게 없는데 닫음
                return False
            stack.pop()
    return len(stack) == 0          # 다 닫혔으면 빈 스택
```

`"())("` 같은 입력을 카운터(여는 괄호 +1, 닫는 괄호 -1)로도 풀 수 있지 않나 싶지만, 카운터로 되는 건 괄호가 한 종류일 때뿐입니다. `"([)]"` 처럼 종류가 섞이면 "**무엇이** 가장 최근에 열렸는지"를 기억해야 하고, 그게 정확히 스택이 하는 일입니다.

## 큐 — 먼저 넣은 것을 먼저 꺼낸다 (FIFO)

큐는 줄서기입니다. 뒤(tail)로 들어와서 앞(head)으로 나갑니다(First In, First Out).

연결 리스트로 구현해 보면 스택과의 차이가 명확해집니다. 넣는 곳과 빼는 곳이 **다른 쪽**이라, head만으로는 안 되고 **tail 포인터가 따로 필요**합니다.

```python
class Queue:
    def __init__(self):
        self.head = None
        self.tail = None

    def enqueue(self, value):       # tail 뒤에 붙인다
        new_node = Node(value)
        if self.is_empty():
            self.head = new_node
            self.tail = new_node
            return
        self.tail.next = new_node
        self.tail = new_node

    def dequeue(self):              # head를 떼어낸다
        if self.is_empty():
            return None
        origin_head = self.head
        self.head = self.head.next
        return origin_head.data

    def is_empty(self):
        return self.head is None
```

tail 포인터가 없다면 enqueue 때마다 head부터 끝까지 걸어가야 해서 O(n)이 됩니다. 포인터 하나를 더 드는 대가로 양쪽 연산이 모두 O(1)이 되는 것 — 이런 트레이드오프가 자료구조 설계의 전형입니다.

### Python에서 큐를 리스트로 쓰면 안 되는 이유

여기서 리스트의 한계가 처음 드러납니다. 리스트로 큐를 흉내 내면 `pop(0)`을 쓰게 되는데, **리스트는 배열이라 맨 앞을 빼면 뒤의 원소 전부가 한 칸씩 당겨집니다.** O(n)입니다. 그래서 Python 표준 라이브러리에 양쪽 끝 삽입·삭제가 모두 O(1)인 `collections.deque`가 따로 있습니다.

```python
from collections import deque

q = deque([1, 2, 3])
q.append(4)      # 뒤로 enqueue — O(1)
q.popleft()      # 앞에서 dequeue — O(1)  (리스트의 pop(0)은 O(n))
```

"리스트로도 되는데"의 함정이 정확히 여기 있습니다. 되긴 되는데, **연산 비용이 계약과 다릅니다.**

큐로 푼 문제는 주가 문제였습니다. "각 시점의 가격이 이후로 떨어지지 않은 기간 구하기" — 앞에서부터 하나씩 처리하고 버리는 흐름이라 `popleft`로 모델링하면 "지금 처리 중인 값 / 아직 남은 값"의 구분이 코드 구조에 그대로 드러납니다. 다만 이 문제에서 큐는 복잡도를 줄여주지는 않았습니다(여전히 각 원소마다 뒤를 훑어야 함). 자료구조가 항상 더 빠르게 해주는 건 아니고, 이 경우엔 **문제의 소비 패턴을 코드로 정직하게 옮기는 도구**였습니다.

## 해시 테이블 — 위치를 계산해서 바로 간다

스택·큐가 "넣고 빼는 순서"의 자료구조라면, 해시는 "**찾기**"의 자료구조입니다. 리스트에서 값을 찾으려면 앞에서부터 순회해야 하지만(O(n)), 해시 테이블은 키를 **해시 함수에 넣어 저장 위치를 계산**하고 그 자리로 바로 갑니다(평균 O(1)).

가장 단순한 형태부터 만들어 봤습니다.

```python
class Dict:
    def __init__(self):
        self.items = [None] * 8

    def put(self, key, value):
        index = hash(key) % len(self.items)   # 키 → 배열 인덱스
        self.items[index] = value

    def get(self, key):
        index = hash(key) % len(self.items)
        return self.items[index]
```

`hash(key) % 8`로 키를 0~7 사이 인덱스로 바꿔 배열에 넣습니다. 잘 동작하는 것처럼 보입니다.

### 값이 사라지는 버그 — 충돌

그런데 이 구현에는 치명적인 문제가 있습니다. 슬롯은 8칸뿐인데 키는 무한히 다양합니다. **서로 다른 키가 같은 인덱스로 계산되는 순간(해시 충돌), 먼저 넣은 값이 소리 없이 덮입니다.**

```python
my_dict = Dict()
my_dict.put("A", 1)
my_dict.put("B", 2)   # 만약 "A"와 "B"의 인덱스가 같다면
my_dict.get("A")      # → 2  ("A"의 값이 사라졌다)
```

에러도 안 나고 그냥 틀린 값이 나옵니다. 8칸에 9개를 넣으면 비둘기집 원리로 충돌은 **반드시** 일어나므로, 충돌은 예외 상황이 아니라 해시 테이블의 전제 조건입니다.

### 체이닝 — 같은 칸에 여러 개를 매달기

해결책 하나가 **체이닝(chaining)** 입니다. 각 슬롯에 값 하나가 아니라 **(키, 값) 쌍의 목록**을 두고, 충돌하면 그 목록에 이어 붙입니다.

```python
class LinkedTuple:                  # 한 슬롯에 매달리는 (키, 값) 목록
    def __init__(self):
        self.items = []

    def add(self, key, value):
        self.items.append([key, value])

    def get(self, key):
        for k, v in self.items:     # 같은 슬롯 안에서는 키를 대조하며 순회
            if k == key:
                return v


class LinkedDict:
    def __init__(self):
        self.items = [LinkedTuple() for _ in range(8)]

    def put(self, key, value):
        index = hash(key) % len(self.items)
        self.items[index].add(key, value)

    def get(self, key):
        index = hash(key) % len(self.items)
        return self.items[index].get(key)
```

이제 값과 함께 **키도 저장**한다는 점이 중요합니다. 같은 슬롯에 여러 쌍이 매달릴 수 있으니, 꺼낼 때 "이 중 누가 진짜 내 키인가"를 대조해야 하기 때문입니다. 처음 구현에서 값만 저장했던 것 자체가 충돌을 생각하지 않았다는 증거였습니다.

![해시 충돌과 체이닝 — 같은 슬롯에 (키, 값) 쌍을 매단다](/images/stack-queue-hash-from-scratch/hash-chaining.svg)

물론 한 슬롯에 쏠리면 그 슬롯 안 순회가 길어져 최악 O(n)까지 떨어집니다. 그래서 실제 해시 테이블은 원소가 차면 슬롯 수를 늘려 재배치(리사이징)합니다. 참고로 Python 내장 dict는 체이닝이 아니라 오픈 어드레싱(빈 다른 슬롯을 찾아가는 방식)을 쓰지만, "충돌은 반드시 일어나고, 처리 전략이 있어야 한다"는 본질은 같습니다.

### 해시가 문제를 푸는 방식 — 결석한 학생 찾기

전체 명단과 출석 명단을 주고 결석한 한 명을 찾는 문제입니다. 리스트로 풀면 학생마다 `in`으로 다른 명단을 순회하니 O(n²)입니다. dict를 쓰면:

```python
def get_absent_student(all_array, present_array):
    students = {}
    for student in all_array:        # 전체 명단을 dict에 — 각 O(1)
        students[student] = True

    for present in present_array:    # 출석한 사람을 지운다 — 각 O(1)
        del students[present]

    for key in students.keys():      # 남은 한 명이 결석자
        return key
```

같은 O(n) 순회 두 번이지만, 안쪽의 "찾기"가 O(n) → O(1)이 되면서 전체가 O(n²) → O(n)으로 내려옵니다. `in` 키워드도 리스트에서는 순회(O(n)), dict/set에서는 해시 조회(평균 O(1))로 동작합니다 — 같은 문법인데 자료구조에 따라 비용이 다른 대표 사례입니다.

## 마치며

- 스택과 큐는 기능이 아니라 **접근 규칙**입니다. LIFO(가장 최근 것부터)가 문제의 구조와 일치하면 스택, FIFO(들어온 순서대로)면 큐 — 자료구조 선택이 곧 문제 해석입니다
- 연결 리스트 구현에서 본 것: 스택은 head 하나로 충분하고, 큐는 tail 포인터를 하나 더 들어 양쪽 O(1)을 삽니다
- Python 리스트로 큐를 흉내 내면 `pop(0)`이 O(n)입니다. `collections.deque`가 따로 존재하는 이유입니다
- 해시 테이블의 본질은 "키로 위치를 계산한다"이고, 충돌은 예외가 아니라 전제입니다. 체이닝이든 오픈 어드레싱이든 충돌 전략까지가 해시 테이블입니다
- "리스트로도 된다"는 말은 반은 맞습니다. 기능은 되지만 **연산 비용의 계약이 다릅니다.** 자료구조를 고른다는 건 어떤 연산을 O(1)로 만들지 정하는 일입니다

다음 주는 이 자료구조들을 전제로 하는 탐색 알고리즘으로 이어집니다.
