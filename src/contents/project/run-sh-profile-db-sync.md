---
title: '개발 실행 스크립트 개선 — 프로파일 정리와 dev DB 동기화'
date: '2026-05-15'
category: 'project'
keywords: ['스크립트', 'Docker', 'Infra']
---

> local 프로파일 제거, 실행 메뉴 단순화, Docker 볼륨 초기화 시 원격 dev DB 데이터를 로컬로 복제하는 기능 추가

## 개요

Spring Boot 멀티모듈 프로젝트에서 개발 환경 실행 스크립트(`run.sh`)를 개선했다. 불필요한 프로파일을 제거하고 docker / dev 두 가지로 단순화했으며, Docker 볼륨 초기화 시 원격 dev 서버 DB 데이터를 그대로 로컬 Docker DB로 가져오는 기능을 추가했다.

## 변경 내용

### 1. 프로파일 단순화

**수정 전** (3가지)

```
1) default  - 로컬 Docker DB (PostgreSQL + MailDev)
2) local    - 로컬 환경
3) dev      - 원격 개발서버 DB
```

**수정 후** (2가지)

```
1) docker  - 로컬 Docker DB (PostgreSQL + MailDev)
2) dev     - 원격 개발서버 DB
```

- 더 이상 쓰지 않는 레거시 프로파일과 대응 설정 파일(`data-local.yaml`, `application.yaml`의 관련 섹션) 삭제
- 유지 중인 프로파일: `default`(docker 선택 시), `dev`

### 2. Docker 볼륨 초기화 흐름

```
docker 선택
    └─ 데이터 초기화? (y/n)
            ├─ n → 기존 데이터 유지
            │       EXTRA_SPRING_OPTS="--myapp.data.initialize=false"
            └─ y → 볼륨 포함 재시작
                    └─ dev 데이터 동기화? (y/n)
                            ├─ y → pg_dump (dev) → pg_restore (docker local)
                            │       EXTRA_SPRING_OPTS="--myapp.data.initialize=false"
                            └─ n → Java 초기 데이터 사용 (initialize=true)
```

### 3. dev DB → Docker DB 복제 로직

```bash
# .env.local 에서 dev DB 접속 정보 로드
source "$SCRIPT_DIR/.env.local"

DUMP_FILE="$SCRIPT_DIR/myapp_dev.dump"

# 원격 dev DB 덤프 (Custom format)
PGPASSWORD="$DEV_DB_PASS" pg_dump \
    -h "$DEV_DB_HOST" -p "$DEV_DB_PORT" \
    -U "$DEV_DB_USER" -d "$DEV_DB_NAME" \
    --no-owner --no-acl -Fc -f "$DUMP_FILE"

# 로컬 Docker DB 복원
PGPASSWORD="$LOCAL_DB_PASS" pg_restore \
    -h localhost -p "$LOCAL_DB_PORT" \
    -U appuser -d myapp \
    --no-owner --clean --if-exists \
    "$DUMP_FILE"

rm -f "$DUMP_FILE"
```

**핵심 옵션 설명**

| 옵션 | 의미 |
|------|------|
| `-Fc` | Custom format (pg_restore 전용, 압축) |
| `--no-owner` | 원본 소유자 그대로 복원하지 않음 (권한 오류 방지) |
| `--no-acl` | ACL(권한 설정) 제외 |
| `--clean --if-exists` | 복원 전 기존 객체 DROP (충돌 방지) |

### 4. `EXTRA_SPRING_OPTS` 패턴

```bash
EXTRA_SPRING_OPTS=""  # 기본값: 빈 문자열

# 조건에 따라 값 설정
EXTRA_SPRING_OPTS="--myapp.data.initialize=false"

# JAR 실행 시 전달
java $JAVA_OPTS -jar "$JAR" --spring.profiles.active="$PROFILE" $EXTRA_SPRING_OPTS
```

- `myapp.data.initialize=false` → Spring Boot 기동 시 Java 코드로 초기 데이터를 심지 않음
- dev 데이터를 가져온 경우 또는 기존 데이터 유지 시 적용

### 5. 환경 변수 파일 분리

```
.env.local          ← gitignore, 실제 dev DB 접속 정보
.env.local.example  ← 커밋됨, 셋업 가이드용
```

**.env.local.example 예시**

```bash
DEV_DB_HOST=dev.example.com
DEV_DB_PORT=5432
DEV_DB_USER=myuser
DEV_DB_PASS=mypassword
DEV_DB_NAME=mydb
```

프론트엔드도 동일 컨벤션 적용:

- `client/.env` → `client/.env.local` (Vite 기본 gitignore 컨벤션)

## pg_dump / pg_restore 핵심 개념

### Custom Format (-Fc)

- `pg_dump -Fc`: 압축된 바이너리 포맷 → `pg_restore`로만 복원 가능
- SQL 텍스트 덤프(`-Fp`)보다 크기 작고 복원 시 객체 선택 가능

### 복원 순서 주의

`--clean --if-exists` 없이 복원하면 이미 존재하는 테이블/시퀀스와 충돌 가능. 볼륨을 완전히 날린 후 복원할 때도 명시하는 것이 안전하다.

## 주의사항

- `.env.local`이 없으면 스크립트가 `exit 1`로 중단 → `.env.local.example`을 복사해서 채우도록 안내 문구를 함께 출력
- `pg_dump`/`pg_restore`는 클라이언트 버전이 서버 버전보다 낮으면 경고 발생 → 가능하면 버전 맞추기
- 덤프 파일(`myapp_dev.dump`)은 복원 후 자동 삭제 (`rm -f`)

## 관련 개념

- Spring Boot 프로파일 (`spring.profiles.active`)
- Docker Compose 볼륨 관리 (`docker compose down -v`)
- PostgreSQL `pg_dump` / `pg_restore`
- Bash `source` 명령으로 환경변수 파일 로드
- Vite `.env.local` 컨벤션 (자동 gitignore)

---

## 보충: Java 초기 데이터 vs R__seed.sql

이 프로젝트는 Flyway(V1~V23 마이그레이션)로 스키마를 관리하고, 초기 데이터는 Java 코드(`myapp.data.initialize`)로 심는다. Flyway의 `R__seed.sql` 방식과 비교하면 다음과 같다.

### 차이점

| 항목 | Java 코드 (현재) | R__seed.sql |
|------|-----------------|-------------|
| 작성 방식 | Repository / EntityManager | 순수 SQL INSERT |
| 타입 안전 | ✅ 컴파일 타임 체크 | ❌ 런타임에 터짐 |
| 로직 가능 | ✅ 조건문·반복·계산 | ❌ 순수 데이터만 |
| 가독성 | 코드량 많음 | SQL이라 한눈에 보임 |
| 실행 시점 | 앱 기동 시 Java가 판단 | Flyway가 매 기동마다 자동 실행 |

### pg_dump와의 역할 분리

```
R__seed.sql  →  최소 기준 데이터 (공통코드, 관리자 계정, 기본 설정)
                환경 공통 → 코드로 관리 가능
                ✅ dev DB 없어도 앱이 돌아가는 최소 상태 보장

pg_dump      →  실제 업무 데이터 (주문·결제 내역 같은 대량 데이터)
                양이 많고 매번 달라짐 → SQL로 관리 불가
                ✅ 실데이터로 기능 테스트가 필요할 때
```

### R__seed.sql 도입이 유용한 시점

- 최소 기능이 돌아가는지 빠르게 확인하고 싶을 때
- dev DB에 접근할 수 없는 환경(네트워크 차단, 원격 서버 장애)에서 로컬 초기화가 필요할 때
- 새로 합류한 사람이 pg_dump 없이 바로 개발 환경을 셋업해야 할 때

→ **완전 대체는 아님.** seed는 기준 데이터, pg_dump는 실업무 데이터 재현용으로 역할이 다르다.
