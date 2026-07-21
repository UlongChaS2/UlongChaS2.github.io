---
title: 'JVM 클래스 로딩과 Gradle 빌드 트러블슈팅'
date: '2026-03-25'
category: 'project'
keywords: ['JVM', 'Gradle', 'BE']
---

> 런타임에 클래스를 못 찾는 에러는 대부분 빌드 설정 문제다. 증상을 보고 원인 계층을 역추적하는 법을 파헤치자.

<!--more-->

## 개요

Java 프로젝트를 운영하다 보면 분명히 코드에 클래스가 있는데 실행하면 `ClassNotFoundException`이나 `NoClassDefFoundError`가 발생하는 경우가 있다.
이 에러들은 증상은 비슷하지만 원인 계층이 다르고, Gradle 멀티모듈 + Annotation Processing 환경에서는 더욱 자주 등장한다.
이 글은 "왜 이런 에러가 나는가"를 JVM 레벨부터 빌드 시스템까지 역추적하며 설명한다.

---

## 1. JVM 클래스 로딩 메커니즘

### Classpath란?

JVM이 클래스를 찾아볼 디렉토리/JAR 목록이다.

```
java -cp ./build/classes:./lib/some.jar com.example.Main
```

JVM은 Classpath에 있는 경로만 탐색한다. 코드에서 `import` 했어도 Classpath에 없으면 못 찾는다.

### 클래스 로딩 시점

JVM은 클래스를 **필요한 순간**에 로드한다 (Lazy Loading).

```
프로그램 시작
  → Main 클래스 로드
  → Main에서 UserService 호출하는 순간 → UserService 로드 시도
  → UserService가 없으면 → 에러 발생
```

즉, 컴파일은 성공해도 **실행 중에** 에러가 날 수 있다.

### ClassNotFoundException vs NoClassDefFoundError

| 구분 | ClassNotFoundException | NoClassDefFoundError |
|------|----------------------|---------------------|
| 타입 | Checked Exception | Error |
| 발생 시점 | 런타임에 클래스를 동적으로 로드할 때 | 컴파일 시엔 있었는데 런타임에 없을 때 |
| 원인 | Classpath에 아예 없음 | Classpath에 없거나 static 초기화 실패 |
| 주요 발생 상황 | `Class.forName("com.example.Foo")` | 의존 JAR이 빠진 채로 실행 |

**핵심 차이:**
- `ClassNotFoundException` → "처음부터 없어"
- `NoClassDefFoundError` → "컴파일할 때는 있었는데 지금 없어"

실무에서는 `NoClassDefFoundError`가 더 혼란스럽다. 코드에 분명히 있는데 에러가 나니까.

---

## 2. Java 빌드 시스템 (Gradle)

### Task 의존성과 실행 순서

Gradle은 Task 간 의존성 그래프를 만들어 순서를 결정한다.

```groovy
// A가 먼저 실행되고, B가 실행된다
taskB.dependsOn taskA
```

`build` task의 기본 실행 순서:
```
clean → compileJava → processResources → classes → jar → assemble → build
```

**안티패턴:**
```groovy
// ❌ 이렇게 하면 매번 compileJava 전에 clean이 실행된다
compileJava.dependsOn clean
```

이렇게 하면 생성된 파일(Q클래스 등)이 매번 삭제되고 재생성해야 한다. 재생성이 실패하면 클래스가 없는 채로 빌드가 끝난다.

### Incremental Build (증분 빌드)

Gradle은 변경된 파일만 다시 컴파일하는 증분 빌드를 지원한다.

```
첫 빌드: 모든 파일 컴파일
두 번째 빌드: UserService.java만 변경됐으면 UserService만 재컴파일
```

`compileJava.dependsOn clean`을 넣으면 증분 빌드가 깨진다. 매번 전체를 다시 빌드하게 된다.

**올바른 clean 사용법:**
```bash
# 필요할 때만 명시적으로
./gradlew clean build
```

### Annotation Processing (APT)

컴파일 시점에 어노테이션을 읽어서 새로운 코드를 자동 생성하는 기술이다.

```
.java 파일
  → javac 컴파일러 시작
  → Annotation Processor 실행 (Lombok, QueryDSL 등)
  → 새 .java 파일 생성 (Q클래스, Builder 등)
  → 생성된 파일 포함해서 최종 컴파일
  → .class 파일 생성
```

Gradle 설정:
```groovy
dependencies {
    // 컴파일할 때만 사용, 런타임엔 불필요
    annotationProcessor 'org.projectlombok:lombok'
    // 좌표는 group:artifact:version:classifier 순서 — jpa는 classifier라 version 뒤에 와야 한다
    annotationProcessor 'io.github.openfeign.querydsl:querydsl-apt:<version>:jpa'
}
```

**문제 발생 패턴:**
- `clean`으로 생성된 Q클래스 삭제
- `compileJava` 실행 → APT가 Q클래스 재생성 시도
- APT 실행 타이밍 문제로 재생성 실패
- Q클래스 없는 채로 빌드 완료 → 런타임 에러

### Multi-module 프로젝트 구조

```
settings.gradle
  include 'core'
  include 'web'
  include 'application'

application/build.gradle
  dependencies {
      implementation project(':core')
      implementation project(':web')
  }
```

각 모듈이 독립적으로 빌드되고, 의존 모듈의 빌드 결과물을 Classpath에 포함한다.

**문제 발생 패턴:**
```
core 모듈 변경
  → core만 재빌드
  → application 모듈은 이전 core JAR 참조
  → 새 클래스 못 찾음 → 에러
```

해결: 전체 재빌드
```bash
./gradlew clean build
```

---

## 3. Annotation Processing 상세

### Lombok이 하는 일

`@Getter`, `@Builder`, `@Data` 등의 어노테이션을 읽어서 컴파일 시점에 메서드를 생성한다.

```java
// 소스 코드
@Builder
public class Order {
    private String id;
    private int amount;
}

// Lombok이 생성하는 코드 (실제로는 .class에 직접 삽입)
public class Order {
    private String id;
    private int amount;

    // 내부 Builder 클래스 생성
    public static class OrderBuilder {
        public Order build() { ... }
    }
}
```

`Order$OrderBuilder`가 없다는 에러가 나면 Lombok APT가 실행 안 된 것이다.

### QueryDSL Q클래스 생성 과정

```java
// 엔티티 클래스
@Entity
public class Product {
    @Id private Long id;
    private String name;
    private int price;
}
```

QueryDSL APT가 위 클래스를 읽어서 아래를 생성:

```java
// 자동 생성 (src/main/generated/querydsl/...)
public class QProduct extends EntityPathBase<Product> {
    public final NumberPath<Long> id = createNumber("id", Long.class);
    public final StringPath name = createString("name");
    public final NumberPath<Integer> price = createNumber("price", Integer.class);
}
```

이 Q클래스를 이용해 타입 안전한 쿼리 작성:
```java
QProduct product = QProduct.product;
queryFactory.select(product)
    .where(product.price.gt(1000))
    .fetch();
```

### Gradle sourceSets 설정

Q클래스가 생성되는 디렉토리를 소스 경로에 추가해야 컴파일 대상이 된다:

```groovy
def querydslDir = 'src/main/generated/querydsl'

sourceSets {
    main.java.srcDirs += [querydslDir]
}

tasks.withType(JavaCompile).configureEach {
    options.getGeneratedSourceOutputDirectory().set(file(querydslDir))
}
```

---

## 4. Spring Boot 멀티모듈 구조

### 모듈 간 의존성: implementation vs api

```groovy
// implementation: 이 모듈 내부에서만 사용
// 의존하는 모듈에서는 접근 불가
implementation project(':core')

// api: 이 모듈을 의존하는 모듈에서도 접근 가능
// 전이 의존성(transitive dependency)
api project(':core')
```

**실무 기준:**
- 외부에 노출할 필요 없는 의존성 → `implementation`
- 인터페이스/공용 타입으로 사용되는 의존성 → `api`

### bootJar vs plain jar

| 구분 | bootJar | plain jar |
|------|---------|-----------|
| 용도 | 실행 가능한 단독 JAR | 다른 모듈에서 참조용 |
| 포함 내용 | 모든 의존성 포함 (Fat JAR) | 해당 모듈 클래스만 |
| 설정 | `bootJar.enabled = true` | `bootJar.enabled = false` |

```groovy
// 실행 모듈 (application)
bootJar.enabled = true
jar.enabled = false

// 라이브러리 모듈 (core, web 등)
bootJar.enabled = false
// jar.enabled = true (기본값)
```

### 런타임 Classpath 구성

Spring Boot의 bootJar는 실행 시 이런 구조:

```
application.jar
  ├── BOOT-INF/
  │   ├── classes/          ← application 모듈 클래스
  │   └── lib/
  │       ├── core-0.0.1.jar    ← core 모듈
  │       ├── web-0.0.1.jar     ← web 모듈
  │       └── spring-boot-*.jar ← 외부 의존성
  └── org/springframework/boot/loader/  ← 부트 로더
```

**에러 발생 시나리오:**
1. `core` 모듈에 새 클래스 추가
2. `core`만 재빌드 → `core-0.0.1.jar` 갱신
3. 하지만 `application` 모듈이 이전 `core.jar`를 캐시로 사용
4. bootJar에 이전 `core.jar` 포함 → 새 클래스 없음 → 에러

---

## 트러블슈팅 흐름

```
에러 발생
  ↓
ClassNotFoundException?
  → Classpath에 아예 없음
  → JAR가 빠진 것 → 의존성 확인

NoClassDefFoundError?
  → 컴파일엔 있었는데 런타임에 없음
  → 빌드 결과물 확인

  ↓
Q클래스나 Builder 클래스?
  → Annotation Processing 문제
  → compileJava.dependsOn clean 설정 확인
  → ./gradlew clean build 실행

  ↓
멀티모듈 프로젝트?
  → 특정 모듈 변경 후 전체 재빌드 안 함
  → ./gradlew clean build 실행

  ↓
그래도 안 되면?
  → ./gradlew clean build --info 로 상세 로그 확인
  → APT가 실행됐는지, 어떤 파일이 생성됐는지 추적
```

---

## 핵심 요약

- `ClassNotFoundException` = Classpath에 없음 / `NoClassDefFoundError` = 있다가 없어짐
- `compileJava.dependsOn clean`은 안티패턴 — APT 불안정 유발
- Q클래스, Builder 클래스는 APT가 생성 — `clean` 후 재생성 필요
- 멀티모듈에서 클래스 못 찾으면 `./gradlew clean build`가 1순위 해결책
- `clean`은 자동화하지 말고 필요할 때 명시적으로

---

## 관련 개념
- Spring Bean 생성 실패 에러 읽는 법
- Gradle Task Graph 시각화 (`./gradlew :app:dependencies`)
- JVM 클래스 로더 계층 구조
