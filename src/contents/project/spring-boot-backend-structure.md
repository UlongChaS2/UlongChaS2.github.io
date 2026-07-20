---
title: 'Spring Boot 백엔드 구조 이해하기'
date: '2026-03-23'
category: 'project'
keywords: ['Spring Boot', '아키텍처', 'BE']
---

> Controller → UseCase → Repository → Entity → DB 흐름을 게시판 예시로 이해한다.

<!--more-->

## 개요
Spring Boot 백엔드는 계층이 명확하게 나뉘어 있다. 각 계층이 역할을 분리해서 담당하기 때문에 유지보수가 쉽고 변경에 유연하다. 이 글은 게시판 게시글 조회(`GET /posts`) 를 기준으로 전체 흐름을 정리한다.

---

## 전체 흐름

```
프론트 요청 (GET /posts)
  → Controller
    → UseCase 인터페이스
      → UseCase 구현체 (Service)
        → Repository 인터페이스
          → RepositoryImpl
            → JpaRepository
              → DB
```

---

## 핵심 개념

### DTO (Data Transfer Object)
데이터를 담아서 이쪽에서 저쪽으로 전달하는 그릇. 택배 박스 같은 것.

```java
// 프론트에서 보낸 검색 조건을 받는 그릇
public class PostSearchRequest {
    String title;    // 제목 검색어
    String author;   // 작성자
}
```

### 인터페이스
"이런 메서드가 있어야 해" 라고 약속만 정의하는 것. 실제 구현 코드는 없다.

```java
// 선언만 있음, 구현 코드 없음
public interface SearchPosts {
    List<Post> search(PostSearchRequest request);
}
```

### 구현체 (implements)
인터페이스의 약속을 실제로 구현하는 클래스. `@Override` 로 표시.

```java
@Service
public class PostService implements SearchPosts {
    @Override
    public List<Post> search(PostSearchRequest request) {
        // 진짜 DB 조회 코드
    }
}
```

### DI (Dependency Injection, 의존성 주입)
Spring이 앱 시작할 때 `@Service`, `@Repository`, `@Component` 붙은 클래스를 자동으로 객체로 만들어 컨테이너에 보관하고, 필요한 곳에 자동으로 주입해준다. 개발자가 `new` 로 직접 만들 필요 없다.

```java
@RequiredArgsConstructor  // final 필드 생성자 자동 생성 (Lombok)
public class PostController {
    private final SearchPosts searchPosts;  // Spring이 자동으로 PostService 주입
}
```

### Lombok
반복적인 Java 코드(생성자, getter, setter 등)를 자동으로 생성해주는 라이브러리.

| 애노테이션 | 하는 일 |
|---|---|
| `@Getter` | getter 자동 생성 |
| `@Setter` | setter 자동 생성 |
| `@RequiredArgsConstructor` | `final` 필드 생성자 자동 생성 |
| `@Builder` | 빌더 패턴 자동 생성 |

---

## 계층별 상세

### 1. Controller
HTTP 요청을 받는 입구. 비즈니스 로직 없이 UseCase에 위임만 한다.

```java
@RestController
@RequestMapping("/api/v1/posts")
@RequiredArgsConstructor
public class PostController {

    private final SearchPosts searchPosts;

    @GetMapping
    public ApiResponse<?> getPosts(@ModelAttribute PostSearchRequest request) {
        return ApiResponse.ok(searchPosts.search(request));
    }

    @PostMapping
    public ApiResponse<?> createPost(@RequestBody PostCreateRequest request) {
        // ...
    }
}
```

주요 애노테이션:

| 애노테이션 | 의미 |
|---|---|
| `@RestController` | REST API 컨트롤러 |
| `@GetMapping` | GET 요청 처리 |
| `@PostMapping` | POST 요청 처리 |
| `@PatchMapping` | PATCH 요청 처리 |
| `@RequestBody` | 요청 body → Java 객체 변환 |
| `@RequestParam` | URL 쿼리 파라미터 (`?id=1`) |

### 2. UseCase
비즈니스 로직을 담당하는 계층. 인터페이스로 선언하고 Service 클래스에서 구현한다.

```java
// 인터페이스 (약속)
public interface SearchPosts {
    List<Post> search(PostSearchRequest request);
}

// 구현체 (실제 로직)
@Service
public class PostService implements SearchPosts {

    private final PostRepository postRepository;

    @Override
    public List<Post> search(PostSearchRequest request) {
        // 1. 게시글 조회
        // 2. 작성자 정보 조회
        // 3. 댓글 수 조회
        // 4. 합쳐서 반환
    }
}
```

### 3. Repository
DB 접근을 담당하는 계층. 마찬가지로 인터페이스 + 구현체 구조.

```java
// 인터페이스
public interface PostRepository {
    List<Post> findByTitle(String title);
}

// 구현체 - JPA에 위임
@Repository
public class PostRepositoryImpl implements PostRepository {

    private final JpaPostRepository jpaPostRepository;

    @Override
    public List<Post> findByTitle(String title) {
        return jpaPostRepository.findByTitleContaining(title);
    }
}
```

### 4. JpaRepository
Spring JPA가 제공하는 인터페이스. **메서드 이름만 규칙에 맞게 쓰면 SQL을 자동으로 생성**해준다.

```java
public interface JpaPostRepository extends JpaRepository<Post, Long> {
    // 메서드 이름 → SQL 자동 생성
    List<Post> findByTitleContaining(String title);
    List<Post> findByAuthorAndCreatedAtAfter(String author, LocalDate date);
}
```

위 메서드를 SQL로 번역하면:
```sql
-- findByTitleContaining
SELECT * FROM post WHERE title LIKE '%제목%'

-- findByAuthorAndCreatedAtAfter
SELECT * FROM post WHERE author = ? AND created_at > ?
```

---

## REST API 메서드 정리

| HTTP 메서드 | 의미 | 예시 |
|---|---|---|
| `GET` | 데이터 조회 | `GET /posts` |
| `POST` | 데이터 생성 | `POST /posts` |
| `PATCH` | 일부 수정 | `PATCH /posts/1` |
| `DELETE` | 삭제 | `DELETE /posts/1` |

---

## 인터페이스를 쓰는 이유
Controller가 구현체를 직접 알지 않아도 된다. 나중에 구현체를 바꿔도 Controller 코드는 그대로 유지된다.

```
인터페이스  →  "검색 기능 있어야 해" (규칙)
구현체      →  실제로 구현한 클래스
Controller  →  인터페이스 타입만 알고 사용
Spring      →  둘을 자동으로 연결
```

---

## 일반적인 구조 vs 클린 아키텍처

**일반적인 Spring 프로젝트 (3단계)**
```
Controller → Service → JpaRepository
```

**클린 아키텍처 적용 (6단계)**
```
Controller → UseCase 인터페이스 → Service 구현체
  → Repository 인터페이스 → RepositoryImpl → JpaRepository
```

처음엔 복잡해 보이지만 대규모 프로젝트에서 유지보수성이 높아진다.

---

## 관련 개념
- JPA / Hibernate
- Spring DI / IoC 컨테이너
- REST API 설계
- Lombok
- 클린 아키텍처
