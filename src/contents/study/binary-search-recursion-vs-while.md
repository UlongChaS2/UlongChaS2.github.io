---
title: '이진 탐색은 재귀와 while 중 무엇이 더 나을까'
date: '2026-07-27'
category: 'study'
keywords: ['Algorithm', 'Python', 'Binary Search']
---

> 이진 탐색은 재귀로 표현하면 이해하기 쉽다. 하지만 Python으로 직접 구현해보니, 실제 코드는 `while`이 더 낫다고 느꼈다.

<!--more-->

## 개요

이진 탐색을 처음 구현할 때 나는 재귀로 먼저 풀었다. 이진 탐색 자체가 "가운데를 보고, 왼쪽이나 오른쪽 절반에서 같은 일을 반복한다"는 구조라서 재귀가 자연스럽게 떠올랐다.

```python
finding_target = 14
finding_numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]


def is_existing_target_number_binary(target, array):
    half_index = len(array) // 2

    if array[half_index] < target:
        return is_existing_target_number_binary(target, array[half_index + 1:])
    elif array[half_index] > target:
        return is_existing_target_number_binary(target, array[:half_index])
    else:
        return True


result = is_existing_target_number_binary(finding_target, finding_numbers)
print(result)  # True
```

처음에는 이게 꽤 괜찮아 보였다. 가운데 값을 보고, target이 더 크면 오른쪽 배열로 다시 탐색한다. target이 더 작으면 왼쪽 배열로 다시 탐색한다. 흐름만 보면 이진 탐색의 개념과 잘 맞는다. 그런데 코드를 다시 보니까 아쉬운 부분이 보였다.

## 재귀로 풀었을 때 어색했던 점

가장 먼저 걸린 부분은 slicing이었다.

```python
array[half_index + 1:]
array[:half_index]
```

이 코드는 탐색 범위를 줄이는 것처럼 보이지만, 실제로는 매번 새로운 리스트를 만든다. 이진 탐색의 핵심은 "범위를 줄인다"인데, 매번 리스트를 새로 만드는 건 조금 아깝다. 데이터가 작으면 크게 티가 안 나지만, 이진 탐색을 쓰는 이유가 보통 큰 데이터에서 탐색 비용을 줄이기 위해서라면 굳이 매번 새 리스트를 만드는 방식은 좋은 구현이라고 보기 어렵다.

그리고 위 코드에는 target이 없을 때의 종료 조건도 빠져 있다.

```python
if len(array) == 0:
    return False
```

이런 조건을 넣어야 빈 배열까지 내려갔을 때 에러가 나지 않는다. 즉, 재귀로 간단하게 쓰면 개념은 잘 보이지만, 실제로 제대로 동작하게 만들려면 생각할 것이 늘어난다.

## slicing을 피하려면 인덱스를 넘겨야 한다

slicing을 피하려면 새 배열을 만들지 말고 `left`, `right` 인덱스를 넘기면 된다.

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

이렇게 하면 새 리스트를 만들지 않는다. 탐색 범위만 `left`, `right`로 관리하니까 메모리 면에서도 더 낫다. 하지만 여기서 또 다른 고민이 생겼다. 함수 파라미터가 많아졌다.

```python
target, array, left, right
```

호출할 때도 이렇게 써야 한다.

```python
result = is_existing_target_number_binary_recursive(
    finding_target,
    finding_numbers,
    0,
    len(finding_numbers) - 1,
)
```

동작은 좋아졌는데, 처음 봤을 때 읽기는 더 불편해졌다. 재귀 구조를 유지하려면 함수가 자기 자신에게 현재 탐색 범위를 계속 넘겨야 한다. 그래서 slicing을 안 쓰려면 결국 `left`, `right` 같은 상태를 파라미터로 들고 다녀야 한다.

이 부분에서 조금 애매하다고 느꼈다.

- slicing을 쓰면 코드는 짧지만 매번 새 리스트를 만든다.
- slicing을 피하면 성능은 낫지만 파라미터가 늘고 코드가 무거워진다.

재귀가 예쁘게 보였던 이유가 사실은 slicing 덕분이었던 것 같다.

## while로 쓰면 상태가 함수 안에 남는다

같은 로직을 `while`로 쓰면 이렇게 된다.

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

재귀 버전과 하는 일은 같다. 가운데 값을 보고, target이 더 크면 `left`를 오른쪽으로 옮긴다. target이 더 작으면 `right`를 왼쪽으로 옮긴다.

차이는 `left`, `right`를 어디에 두느냐다. 재귀에서는 `left`, `right`를 다음 함수 호출의 파라미터로 넘긴다. `while`에서는 같은 함수 안에서 값만 바꾼다. 그래서 Python에서는 `while`이 더 편하게 느껴졌다.

## 재귀와 while 중 무엇이 더 나은가

둘 다 이진 탐색이다. 시간복잡도도 둘 다 `O(log n)`이다. 하지만 Python으로 직접 구현한다면 나는 `while`이 더 낫다고 생각한다.

| 기준 | 재귀 | while |
|------|------|-------|
| 개념 이해 | 좋음 | 상대적으로 덜 직관적 |
| slicing 없이 구현 | 가능하지만 파라미터가 늘어남 | 자연스러움 |
| 함수 호출 비용 | 있음 | 없음 |
| 재귀 깊이 제한 | 신경 써야 함 | 신경 쓰지 않아도 됨 |
| 코드 가독성 | 간단히 쓰면 좋지만 제대로 쓰면 무거워짐 | 일정하게 읽힘 |

재귀는 이진 탐색을 처음 이해할 때 좋다. "절반으로 나누고 다시 같은 문제를 푼다"는 구조가 잘 보인다.

하지만 실제 Python 코드로 옮기면 선택지가 갈린다. 간단하게 쓰려고 slicing을 하면 매번 새 리스트가 생긴다. slicing을 피하려고 `left`, `right`를 넘기면 함수 파라미터가 많아져서 가독성이 떨어진다.

반면 `while`은 처음에는 조금 절차적으로 보이지만, 이진 탐색에서 필요한 상태를 함수 안에서 깔끔하게 관리한다.

## 핵심 포인트

- 재귀 이진 탐색은 개념을 이해하기 좋다.
- 하지만 slicing을 쓰면 매번 새 리스트가 만들어진다.
- slicing을 피하려면 `left`, `right`를 파라미터로 넘겨야 한다.
- 그 방식은 성능은 낫지만 코드가 덜 읽기 쉬워질 수 있다.
- Python에서는 `while + left/right index` 방식이 가장 무난하다.

개인적으로는 이렇게 정리했다.

> **이진 탐색을 이해할 때는 재귀가 좋고, Python으로 구현할 때는 while이 더 낫다.**
