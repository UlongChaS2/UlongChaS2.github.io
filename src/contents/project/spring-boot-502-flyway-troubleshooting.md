---
title: '배포 후 502 에러 진단하기 — Flyway 마이그레이션 누락'
date: '2026-05-07'
category: 'project'
keywords: ['Infra', '502', 'Flyway']
---

> 502 Bad Gateway의 원인은 앱이 뜨지 않는 것, Flyway 마이그레이션 누락이 흔한 원인 중 하나

## 개요

`deploy.sh`로 배포 후 502 에러가 발생했다. Nginx 같은 리버스 프록시가 502를 반환하는 건
백엔드 앱 자체가 실행되지 않고 있다는 의미다. 앱 로그를 확인해 Flyway 마이그레이션 누락이 원인임을 파악했다.

## 502 에러 진단 순서

### 1. 앱 프로세스 확인

```bash
ps aux | grep java
```

앱 프로세스가 없으면 → 앱이 시작 안 됐거나 크래시 난 것

### 2. 앱 로그 확인

```bash
tail -100 /opt/myapp/deploy/app.log
```

`restart.sh`가 상대 경로로 로그를 쓰므로, 실행 위치에 따라 로그 경로가 달라진다.

### 3. restart.sh 확인

```bash
cat /opt/myapp/restart.sh
```

`nohup java -jar ... > app.log 2>&1 &` 패턴이면 같은 디렉토리에 로그가 생긴다.

## Flyway 마이그레이션 누락 오류

### 에러 메시지

```
Caused by: org.flywaydb.core.api.exception.FlywayValidateException: 
Validate failed: Migrations have failed validation
Detected resolved migration not applied to database: 12.
To allow executing this migration, set -outOfOrder=true.
```

### 원인

DB를 새로 만들거나 복원할 때 특정 버전의 마이그레이션이 누락되는 경우 발생.

예시 상황:

```
DB 히스토리:  V1~V11, V13, V14, V15  (V12 누락)
JAR에 있는 파일: V1~V15 (V12 포함)
```

Flyway는 기본적으로 순서를 엄격히 체크해서, 이미 V13이 적용된 상태에서 V12를 실행하려 하면 거부한다.

### flyway_schema_history 확인

```sql
SELECT version, description, success FROM flyway_schema_history ORDER BY installed_rank;
```

빠진 버전이 있는지 확인한다.

## 해결 방법

### out-of-order: true 설정

`application.yml` 또는 `data-prod.yaml`에 추가:

```yaml
spring:
  flyway:
    enabled: true
    baseline-on-migrate: true
    baseline-version: 1
    out-of-order: true  # 순서가 어긋난 마이그레이션 허용
```

이렇게 하면 Flyway가 V12를 V13 이후에 실행하는 걸 허용한다.

마이그레이션 SQL이 `CREATE TABLE IF NOT EXISTS`로 작성되어 있으면 이미 테이블이 있어도 에러 없이 통과한다.

### flyway_schema_history에 수동 삽입 (비추천)

```sql
INSERT INTO flyway_schema_history (installed_rank, version, description, type, script, checksum, installed_by, execution_time, success)
VALUES (
    (SELECT MAX(installed_rank) + 1 FROM flyway_schema_history),
    '12', 'add some table', 'SQL', 'V12__add_some_table.sql',
    -1, 'appuser', 0, true
);
```

**주의**: checksum을 -1로 넣으면 Flyway가 여전히 유효하지 않은 항목으로 판단해서 에러가 날 수 있다.
수동 삽입보다 `out-of-order: true`로 Flyway가 직접 실행하게 하는 게 더 안전하다.

## Flyway 주요 설정 옵션

| 설정 | 설명 |
|------|------|
| `baseline-on-migrate: true` | flyway_schema_history가 없을 때 자동으로 baseline 생성 |
| `baseline-version: 1` | baseline 시작 버전 |
| `out-of-order: true` | 순서가 어긋난 마이그레이션 허용 |
| `validate-on-migrate: false` | 마이그레이션 전 validation 스킵 (비추천) |

## 클라우드 방화벽(보안 그룹) 이슈

클라우드 인스턴스에 SSH 접속이 안 되면 방화벽 인바운드 규칙부터 확인한다.

- 내 IP 확인: `curl ifconfig.me`
- 보안 그룹 인바운드 규칙에 `내IP/32 → SSH 포트` 허용 추가

로컬 터미널에서는 접속되는데 다른 도구나 다른 네트워크에서 안 되는 경우,
그 쪽 출발지 IP가 허용 목록에 없어서 막히는 것이다. 접속 주체가 늘어날수록
IP 기반 허용 목록은 관리 비용이 커지므로, 장기적으로는 배스천 호스트나
VPN을 통한 단일 진입점을 두는 편이 낫다.

## 배포 스크립트 구조 (nohup 방식)

```bash
# restart.sh 패턴
JAR_FILE=$(ls -t /opt/myapp/deploy/*.jar | head -n 1)
nohup java -jar -Dspring.profiles.active=prod "$JAR_FILE" > "$LOG_FILE" 2>&1 &
echo $! > "$PID_FILE"
```

**주의**: `restart.sh`에서 상대 경로(`app.log`, `app.pid`)를 사용하면
실행 위치에 따라 로그가 다른 곳에 생긴다. `deploy.sh`가 `cd /opt/myapp/deploy` 후
`restart.sh`를 호출하면 로그는 `/opt/myapp/deploy/app.log`에 생성됨.

## 관련 개념

- Flyway DB 마이그레이션
- Spring Boot prod 프로파일 설정
- 클라우드 보안 그룹 / 방화벽 규칙
- nohup 백그라운드 실행
