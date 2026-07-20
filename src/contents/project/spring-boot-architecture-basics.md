---
title: 'Spring Boot 아키텍처 기초 — 계층 구조와 핵심 개념'
date: '2026-03-31'
category: 'project'
keywords: ['BE', 'Spring Boot', '아키텍처']
---

> Spring Boot는 Controller → UseCase → Repository → Entity 순으로 계층이 나뉘며, 각 계층은 인터페이스로 연결된다

## 개요

Spring Boot 백엔드는 역할별로 계층을 분리한다. 이 구조를 클린 아키텍처라고 하며, 각 계층이 한 가지 역할만 담당해서 코드가 명확하고 유지보수가 쉬워진다. 처음엔 왜 이렇게 나누는지 이해하기 어렵지만, "만드는 순서"를 따라가면 자연스럽게 이해된다.

## 핵심 개념

### 1. 계층 구조 (만드는 순서)

```
1. Entity        → DB 테이블과 1:1 매핑되는 Java 클래스
2. JpaRepository → 메서드 이름으로 SQL 자동 생성
3. Repository    → 도메인 계층의 인터페이스 (뭘 할 수 있는지 목록)
4. RepositoryImpl→ Repository 실제 구현 (QueryDSL로 복잡한 쿼리)
5. UseCase       → 비즈니스 로직 인터페이스
6. Service       → UseCase 구현체 (여러 Repository 조합)
7. Controller    → HTTP 요청/응답 처리
```

### 2. 인터페이스와 구현체

```java
// 인터페이스 — "뭘 할 수 있는지" 선언만
public interface ItemRepository {
    Optional<Item> findById(Long id);
    PagedResult<Item> search(SearchCriteria criteria);
    Item save(Item item);
}

// 구현체 — "어떻게 하는지" 실제 코드
@Repository
public class ItemRepositoryImpl implements ItemRepository {
    @Override
    public Optional<Item> findById(Long id) {
        return jpaItemRepository.findById(id);
    }
}
```

인터페이스에서 `gd` → 구현체 확인 / `gI` → 어디서 사용하는지 확인 (neovim LSP)

### 3. DI (Dependency Injection)

Spring이 `@Service`, `@Repository` 붙은 클래스를 자동으로 만들어서 주입해줌.

```java
@Service
@RequiredArgsConstructor   // Lombok: final 필드로 생성자 자동 생성
public class ItemService implements SearchItems {
    private final ItemRepository itemRepository;  // Spring이 자동 주입
}
```

직접 `new ItemRepositoryImpl()` 안 해도 됨. Spring 컨테이너가 알아서 연결.

### 4. Lombok 어노테이션

| 어노테이션 | 역할 |
|-----------|------|
| `@RequiredArgsConstructor` | `final` 필드를 받는 생성자 자동 생성 |
| `@Getter` | 모든 필드의 getter 메서드 자동 생성 |
| `@Builder` | 빌더 패턴 자동 생성 |
| `@NoArgsConstructor` | 빈 생성자 자동 생성 |

### 5. JPA Entity 어노테이션

```java
@Entity
@Table(
    name = "BOARD_POST",
    uniqueConstraints = { @UniqueConstraint(columnNames = {"author_id", "title"}) },
    indexes = { @Index(columnList = "created_at") }
)
public class BoardPost extends DomainEntity {

    @EmbeddedId
    private BoardPostId id;   // Value Object ID

    @Column(name = "title")
    private String title;

    @PrePersist
    protected void onCreate() {
        // 저장 직전에 자동 실행 (ID 생성 등)
        if (this.id == null) {
            this.id = BoardPostId.create();
        }
    }

    @Builder
    private BoardPost(String title, String content) {
        this.title = title;
        this.content = content;
    }
}
```

- `uniqueConstraints` → DB에서 중복 방지 (예: 같은 저자가 같은 제목 2번 올리면 에러)
- `@Index` → 자주 조회하는 컬럼에 인덱스 걸어 속도 향상
- `@PrePersist` → 저장 직전 자동 실행 (UUID 생성 등에 사용)
- `@Builder private 생성자` → 외부에서 `new` 못하고 빌더로만 생성 가능 → 캡슐화

### 6. Value Object (ID)

```java
@Embeddable
public class BoardPostId {
    private String id;

    // 새 ID 생성
    public static BoardPostId create() {
        return new BoardPostId(UUID.randomUUID().toString());
    }

    // 기존 ID로 참조
    public static BoardPostId of(String id) {
        return new BoardPostId(id);
    }
}
```

ID를 String 그냥 쓰는 게 아니라 클래스로 감싸면 → 타입 안전 (게시글 ID에 사용자 ID 실수로 넣으면 컴파일 에러)

### 7. JpaRepository

```java
public interface JpaBoardPostRepository extends JpaRepository<BoardPost, BoardPostId> {
    // 메서드 이름 → SQL 자동 생성
    boolean existsByAuthorIdAndTitle(String authorId, String title);
    // SELECT COUNT(*) > 0 FROM board_post WHERE author_id = ? AND title = ?
}
```

### 8. Repository 인터페이스 (도메인 계층)

```java
public interface BoardPostRepository {
    Optional<BoardPost> findById(BoardPostId id);
    PagedResult<BoardPost> search(SearchCriteria criteria);
    BoardPost save(BoardPost post);
    boolean existsByUniqueKey(String authorId, String title);
}
```

"이 Repository로 뭘 할 수 있는지"를 한눈에 보여주는 목록. 실제 SQL은 Impl에 있음.

### 9. Optional

```java
Optional<BoardPost> result = repository.findById(id);
// 값이 있을 수도 없을 수도 있을 때 null 대신 사용
result.orElseThrow(() -> new NotFoundException("게시글을 찾을 수 없습니다"));
```

### 10. PagedResult

```java
PagedResult<BoardPost> page = repository.search(criteria);
// data: 현재 페이지 데이터 목록
// totalCount: 전체 개수
```

## 상세 내용

### 클린 아키텍처 계층 분리 이유

```
Controller (web 모듈)
    ↓
UseCase 인터페이스 (core 모듈)
    ↓
Service 구현체 (core 모듈)
    ↓
Repository 인터페이스 (core 모듈)
    ↓
RepositoryImpl (data 모듈)
    ↓
JpaRepository (data 모듈)
    ↓
DB
```

이렇게 나누는 이유:
- **Core는 DB 몰라도 됨** → PostgreSQL을 MySQL로 바꿔도 core 건드릴 필요 없음
- **테스트 쉬움** → 인터페이스만 있으면 가짜(Mock) 구현체로 테스트 가능
- **역할 명확** → 어디 가면 뭐 있는지 항상 알 수 있음

### 디버깅 흐름

버그 생겼을 때: **Controller → UseCase → Repository 순으로** 에러 찾기

```
1. Controller에서 어떤 UseCase 호출하는지 확인
2. UseCase에서 어떤 Repository 호출하는지 확인
3. RepositoryImpl에서 실제 쿼리 확인
```

### @Override 어노테이션

```java
public class ItemRepositoryImpl implements ItemRepository {
    @Override  // "나는 인터페이스에서 선언된 메서드를 구현하는 중"
    public Optional<Item> findById(Long id) { ... }
}
```

`@Override` 없어도 동작하지만, 붙이면 오타나 시그니처 불일치 시 컴파일 에러로 잡아줌.

### 접근제어자

| 접근제어자 | 접근 가능 범위 |
|-----------|--------------|
| `public` | 어디서든 |
| `protected` | 같은 패키지 + 자식 클래스 |
| `private` | 같은 클래스만 |

Entity에서 `@Builder private 생성자` → 외부에서 `new Item(...)` 불가, `Item.builder().build()`만 가능

## 코드 예시

### 전체 흐름 (게시판 목록 조회)

```java
// 1. Controller
@GetMapping("/posts")
public ResponseEntity<Page<PostResponse>> getPosts(@ModelAttribute SearchRequest req) {
    return ResponseEntity.ok(searchPosts.search(req.toCriteria()));
}

// 2. UseCase 인터페이스
public interface SearchPosts {
    PagedResult<PostResponse> search(SearchCriteria criteria);
}

// 3. Service (UseCase 구현체)
@Service
@RequiredArgsConstructor
public class PostService implements SearchPosts {
    private final BoardPostRepository postRepository;

    @Override
    public PagedResult<PostResponse> search(SearchCriteria criteria) {
        PagedResult<BoardPost> posts = postRepository.search(criteria);
        return posts.map(PostResponse::from);
    }
}

// 4. Repository 인터페이스
public interface BoardPostRepository {
    PagedResult<BoardPost> search(SearchCriteria criteria);
}

// 5. RepositoryImpl
@Repository
@RequiredArgsConstructor
public class BoardPostRepositoryImpl implements BoardPostRepository {
    private final JPAQueryFactory queryFactory;

    @Override
    public PagedResult<BoardPost> search(SearchCriteria criteria) {
        // QueryDSL로 동적 쿼리 작성
        QBoardPost post = QBoardPost.boardPost;
        List<BoardPost> content = queryFactory.selectFrom(post)
            .where(titleContains(criteria.getKeyword()))
            .offset(criteria.getPage() * criteria.getSize())
            .limit(criteria.getSize())
            .fetch();
        long total = queryFactory.select(post.count()).from(post).fetchOne();
        return new PagedResult<>(content, total);
    }
}
```

## 주의사항 / 자주 하는 실수

- **인터페이스 vs 구현체 헷갈림**: 인터페이스는 선언만, 구현체는 `implements`로 실제 로직 작성
- **DI 안 되는 경우**: `@Service`, `@Repository` 어노테이션 빠뜨리면 Spring이 주입 못 함
- **QueryDSL Q 클래스 없음**: 빌드 전에 Q 클래스 생성 필요 (`./gradlew :data:compileJava`)
- **`@Builder`와 `@NoArgsConstructor` 충돌**: JPA Entity는 기본 생성자 필요, `@NoArgsConstructor(access = PROTECTED)` 함께 써야 함

## 관련 개념

- QueryDSL — 타입 안전한 동적 쿼리 작성 라이브러리
- MapStruct — 계층 간 DTO ↔ Entity 자동 변환
- Spring Container / Bean — @Service, @Repository를 인스턴스화하고 관리
- JPA Auditing — createdAt, updatedAt 자동 관리
- 클린 아키텍처 — 계층 분리로 의존성 방향 제어
