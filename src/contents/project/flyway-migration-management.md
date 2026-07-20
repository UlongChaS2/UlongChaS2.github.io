---
title: 'Flyway 마이그레이션 관리'
date: '2026-03-23'
category: 'project'
keywords: ['BE', 'Flyway', 'migration']
---

DB 스키마 변경 이력을 코드처럼 버전으로 관리하는 도구.

## 개요
Flyway는 DB 구조 변경(테이블 생성, 컬럼 추가 등)을 SQL 파일로 관리하고 자동으로 실행해주는 도구다. 팀 개발 시 DB 상태를 일관되게 유지할 수 있어 협업 환경에서 필수적이다.

## 핵심 개념

### 마이그레이션 파일
개발자가 직접 작성하는 SQL 파일. 자동 생성이 아니라 **사람이 직접 만든다**.

```
V1__baseline.sql
V2__add_dev_tables.sql
V3__fix_order_seq_column_type.sql
...
V15__create_order_history.sql
```

- `V{숫자}__` 접두사로 순서를 정함
- Java 버전과 무관한 DB 변경 순서 번호
- 파일 내용은 일반 SQL

### 체크섬 (Checksum)
파일 내용을 숫자로 변환한 값. 파일 내용이 조금이라도 바뀌면 숫자가 달라진다.

```
원본 파일 내용  →  체크섬: 434305087
수정된 파일     →  체크섬: 917892815
```

Flyway는 이미 실행된 파일이 수정되었는지 감지하기 위해 체크섬을 비교한다.

### flyway_schema_history 테이블
Flyway가 DB에 자동으로 만드는 이력 테이블.

| 컬럼 | 설명 |
|------|------|
| version | 마이그레이션 버전 번호 |
| description | 파일명에서 추출한 설명 |
| script | 실행된 파일명 |
| checksum | 파일 체크섬 |
| installed_by | 실행한 DB 유저 |
| installed_on | 실행 시각 |
| success | 성공 여부 |

## Flyway 동작 방식

```
앱 시작 (bootRun)
        ↓
flyway_schema_history 확인
(어떤 버전까지 실행됐는지 확인)
        ↓
로컬 마이그레이션 파일 스캔
(V1, V2, V3... 파일 목록 수집)
        ↓
검증 (Validate)
- DB 체크섬 vs 로컬 파일 체크섬 비교
- 로컬에 파일 없으면 → 에러
- 체크섬 다르면 → 에러
        ↓
검증 통과 시 새 파일만 순서대로 실행
(이미 실행된 버전은 건너뜀)
        ↓
실행 후 flyway_schema_history에 기록
```

## 자주 발생하는 에러

### 1. 파일 없음 에러
```
Detected applied migration not resolved locally: 15.
```
**원인**: DB에는 V15가 실행된 기록이 있는데 로컬에 파일이 없음
**발생 이유**: 누군가 공용 DB에 직접 마이그레이션 실행 후 파일을 git에 올리지 않음

**해결책**:
- 원본 파일을 작성한 사람에게 받기 (가장 안전)
- 임시방편: `application.yml`에 설정 추가
```yaml
spring:
  flyway:
    ignore-missing-migrations: true
```

### 2. 체크섬 불일치 에러
```
Migration checksum mismatch for migration version 15
-> Applied to database : 434305087
-> Resolved locally    : 917892815
```
**원인**: 이미 실행된 마이그레이션 파일 내용이 변경됨
**해결책**: `./gradlew flywayRepair` (DB 체크섬을 로컬 파일 기준으로 업데이트)

## Flyway 도입 전 vs 후

| | 도입 전 | 도입 후 |
|---|---|---|
| DB 변경 방법 | DB 클라이언트에서 직접 SQL 실행 | V{n}__xxx.sql 파일 생성 후 git push |
| 기록 | 없음 | git + flyway_schema_history |
| 공유 | 구두/메신저로 전달 | 앱 시작 시 자동 적용 |
| 문제 | 누가 실행했는지 모름, 빠뜨리는 사람 생김 | 파일 없이 DB 건드리면 에러 |

## 팀 개발 환경 권장 구성

### 이상적인 구조
```
개발자A: Docker 로컬 DB (localhost:5432)
개발자B: Docker 로컬 DB (localhost:5432)
→ 서로 영향 없음, 각자 독립적
```

### 공용 DB 사용 시 규칙
- 마이그레이션 파일은 반드시 PR과 함께 커밋
- 파일 없이 공용 DB 직접 건드리지 않기

## 주의사항 / 자주 하는 실수
- 이미 실행된 마이그레이션 파일 내용 수정 금지 (체크섬 불일치)
- 공용 DB에 직접 SQL 실행 후 파일 커밋 누락 — 위 V15 문제의 원인
- `flywayRepair`로 체크섬 바꾸면 나중에 원본 파일 받을 때 또 꼬임

## 관련 명령어
```bash
# 앱 실행 (Flyway 자동 실행 포함)
./gradlew bootRun

# 마이그레이션 repair (체크섬 업데이트)
./gradlew flywayRepair

# DB 이력 확인
SELECT * FROM flyway_schema_history ORDER BY installed_rank;

# 특정 버전 확인
SELECT * FROM flyway_schema_history WHERE version = '15';
```

## 관련 개념
- Spring Boot Auto Configuration
- JPA / Hibernate (DB 스키마와 밀접한 관계)
- Docker Compose (로컬 DB 환경 구성)
- CI/CD 파이프라인에서의 DB 마이그레이션 자동화
