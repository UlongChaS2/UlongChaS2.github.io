---
title: '오픈 전 최소한의 배포 QA 파이프라인'
date: '2026-05-18'
category: 'project'
keywords: ['QA', '배포', 'Infra']
---

> 첫 운영 배포 전에는 화려한 CI/CD보다 백업, 롤백, 마이그레이션 안전장치, QA 증적이 먼저다.

<!--more-->

## 개요

기능 구현이 어느 정도 끝난 프로젝트에서도, 배포 산출물 보관 방식·DB 백업·JAR 롤백·QA 증적 관리가 정리되어 있지 않으면 운영 시작 직후 장애 대응이 어려워진다.

이 글은 첫 운영 배포 전에 반드시 잡아야 할 최소 파이프라인을 정리한다. 목표는 완결된 엔터프라이즈 배포 시스템이 아니라, "터졌을 때 되돌릴 수 있는 상태"를 만드는 것이다.

## 자주 발견되는 리스크

### 1. 운영 파일 기준 경로 혼재

배포 JAR, 로그, PID 파일, 재시작 스크립트가 서로 다른 기준 경로에 흩어져 있으면 장애가 났을 때 실제 실행 기준을 빠르게 파악하기 어렵다.

특히 루트 파티션 여유 공간이 넉넉하지 않은 상태에서 배포 산출물과 로그가 계속 쌓이면, 애플리케이션 자체 문제가 아니어도 배포나 재시작이 실패할 수 있다.

### 2. 운영 DB 백업 자동화 부재

개발용 DB를 로컬 Docker DB로 가져오는 `pg_dump` 흐름은 있어도, 운영 DB를 배포 전에 자동 백업하거나 정기 백업하는 흐름은 빠져 있는 경우가 많다.

### 3. 롤백 가능한 JAR 보관 구조 부재

배포 스크립트가 원격 서버의 기존 JAR를 삭제한 뒤 새 JAR를 전송하는 구조라면, 새 JAR 전송 실패·앱 재시작 실패·런타임 오류가 났을 때 이전 버전으로 즉시 되돌릴 수 없다.

### 4. Flyway migration 자동 실행 위험

운영 프로파일에서 Flyway가 활성화되어 있으면 애플리케이션 재시작 시 DB migration이 자동 실행될 수 있다. 마이그레이션이 실패하거나 데이터가 손상되면 배포 실패를 넘어 운영 DB 장애로 이어진다.

### 5. QA 결과 추적 부재

수동 QA 결과가 구조화되어 남지 않으면, 어떤 화면이 검증되었는지·어떤 이슈가 재현 가능한지·어떤 버전에서 통과했는지 추적할 수 없다.

## 최소 파이프라인 목표

```text
1. 운영 파일 기준 경로가 명확하다.
2. 배포 전 DB 백업이 남는다.
3. 배포 실패 시 이전 JAR로 되돌릴 수 있다.
4. DB migration이 무작정 실행되지 않는다.
5. QA 결과와 실패 증적이 추적 가능한 형태로 남는다.
```

## 권장 최소 구조

```text
GitHub Actions
  ├─ build
  ├─ unit test / lint
  ├─ DB backup trigger
  ├─ artifact upload
  ├─ SSH deploy
  ├─ health check
  ├─ QA smoke test
  └─ QA 상태판 sync

운영 서버
  ├─ releases/
  │   ├─ app-20260518-120000.jar
  │   ├─ app-20260518-130000.jar
  │   └─ ...
  ├─ current -> releases/app-20260518-130000.jar
  ├─ backups/
  │   └─ db-20260518-125900.dump
  └─ restart.sh
```

## 0단계: 운영 파일 기준 경로 정리

DB 백업과 JAR 롤백 구조를 만들기 전에, 먼저 서버 안에서 "무엇이 실제 실행 기준인지"를 분명히 해야 한다.

정리 방향:

- 배포 산출물, 로그, PID 파일, 재시작 스크립트를 하나의 앱 운영 디렉터리 아래로 모은다.
- 루트 파티션이 부족하다면 배포 산출물과 로그를 여유 공간이 큰 데이터 디스크로 옮긴다.
- 홈 디렉터리에는 Java 런타임처럼 실행 도구에 가까운 파일만 남긴다.
- 배포 디렉터리에는 실행 대상 JAR만 남기고 로그, PID, 임시 파일은 분리한다.
- 심볼릭 링크가 남아 있으면 실제 디렉터리인지 링크인지 확인하고, 불필요한 링크는 제거한다.

이 단계의 목적은 디렉터리 정리가 아니라 **운영 판단 기준을 줄이는 것**이다. 장애가 났을 때 확인해야 할 위치가 하나로 정리되어 있어야 다음 단계인 DB 백업, 롤백, health check도 안정적으로 붙일 수 있다.

구조로만 보면 다음과 같은 변화다.

```text
Before
홈 디렉터리
├── 배포 JAR
├── 로그
├── PID 파일
├── 재시작 스크립트
└── Java 런타임

After
홈 디렉터리
└── Java 런타임

데이터 디스크의 앱 운영 디렉터리
├── 배포 JAR
├── 로그
├── PID 파일
└── 재시작 스크립트
```

핵심은 "Java 실행 파일의 위치"와 "실행할 JAR의 위치"를 구분한 것이다. Java는 앱을 실행하는 도구이고, JAR는 Java가 읽어서 실행할 대상 파일이다. 둘은 같은 디렉터리에 있을 필요가 없다.

경로를 옮긴 뒤 확인해야 할 것:

- 새 기준 경로의 JAR로 애플리케이션이 정상 기동되는가
- 웹 서버가 기존 서비스 포트에서 정상 시작되는가
- 배포 디렉터리에 실행 대상 JAR만 남았는가
- 로그와 PID 파일이 운영 기준 디렉터리 아래로 분리되었는가
- 예전 심볼릭 링크와 홈 디렉터리 잔여 파일이 정리되었는가

### 이 단계에서 배운 것

- 배포 경로를 바꿀 때 JAR 위치만 바꾸면 안 된다. 재시작 스크립트, PID 파일, 로그 파일, 배포 스크립트가 **모두 같은 기준**을 바라봐야 한다.
- PID 파일 위치가 바뀌면 이전 프로세스를 종료하지 못한다. 그러면 새 프로세스가 뜨지 못하고 포트 충돌이 난다.
- 배포 디렉터리에는 실행 대상만 남기는 편이 좋다. 로그, PID, 임시 파일이 섞이면 운영 상태 판단이 느려진다.
- 심볼릭 링크는 편하지만 정리 중에는 혼동을 만든다. 실제 디렉터리인지 링크인지 확인해야 한다.

## 1단계: 배포 전 DB 백업

운영 DB가 같은 서버의 PostgreSQL이라면 배포 직전에 `pg_dump`를 실행해 백업 파일을 남긴다.

```bash
mkdir -p /opt/myapp/backups
pg_dump \
  -h localhost \
  -p 5432 \
  -U appuser \
  -d app_db \
  --no-owner \
  --no-acl \
  -Fc \
  -f /opt/myapp/backups/app_db_$(date +%Y%m%d_%H%M%S).dump
```

권장 사항:

- 백업 파일명에 날짜와 시간을 포함한다.
- 최소 최근 7개 또는 최근 7일 백업을 보관한다.
- 백업만 하지 말고 **복구 테스트도 최소 1회는** 해봐야 한다.

복구 예시:

```bash
pg_restore \
  -h localhost \
  -p 5432 \
  -U appuser \
  -d app_db_restore_test \
  --clean \
  --if-exists \
  /opt/myapp/backups/app_db_20260518_120000.dump
```

이 단계에서 미리 확인할 것:

- 운영 DB 접속 정보가 어디에 있는지 (코드에 박혀 있다면 secret/env로 옮긴다)
- 백업 실행 사용자가 필요한 권한을 가지고 있는지
- 백업 저장 위치를 앱 운영 디렉터리 아래로 둘지, 별도 백업 저장소로 둘지
- 오래된 백업 보관 정책을 어떻게 할지
- 백업 성공 전에는 새 JAR 배포를 진행하지 않도록 파이프라인을 구성했는지

## 2단계: JAR 롤백 구조

기존 JAR를 바로 삭제하지 말고, 릴리즈 디렉터리에 버전별로 보관한다.

나쁜 방식:

```bash
rm -f ./*.jar
scp new-app.jar server:/deploy
```

권장 방식:

```bash
/opt/myapp/deploy/
  releases/
    app-20260518-120000.jar
    app-20260518-130000.jar
  current -> releases/app-20260518-130000.jar
```

배포 흐름:

```text
1. 새 JAR를 releases/에 업로드
2. current symlink를 새 JAR로 변경
3. 앱 재시작
4. health check 실패 시 current를 이전 JAR로 되돌림
5. 이전 JAR로 재시작
```

롤백 예시:

```bash
ln -sfn /opt/myapp/deploy/releases/app-previous.jar /opt/myapp/deploy/current
systemctl restart app.service
```

목표 디렉터리 구조:

```text
앱 운영 디렉터리
├── releases
│   ├── app-version-a.jar
│   └── app-version-b.jar
├── current -> releases/app-version-b.jar
├── logs
├── backups
├── app.pid
└── restart.sh
```

### 삭제-후-재업로드 방식이 왜 위험한가

기존 JAR를 삭제하고 새 JAR를 다시 올리는 방식은 단순하지만 실제로 다음 지점에서 문제가 된다.

- 기존 JAR 삭제가 깔끔하게 되지 않을 수 있다.
- 삭제와 재업로드 사이에 실패하면 이전 정상 실행 파일이 명확히 남지 않는다.
- 빌드 또는 배포 과정에서 디스크 용량 문제가 발생할 수 있다.
- 루트·홈 파티션에 배포 산출물과 로그가 섞이면 서버 전체 안정성에 영향을 준다.

운영 관심사가 어떻게 바뀌는지 비교하면 차이가 분명하다.

```text
변경 전 관심사:
  JAR가 어디 있는지
  로그가 어디 쌓이는지
  PID 파일이 어디 있는지
  restart.sh가 어느 경로를 보는지
  삭제가 제대로 되었는지

변경 후 관심사:
  앱 운영 디렉터리 확인
  releases / current / previous 확인
  logs 확인
  app.pid 확인
```

디스크를 바로 늘릴 수 없다면, 루트 파티션을 계속 쓰는 구조보다 애플리케이션 운영 전용 경로를 따로 잡는 편이 낫다. 나중에 오래된 JAR와 로그 정리 정책을 붙이려면 운영 파일이 한곳에 모여 있어야 한다.

## 3단계: Flyway migration 안전장치

Flyway는 운영 DB 스키마를 직접 바꾸므로 배포 파이프라인에서 가장 조심해야 한다.

최소 원칙:

- 운영 migration SQL은 PR에서 반드시 리뷰한다.
- `DROP`, 대량 `UPDATE`, 대량 `DELETE`, 컬럼 타입 변경은 별도 승인 대상으로 둔다.
- 배포 직전 DB 백업 후 migration을 실행한다.
- migration 실패 시 앱을 새 버전으로 띄우지 않는다.
- 가능한 한 backward-compatible migration을 사용한다.

위험한 migration 예시:

```sql
DROP COLUMN old_value;
UPDATE orders SET status = 'DONE';
ALTER TABLE users ALTER COLUMN age TYPE integer USING age::integer;
```

상대적으로 안전한 흐름:

```text
1차 배포: 새 nullable 컬럼 추가
2차 배포: 앱에서 새 컬럼 사용
3차 배포: 데이터 백필
4차 배포: 구 컬럼 제거
```

## 4단계: 배포 진입점을 GitHub Actions로 이동

기존 수동 배포 스크립트를 완전히 버릴 필요는 없다. **실행 주체만** 로컬 PC에서 GitHub Actions로 옮기면 된다.

기존 방식:

```text
개발자 PC
  -> deploy script 실행
  -> SSH 접속
  -> 서버 배포
```

권장 방식:

```text
GitHub Actions
  -> build
  -> test
  -> SSH 접속
  -> 서버 배포
  -> artifact 업로드
  -> QA 상태판 업데이트
```

GitHub Secrets 예시:

```text
SSH_HOST
SSH_PORT
SSH_USER
SSH_PRIVATE_KEY
QA_BOARD_TOKEN
QA_BOARD_DATABASE_ID
```

SSH key 방식이 비밀번호 방식보다 권장된다. 단, 서버의 `authorized_keys`에 public key를 추가하는 것은 접속 권한 변경이므로 반드시 담당자의 승인을 받고 진행한다.

## 5단계: QA 결과를 artifact와 상태판에 남기기

Playwright 같은 브라우저 QA를 실행하면 실패 시 다음 결과가 생긴다.

```text
playwright-report/
test-results/
  ├─ screenshot.png
  ├─ video.webm
  └─ trace.zip
qa-results.json
```

GitHub Actions에서는 이 결과를 artifact로 업로드한다.

```yaml
- name: Upload QA artifacts
  uses: actions/upload-artifact@v4
  if: always()
  with:
    name: qa-results
    path: |
      playwright-report/
      test-results/
      qa-results.json
```

QA 상태판(Notion 등)에는 무거운 파일을 직접 넣기보다 실행 URL과 상태를 저장한다.

QA 상태판 필드 예시:

| 필드 | 용도 |
|---|---|
| Title | QA 항목 이름 |
| Area | 기능 영역 |
| Screen | 화면명 |
| Flow | 조회, 저장, 전송 등 |
| Priority | P0, P1, P2 |
| Status | To QA, Passed, Failed, Retest |
| Error | 실패 메시지 |
| Run URL | GitHub Actions 실행 링크 |
| Artifact Name | qa-results, playwright-report 등 |
| Last Checked | 마지막 검증일 |

## 6단계: 최소 QA 범위

첫 QA에서는 디자인 디테일보다 **운영 차단 리스크**를 먼저 본다.

우선순위:

```text
1. 로그인, 메뉴, 권한, 공통 레이아웃
2. 핵심 데이터 조회, 상세, 저장
3. 주요 등록 플로우
4. 상태 변경 플로우 (승인/반려 등)
5. 외부 시스템 연동과 결과 확인
6. 기준정보 조회, 등록, 수정
7. 엑셀 업로드, 다운로드
```

체크 항목:

- 화면 진입 가능
- API 정상 호출
- 검색과 조회 가능
- 저장, 수정, 삭제 정상
- 필수 validation 동작
- 콘솔 에러 없음
- 권한과 인증 흐름 정상
- 주요 그리드 렌더링 정상
- 외부 연동 실패 시 사용자에게 명확히 표시

## 역할 분담

큰 조직에서는 보통 다음처럼 나뉜다.

| 역할 | 책임 |
|---|---|
| 백엔드 | migration 작성, API 안정성, backward-compatible 변경, 장애 원인 분석 |
| 인프라/SRE | 배포 파이프라인, 서버, 백업, 모니터링, 롤백, 권한 관리 |
| DBA/데이터 플랫폼 | DB 백업 정책, 복구 테스트, migration 운영 기준 |
| QA | 테스트 시나리오, 회귀 검증, 증적 관리 |

규모가 작은 팀에서는 백엔드가 인프라 영역까지 일부 맡는 경우가 많다. 그래도 책임 기준으로는 백엔드 혼자 떠안을 일이 아니라, 백엔드와 인프라가 같이 소유해야 한다.

## 최소 실행 체크리스트

```text
[ ] 운영 파일 기준 경로 정리
[ ] 배포 산출물과 로그를 여유 공간이 큰 디스크로 분리
[ ] GitHub Actions에서 build 실행
[ ] GitHub Actions에서 test/lint 실행
[ ] 배포 전 운영 DB pg_dump 백업
[ ] JAR를 releases/에 버전별 보관
[ ] current symlink 기반 재시작
[ ] health check 실패 시 이전 JAR로 rollback
[ ] Playwright smoke QA 실행
[ ] QA report를 GitHub artifact로 업로드
[ ] QA 결과를 상태판에 동기화
[ ] 운영 DB 접속 정보는 코드에서 제거하고 secret/env로 이동
```

## 다음 단계

여기까지 왔다면 그다음은 QA 실행 위치 문제다. 외부 러너가 대상 서버에 접근할 수 없는 환경에서는 GitHub-hosted runner로 브라우저 QA를 돌릴 수 없다. 이 경우 QA 실행 위치를 서버 내부의 self-hosted runner로 옮기게 되는데, 이때 **runner 실행 계정을 앱 실행 계정과 분리하는 것**이 중요하다. GitHub Actions의 shell 명령이 실제 서버에서 실행되기 때문에, QA 실행 계정이 앱 배포 디렉터리를 자유롭게 수정할 수 있으면 테스트 실패가 운영 파일 손상으로 이어질 수 있다.

## 핵심 포인트

- 앱 서버와 DB가 같은 서버에 있어도 첫 운영은 가능하지만, 백업과 롤백이 없으면 위험하다.
- 배포 산출물, 로그, PID, 재시작 스크립트의 기준 경로가 흩어져 있으면 장애 대응이 느려진다.
- 기존 JAR를 삭제하고 새 JAR만 올리는 배포는 롤백이 어렵다.
- Flyway는 편하지만 운영 DB를 직접 바꾸므로 배포 전 백업과 리뷰가 필요하다.
- GitHub Artifact는 스크린샷, 비디오, trace 같은 QA 증적 보관에 적합하다.
- QA 상태판은 증적 파일 저장소가 아니라 상태 추적용으로 쓰는 것이 좋다.
- 장기적으로는 앱 서버와 DB 서버 분리, Cloud DB 도입, 모니터링과 알림 체계가 필요하다.

## 관련 개념

- CI/CD
- Blue-Green Deployment
- Rollback Strategy
- Database Migration
- Flyway
- PostgreSQL Backup and Restore
- GitHub Actions Artifact
- SRE
