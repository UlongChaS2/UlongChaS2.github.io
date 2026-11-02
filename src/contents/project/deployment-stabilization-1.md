---
title: '운영 배포 안정화기 (1) - 삭제 후 재업로드에서 벗어나기'
date: '2026-05-28'
category: 'project'
keywords: ['배포', '롤백', 'Infra']
---

> 기존 JAR를 삭제하고 새 JAR를 올리는 배포 과정에서 생긴 불안정함을 계기로, 운영 경로 정리부터 JAR rollback과 health check까지 단계적으로 배포 안정성을 높인 기록입니다

<!--more-->

## 개요

AI로 개발 방식이 바뀌면서 프로젝트 하나를 혼자 맡게 됐습니다. 그동안은 화면 개발만 했는데, 혼자 맡다 보니 배포까지 제가 챙겨야 했고 이 부분도 같이 공부하게 됐습니다

운영 중인 서비스의 배포는 "기존 JAR를 삭제하고 새 JAR를 올린 뒤 재시작한다" 수준이었습니다. 몇 번 아슬아슬한 상황을 겪고 나서, 실패했을 때 원인을 빠르게 확인하고 이전 버전으로 되돌릴 수 있는 구조로 바꿨습니다

처음에 문제라고 생각한 건 단순한 배포 자동화 부족이었는데, 실제로 걸린 지점은 달랐습니다

```text
기존 방식:
  기존 JAR 삭제
  새 JAR 업로드
  앱 재시작
```

여기서 실제로 문제가 된 건 세 가지였습니다. 기존 JAR 삭제가 깔끔하게 되지 않은 적이 있었고, 삭제와 재업로드 사이에 실패하면 이전 정상 JAR 기준이 애매해졌습니다. 그리고 빌드와 배포 과정에서 서버 용량 문제가 생길 수 있었습니다

그래서 먼저 배포 산출물, 로그, PID, 재시작 스크립트의 기준 경로를 정리했습니다. 서버 용량을 크게 줄인 작업은 아니지만, root나 home 쪽에 계속 산출물을 쌓는 구조를 피하고 별도 운영 디렉터리로 기준을 모은 것이 중요했습니다

용량을 얼마나 줄였는지보다, 운영 파일을 어디에 쌓고 장애가 나면 어디를 볼지 정하는 게 먼저였습니다

## 왜 별도 운영 경로로 옮겼나

서버 디스크를 바로 늘릴 수 있다면 증설이 가장 확실합니다. 다만 증설이 어려울때는 root 파티션을 계속 채우지 않도록 앱 운영 파일을 별도 경로로 모으는 쪽이 낫다고 판단했습니다

root나 home 쪽에 계속 쌓으면 OS·계정·기본 도구가 쓰는 공간과 앱 산출물이 섞입니다. root 파티션 압박이 서버 전체 안정성에 영향을 줄 수 있고, 장애가 나도 어떤 파일을 지워도 되는지 판단하기 어렵습니다. JAR, 로그, PID, 재시작 기준이 흩어지는 것도 문제였습니다

별도 운영 디렉터리로 모으면 앱 운영 파일의 책임 경계가 명확해집니다. releases, logs, pid, restart script를 한 기준 아래에서 관리할 수 있고, 오래된 JAR와 로그 정리 정책을 붙이기 쉬워집니다. 무엇보다 rollback 구조를 얹기 쉬워집니다

## 문제의 시작점 - 삭제 후 재업로드 방식

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

배포는 언제든 실패할 수 있습니다. 문제는 실패했을 때 되돌릴 기준이 없다는 점이었습니다

## 개선 방향 - 삭제하지 말고 포인터를 바꾼다

개선한 방식은 JAR를 삭제하지 않습니다

```text
/opt/myapp/deploy/
  releases/
    app-version-a.jar
    app-version-b.jar
  current.jar -> releases/app-version-b.jar
  previous    -> releases/app-version-a.jar
```

배포할 때는 새 JAR를 `releases`에 넣고, `current.jar`가 새 JAR를 가리키도록 바꿉니다

```text
1. 새 JAR를 releases/에 업로드
2. 현재 current.jar가 가리키는 JAR를 previous로 저장
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

## Health check 기준

배포 성공 여부를 하나의 `/health`로만 판단하면 애매해집니다. 앱 프로세스 기동 실패와 DB 준비 실패가 섞이기 때문입니다

그래서 Actuator health check를 나눴습니다. `liveness`는 JAR와 Spring 앱이 정상 기동했는지 확인하고, 실패하면 새 JAR 기동 실패로 보고 rollback합니다. `readiness`는 DB를 포함해 요청을 받을 준비가 됐는지 확인하고, 운영 기준에서는 실패 시 rollback합니다

운영 기준으로는 readiness까지 성공해야 배포 성공으로 보는 것이 더 안전했습니다. 다만 특수 상황에서는 배포 정책 값으로 일시 우회할 수 있게 뒀습니다

## 운영 주체가 분리된 환경에서의 변형

운영 통제가 강한 환경에서는 개발자가 배포 때마다 서버의 restart 스크립트를 덮어쓰는 방식을 허용하지 않을 수 있습니다

그 경우 책임 경계가 이렇게 나뉩니다

| 개발 측이 관리 | 운영 측이 관리 |
| --- | --- |
| JAR 산출물 | 서버 계정 |
| 릴리스 노트 | systemd 또는 restart 스크립트 |
| migration 스크립트 | 리버스 프록시, 방화벽 |
| QA 결과 | Java 설치 경로, 운영 DB 접속 정보 |

이렇게 나뉘어도 배포 구조(`releases`, `current.jar`, `previous`, health check, rollback)는 그대로 쓸 수 있습니다. 달라지는 건 restart 명령을 누가 관리하느냐뿐입니다

## 실제로 바꾼 것

위 구조를 실제 서버에 옮기면서 손댄 곳은 생각보다 자잘했습니다. 서버에만 있던 restart 스크립트를 `scripts/server-restart.sh`로 저장소에 가져왔고, 예전 JAR를 찾아 실행하던 fallback은 지웠습니다. 이제 서버는 `current.jar`만 실행합니다

rollback은 기준이 될 정상 버전이 하나는 있어야 해서, 구조를 바꾼 뒤 처음 성공한 배포를 baseline으로 잡았습니다

health check는 Actuator endpoint를 추가하고 인증 예외로 열어뒀습니다. `deploy.sh`가 liveness와 readiness를 둘 다 확인하고, readiness가 실패해도 rollback하게 바꿨습니다. 실제로 readiness가 UP으로 돌아오는 걸 보고 나서야 DB까지 붙은 상태라는 게 확인됐습니다

## DB까지 되돌리지는 않았습니다

여기까지 하고 나니 DB도 같이 되돌리면 좋겠다는 생각이 들었습니다. 그런데 운영 DB는 배포 직후에도 사용자가 새 데이터를 넣을 수 있어서, 자동 restore를 붙이면 오히려 정상 데이터를 날릴 수 있겠다 싶었습니다

그래서 JAR rollback까지만 자동으로 하고, DB restore는 자동화하지 않았습니다. 백업 보관 정책이나 migration 위험도 분석, GitHub Actions 배포 파이프라인도 이번 범위에서는 뺐습니다

## 아직 남은 것

DB 백업은 계속 마음에 걸립니다. JAR rollback은 애플리케이션 파일만 되돌리기 때문에, schema나 데이터가 바뀌는 배포에서는 따로 백업이 필요할 수 있습니다. 저는 아직 localhost에서 IDE로 restore해 본 경험밖에 없어서, 운영 DB와 migration 흐름이 정해지면 배포 전에 `pg_dump` 하나 남기고, 백업이 실패하면 배포를 멈추고, 테스트 DB에 restore를 연습해 보는 정도부터 해보려고 합니다

liveness와 readiness가 UP이어도 업무 기능이 멀쩡하다는 뜻은 아니었습니다. 특정 API가 null 조건으로 터지거나 화면이 깨지는 건 health check로는 안 잡혀서, 로그인과 주요 화면 진입, 주요 조회와 저장 정도는 smoke test로 확인하고 싶습니다

GitHub Actions로 배포하는 것도 아직입니다. 다만 rollback 구조를 만들 때 나중에 이걸 얹는 상황은 생각해 뒀습니다. 서버에 바로 접속할 수 있는 환경이면 Actions가 SSH로 올리면 되고, 외부 접근이 막힌 환경이면 artifact를 받아 반입 절차를 거쳐 `releases/`에 올리면 됩니다

```text
인터넷 접근이 가능한 서버:
  GitHub Actions -> JAR build -> SSH upload
  -> current 변경 -> restart -> health check -> rollback

외부 접근이 제한된 환경:
  GitHub Actions 또는 로컬에서 JAR build -> artifact 다운로드
  -> 반입 절차 -> 서버 releases/에 업로드
  -> current 변경 -> restart -> health check -> rollback
```

어느 쪽이든 마지막은 같은 rollback 구조 위에서 돕니다. 그래서 이번에 먼저 만들어 둔 게 나중에 헛일이 되지는 않겠다고 생각했습니다

## 핵심 포인트

- 기존 JAR를 삭제하고 새 JAR를 올리는 방식은 단순하지만, rollback 기준을 잃기 쉽습니다
- 삭제 실패, 전송 실패, 용량 문제는 모두 운영 기준 경로가 불명확한 배포에서 더 크게 터집니다
- 디스크 용량을 바로 늘릴 수 없다면, root를 계속 압박하지 않도록 앱 운영 파일을 전용 경로로 모으는 편이 낫습니다
- 운영 배포에서는 성공했을 때보다 실패했을 때 되돌릴 수 있는지를 먼저 봐야 했습니다
- `releases/current/previous` 구조는 수동 배포, GitHub Actions 배포, 반입 배포 모두에 적용할 수 있습니다
- `liveness`는 앱 기동 확인, `readiness`는 DB를 포함한 준비 상태 확인입니다. readiness까지 성공해야 운영 배포 성공으로 보는 것이 더 안전합니다
- GitHub Actions artifact는 산출물 생성 수단이고, 서버의 rollback 구조는 산출물 실행 안전장치입니다

다음 편에서는 이 배포 기반 위에 CI/CD와 QA 파이프라인을 붙인 과정을 정리했습니다. 실행 위치, 계정 권한, 네트워크, 인증서, 디스크, rollback 기준을 하나씩 맞춰야 해서 workflow 파일 하나로는 끝나지 않았습니다
