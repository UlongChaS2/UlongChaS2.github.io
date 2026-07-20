---
title: '공통 로직 추출 — 언제 하고 언제 하지 말아야 하나'
date: '2026-03-26'
category: 'project'
keywords: ['리팩터링', '설계', 'BE']
---

> 중복 코드가 두 군데 있다고 무조건 추출하면 안 된다. 추출의 이득이 복잡도 비용을 넘을 때만 해야 한다.

<!--more-->

## 개요

두 곳에 동일한 로직이 있을 때 "공통으로 빼야 하나?"라는 질문이 생긴다. 이 결정은 단순히 코드 중복 여부만이 아니라, 레이어 설계, 테스트 용이성, 변경 빈도, 팀 컨벤션 등 여러 요소를 고려해야 한다.

---

## @Autowired란?

Spring이 객체를 직접 `new`로 생성하지 않고, **필요한 곳에 알아서 주입해주는 메커니즘**이다.

```java
@Service
public class OrderService {

    @Autowired  // "Spring아, 이거 알아서 넣어줘"
    private PaymentService paymentService;

    // new PaymentService() 할 필요 없음
}
```

Spring이 관리하는 Bean을 컨테이너가 생성하고, 의존 관계를 자동으로 연결해준다. 생성자 주입(Constructor Injection)이 현재 권장 방식이다:

```java
@Service
@RequiredArgsConstructor  // Lombok이 생성자 자동 생성
public class OrderService {
    private final PaymentService paymentService;  // final + 생성자 주입
}
```

---

## 공통 로직 추출 옵션 비교

### 시나리오

두 클래스에 동일한 로직이 있다:

```java
// 클래스 A
boolean hasActive = repo.existsByIdAndStatus(id, Status.ACTIVE);
entity.changeStatus(hasActive ? Status.RUNNING : Status.IDLE);
entityRepo.save(entity);

// 클래스 B (완전히 동일)
boolean hasActive = repo.existsByIdAndStatus(id, Status.ACTIVE);
entity.changeStatus(hasActive ? Status.RUNNING : Status.IDLE);
entityRepo.save(entity);
```

---

### 옵션 1: 공통 도메인 서비스 클래스 생성

```java
@Service
@RequiredArgsConstructor
public class EntityStatusManager {
    private final StatusRepository repo;
    private final EntityRepository entityRepo;

    public void restoreStatus(Entity entity, Long id) {
        boolean hasActive = repo.existsByIdAndStatus(id, Status.ACTIVE);
        entity.changeStatus(hasActive ? Status.RUNNING : Status.IDLE);
        entityRepo.save(entity);
    }
}

// 클래스 A, B 모두 주입받아 사용
@Service
@RequiredArgsConstructor
public class ServiceA {
    private final EntityStatusManager statusManager;

    public void doSomething(Entity entity, Long id) {
        // ...
        statusManager.restoreStatus(entity, id);
    }
}
```

**장점:**
- Repository 호출 포함 로직 **완전 통합** — 쿼리 조건이 바뀌어도 한 곳만 수정
- 변경 시 실수 방지 (한 쪽만 수정하고 다른 쪽 까먹는 사고 예방)

**단점:**
- 역할이 모호해짐 — "이 클래스는 서비스야? Repository 래퍼야?"
- **레이어 경계가 흐려짐** — Service가 또 다른 Service를 주입받으면 계층 구조가 복잡해짐
- 테스트 시 Mock이 늘어남

```
// 테스트가 복잡해지는 예
@Mock StatusRepository repo;
@Mock EntityRepository entityRepo;
@InjectMocks EntityStatusManager statusManager;  // 추가됨
@InjectMocks ServiceA serviceA;  // statusManager 주입 필요
```

---

### 옵션 2: 엔티티 메서드 추가

```java
// Entity 클래스 내부
public void restoreStatus(boolean hasActive) {
    this.status = hasActive ? Status.RUNNING : Status.IDLE;
}

// 두 클래스에서 각자 Repository 호출 후 엔티티에 위임
boolean hasActive = repo.existsByIdAndStatus(id, Status.ACTIVE);
entity.restoreStatus(hasActive);  // 판단 로직은 엔티티가
entityRepo.save(entity);
```

**장점:**
- 도메인 객체가 자신의 상태를 스스로 관리 (DDD 원칙)
- Repository 없이 순수 단위 테스트 가능

```java
// 테스트가 단순해짐
Entity entity = new Entity(Status.RUNNING);
entity.restoreStatus(false);
assertThat(entity.getStatus()).isEqualTo(Status.IDLE);
```

**단점:**
- **Repository 호출은 여전히 두 곳에 중복** — 진짜 중복 제거가 아님
- 쿼리 조건이 바뀌면 두 군데 다 수정해야 함
- 메서드 시그니처가 특정 케이스에 묶여 재사용성이 낮음
- 이 프로젝트가 Anemic Domain Model이면 스타일 일관성이 깨짐

---

### 옵션 3: 그냥 두기 + 주석

```java
// NOTE: ServiceB와 동일한 롤백 로직 — 변경 시 양쪽 함께 수정
boolean hasActive = repo.existsByIdAndStatus(id, Status.ACTIVE);
entity.changeStatus(hasActive ? Status.RUNNING : Status.IDLE);
entityRepo.save(entity);
```

**장점:**
- 코드 추적이 직관적
- 불필요한 추상화 없음
- 코드 자체가 단순

**단점:**
- 주석이 없어지면 중복인지 모름
- 한 쪽만 수정하는 실수 가능

---

## 비교표

| 항목 | 공통 서비스 | 엔티티 메서드 | 두 군데 유지 |
|------|-------------|---------------|--------------|
| Repository 중복 제거 | ✅ 완전 제거 | ❌ 여전히 중복 | ❌ 중복 |
| 레이어 경계 유지 | ⚠️ 흐려질 수 있음 | ✅ 명확 | ✅ 명확 |
| 테스트 복잡도 | 높아짐 | 낮아짐 | 그대로 |
| 코드 추적 용이성 | 낮아짐 | 중간 | 높음 |
| 변경 안전성 | ✅ 한 곳만 수정 | ❌ 두 군데 | ❌ 두 군데 |

---

## 언제 추출하고 언제 두는가

### Rule of Three

> 한 번은 그냥 쓰고, 두 번은 참고, **세 번째에 추출하라**

두 군데 중복은 아직 패턴이 확정되지 않은 단계일 수 있다. 성급한 추상화(Premature Abstraction)는 오히려 코드를 복잡하게 만든다.

### 추출해야 할 때

- 세 곳 이상 중복
- 변경 빈도가 높은 로직 (쿼리 조건, 계산식 등)
- 버그가 여러 곳에 동시에 발생하는 이력이 있음

### 두는 게 나을 때

- 두 곳뿐이고 코드가 짧음 (3줄 이하)
- **변경 빈도가 낮은 도메인 규칙** (예: "재고가 0이면 품절 상태로")
- 추출하면 레이어 경계가 애매해지는 경우

---

## 변경 빈도 판단 기준

| 낮음 (도메인 규칙) | 높음 (구현 세부사항) |
|-------------------|---------------------|
| 기획자가 결정해야 바뀜 | 개발자 판단으로 바뀜 |
| 비즈니스 본질적 규칙 | 성능, 신규 필드, 기술 변경 |
| 다른 기능에도 동일하게 적용됨 | 특정 케이스에만 해당 |

---

## 관련 개념

- Spring DI (의존성 주입) — @Autowired, Constructor Injection
- DDD (Domain-Driven Design) — Anemic vs Rich Domain Model
- Premature Abstraction — 성급한 추상화의 위험
- Rule of Three — 코드 중복 추출 기준
- Layered Architecture — Controller / Service / Repository 계층 분리
