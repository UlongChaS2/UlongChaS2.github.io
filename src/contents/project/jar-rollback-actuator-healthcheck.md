---
title: 'JAR 롤백 배포 구조와 Actuator Health Check'
date: '2026-05-20'
category: 'project'
keywords: ['롤백', 'health check', 'Infra']
---

> Spring Boot JAR 배포에서 `releases/current/previous` 구조를 사용하면 신규 배포 실패 시 이전 JAR로 빠르게 되돌릴 수 있다.

<!--more-->

## 개요

이번 작업의 핵심은 기존처럼 새 JAR를 올리고 기존 파일을 삭제하는 방식에서 벗어나, 서버에 이전 배포 산출물을 남겨두고 health check 실패 시 자동으로 되돌릴 수 있는 구조를 만드는 것이다.

특히 CI가 서버에 직접 접근할 수 없는 환경도 있다. 그래도 JAR 산출물을 별도 경로로 반입한 뒤 서버의 rollback 구조에 태우면 같은 배포 절차를 유지할 수 있다.

## 핵심 개념

### releases current previous 구조

서버에는 JAR 파일을 직접 덮어쓰지 않고, 버전별 파일을 `releases` 디렉토리에 보관한다.

```text
/opt/myapp/deploy/
  releases/
    app-26.5.20.10.26.jar
    app-26.5.20.10.33.jar
    app-26.5.20.11.10.jar
  current.jar -> releases/app-26.5.20.11.10.jar
  previous    -> releases/app-26.5.20.10.33.jar
```

애플리케이션 실행은 항상 `current.jar`를 기준으로 한다. 실제 JAR 파일명은 매번 달라도 되고, `current.jar` symlink만 새 JAR로 바꾸면 된다.

### baseline

첫 번째로 정상 배포에 성공한 JAR가 baseline이 된다.

```text
baseline 없음:
  previous 없음
  rollback 불가

baseline 있음:
  current.jar가 기존 정상 JAR를 가리킴
  다음 배포 전 previous가 current의 대상 JAR를 가리킴
  새 JAR 실패 시 previous로 되돌릴 수 있음
```

baseline은 별도 파일을 만드는 개념이라기보다, 현재 정상 동작 중인 `current.jar`가 다음 배포의 rollback 대상이 되는 구조다.

### liveness와 readiness

Spring Boot Actuator의 health check는 목적에 따라 나눠야 한다.

```text
liveness:
  애플리케이션 프로세스가 살아 있는지 확인
  Spring context가 뜨고 HTTP 포트가 열렸는지 확인
  DB 정상 여부까지 보장하지 않음

readiness:
  애플리케이션이 요청을 받을 준비가 되었는지 확인
  DB 연결 같은 준비 상태를 포함할 수 있음
```

이번 구조에서는 다음처럼 나눴다.

```text
/actuator/health/liveness
  JAR 기동 성공 여부 판단

/actuator/health/readiness
  DB 포함 준비 상태 판단
```

## 배포 흐름

기본 배포 흐름은 다음과 같다.

```text
1. 로컬 또는 CI에서 JAR 빌드
2. 새 JAR를 서버 releases 디렉토리에 업로드
3. 현재 current.jar 대상 JAR를 previous로 저장
4. current.jar를 새 JAR로 변경
5. 서버 restart 스크립트 실행
6. liveness check
7. readiness check
8. 실패 조건에 따라 rollback 또는 성공 처리
```

현재 권장 정책은 다음과 같다.

```text
liveness 실패:
  JAR 기동 실패로 보고 rollback

readiness 실패:
  DB 포함 준비 상태 실패로 보고 rollback

readiness를 일시적으로 우회해야 하는 특수 상황:
  READINESS_REQUIRED=false ./deploy.sh
```

## 왜 처음에는 실패했는가

처음에는 배포 스크립트가 `/actuator/health`를 기준으로 성공 여부를 판단했다.

`/actuator/health`는 DB 같은 health indicator까지 포함할 수 있다. 그래서 새 JAR가 실제로는 뜨고 HTTP 포트도 열렸는데, DB 또는 readiness 항목이 `DOWN`이면 HTTP 503을 반환한다.

당시 로그의 의미는 다음과 같다.

```text
Connection refused:
  앱이 아직 뜨는 중이라 포트가 열리지 않음

HTTP 503:
  앱은 떠 있고 actuator endpoint도 열림
  하지만 전체 health 상태가 DOWN

HTTP 401:
  이전 JAR에는 actuator health endpoint 인증 예외가 없었음
```

그래서 `/actuator/health` 하나만 보고 배포 성공 여부를 판단하면, "JAR 기동 실패"와 "DB 준비 실패"가 섞여서 rollback 판단이 애매해진다.

## 설정 예시

Spring Boot에서는 Actuator health endpoint를 노출하고 probe 그룹을 분리한다.

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health
  endpoint:
    health:
      show-details: never
      probes:
        enabled: true
      group:
        liveness:
          include: livenessState
        readiness:
          include: readinessState,db
  health:
    livenessstate:
      enabled: true
    readinessstate:
      enabled: true
```

보안 설정에서는 health 계열 endpoint만 인증 없이 열어둔다.

```java
private static final String[] PUBLIC_URLS = {
    "/actuator/health",
    "/actuator/health/**"
};
```

이렇게 하면 `/actuator/health/liveness`, `/actuator/health/readiness`는 배포 스크립트가 서버 내부에서 확인할 수 있다. 다른 actuator endpoint는 노출하지 않는다.

## 배포 정책은 어디에 두는가

`application.yml`은 애플리케이션 내부 설정이다.

```text
application.yml:
  actuator endpoint 노출
  liveness/readiness 그룹 구성
  DB 설정
  Spring profile
```

반면 rollback 여부, health check 재시도 횟수, readiness 실패 시 배포 실패로 볼지 여부는 배포 정책이다.

```text
deploy.sh 또는 GitHub Actions:
  health check URL
  retry 횟수
  readiness 실패 시 rollback 여부
  서버 접속 정보
  JAR 업로드 위치
```

따라서 `READINESS_REQUIRED` 같은 값은 `application.yml`이 아니라 `deploy.sh` 또는 GitHub Actions env에 두는 것이 맞다.

## CI가 서버에 직접 닿지 못하는 환경

GitHub Actions는 빌드와 산출물 생성 자동화에 가깝다.

```text
GitHub Actions:
  Gradle build
  JAR artifact 생성
  테스트 실행
  가능하면 SSH 배포
```

서버 rollback 구조는 산출물을 안전하게 실행하는 마지막 단계다.

```text
서버 rollback 구조:
  releases 보관
  current symlink 변경
  restart
  health check
  previous rollback
```

보안 정책상 외부 CI가 서버에 직접 접근할 수 없는 환경도 있다. 이 경우에도 구조는 유효하다.

```text
1. 빌드 환경에서 JAR artifact 생성
2. 승인 절차를 거쳐 배포 대상 환경으로 반입
3. 서버 releases 디렉토리에 JAR 업로드
4. current.jar 변경
5. restart 및 health check
6. 실패 시 previous로 rollback
```

즉 CI에서 자동 배포가 가능하든 아니든, 서버의 rollback 구조는 별도로 의미가 있다.

## 운영 조직이 분리된 환경에서의 차이

운영 통제가 강한 환경에서는 서버 파일을 개발자가 배포 때마다 덮어쓰는 방식을 허용하지 않을 수 있다.

이런 경우 책임 경계는 보통 다음처럼 나뉜다.

```text
개발 쪽:
  애플리케이션 코드
  JAR 산출물
  migration 스크립트
  릴리스 노트

운영 쪽:
  서버 계정과 권한
  Java 설치 경로
  systemd 또는 restart 스크립트
  리버스 프록시, 방화벽
  로그 보관 정책
  운영 DB 접속 정보
```

그래도 핵심 구조는 동일하다.

```text
releases/
current.jar
previous
health check
rollback
```

차이는 restart 스크립트를 누가 관리하느냐이다.

```text
개발 주도 환경:
  repo의 server-restart.sh를 배포 때 서버에 업로드

운영 주도 환경:
  restart.sh 또는 systemd는 서버에 고정 설치
  개발 쪽은 JAR만 전달
```

## 주의사항

### liveness만으로는 업무 정상 동작을 보장하지 않는다

`liveness`가 `UP`이라는 것은 앱 프로세스가 살아 있다는 뜻이다. 업무 API, 화면, 내부 비즈니스 로직이 정상이라는 뜻은 아니다.

그래서 운영 기준은 최소한 다음 단계로 나누는 것이 좋다.

```text
1. liveness hard gate
2. readiness hard gate
3. 핵심 API 또는 화면 smoke test
```

### DB restore 자동화는 현재 범위가 아니다

이번 단계에서 자동화한 것은 JAR rollback과 health check까지다. DB restore 자동화는 넣지 않았다.

```text
자동화함:
  current.jar -> previous JAR rollback
  liveness/readiness check

자동화하지 않음:
  pg_restore 자동 실행
  운영 DB 자동 복구
  migration rollback 자동 판단
```

이유는 DB 복구가 JAR rollback보다 훨씬 위험하기 때문이다. 배포 직후라도 사용자가 새 데이터를 입력했다면, 자동 restore가 정상 데이터까지 되돌릴 수 있다. 따라서 DB는 필요할 때 백업 파일을 기준으로 사람이 판단해서 복구해야 한다.

현재 단계에서는 로컬 환경에서 restore 경험이 있다면 충분하고, 운영 DB 쪽은 나중에 DB 접근 권한과 migration 정책이 확정된 뒤 `pg_dump` 백업부터 단순하게 붙이는 편이 현실적이다.

### readiness가 UP이어도 모든 기능이 정상이라는 뜻은 아니다

`readiness`가 DB 연결을 확인해도, 특정 API의 QueryDSL 조건 오류나 특정 화면의 런타임 오류까지 보장하지는 않는다.

예를 들어 특정 조회 API에서 `eq(null)` 같은 런타임 오류가 발생할 수 있다. 이런 문제는 health check가 아니라 API smoke test나 E2E 테스트로 잡아야 한다.

### 서버의 restart 스크립트와 레포의 restart 스크립트

레포에 restart 스크립트를 두고 배포 때 서버로 업로드하면 버전관리가 쉽다.

```text
장점:
  변경 이력이 git에 남음
  GitHub Actions에서 재현 가능
  서버 수동 수정으로 인한 편차 감소

주의:
  서버에서 직접 수정한 restart.sh는 다음 배포 때 덮어써짐
```

따라서 레포 파일명은 `scripts/server-restart.sh`처럼 명확히 두는 편이 좋다.

## 핵심 포인트

- 첫 정상 배포가 baseline이 된다.
- JAR 파일명은 매번 달라도 된다. 실행은 `current.jar` symlink 기준으로 한다.
- `liveness`는 JAR 기동 확인, `readiness`는 DB 포함 준비 상태 확인이다.
- `/actuator/health` 하나만 기준으로 쓰면 JAR 기동 실패와 DB 준비 실패가 섞인다.
- readiness 실패 시 rollback 여부는 애플리케이션 설정이 아니라 배포 정책이다.
- CI artifact 배포와 서버 rollback 구조는 경쟁 관계가 아니라 서로 연결되는 단계다.
- CI가 서버에 직접 닿지 못하는 환경에서도 같은 rollback 구조를 쓸 수 있다.

## 관련 개념

- Spring Boot Actuator
- Health Check
- Liveness Probe
- Readiness Probe
- Symlink 배포
- JAR rollback
- CI/CD artifact
- 배포 책임 경계

## 시리즈 연결 메모

이 글은 운영 배포 안정화 시리즈와 함께 읽으면 좋은 관련 글이다. 관련 글인 「운영 배포 안정화기 (1) — 삭제 후 재업로드에서 벗어나기」에서 정리한 "기존 JAR 삭제 후 새 JAR 재업로드 방식의 위험"을 실제 rollback 구조로 풀어낸 내용이다. 핵심은 JAR를 삭제하지 않고 `releases`에 보관하며, 실행 기준을 `current.jar` symlink로 고정하고 실패 시 `previous`로 되돌리는 것이다.
