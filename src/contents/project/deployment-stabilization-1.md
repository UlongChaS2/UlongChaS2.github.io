---
title: '운영 배포 안정화기 (1) — 삭제 후 재업로드에서 벗어나기'
date: '2026-05-20'
category: 'project'
---

기존 JAR 삭제 후 재업로드 방식에서 생긴 불안정함을 계기로, 운영 경로 정리, 운영 디렉터리 이동, JAR rollback, health check, QA 증적까지 단계적으로 배포 안정성을 높인 기록이다.

## 시리즈 개요

이 글은 "일단 기존 JAR를 삭제하고 새 JAR를 올린 뒤 재시작한다" 수준의 배포에서 벗어나, 실패했을 때 원인을 빠르게 확인하고 이전 버전으로 되돌릴 수 있는 구조를 만드는 과정을 정리한다.

처음 문제는 단순한 배포 자동화 부족이 아니었다.

```text
기존 방식:
  기존 JAR 삭제
  새 JAR 업로드
  앱 재시작
```

이 방식에서 실제로 문제가 되었던 지점은 세 가지였다.

```text
1. 기존 JAR 삭제가 깔끔하게 되지 않은 적이 있었다.
2. 삭제와 재업로드 사이에 실패하면 이전 정상 JAR 기준이 애매해진다.
3. 빌드와 배포 과정에서 서버 용량 문제가 발생할 수 있었다.
```

그래서 먼저 배포 산출물, 로그, PID, 재시작 스크립트의 기준 경로를 정리했다. 서버 용량을 극적으로 줄인 작업은 아니지만, root/home 쪽에 계속 산출물을 쌓는 구조를 피하고 별도 운영 디렉터리로 기준을 모은 것이 중요했다.

핵심은 "용량을 얼마나 줄였는가"보다 "운영 파일을 어디에 쌓고, 장애 시 어디를 보면 되는가"였다.

## 왜 별도 운영 경로로 옮겼나

서버 디스크 용량을 바로 늘릴 수 있다면 증설이 가장 직접적인 해결책이다. 하지만 용량 증설이 어렵거나 승인 절차가 필요한 상황에서는 root 파티션을 계속 압박하지 않도록 앱 운영 파일을 별도 운영 경로로 모으는 편이 낫다.

```text
root/home 쪽에 계속 쌓는 구조:
  OS, 계정, 기본 도구가 쓰는 공간과 앱 산출물이 섞임
  루트 파티션 압박이 서버 전체 안정성에 영향을 줄 수 있음
  장애 시 어떤 파일을 지워도 되는지 판단이 어려움
  JAR, 로그, PID, 재시작 기준이 흩어지기 쉬움

별도 운영 디렉터리로 모으는 구조:
  앱 운영 파일의 책임 경계가 명확함
  releases, logs, pid, restart script를 한 기준 아래에서 관리 가능
  오래된 JAR와 로그 정리 정책을 붙이기 쉬움
  rollback 구조를 얹기 쉬움
```

즉 운영 경로 이동은 "공간 절약 작업"이라기보다 "root 파티션 리스크를 줄이고 운영 판단 기준을 정리한 작업"에 가깝다.

## 이 단계에서 다룬 주제

주제:

- 운영 파일 기준 경로 정리
- 루트 파티션 용량 부족 리스크
- 배포 JAR, 로그, PID, 재시작 스크립트 위치 통일
- 기존 JAR 삭제 후 재업로드 방식의 rollback 한계
- DB 백업과 복구 테스트 필요성
- GitHub Actions artifact와 QA 증적 관리
- `releases/current/previous` 구조
- 첫 정상 배포를 baseline으로 보는 방식
- `current.jar` symlink 기반 실행
- `previous` symlink 기반 rollback
- Actuator `liveness`와 `readiness` 분리
- readiness 실패 시 rollback 정책

핵심 메시지:

```text
1차 운영 전에는 화려한 CI/CD보다 백업, rollback, migration 안전장치, QA 증적이 먼저다.
JAR 파일을 삭제하고 새로 올리는 대신, 버전별 JAR를 보관하고 current 포인터만 바꿔야 rollback이 가능하다.
```

## 문제의 시작: 삭제 후 재업로드 방식

기존 방식은 대략 다음과 같았다.

```bash
rm -f /deploy/*.jar
scp app.jar server:/deploy/
java -jar /deploy/app.jar
```

처음에는 단순해 보이지만 운영에서는 다음 문제가 생긴다.

```text
기존 JAR 삭제 실패:
  오래된 파일이 남아 어떤 JAR가 실행 기준인지 헷갈릴 수 있음

기존 JAR 삭제 성공 + 새 JAR 업로드 실패:
  실행할 JAR가 사라지거나 이전 정상 파일 기준이 애매해짐

빌드/전송 중 용량 문제:
  root/home 쪽에 산출물과 로그가 쌓이면 배포 실패가 앱 문제가 아니라 디스크 문제로 발생할 수 있음

새 JAR 업로드 성공 + 재시작 실패:
  이전 정상 버전으로 즉시 돌아가기 어려움

새 JAR 실행 성공 + health 실패:
  앱은 떴지만 DB 또는 준비 상태가 비정상일 수 있음
```

핵심 문제는 "배포가 실패할 수 있다"가 아니다. 배포는 언제든 실패할 수 있다. 진짜 문제는 실패했을 때 되돌릴 기준이 없다는 점이다.

## 개선 방향: 삭제하지 말고 포인터를 바꾼다

개선된 방식은 JAR를 삭제하지 않는다.

```text
/opt/myapp/deploy/
  releases/
    app-version-a.jar
    app-version-b.jar
  current.jar -> releases/app-version-b.jar
  previous    -> releases/app-version-a.jar
```

배포할 때는 새 JAR를 `releases`에 추가하고, `current.jar`가 새 JAR를 가리키게 바꾼다.

```text
1. 새 JAR를 releases/에 업로드
2. 현재 current.jar 대상 JAR를 previous로 저장
3. current.jar를 새 JAR로 변경
4. 앱 재시작
5. liveness/readiness 확인
6. 실패 시 current.jar를 previous로 되돌림
7. 이전 JAR로 재시작
```

이 구조에서는 실제 실행 명령이 항상 일정해진다.

```bash
java -jar /opt/myapp/deploy/current.jar
```

실제 JAR 파일명은 매번 달라도 된다. 실행 기준은 `current.jar` 하나이고, rollback 기준은 `previous`다.

## Health Check 기준

배포 성공 여부는 하나의 `/health`로만 판단하면 애매해진다. 앱 프로세스 기동 실패와 DB 준비 실패가 섞이기 때문이다.

그래서 Actuator health check를 나눴다.

```text
liveness:
  JAR/Spring 앱이 정상 기동했는지 확인
  실패하면 새 JAR 기동 실패로 보고 rollback

readiness:
  DB를 포함해 요청 받을 준비가 되었는지 확인
  운영 기준에서는 실패 시 rollback
```

운영 기준으로는 readiness까지 성공해야 배포 성공으로 보는 것이 더 안전하다. 다만 특수 상황에서는 배포 정책 값으로 일시 우회할 수 있다.

## GitHub Actions와 격리망 배포에서의 의미

GitHub Actions는 배포 서버에 직접 접속할 수 있으면 SSH 배포까지 수행할 수 있다. 하지만 외부 네트워크에서 서버로 직접 접근할 수 없는 환경도 있다.

그래도 rollback 구조는 유효하다.

```text
인터넷 접근이 가능한 서버:
  GitHub Actions
  -> JAR build
  -> SSH upload
  -> current 변경
  -> restart
  -> health check
  -> rollback

외부 접근이 제한된 환경:
  GitHub Actions 또는 로컬에서 JAR build
  -> artifact 다운로드
  -> 반입 절차
  -> 서버 releases/에 업로드
  -> current 변경
  -> restart
  -> health check
  -> rollback
```

즉 GitHub Actions는 산출물 생성과 자동화를 담당하고, 서버 rollback 구조는 들어온 산출물을 안전하게 실행하는 역할을 한다. 둘은 대체 관계가 아니라 연결 관계다.

## 운영 주체가 분리된 환경에서의 변형

운영 통제가 강한 환경에서는 개발자가 배포 때마다 서버의 restart 스크립트를 덮어쓰는 방식을 허용하지 않을 수 있다.

그 경우 책임 경계는 이렇게 나뉜다.

```text
개발 측 관리:
  JAR 산출물
  릴리스 노트
  migration 스크립트
  QA 결과

운영 측 관리:
  서버 계정
  systemd 또는 restart 스크립트
  리버스 프록시/방화벽
  Java 설치 경로
  운영 DB 접속 정보
```

그래도 핵심 배포 모델은 유지할 수 있다.

```text
releases/
current.jar
previous
health check
rollback
```

차이는 restart 명령을 누가 소유하느냐이다.

## 현재까지 완료된 흐름

```text
1. 기존 삭제 후 재업로드 방식의 위험 확인
2. 삭제 실패와 용량 문제를 계기로 운영 경로 재정리
3. 배포 산출물, 로그, PID, restart 기준을 운영 디렉터리로 통일
4. releases/current/previous rollback 구조 설계
5. Actuator health endpoint 추가
6. liveness/readiness 분리
7. health endpoint 인증 예외 추가
8. deploy.sh에 liveness/readiness check 추가
9. readiness 실패 시 rollback하도록 기본 정책 강화
10. 정상 baseline 배포 확인
11. readiness UP으로 DB 포함 준비 상태 확인
12. restart 스크립트 원본을 scripts/server-restart.sh로 정리
13. server-restart.sh가 current.jar만 실행하도록 fallback 제거
```

## 현재 단계에서 멈춘 선

이번 단계에서는 배포 안정화 범위를 의도적으로 좁혔다.

```text
자동화한 것:
  JAR releases 보관
  current.jar 기준 실행
  previous 기반 JAR rollback
  liveness/readiness health check
  readiness 실패 시 JAR rollback
  서버 restart 스크립트 원본을 repo/scripts/server-restart.sh에서 관리

자동화하지 않은 것:
  DB 자동 restore
  복잡한 백업 보관 정책
  migration 위험도 자동 분석
  GitHub Actions 전체 배포 파이프라인
```

DB restore 자동화는 지금 단계에서는 과하다. 운영 DB는 배포 직후라도 사용자가 새 데이터를 입력할 수 있기 때문에, 자동 restore가 오히려 정상 데이터를 날릴 수 있다. 따라서 현재 결론은 "JAR rollback은 자동화하고, DB restore는 자동화하지 않는다"이다.

## 나중에 다시 볼 작업

### 1. DB 백업과 복구 테스트

JAR rollback은 애플리케이션 파일 rollback이다. DB schema나 데이터가 바뀌는 배포에서는 별도 백업이 필요할 수 있다. 다만 지금은 localhost에서 IDE 기반 restore 경험이 있고, 운영 DB restore 자동화까지 만들 단계는 아니다.

나중에 운영 DB와 migration 흐름이 확정되면 다음 정도만 검토한다.

```text
배포 전 pg_dump 파일 1개 남기기
백업 실패 시 배포 중단
운영 DB가 아닌 테스트 DB나 로컬 DB에 restore 연습
DB restore는 자동화하지 않고 수동 판단
```

### 2. Smoke test 연결

`liveness`와 `readiness`는 업무 기능 정상 여부를 보장하지 않는다. 특정 API에서 null 조건 오류가 나거나 화면이 깨지는 문제는 별도 smoke test가 필요하다.

최소 smoke 범위:

```text
로그인
주요 화면 진입
주요 조회 API
저장/수정 같은 핵심 플로우 일부
콘솔 에러 확인
```

### 3. GitHub Actions artifact 배포

최종적으로는 GitHub Actions에서 JAR artifact를 만들고, 환경에 따라 자동 SSH 배포 또는 수동 반입 배포를 선택할 수 있게 한다.

```text
빌드 자동화:
  GitHub Actions artifact

인터넷 접근 가능 서버:
  SSH deploy

외부 접근이 제한된 서버:
  artifact 반입 후 서버 deploy
```

## 정리

기존 배포는 원격 서버의 JAR를 삭제한 뒤 새 JAR를 다시 올리는 방식이었다. 이 과정에서 삭제가 깔끔하게 되지 않거나, 빌드/전송 중 서버 용량 문제가 생기면 어떤 JAR가 실제 실행 기준인지 불명확해질 수 있었다. 단순히 파일 몇 개를 옮긴다고 전체 용량이 크게 줄어드는 것은 아니지만, root 파티션에 배포 산출물과 로그를 계속 쌓는 구조는 운영상 위험하다고 판단했다. 그래서 애플리케이션 산출물, 로그, PID, 재시작 스크립트의 기준을 별도 운영 디렉터리로 모으고, 이후 releases/current/previous 기반 rollback 구조를 붙였다.

## 핵심 결론

- 기존 JAR를 삭제하고 새 JAR를 올리는 방식은 단순하지만 rollback 기준을 잃기 쉽다.
- 삭제 실패, 전송 실패, 용량 문제는 모두 "운영 기준 경로가 불명확한 배포"에서 더 크게 터진다.
- 디스크 용량을 바로 늘릴 수 없다면 root를 계속 압박하지 않도록 앱 운영 파일을 전용 경로로 모으는 편이 낫다.
- 운영 배포에서 중요한 것은 "성공했을 때"보다 "실패했을 때 되돌릴 수 있는가"이다.
- `releases/current/previous` 구조는 수동 배포, GitHub Actions 배포, 반입 배포 모두에 적용할 수 있다.
- `liveness`는 앱 기동 확인, `readiness`는 DB 포함 준비 상태 확인이다.
- readiness까지 성공해야 운영 배포 성공으로 보는 것이 더 안전하다.
- GitHub Actions artifact는 산출물 생성 수단이고, 서버 rollback 구조는 산출물 실행 안전장치다.

## 다음 편

다음 편에서는 이 배포 기반 위에 CI/CD와 QA 파이프라인을 붙인다.

주제:

- GitHub Actions 기반 QA 실행 흐름
- GitHub-hosted runner 접근 제한과 self-hosted runner 도입
- 앱 실행 계정과 runner 계정 분리
- Playwright 실행 환경, 브라우저 캐시, OS dependency 정리
- 인증서 만료, 포트, 리버스 프록시, 방화벽 트러블슈팅
- 실패 이슈 생성은 QA 안정화 이후 다시 켜는 전략
- 나중에 CD runner를 붙일 때 배포 전용 계정으로 권한을 분리하는 방향

핵심 메시지:

```text
CI/CD + QA 파이프라인은 workflow 파일 하나가 아니라 실행 위치, 계정 권한, 네트워크, 인증서, 디스크, rollback 기준이 연결된 운영 구조다.
```
