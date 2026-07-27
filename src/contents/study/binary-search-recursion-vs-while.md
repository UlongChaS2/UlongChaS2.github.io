---
title: '이진 탐색은 재귀와 while 중 무엇이 더 나을까'
date: '2026-07-27'
category: 'study'
keywords: ['Algorithm', 'Python', 'Binary Search']
---

> 정렬된 배열에서 값을 찾는다면 순차 탐색보다 이진 탐색이 낫다. 다만 Python에서 이진 탐색을 구현할 때는 재귀보다 `while` 방식이 보통 더 실용적이다.

<!--more-->

## 개요

배열 안에 특정 숫자가 있는지 확인하는 가장 단순한 방법은 앞에서부터 하나씩 비교하는 것이다.

```python
finding_target = 14
finding_numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]


def is_existing_target_number_sequential(target, array):
    for number in array:
        if target == number:
            return True

    return False
```

이 방식은 **순차 탐색**이다. 배열이 정렬되어 있지 않아도 동작한다. 대신 최악의 경우 배열 끝까지 모두 확인해야 하므로 시간복잡도는 `O(n)`이다.

그런데 위 배열처럼 이미 정렬되어 있다면 굳이 처음부터 끝까지 볼 필요가 없다. 가운데 값을 확인하고, 찾는 값이 더 크면 오른쪽 절반만 보면 된다. 반대로 더 작으면 왼쪽 절반만 보면 된다. 이게 **이진 탐색(binary search)**이다.

## 순차 탐색과 이진 탐색의 차이

순차 탐색은 한 칸씩 이동한다.

```text
1 → 2 → 3 → 4 → ... → 14
```

이진 탐색은 절반씩 버린다.

```text
[1 ... 16]
가운데 9 확인
14는 9보다 큼 → 오른쪽 절반만 탐색

[10 ... 16]
가운데 13 확인
14는 13보다 큼 → 오른쪽 절반만 탐색

[14 ... 16]
가운데 15 확인
14는 15보다 작음 → 왼쪽 탐색

[14]
찾음
```

데이터가 적을 때는 차이가 잘 안 보인다. 하지만 데이터가 커질수록 차이가 커진다.

| 방식 | 조건 | 시간복잡도 |
|------|------|------------|
| 순차 탐색 | 정렬 필요 없음 | `O(n)` |
| 이진 탐색 | 정렬된 배열 필요 | `O(log n)` |

정리하면 이렇다.

- 정렬되지 않은 배열이면 순차 탐색이 자연스럽다.
- 정렬된 배열이면 이진 탐색이 훨씬 효율적이다.
- 단, 이진 탐색은 **정렬되어 있다는 전제**가 깨지면 사용할 수 없다.

## 재귀로 구현한 이진 탐색

이진 탐색은 "문제를 절반으로 나누고, 그 절반에서 다시 같은 일을 한다"는 구조라 재귀로 표현하기 쉽다.

```python
def is_existing_target_number_binary(target, array):
    if len(array) == 0:
        return False

    half_index = len(array) // 2

    if array[half_index] < target:
        return is_existing_target_number_binary(target, array[half_index + 1:])
    elif array[half_index] > target:
        return is_existing_target_number_binary(target, array[:half_index])
    else:
        return True
```

이 코드는 순차 탐색이 아니다. 가운데 인덱스를 기준으로 배열을 반씩 줄여가므로 이진 탐색이다.

다만 조심할 점이 있다.

```python
if len(array) == 0:
    return False
```

이 종료 조건이 없으면 target이 배열에 없을 때 빈 배열까지 내려가고, 결국 `array[half_index]`에서 에러가 난다.

또 하나는 slicing이다.

```python
array[half_index + 1:]
array[:half_index]
```

이렇게 자르면 매번 새 배열이 만들어진다. 개념은 이해하기 쉽지만, 메모리 면에서는 아쉽다.

## 재귀에서 slicing을 피하는 방법

새 배열을 만들지 않고 `left`, `right` 인덱스만 넘기면 더 낫다.

```python
def is_existing_target_number_binary_recursive(target, array, left, right):
    if left > right:
        return False

    mid = (left + right) // 2

    if array[mid] == target:
        return True

    if array[mid] < target:
        return is_existing_target_number_binary_recursive(
            target,
            array,
            mid + 1,
            right,
        )

    return is_existing_target_number_binary_recursive(
        target,
        array,
        left,
        mid - 1,
    )
```

호출할 때는 범위를 같이 넘긴다.

```python
result = is_existing_target_number_binary_recursive(
    finding_target,
    finding_numbers,
    0,
    len(finding_numbers) - 1,
)
```

이 방식은 slicing보다 낫다. 배열을 새로 만들지 않고, 탐색 범위만 좁힌다.

하지만 Python에서는 여전히 재귀 함수 호출이 계속 쌓인다.

## while로 구현한 이진 탐색

실제로는 `while` 방식이 더 많이 쓰인다.

```python
def is_existing_target_number_binary(target, array):
    left = 0
    right = len(array) - 1

    while left <= right:
        mid = (left + right) // 2

        if array[mid] == target:
            return True

        if array[mid] < target:
            left = mid + 1
        else:
            right = mid - 1

    return False
```

동작은 재귀와 같다.

- 가운데 값을 본다.
- target이 더 크면 `left`를 옮긴다.
- target이 더 작으면 `right`를 옮긴다.
- `left > right`가 되면 더 이상 찾을 범위가 없으므로 `False`를 반환한다.

재귀처럼 함수를 다시 부르는 게 아니라, 같은 함수 안에서 `left`, `right` 값만 갱신한다.

## 재귀와 while 중 무엇이 더 좋은가

둘 다 이진 탐색이고, 시간복잡도는 `O(log n)`이다.

하지만 Python에서는 보통 `while` 방식이 더 실용적이다.

| 기준 | 재귀 | while |
|------|------|-------|
| 개념 표현 | 분할 정복 구조가 잘 보임 | 절차적으로 보임 |
| 함수 호출 비용 | 있음 | 없음 |
| 재귀 깊이 제한 | 있음 | 없음 |
| 메모리 사용 | 호출 스택 사용 | 적음 |
| 실무/코딩테스트 | 학습용에 가까움 | 더 자주 사용 |

재귀는 "이진 탐색이 왜 절반씩 줄어드는가"를 이해하기 좋다. 특히 분할 정복을 처음 배울 때는 재귀가 구조를 더 잘 보여준다.

반면 `while`은 Python에서 더 안정적이다.

- 함수 호출 비용이 없다.
- 재귀 제한을 신경 쓰지 않아도 된다.
- slicing 없이 인덱스만 움직이기 쉽다.
- 코드가 짧고 예측 가능하다.

그래서 학습할 때는 재귀로 먼저 이해하고, 실제 구현은 `while`로 하는 편이 좋다.

## 언제 무엇을 쓰면 좋을까

### 순차 탐색을 쓰는 경우

- 배열이 정렬되어 있지 않다.
- 데이터가 아주 작다.
- 정렬 비용이 더 크다.
- 한 번만 찾고 끝난다.

```python
def exists(target, array):
    for number in array:
        if number == target:
            return True

    return False
```

정렬되지 않은 데이터를 이진 탐색하려고 억지로 정렬하면 오히려 비용이 더 들 수 있다.

### 이진 탐색을 쓰는 경우

- 배열이 이미 정렬되어 있다.
- 데이터가 크다.
- 여러 번 검색해야 한다.
- 검색 성능이 중요하다.

```python
def exists(target, array):
    left = 0
    right = len(array) - 1

    while left <= right:
        mid = (left + right) // 2

        if array[mid] == target:
            return True
        elif array[mid] < target:
            left = mid + 1
        else:
            right = mid - 1

    return False
```

## 결론

- 처음 작성한 `for`문 코드는 순차 탐색이다. 정렬 여부와 상관없이 동작하지만 최악의 경우 `O(n)`이다.
- 가운데 값을 보고 절반씩 줄이는 코드는 이진 탐색이다. 정렬된 배열에서만 사용할 수 있고 시간복잡도는 `O(log n)`이다.
- 재귀 이진 탐색은 개념을 이해하기 좋지만, Python에서는 함수 호출 비용과 재귀 제한이 있다.
- 실전에서는 `while + left/right index` 방식이 가장 무난하다.

개인적으로는 이렇게 정리해두면 헷갈리지 않는다.

> **이해할 때는 재귀, 실제로 쓸 때는 while.**
