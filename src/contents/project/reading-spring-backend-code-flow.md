---
title: 'Spring 백엔드 코드 흐름 읽기'
date: '2026-06-04'
category: 'project'
---

> 백엔드 코드는 `Controller → Request DTO → Criteria/Search DTO → Service → Repository → QueryDSL` 순서로 따라가면 읽기 쉬워진다.

## 개요

Spring 백엔드 코드를 처음 읽을 때 가장 어려운 점은 클래스가 너무 많이 연결되어 있다는 것이다. DTO, Mapper, Service, Repository, QueryDSL을 한 번에 이해하려고 하면 흐름이 끊긴다. 먼저 요청 하나가 어디서 시작해서 DB 조회까지 어떻게 이동하는지만 파악해야 한다.

## 핵심 개념

### Controller

HTTP 요청이 들어오는 입구다.

```java
@GetMapping("/search")
public ApiResponse<?> search(PostSearchRequest request) {
    return ApiResponse.ok(searchPosts.search(request.toCriteria()));
}
```

읽을 때는 다음 3가지만 먼저 본다.

- 어떤 URL과 연결되는가
- 어떤 Request DTO를 받는가
- 어떤 Service를 호출하는가

### Request DTO

프론트가 보낸 요청값을 담는 객체다.

```java
public record PostSearchRequest(
        String keyword,
        PagingInfo pagingInfo,
        String sortField,
        String sortDirection
) {
}
```

`record`는 읽기 전용 DTO 클래스를 짧게 쓰는 Java 문법이다. `request.sortField()`처럼 값을 꺼낸다.

### Criteria / Search DTO

백엔드 내부 검색 조건이다. Request DTO는 프론트 요청 모양에 가깝고, Criteria는 Service와 Repository가 쓰기 좋은 모양에 가깝다.

```java
public record PostSearchCriteria(
        String keyword,
        PagingInfo pagingInfo,
        String sortField,
        String sortDirection
) {
}
```

Request에서 Criteria로 바꾸는 이유는 외부 입력을 내부 기준으로 정리하기 위해서다.

- `null` paging → 기본 paging
- 문자열 ID → 도메인 ID
- 세션 사용자 정보 추가
- 정렬 필드 전달

### Mapper

DTO 변환을 대신해주는 도구다. 직접 변환할 수도 있고 Mapper를 쓸 수도 있다.

직접 변환:

```java
request.toCriteria(userSession)
```

Mapper 변환:

```java
postSearchMapper.toCriteria(request)
```

MapStruct를 쓰면 개발자는 인터페이스만 작성하고, 실제 구현체는 빌드 시 자동 생성된다.

### Service

업무 흐름을 연결한다. 처음 읽을 때는 깊게 보지 말고 어디로 넘기는지만 본다.

```java
public PagedResult<Post> search(PostSearchCriteria criteria) {
    return repository.search(criteria);
}
```

이 코드는 "검색 조건을 Repository로 넘긴다"는 뜻이다.

### Repository

실제 DB 조회 쿼리를 만드는 곳이다. 여기서 `where`, `join`, `orderBy`, `paging`을 확인한다.

```java
JPAQuery<Post> dataQuery = queryFactory
        .selectFrom(qPost)
        .where(condition)
        .orderBy(resolveOrderSpecifiers(criteria.sortField(), criteria.sortDirection()));
```

## 정렬 흐름

정렬은 보통 다음 순서로 흐른다.

```text
그리드 컬럼 클릭
→ sortField / sortDirection 요청 파라미터
→ Request DTO
→ Criteria/Search DTO
→ Repository
→ SortMapper 또는 resolveOrderSpecifiers
→ QueryDSL orderBy
```

예시:

```java
private OrderSpecifier<?>[] resolveOrderSpecifiers(String sortField, String sortDirection) {
    OrderSpecifier<?> primary = resolveSortOrder(sortField, sortDirection);

    if (primary == null) {
        return new OrderSpecifier<?>[] {
                qPost.createdAt.desc(),
                qPost.id.desc()
        };
    }

    return new OrderSpecifier<?>[] {
            primary,
            qPost.createdAt.desc(),
            qPost.id.desc()
    };
}
```

의미:

- 정렬 요청이 없으면 기본 정렬
- 정렬 요청이 있으면 요청 정렬을 먼저 적용
- 같은 값끼리는 기본 정렬로 안정적인 순서 유지

## 디버깅 순서

정렬이나 검색이 안 될 때는 아래 순서로 확인한다.

1. Controller의 Request DTO에 값이 들어오는가
2. Request DTO에서 Criteria/Search DTO로 값이 넘어가는가
3. Service가 Criteria를 그대로 넘기는가
4. Repository에서 `where` 조건이 너무 강하지 않은가
5. `sortField`가 SortMapper의 switch case에 등록되어 있는가
6. `orderBy`가 실제 쿼리에 붙는가

## 자주 하는 실수

### 전체 파일을 처음부터 끝까지 읽으려고 한다

처음에는 전체 파일을 읽지 말고 메서드 호출만 따라간다.

```text
Controller
→ Service
→ Repository
```

### Interface와 Impl 연결에서 막힌다

Service에는 보통 인터페이스 타입이 보인다.

```java
private final PostRepository repository;
```

실제로 실행되는 코드는 구현체다.

```java
PostRepositoryImpl
```

읽을 때는 `search` 같은 메서드 이름으로 검색하고, `implements`한 클래스를 찾는다.

### Q 클래스를 직접 작성한 코드로 착각한다

`QPost`, `QUser` 같은 클래스는 QueryDSL이 자동 생성한 클래스다. 직접 수정하지 않는다. DB 필드를 타입 안전하게 참조하기 위한 도구다.

## 핵심 포인트

- Controller는 요청을 받는다.
- Request DTO는 프론트 요청값을 담는다.
- Criteria/Search DTO는 내부 검색 조건이다.
- Service는 흐름을 연결한다.
- Repository는 DB 쿼리를 만든다.
- Mapper는 DTO 변환을 도와준다.
- QueryDSL의 Q 클래스는 자동 생성 파일이다.
- 정렬 디버깅은 `sortField`가 Repository의 정렬 매핑에 있는지 확인하는 것이 핵심이다.
