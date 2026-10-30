---
title: '운영 배포 안정화기 (1) - 삭제 후 재업로드에서 벗어나기'
date: '2026-05-28'
category: 'project'
keywords: ['배포', '롤백', 'Infra']
---

> 기존 JAR를 삭제하고 새로 올리는 배포에서 생긴 불안정함을 계기로, 운영 경로 정리부터 JAR rollback과 health check까지 단계적으로 배포 안정성을 높인 기록입니다

<!--more-->

## 개요

운영 중인 서비스의 배포는 "기존 JAR를 삭제하고 새 JAR를 올린 뒤 재시작한다" 수준이었습니다. 몇 번 아슬아슬한 상황을 겪고 나서, 실패했을 때 원인을 빠르게 확인하고 이전 버전으로 되돌릴 수 있는 구조로 바꿨습니다

처음에 문제라고 생각한 건 단순한 배포 자동화 부족이었는데, 실제로 걸린 지점은 달랐습니다

```text
기존 방식:
  기존 JAR 삭제
  새 JAR 업로드
  앱 재시작
```

여기서 실제로 문제가 된 건 세 가지였습니다. 기존 JAR 삭제가 깔끔하게 되지 않은 적이 있었고, 삭제와 재업로드 사이에 실패하면 이전 정상 JAR 기준이 애매해졌습니다. 그리고 빌드와 배포 과정에서 서버 용량 문제가 생길 수 있었습니다

그래서 먼저 배포 산출물, 로그, PID, 재시작 스크립트의 기준 경로를 정리했습니다. 서버 용량을 극적으로 줄인 작업은 아니지만, root나 home 쪽에 계속 산출물을 쌓는 구조를 피하고 별도 운영 디렉터리로 기준을 모은 것이 중요했습니다

핵심은 "용량을 얼마나 줄였는가"보다 **"운영 파일을 어디에 쌓고, 장애 시 어디를 보면 되는가"**였습니다

## 왜 별도 운영 경로로 옮겼나

서버 디스크 용량을 바로 늘릴 수 있다면 증설이 가장 직접적인 해결책입니다. 하지만 용량 증설이 어렵거나 승인 절차가 필요한 상황에서는, root 파티션을 계속 압박하지 않도록 앱 운영 파일을 별도 경로로 모으는 편이 낫습니다

root나 home 쪽에 계속 쌓으면 OS·계정·기본 도구가 쓰는 공간과 앱 산출물이 섞입니다. 루트 파티션 압박이 서버 전체 안정성에 영향을 줄 수 있고, 장애가 나도 어떤 파일을 지워도 되는지 판단하기 어렵습니다. JAR, 로그, PID, 재시작 기준이 흩어지는 것도 문제였습니다

별도 운영 디렉터리로 모으면 앱 운영 파일의 책임 경계가 명확해집니다. releases, logs, pid, restart script를 한 기준 아래에서 관리할 수 있고, 오래된 JAR와 로그 정리 정책을 붙이기 쉬워집니다. 무엇보다 rollback 구조를 얹기 쉬워집니다

즉 운영 경로 이동은 "공간 절약 작업"이라기보다 **root 파티션 리스크를 줄이고 운영 판단 기준을 정리한 작업**에 가까웠습니다

## 문제의 시작: 삭제 후 재업로드 방식

기존 방식은 대략 이랬습니다

```bash
rm -f /deploy/*.jar
scp app.jar server:/deploy/
java -jar /deploy/app.jar
```

단순해 보이지만 운영에서는 단계마다 문제가 생깁니다

```text
기존 JAR 삭제 실패
  오래된 파일이 남아 어떤 JAR가 실행 기준인지 헷갈릴 수 있음

삭제 성공 + 새 JAR 업로드 실패
  실행할 JAR가 사라지거나 이전 정상 파일 기준이 애매해짐

빌드/전송 중 용량 문제
  root/home 쪽에 산출물과 로그가 쌓이면
  배포 실패가 앱 문제가 아니라 디스크 문제로 발생

업로드 성공 + 재시작 실패
  이전 정상 버전으로 즉시 돌아가기 어려움

실행 성공 + health 실패
  앱은 떴지만 DB 또는 준비 상태가 비정상일 수 있음
```

핵심 문제는 "배포가 실패할 수 있다"가 아니었습니다. 배포는 언제든 실패할 수 있습니다. 진짜 문제는 **실패했을 때 되돌릴 기준이 없다**는 점이었습니다

## 개선 방향: 삭제하지 말고 포인터를 바꾼다

개선한 방식은 JAR를 삭제하지 않습니다

```text
/opt/myapp/deploy/
  releases/
    app-version-a.jar
    app-version-b.jar
  current.jar -> releases/app-version-b.jar
  previous    -> releases/app-version-a.jar
```

배포할 때는 새 JAR를 `releases`에 추가하고, `current.jar`가 새 JAR를 가리키게 바꿉니다

```text
1. 새 JAR를 releases/에 업로드
2. 현재 current.jar 대상 JAR를 previous로 저장
3. current.jar를 새 JAR로 변경
4. 앱 재시작
5. liveness/readiness 확인
6. 실패 시 current.jar를 previous로 되돌림
7. 이전 JAR로 재시작
```

이 구조에서는 실제 실행 명령이 항상 일정해집니다

```bash
java -jar /opt/myapp/deploy/current.jar
```

실제 JAR 파일명은 매번 달라도 됩니다. 실행 기준은 `current.jar` 하나이고, rollback 기준은 `previous`입니다

## Health Check 기준

배포 성공 여부를 하나의 `/health`로만 판단하면 애매해집니다. 앱 프로세스 기동 실패와 DB 준비 실패가 섞이기 때문입니다

그래서 Actuator health check를 나눴습니다. `liveness`는 JAR와 Spring 앱이 정상 기동했는지 확인하고, 실패하면 새 JAR 기동 실패로 보고 rollback합니다. `readiness`는 DB를 포함해 요청 받을 준비가 됐는지 확인하고, 운영 기준에서는 실패 시 rollback합니다

운영 기준으로는 readiness까지 성공해야 배포 성공으로 보는 것이 더 안전했습니다. 다만 특수 상황에서는 배포 정책 값으로 일시 우회할 수 있게 뒀습니다

## 운영 주체가 분리된 환경에서의 변형

운영 통제가 강한 환경에서는 개발자가 배포 때마다 서버의 restart 스크립트를 덮어쓰는 방식을 허용하지 않을 수 있습니다

그 경우 책임 경계가 이렇게 나뉩니다

```text
개발 측 관리:          운영 측 관리:
  JAR 산출물             서버 계정
  릴리스 노트            systemd 또는 restart 스크립트
  migration 스크립트     리버스 프록시/방화벽
  QA 결과                Java 설치 경로, 운영 DB 접속 정보
```

그래도 핵심 배포 모델(`releases`, `current.jar`, `previous`, health check, rollback)은 그대로 유지할 수 있습니다. 차이는 restart 명령을 누가 소유하느냐뿐입니다

## 여기까지 한 일

작업을 세 덩어리로 정리하면 이렇게 됩니다

**운영 경로 정리**

삭제 실패와 용량 문제를 계기로 배포 산출물·로그·PID·restart 기준을 별도 운영 디렉터리로 통일했습니다. restart 스크립트 원본도 `scripts/server-restart.sh`로 옮겨 저장소에서 관리하고, `current.jar`만 실행하도록 fallback을 제거했습니다

**rollback 구조**

`releases/current/previous` 구조를 설계하고 첫 정상 배포를 baseline으로 잡았습니다. `current.jar` symlink로 실행하고, 문제가 생기면 `previous`로 되돌립니다

**health check**

Actuator health endpoint를 추가하고 liveness와 readiness를 분리했습니다. health endpoint는 인증 예외로 열어두고, `deploy.sh`에서 두 check를 모두 확인합니다. readiness가 실패하면 rollback하도록 기본 정책을 강화했습니다. 실제로 readiness UP으로 DB 포함 준비 상태까지 확인했습니다

## 여기서 멈춘 선

이번 단계에서는 배포 안정화 범위를 의도적으로 좁혔습니다

```text
자동화한 것:                      자동화하지 않은 것:
  JAR releases 보관                 DB 자동 restore
  current.jar 기준 실행             복잡한 백업 보관 정책
  previous 기반 rollback            migration 위험도 자동 분석
  liveness/readiness check          GitHub Actions 전체 배포 파이프라인
  readiness 실패 시 rollback
```

DB restore 자동화는 이 단계에서는 과하다고 판단했습니다. 운영 DB는 배포 직후라도 사용자가 새 데이터를 입력할 수 있어서, 자동 restore가 오히려 정상 데이터를 날릴 수 있기 때문입니다. 그래서 **JAR rollback은 자동화하고, DB restore는 자동화하지 않는다**로 결론을 냈습니다

## 나중에 다시 볼 작업

**DB 백업과 복구 테스트** — JAR rollback은 애플리케이션 파일 rollback입니다. DB schema나 데이터가 바뀌는 배포에서는 별도 백업이 필요할 수 있습니다. 지금은 localhost에서 IDE 기반 restore 경험만 있고, 운영 DB restore 자동화까지 만들 단계는 아닙니다. 나중에 운영 DB와 migration 흐름이 확정되면 배포 전 `pg_dump` 파일 하나 남기기, 백업 실패 시 배포 중단, 테스트 DB에 restore 연습 정도를 검토할 생각입니다

**Smoke test 연결** — liveness와 readiness는 업무 기능 정상 여부를 보장하지 않습니다. 특정 API에서 null 조건 오류가 나거나 화면이 깨지는 문제는 별도 smoke test가 필요합니다. 최소 범위는 로그인, 주요 화면 진입, 주요 조회 API, 저장/수정 같은 핵심 플로우, 콘솔 에러 확인 정도로 잡고 있습니다

**GitHub Actions artifact 배포** — 아직 붙이지 않았지만, rollback 구조를 설계할 때 나중에 이걸 얹는 상황까지 고려했습니다. GitHub Actions는 배포 서버에 직접 접속할 수 있으면 SSH 배포까지 수행할 수 있는데, 외부 네트워크에서 서버로 직접 접근할 수 없는 환경도 있습니다. 그래도 지금 만든 rollback 구조는 양쪽 모두에서 유효합니다

```text
인터넷 접근이 가능한 서버:
  GitHub Actions -> JAR build -> SSH upload
  -> current 변경 -> restart -> health check -> rollback

외부 접근이 제한된 환경:
  GitHub Actions 또는 로컬에서 JAR build -> artifact 다운로드
  -> 반입 절차 -> 서버 releases/에 업로드
  -> current 변경 -> restart -> health check -> rollback
```

GitHub Actions는 산출물 생성과 자동화를 담당하고, 서버 rollback 구조는 들어온 산출물을 안전하게 실행하는 역할입니다. 둘은 대체 관계가 아니라 연결 관계라서, 지금 단계에서 rollback 쪽을 먼저 만들어둔 것이 나중에 헛일이 되지 않습니다

## 정리

- 기존 JAR를 삭제하고 새 JAR를 올리는 방식은 단순하지만 rollback 기준을 잃기 쉽습니다
- 삭제 실패, 전송 실패, 용량 문제는 모두 "운영 기준 경로가 불명확한 배포"에서 더 크게 터집니다
- 디스크 용량을 바로 늘릴 수 없다면 root를 계속 압박하지 않도록 앱 운영 파일을 전용 경로로 모으는 편이 낫습니다
- 운영 배포에서 중요한 것은 "성공했을 때"보다 **"실패했을 때 되돌릴 수 있는가"**입니다
- `releases/current/previous` 구조는 수동 배포, GitHub Actions 배포, 반입 배포 모두에 적용할 수 있습니다
- `liveness`는 앱 기동 확인, `readiness`는 DB 포함 준비 상태 확인입니다. readiness까지 성공해야 운영 배포 성공으로 보는 것이 더 안전합니다
- GitHub Actions artifact는 산출물 생성 수단이고, 서버 rollback 구조는 산출물 실행 안전장치입니다

다음 편에서는 이 배포 기반 위에 CI/CD와 QA 파이프라인을 붙인 과정을 정리했습니다. workflow 파일 하나로 끝나는 일이 아니라 실행 위치, 계정 권한, 네트워크, 인증서, 디스크, rollback 기준이 전부 연결된 작업이었습니다
