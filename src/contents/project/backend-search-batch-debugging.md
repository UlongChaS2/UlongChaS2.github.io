---
title: '백엔드 검색·배치 디버깅 흐름 정리'
date: '2026-06-02'
category: 'project'
---

> Spring 백엔드는 컨트롤러에서 바로 DB를 조회/저장하지 않고, Request DTO, 인터페이스, 서비스 구현체, Repository를 따라가야 실제 조회와 저장 위치를 찾을 수 있다.

## 개요

백엔드 API를 디버깅할 때 가장 헷갈리는 부분은 "컨트롤러 메소드가 보이는데 실제 DB 조회나 저장 코드는 어디 있느냐"이다.
Spring + DDD + Repository 구조에서는 컨트롤러가 HTTP 요청을 받고, 실제 조회/저장은 service/usecase와 repository 쪽으로 위임된다.

이 글은 목록 검색 API(`GET /posts/search`)와 배치 저장 API(`POST /posts/batch`)를 예로, nvim에서 어떤 심볼에 커서를 두고 어떤 LSP 기능을 눌러 따라가는지 정리한다.

## 큰 그림

```text
GET /posts/search
브라우저/프론트
  ↓
Controller
  ↓
Request DTO 변환
  ↓
UseCase Interface
  ↓
Service 구현체
  ↓
Repository Interface
  ↓
Repository Impl
  ↓
QueryDSL select/orderBy
  ↓
DB
```

```text
POST /posts/batch
브라우저/프론트
  ↓
Controller
  ↓
Request item들을 Command로 변환
  ↓
Batch UseCase
  ↓
단건 Save UseCase 반복 호출
  ↓
Repository save
  ↓
JPA save
  ↓
DB insert/update
```

## nvim에서 쓰는 핵심 이동

### 정의로 이동

```vim
gd
```

또는 직접 명령:

```vim
:lua vim.lsp.buf.definition()
```

사용하는 곳:
- 변수 선언으로 이동
- 타입 정의로 이동
- 메소드 정의로 이동
- DTO record/class로 이동

### 구현체로 이동

```vim
:lua vim.lsp.buf.implementation()
```

사용하는 곳:
- interface 메소드에서 실제 구현체로 이동
- repository interface에서 repository impl로 이동
- usecase interface에서 service 구현체로 이동

주의: `gd`는 보통 interface까지만 가는 경우가 많다.
interface의 실제 몸통을 보고 싶으면 implementation을 써야 한다.

### 현재 파일 안에서 검색

```vim
/searchPosts
```

```vim
/savePosts
```

```vim
/searchForList
```

### 프로젝트 전체 검색

터미널에서:

```bash
rg -n "searchPosts"
```

```bash
rg -n "searchForList"
```

```bash
rg -n "savePosts|save\\("
```

## GET 검색 조회 흐름

예시 컨트롤러:

```java
@GetMapping("/posts/search")
public ApiResponse<PagedResult<PostSearchResponse>> searchPosts(
        @ParameterObject
        @ModelAttribute
        PostSearchRequest request
) {
    PagedResult<PostSearchResponse> result = searchPostsUseCase
            .searchPosts(request.toDto(userSession), userSession.getLanguage())
            .mapContents(dto -> {
                List<AttachmentResponse> attachments = dto.attachments()
                        .stream()
                        .map(AttachmentResponse::from)
                        .toList();

                return new PostSearchResponse(
                        dto.status(),
                        PostResponse.from(dto.post()),
                        attachments
                );
            });

    return ApiResponse.ok(result);
}
```

### 1단계: Request DTO 변환 보기

커서를 `toDto`에 둔다.

```java
request.toDto(userSession)
        ^^^^
```

누를 것:

```vim
gd
```

확인할 것:

```java
sortField
sortDirection
pagingInfo
검색조건
세션에서 주입되는 사용자/테넌트 식별값
```

여기서 정렬값이 DTO로 안 넘어가면 repository까지 절대 도달하지 않는다.

### 2단계: UseCase 인터페이스 보기

커서를 변수명에 둔다.

```java
searchPostsUseCase.searchPosts(...)
^^^^^^^^^^^^^^^^^^
```

누를 것:

```vim
gd
```

대부분 컨트롤러의 필드 선언으로 간다.

```java
private final SearchPostsUseCase searchPostsUseCase;
```

그 다음 타입명에 커서를 둔다.

```java
SearchPostsUseCase
^^^^^^^^^^^^^^^^^^
```

누를 것:

```vim
gd
```

이동하는 곳:

```text
core/.../application/SearchPostsUseCase.java
```

### 3단계: 인터페이스에서 구현체로 이동

인터페이스 안의 메소드에 커서를 둔다.

```java
PagedResult<PostSearchResultDto> searchPosts(SearchCriteriaDto criteria, String language);
                                 ^^^^^^^^^^^
```

누를 것:

```vim
:lua vim.lsp.buf.implementation()
```

이동하는 곳:

```text
core/.../application/PostQueryService.java
```

구현체 클래스 선언은 보통 이렇게 생겼다.

```java
public class PostQueryService implements SearchPostsUseCase, OtherUseCase {
```

`implements SearchPostsUseCase`가 보이면 "이 클래스가 컨트롤러에서 호출한 인터페이스의 실제 몸통"이라는 뜻이다.

### 4단계: 서비스 구현체에서 실제 조회 시작점 찾기

서비스 구현체 안에서:

```vim
/searchPosts
```

메소드를 찾는다.

```java
@Override
public PagedResult<PostSearchResultDto> searchPosts(SearchCriteriaDto criteria, String language) {
    PagedResult<Post> postPage = postSearch.searchForList(criteria);
    ...
}
```

여기서 가장 중요한 줄:

```java
postSearch.searchForList(criteria)
```

이 줄이 "정렬과 페이징이 걸린 기본 목록 조회"이다.

이 메소드의 나머지 부분은 보통 조회 결과에 부가 정보를 붙이는 역할이다.

예:
- 작성자명 조회
- 상태값 조회
- 메타데이터 조회
- 첨부파일 조회
- 코드명 조회
- 최종 response DTO 조립

### 5단계: Repository 조회로 이동

커서를 `searchForList`에 둔다.

```java
postSearch.searchForList(criteria)
           ^^^^^^^^^^^^^
```

먼저:

```vim
gd
```

중간 service 메소드로 갈 수 있다.

```java
@Override
public PagedResult<Post> searchForList(SearchCriteriaDto criteria) {
    return repository.searchForList(criteria);
}
```

이 메소드는 직접 DB를 조회하지 않는다.
그냥 repository로 위임하는 통로이다.

다시 `repository.searchForList`의 `searchForList`에 커서를 둔다.

```java
return repository.searchForList(criteria);
                  ^^^^^^^^^^^^^
```

누를 것:

```vim
gd
```

interface로 가면 거기서 다시:

```vim
:lua vim.lsp.buf.implementation()
```

최종 목적지:

```text
data/.../PostRepositoryImpl.java
```

### 6단계: 실제 orderBy 확인

Repository Impl에서 볼 것:

```java
public PagedResult<Post> searchForList(SearchCriteriaDto criteria) {
    ...
    return PagedQueryUtils.executePagedQuery(dataQuery, countQuery, criteria.pagingInfo());
}
```

정렬은 보통 이런 위치에 있다.

```java
.orderBy(resolveOrderSpecifiers(
        criteria.sortField(),
        criteria.sortDirection(),
        ...
))
```

또는 별도 mapper로 빠져 있으면:

```java
.orderBy(SortMapper.resolveOrderSpecifiers(criteria, context))
```

확인할 것:

```java
criteria.sortField()
criteria.sortDirection()
```

정상 예:

```text
sortField = "amount"
sortDirection = "ASC"
```

그러면 mapper나 switch에서:

```java
"amount" -> post.amount.asc()
```

처럼 QueryDSL order로 바뀐다.

## POST 배치 저장 흐름

예시 컨트롤러:

```java
@PostMapping("/posts/batch")
public ApiResponse<BatchResult> savePostBatch(@RequestBody SavePostBatchRequest request) {
    List<SavePostCommand> commands = request.items()
            .stream()
            .map(this::toSavePostCommand)
            .toList();

    BatchResult result = batchPostUseCase.savePosts(commands);
    return ApiResponse.ok(result);
}
```

### 1단계: request item이 command로 바뀌는 곳 보기

커서를 변환 함수에 둔다.

```java
toSavePostCommand(item)
^^^^^^^^^^^^^^^^^
```

누를 것:

```vim
gd
```

확인할 것:
- request 필드가 command 필드로 빠짐없이 들어가는지
- 식별자(예: `postId`)가 들어가는지
- 중첩된 payload 내부 필드가 들어가는지

### 2단계: batch usecase로 이동

커서를 `savePosts`에 둔다.

```java
batchPostUseCase.savePosts(commands)
                 ^^^^^^^^^
```

누를 것:

```vim
gd
```

interface로 가면:

```vim
:lua vim.lsp.buf.implementation()
```

구현체는 보통 batch service이다.

```java
public class BatchPostService implements BatchPostUseCase {
    public BatchResult savePosts(List<SavePostCommand> commands) {
        int successCount = 0;
        List<BatchFailedResult> failures = new ArrayList<>();

        for (SavePostCommand command : commands) {
            try {
                savePostUseCase.save(command);
                successCount++;
            } catch (Exception e) {
                failures.add(new BatchFailedResult(command.id(), e.getMessage()));
            }
        }

        return new BatchResult(successCount, failures.size(), failures);
    }
}
```

여기서 중요한 줄:

```java
savePostUseCase.save(command);
```

batch는 단건 저장을 for문으로 반복 호출한다.

### 3단계: 단건 저장 usecase로 이동

커서를 `save`에 둔다.

```java
savePostUseCase.save(command)
                ^^^^
```

누를 것:

```vim
gd
```

interface로 가면:

```vim
:lua vim.lsp.buf.implementation()
```

단건 저장 구현체는 보통 이런 구조이다.

```java
public void save(SavePostCommand command) {
    authorRepository.findById(command.authorId());

    postRepository.findByAuthorAndKey(...)
            .ifPresentOrElse(
                    existingPost -> updatePost(existingPost, command),
                    () -> createPost(command)
            );
}
```

### 4단계: DB save 확인

진짜 DB 저장은 repository impl의 JPA save이다.

```java
postRepository.save(post);
```

여기서 `save`에 커서를 둔다.

```java
postRepository.save(post)
               ^^^^
```

누를 것:

```vim
gd
```

interface로 가면:

```vim
:lua vim.lsp.buf.implementation()
```

최종적으로 이런 코드로 간다.

```java
public Post save(Post post) {
    return jpaPostRepository.save(post);
}
```

이 `jpaPostRepository.save(post)`가 실제 DB insert/update를 발생시키는 코드이다.

JPA를 사용하므로 코드에 `insert into ...`가 직접 보이지 않을 수 있다.

## search와 batch의 차이

### search

```text
GET
조회
QueryDSL select
orderBy 있음
DB 데이터 변경 없음
```

디버깅 핵심:

```text
request.toDto()
criteria.sortField/sortDirection
repository.searchForList()
orderBy()
```

### batch

```text
POST
저장
command 생성
for문으로 단건 save 반복
JPA save
DB 데이터 변경 있음
```

디버깅 핵심:

```text
toSavePostCommand()
batchService.savePosts()
singleSaveService.save()
repository.save()
jpaRepository.save()
```

## 자주 헷갈리는 부분

### 컨트롤러 메소드 이름은 누가 호출하나

컨트롤러 메소드는 Java 코드에서 직접 호출하지 않아도 된다.
Spring이 URL과 annotation을 보고 호출한다.

```java
@GetMapping("/posts/search")
public ApiResponse<?> searchPosts(...) { ... }
```

그래서 nvim에서 `searchPosts` references를 찾았는데 안 나올 수 있다.
이건 이상한 게 아니라 Spring MVC 구조에서는 자연스러운 일이다.

### interface는 왜 있는가

컨트롤러는 구체 클래스가 아니라 interface를 바라본다.

```java
private final SearchPostsUseCase searchPostsUseCase;
```

실제 구현체는:

```java
public class PostQueryService implements SearchPostsUseCase
```

Spring이 이 구현체를 주입한다.

### service 중간 메소드가 아무 일도 안 하는 것처럼 보이는 이유

이런 코드는 흔하다.

```java
public PagedResult<Post> searchForList(SearchCriteriaDto criteria) {
    return repository.searchForList(criteria);
}
```

이건 직접 DB를 조회하는 곳이 아니라, application layer에서 domain repository로 넘기는 위임 메소드이다.

### 진짜 DB 조회는 어디인가

보통 `data` 모듈의 `RepositoryImpl`이다.

```java
jpaQueryFactory
        .selectFrom(...)
        .where(...)
        .orderBy(...)
        .fetch()
```

또는 paging helper:

```java
PagedQueryUtils.executePagedQuery(dataQuery, countQuery, pagingInfo)
```

### 진짜 DB 저장은 어디인가

보통 `data` 모듈의 repository impl에서:

```java
jpaRepository.save(entity)
```

이다.

## 디버깅 체크리스트

### GET 검색 정렬 디버깅

1. 컨트롤러에서 `request.sortField`, `request.sortDirection` 확인
2. `request.toDto()` 결과 DTO에 정렬값이 들어갔는지 확인
3. service 구현체의 `searchPosts`에서 `criteria` 확인
4. repository의 `searchForList`로 이동
5. `orderBy` 또는 `SortMapper`에서 sortField가 어떤 QueryDSL 컬럼으로 매핑되는지 확인
6. SQL 로그에서 `order by` 확인

### POST 배치 저장 디버깅

1. 컨트롤러에서 request item 확인
2. `toSavePostCommand` 결과 확인
3. batch service의 for문 확인
4. 단건 save service로 이동
5. 기존 데이터가 있으면 update인지, 없으면 create인지 확인
6. repository impl의 `jpaRepository.save(entity)` 확인
7. SQL 로그에서 insert/update 확인

## 관련 개념

- Spring MVC Controller
- DTO와 Command
- UseCase Interface
- Service Implementation
- Repository Pattern
- QueryDSL
- JPA save
- Pagination
- Server-side Sorting
- nvim LSP definition / implementation
