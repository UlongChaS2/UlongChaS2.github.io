---
title: 'JPA 엔티티와 Value Object'
date: '2026-03-24'
category: 'project'
keywords: ['JPA', 'DDD', 'BE']
---

DB 테이블과 매핑되는 엔티티 클래스와, 값을 안전하게 다루는 Value Object를 이해한다.

## 개요
Spring Boot에서 DB 테이블은 Java 클래스로 표현된다. 이 클래스를 엔티티라고 하며, JPA 애노테이션으로 DB와 매핑한다. Value Object는 ID처럼 값 자체가 의미인 객체를 별도 클래스로 분리해서 타입 안전성을 높이는 패턴이다.

---

## 엔티티 (Entity)

### 기본 구조

```java
@Entity(name = "Post")       // JPA에서 부르는 이름
@Table(
    name = "POST",           // 실제 DB 테이블 이름
    uniqueConstraints = @UniqueConstraint(
        name = "uk_post_title_author",
        columnNames = {"TITLE", "AUTHOR"}  // 이 두 컬럼 조합은 중복 불가
    ),
    indexes = {
        @Index(name = "idx_post_author", columnList = "AUTHOR"),  // 조회 속도 향상
        @Index(name = "idx_post_title", columnList = "TITLE")
    }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Post extends BaseEntity<PostId> {

    @EmbeddedId
    @AttributeOverride(name = "id", column = @Column(name = "ID", columnDefinition = "uuid"))
    private PostId id;  // PK를 별도 클래스로 분리

    @Column(name = "TITLE", nullable = false, length = 100)
    private String title;

    @Column(name = "AUTHOR", nullable = false, length = 50)
    private String author;

    @Column(name = "CONTENT", length = 1000)
    private String content;

    @Column(name = "CREATED_AT")
    private LocalDate createdAt;

    @PrePersist
    private void prePersist() {
        if (id == null) {
            id = PostId.create();  // DB 저장 직전 ID 자동 생성
        }
    }

    @SuppressWarnings("unused")
    protected Post() {}  // JPA용 빈 생성자

    @Builder
    private Post(String title, String author, String content) {
        this.id = PostId.create();
        this.title = title;
        this.author = author;
        this.content = content;
        this.createdAt = LocalDate.now();
    }

    // 비즈니스 로직
    public void updateContent(String newContent) {
        if (newContent == null || newContent.isBlank()) {
            throw new IllegalArgumentException("내용은 비워둘 수 없습니다.");
        }
        this.content = newContent;
    }

    public boolean isWrittenBy(String author) {
        return this.author.equals(author);
    }
}
```

---

## 주요 애노테이션

| 애노테이션 | 의미 |
|---|---|
| `@Entity` | JPA 엔티티 클래스 선언 |
| `@Table` | 매핑할 DB 테이블 설정 |
| `@Column` | DB 컬럼 매핑 및 제약조건 |
| `@EmbeddedId` | PK를 별도 클래스로 분리 |
| `@AttributeOverride` | 내장 클래스의 필드를 DB 컬럼과 매핑 |
| `@PrePersist` | DB 저장 직전 자동 실행 메서드 |
| `@Getter` | getter 자동 생성 (Lombok) |
| `@NoArgsConstructor` | 빈 생성자 자동 생성 (JPA 필수) |
| `@Builder` | 빌더 패턴으로 객체 생성 |
| `@SuppressWarnings` | IDE 경고 무시 |

---

## @Column 주요 속성

```java
@Column(
    name = "TITLE",         // DB 컬럼명
    nullable = false,       // null 허용 안 함
    length = 100,           // 최대 길이
    columnDefinition = "uuid"  // DB 컬럼 타입 직접 지정
)
private String title;
```

---

## uniqueConstraints vs @Index

**uniqueConstraints** — 중복 데이터 방지
```java
// TITLE + AUTHOR 조합이 같으면 중복으로 막음
uniqueConstraints = @UniqueConstraint(columnNames = {"TITLE", "AUTHOR"})

// 예시
제목: "Spring", 작성자: "홍길동"  → OK
제목: "Spring", 작성자: "홍길동"  → ❌ 중복! 에러
제목: "Spring", 작성자: "김철수"  → OK (작성자 다름)
```

**@Index** — 조회 속도 향상
```java
// AUTHOR 컬럼에 인덱스 → author로 검색할 때 빠름
@Index(name = "idx_post_author", columnList = "AUTHOR")
```

인덱스는 정렬된 별도 목록을 만들어두고 검색할 때 바로 위치를 찾아가는 방식. 단, 저장 공간을 추가로 차지하고 데이터 추가/수정/삭제 시 인덱스도 업데이트해야 해서 자주 조회하는 컬럼에만 걸어야 한다.

---

## @Builder를 쓰는 이유

파라미터가 많은 생성자는 순서 실수가 생기기 쉬움:

```java
// ❌ 파라미터 많으면 순서 틀리기 쉬움
new Post("홍길동", "Spring 입문", "내용...");  // title이랑 author 순서 바꿔도 에러 안 남

// ✅ 빌더 패턴
Post.builder()
    .title("Spring 입문")
    .author("홍길동")
    .content("내용...")
    .build();
```

생성자를 `private` 으로 막고 빌더로만 만들게 강제해서 실수 방지.

---

## 캡슐화 — 데이터와 동작을 한 곳에

```java
// ❌ 나쁜 예 - 외부에서 데이터 직접 수정
post.content = "새 내용";  // 검증 없이 바로 수정 가능

// ✅ 좋은 예 - 엔티티 내부에서만 수정
public void updateContent(String newContent) {
    if (newContent == null) throw new IllegalArgumentException("...");
    this.content = newContent;  // 검증 후 수정
}
```

데이터(필드)와 그 데이터를 다루는 동작(메서드)을 한 클래스에 두면 외부에서 직접 건드릴 수 없어서 안전하다.

---

## Value Object

값 자체가 의미인 객체. ID, 금액, 통화 등을 단순 `String`, `Long` 대신 별도 클래스로 만든다.

```java
public class PostId extends ValueObject<PostId> {
    private UUID id;

    protected PostId() {}  // JPA용

    private PostId(UUID id) {  // private → 직접 new 불가
        if (id == null) throw new IllegalArgumentException("id cannot be null");
        this.id = id;
    }

    // 새 ID 생성
    public static PostId create() {
        return new PostId(UUID.randomUUID());
    }

    // 기존 UUID → PostId 변환
    public static PostId of(UUID id) {
        return new PostId(id);
    }

    @Override
    @Transient
    protected Object[] getEqualityFields() {
        return new Object[]{id};  // id 값이 같으면 같은 객체
    }

    @Override
    public String toString() {
        return id.toString();  // UUID 문자열로 출력
    }
}
```

### Value Object를 쓰는 이유

```java
// ❌ String으로 쓰면 실수 가능
void findById(String postId, String authorId) { ... }
findById(authorId, postId);  // 순서 바꿔도 에러 없음

// ✅ Value Object 쓰면 타입이 달라서 컴파일 에러
void findById(PostId postId, AuthorId authorId) { ... }
findById(authorId, postId);  // ❌ 타입 다르니까 에러!
```

### Entity vs Value Object

| | Entity | Value Object |
|---|---|---|
| 구분 기준 | ID | 값 자체 |
| 변경 가능 | 가능 | 불가능 (불변) |
| 예시 | `Post`, `User` | `PostId`, `Money` |

---

## 접근 제어자

| | 같은 클래스 | 같은 패키지 | 자식 클래스 | 외부 |
|---|---|---|---|---|
| `private` | ✅ | ❌ | ❌ | ❌ |
| `protected` | ✅ | ✅ | ✅ | ❌ |
| `public` | ✅ | ✅ | ✅ | ✅ |

---

## 관련 개념
- JPA / Hibernate
- 객체지향 캡슐화
- 빌더 패턴
- UUID
- Spring Data JPA
