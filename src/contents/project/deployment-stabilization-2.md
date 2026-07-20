---
title: '운영 배포 안정화기 (2) — CI/CD와 QA 파이프라인 붙이기'
date: '2026-05-27'
category: 'project'
---

없던 CI/CD + QA 운영 파이프라인을 만들기 위해, JAR 롤백 구조 위에 GitHub Actions, self-hosted runner, Playwright QA, 실패 증적 수집 흐름을 단계적으로 붙인 기록이다.

## 이 문서의 위치

1편에서는 운영 서버의 배포 기준을 정리했다.

```text
1편에서 정리한 것
- root/home에 흩어진 배포 산출물 문제
- 별도 운영 경로 기준 정리
- releases/current.jar/previous 기반 JAR rollback
- Actuator liveness/readiness health check
- restart.sh와 deploy.sh의 역할 정리
```

2편에서는 그 위에 **CI/CD + QA 자동화 흐름**을 얹는다.

```text
2편에서 다루는 것
- GitHub Actions로 QA를 실행하는 구조
- GitHub-hosted runner가 막힌 이유
- self-hosted runner를 기존 서버에 설치한 이유
- runner 계정과 앱 실행 계정 분리
- Playwright 실행 환경 구성
- 인증서, 포트, 리버스 프록시, 방화벽 문제
- 실패 이슈 생성은 언제 켜야 하는지
- 나중에 CD runner를 붙인다면 어떻게 나눌지
```

## 왜 CI/CD + QA 파이프라인이 필요했나

기존에는 배포와 QA가 느슨하게 연결되어 있었다.

```text
기존 흐름
1. 로컬에서 JAR 빌드
2. 서버에 JAR 업로드
3. 서버에서 앱 재시작
4. 사람이 화면 확인
5. 문제가 생기면 로그를 직접 확인
```

이 흐름은 간단하지만 다음 문제가 있다.

```text
문제
- 어떤 JAR가 실제 실행 기준인지 애매해질 수 있음
- 배포 실패 시 이전 버전으로 즉시 돌아가기 어려움
- 앱이 떴는지와 DB 준비가 되었는지 구분하기 어려움
- QA 결과가 기록으로 남지 않음
- 실패 화면, trace, 로그가 구조적으로 보관되지 않음
- 나중에 배포 자동화를 붙이려 해도 권한 기준이 없음
```

그래서 목표를 다음처럼 잡았다.

```text
목표
1. 배포 산출물은 rollback 가능하게 보관한다.
2. 배포 성공 여부는 liveness/readiness로 판단한다.
3. 배포 후 최소 QA는 GitHub Actions에서 실행한다.
4. 접근 제한 때문에 GitHub-hosted runner가 안 되면 self-hosted runner를 쓴다.
5. QA 실패 증적은 artifact로 남긴다.
6. 테스트 안정화 전에는 GitHub Issue 자동 생성은 잠시 꺼둔다.
7. 나중에 CD까지 붙일 수 있도록 QA 권한과 배포 권한을 분리한다.
```

## 전체 목표 구조

현재 만들고 있는 구조는 다음과 같다.

```text
GitHub Repository
  ├─ application / backend modules
  ├─ client / Playwright E2E tests
  ├─ .github/workflows/qa-after-deploy.yml
  └─ Repository secrets
       ├─ QA_BASE_URL
       ├─ QA_USERNAME
       └─ QA_PASSWORD

GitHub Actions
  └─ QA After Deploy
       ├─ checkout
       ├─ setup-node
       ├─ npm ci
       ├─ Playwright Chromium install
       ├─ target reachability check
       ├─ Playwright E2E
       └─ artifact upload

app-dev server
  ├─ appuser
  │    └─ 앱 실행/배포 기준 계정
  ├─ qarunner
  │    └─ QA self-hosted runner 계정
  ├─ /opt/myapp
  │    └─ deploy, releases, current.jar, previous, logs, app.pid
  └─ /opt/myapp-github-runner
       └─ actions-runner, _work, .npm, .cache
```

실행 흐름은 다음과 같다.

```text
GitHub Actions
  ↓ job 전달
app-dev 내부 self-hosted runner
  ↓ Playwright 실행
https://app.example.com
  ↓
Nginx 443
  ↓
Spring Boot 127.0.0.1:8080
```

여기서 중요한 점은 GitHub가 서버로 SSH 접속하는 것이 아니라는 점이다. 서버 안의 runner 프로세스가 GitHub로 outbound 연결을 맺고, GitHub가 job을 내려주면 그 job을 서버 안에서 실행한다.

## GitHub-hosted runner가 아니라 self-hosted runner를 쓴 이유

처음에는 GitHub-hosted runner로 QA를 돌리려 했다. 하지만 운영 서버의 HTTPS 접근이 source IP 기준으로 제한되어 있었기 때문에 GitHub-hosted runner가 접근하지 못했다.

증상:

```text
curl: (28) Failed to connect to app.example.com port 443
```

원인:

```text
GitHub-hosted runner
- GitHub가 제공하는 외부 임시 VM
- 실행 IP를 고정 운영하기 어려움
- 서버 보안 그룹/방화벽 접근 제한에 걸림
```

해결 방향:

```text
self-hosted runner
- 운영 서버 내부에서 실행
- 외부 IP 제한 문제를 피할 수 있음
- 내부 네트워크에서 QA 대상에 접근 가능
```

그래서 기존 `app-dev` 서버 안에 QA runner를 설치했다. 서버를 새로 만들면 비용과 권한 문제가 생기므로, 현재는 서버 1대 안에서 계정만 분리하는 방식으로 시작했다.

## 서버는 하나, 계정은 분리

현재 서버는 하나만 사용한다. 하지만 계정은 역할에 따라 나눈다.

```text
appuser
- 앱 실행 계정
- JAR 배포 기준 계정
- /opt/myapp 관리

qarunner
- GitHub Actions QA 실행 계정
- /opt/myapp-github-runner 관리
- 앱 배포 디렉터리 쓰기 권한 없음
```

이렇게 나누는 이유는 self-hosted runner가 workflow의 shell 명령을 실제 서버에서 실행하기 때문이다.

만약 runner를 `appuser`로 돌리면 GitHub Actions에서 다음 같은 명령도 가능해진다.

```bash
rm -rf /opt/myapp/deploy
kill $(cat /opt/myapp/app.pid)
ln -sfn wrong.jar /opt/myapp/deploy/current.jar
```

즉 QA workflow 실수가 앱 운영 파일 손상으로 이어질 수 있다.

그래서 QA는 낮은 권한 계정으로 실행한다.

```text
QA runner가 할 수 있어야 하는 것
- checkout
- npm ci
- Playwright 실행
- artifact 생성

QA runner가 하지 못해야 하는 것
- current.jar 변경
- previous 변경
- 앱 프로세스 kill
- deploy/releases 삭제
- restart.sh 실행
```

혼자 운영하더라도 이 분리는 의미가 있다. 사람을 나누기 위한 분리가 아니라, 실수의 영향 범위를 줄이기 위한 분리다.

## CI, QA, CD를 어떻게 나눌 것인가

지금 만든 것은 우선 QA 실행 구조다. CI/CD 전체를 한 번에 완성한 것이 아니다.

단계는 다음처럼 나누는 것이 맞다.

```text
1단계: QA runner
- Playwright 실행
- artifact 업로드
- 실패 원인 수집
- 낮은 권한으로 충분

2단계: CI artifact build
- GitHub Actions에서 Gradle build
- JAR artifact 생성
- 산출물 보관

3단계: CD runner
- artifact를 서버 releases에 배치
- current.jar 변경
- restart.sh 실행
- health check
- 실패 시 rollback
```

QA와 CD의 권한은 다르다.

```text
QA 실패
- 테스트 실패
- artifact 확인
- 서비스에 직접 영향 없음

CD 실패
- 실제 앱 재시작 실패 가능
- current.jar가 잘못 바뀔 수 있음
- 서비스 중단 가능
- rollback 필요
```

그래서 나중에 CD까지 붙이면 `qarunner`를 그대로 쓰지 않고 별도 계정을 둔다.

```text
qarunner
- QA 전용
- label: myapp-qa

deployer
- 배포 전용
- label: myapp-deploy
```

즉 runner를 또 만든다는 말은 서버를 또 만든다는 뜻이 아니다. 같은 서버 안에서 계정과 label을 나눠서, QA workflow와 deploy workflow가 서로 다른 권한으로 실행되게 만드는 것이다.

## Playwright QA workflow 구성

현재 QA workflow는 다음 순서로 실행된다.

```text
1. Checkout
2. Wait after deploy
3. Setup Node 22.14.0
4. npm ci
5. npx playwright install chromium
6. QA target reachability check
7. npm run test:e2e
8. Playwright artifact upload
```

처음에는 실패 시 GitHub Issue를 자동 생성하게 했다.

```text
실패 시:
- qa:failed label 생성
- backend/frontend/triage 분류
- assignee 매핑
- artifact 링크 포함 이슈 생성
```

하지만 self-hosted runner와 테스트 환경이 아직 안정화되지 않은 상태에서는 실패할 때마다 불필요한 이슈가 생겼다. 그래서 현재는 이슈 생성 step을 잠시 꺼두었다.

```yaml
- name: Create QA failure issue
  if: false
```

지금 단계에서는 실패 증적을 Issue가 아니라 artifact와 로그로 먼저 확인한다.

```text
안정화 전:
- 이슈 생성 비활성화
- artifact 확인
- trace/screenshot/log로 원인 파악

안정화 후:
- 실패 이슈 생성 재활성화
- 성공 시 기존 실패 이슈 자동 종료
```

## 운영 네트워크 개념 정리

이번 작업에서 포트와 라우팅에 대한 이해가 필요했다.

```text
443
- HTTPS 표준 포트
- 외부 사용자가 도메인으로 접근하는 입구
- Nginx가 받음

80
- HTTP 표준 포트
- Playwright QA에는 직접 필요하지 않음
- Let's Encrypt HTTP-01 인증서 갱신에 필요

애플리케이션 내부 포트
- Spring Boot 앱이 로컬에서 listen하는 포트
- Nginx가 443 요청을 받아 127.0.0.1의 내부 포트로 프록시
```

방화벽(보안 그룹)과 Nginx의 역할도 다르다.

```text
방화벽/보안 그룹
- source IP와 port 기준으로 허용/차단
- domain을 보고 판단하지 않음

Nginx
- 443으로 들어온 요청의 Host header를 보고 서비스 분기
- app.example.com -> 127.0.0.1:8080
- 다른 도메인 -> 다른 내부 포트
```

따라서 방화벽 규칙 설명에 특정 프로젝트명이 적혀 있어도, 기술적으로는 해당 source IP가 서버의 443으로 들어올 수 있다는 뜻이다. 실제 어떤 서비스로 갈지는 Nginx가 domain 기준으로 결정한다.

## 트러블슈팅 1 - HTTPS 인증서 만료

self-hosted runner를 구성한 뒤 서버에서 curl을 확인했을 때 다음 에러가 났다.

```text
curl: (60) SSL certificate problem: certificate has expired
```

인증서 날짜를 확인했다.

```bash
echo | openssl s_client -servername app.example.com -connect app.example.com:443 2>/dev/null | openssl x509 -noout -dates -subject -issuer
```

결과:

```text
notAfter=May 5 2026
현재 날짜=May 27 2026
```

원인은 Let's Encrypt 인증서 만료였다. QA가 실패한 이유가 테스트 코드가 아니라 HTTPS 인증서 문제였던 것이다.

배운 점:

```text
QA 자동화는 화면 오류뿐 아니라 인증서 만료 같은 운영 문제도 드러낸다.
```

## 트러블슈팅 2 - certbot 갱신과 80 포트

인증서를 갱신하려고 `certbot renew --dry-run`을 실행했을 때 다음 문제가 있었다.

```text
Timeout during connect
Fetching http://app.example.com/.well-known/acme-challenge/...
```

원인은 HTTP-01 challenge였다. 현재 certbot은 Let's Encrypt가 외부에서 80 포트로 접근해 인증 파일을 확인하는 방식이다.

```text
Let's Encrypt
  -> http://app.example.com/.well-known/acme-challenge/...
  -> 서버 공인 IP:80
  -> nginx
```

그런데 방화벽에서 80 포트가 닫혀 있어 timeout이 났다.

정리:

```text
Playwright QA
- https://app.example.com
- 443 사용

인증서 갱신 HTTP-01
- http://app.example.com/.well-known/acme-challenge/...
- 80 사용
```

즉 80은 QA 때문에 필요한 것이 아니라 인증서 갱신 때문에 필요하다.

현재 선택:

```text
단기:
- 인증서 갱신할 때만 80 임시 오픈
- certbot renew
- nginx reload
- 다시 80 닫기

장기:
- DNS-01 challenge 전환
- 80 포트 없이 DNS TXT record로 갱신
```

## 트러블슈팅 3 - Playwright --with-deps sudo 실패

GitHub Actions에서 다음 단계가 실패했다.

```bash
npx playwright install --with-deps chromium
```

로그:

```text
Switching to root user to install dependencies...
sudo: a password is required
```

원인은 `--with-deps`다. 이 옵션은 Chromium 브라우저만 설치하는 것이 아니라, 시스템 패키지까지 설치하려고 한다.

```text
npx playwright install chromium
- Chromium 브라우저 다운로드

npx playwright install --with-deps chromium
- Chromium 브라우저 다운로드
- OS dependency 설치
```

self-hosted runner는 `qarunner` 권한으로 실행된다. 이 계정에는 sudo 권한을 주지 않았기 때문에 OS 패키지 설치가 실패했다.

해결:

```text
서버 관리자 작업:
- 필요한 Playwright OS dependency를 sudo apt-get install로 1회 설치

GitHub Actions 작업:
- npx playwright install chromium만 실행
```

workflow도 수정했다.

```yaml
NPM_CONFIG_CACHE: /opt/myapp-github-runner/.npm
PLAYWRIGHT_BROWSERS_PATH: /opt/myapp-github-runner/.cache/ms-playwright

run: npx playwright install chromium
```

배운 점:

```text
self-hosted runner에서 workflow는 서버 관리 작업을 하면 안 된다.
OS 패키지 설치는 관리자 작업이고, 테스트 실행은 runner 작업이다.
```

## 트러블슈팅 4 - QA_BASE_URL trailing slash

QA 실행 중 다음 URL로 접근했다.

```text
https://app.example.com//front/signin
```

결과:

```text
HTTP/2 401
Timeout waiting for getByTestId('id-input')
```

원인:

GitHub Secret의 `QA_BASE_URL` 값 끝에 `/`가 있었고, 코드에서 다시 `/front/signin`을 붙여 `//front/signin`이 되었다. 이 경로가 로그인 HTML이 아니라 401 JSON 응답으로 처리되어 Playwright가 로그인 input을 찾지 못했다.

해결:

workflow와 Playwright global setup에서 trailing slash를 제거했다.

```bash
qa_base_url="${QA_BASE_URL%/}"
```

```ts
const baseURL = (process.env.QA_BASE_URL || `http://localhost:${basePort}`).replace(/\/+$/, '')
```

배운 점:

```text
환경변수는 항상 정규화해야 한다.
Secrets에 들어간 값이 항상 원하는 형태라고 가정하면 안 된다.
```

## 디스크 사용량 관리

서버의 root 디스크는 작고 별도 데이터 파티션은 여유가 있다.

```text
/      약 10GB
/opt   약 100GB
```

그래서 runner와 캐시는 `/opt` 아래로 둔다.

```text
/opt/myapp-github-runner
  ├── actions-runner
  ├── _work
  ├── .npm
  └── .cache/ms-playwright
```

확인 명령:

```bash
df -h / /opt
du -sh /opt/myapp-github-runner
du -sh /opt/myapp-github-runner/actions-runner/_work
du -sh /opt/myapp-github-runner/.npm
du -sh /opt/myapp-github-runner/.cache
```

현재까지 확인한 변화는 크지 않았다.

```text
설치 전후 대략 변화
/      약 +0.1G 수준
/opt   약 +1G 수준
```

다만 Playwright trace, npm cache, node_modules, browser cache가 쌓이면 더 늘 수 있다. QA runner는 보통 8~15GB 정도까지도 고려해야 한다.

## CD runner를 나중에 붙인다면

지금은 CD runner를 만들지 않는다. 하지만 나중에 GitHub Actions에서 배포까지 하려면 QA runner와 CD runner를 분리하는 것이 좋다.

```text
QA runner
- qarunner
- label: myapp-qa
- 테스트 실행
- 낮은 권한

CD runner
- deployer
- label: myapp-deploy
- JAR 배포
- current.jar 변경
- restart.sh 실행
- health check
- rollback
```

CD runner는 운영 파일을 변경하므로 QA runner보다 더 큰 권한이 필요하다. 그래서 같은 계정을 쓰면 안 된다.

용량 면에서는 CD runner가 QA runner보다 부담이 작다.

```text
QA runner가 많이 쓰는 것
- node_modules
- npm cache
- Playwright Chromium
- trace/report/screenshot

CD runner가 쓰는 것
- runner 본체
- checkout 또는 artifact 다운로드
- JAR 임시 보관
```

CD runner 자체는 보통 1~3GB 정도로 관리 가능하다. 실제로 더 중요한 것은 `/opt/myapp/deploy/releases`에 JAR가 계속 쌓이는 문제다.

그래서 나중에 CD를 붙이면 JAR 보관 정책도 필요하다.

```text
예시
- 최근 5개 JAR 보관
- 또는 최근 14일치 보관
- current.jar와 previous가 가리키는 JAR는 삭제하지 않기
```

## 현재 상태

```text
완료
- 별도 운영 경로 기준 정리
- JAR rollback 구조
- Actuator liveness/readiness
- self-hosted QA runner 구성
- QA runner 계정 분리
- GitHub Actions QA workflow 작성
- Playwright OS dependency 서버 설치
- npm/Playwright cache 경로 분리
- QA_BASE_URL 정규화
- 실패 이슈 생성 임시 비활성화

진행 중
- Playwright QA가 끝까지 도는지 확인
- 로그인 이후 selector/데이터 조건 안정화
- artifact 기반 실패 원인 확인

보류
- 실패 이슈 자동 생성 재활성화
- GitHub Actions JAR artifact build
- CD runner 계정과 권한 설계
- DNS-01 인증서 갱신 전환
- 운영 DB 백업/복구 자동화
```

## 앞으로의 순서

```text
1. QA workflow를 이슈 생성 없이 안정화한다.
2. 실패 원인은 artifact와 로그로 먼저 본다.
3. smoke QA가 안정화되면 실패 이슈 생성을 다시 켠다.
4. GitHub Actions에서 JAR artifact build를 정리한다.
5. CD를 붙일 때 배포 전용 계정과 deploy runner를 만든다.
6. CD runner에는 배포에 필요한 최소 권한만 준다.
7. 인증서 갱신은 당장은 80 임시 오픈 방식으로 처리한다.
8. 장기적으로 DNS-01 전환을 검토한다.
9. 운영 DB 정책이 정해지면 DB 백업/복구 테스트를 별도 단계로 붙인다.
```

## 핵심 정리

이번 단계의 핵심은 "GitHub Actions를 도입했다"가 아니다.

정확히는 다음을 만든 것이다.

```text
운영 배포 안정화 기반 위에
GitHub Actions QA 실행 위치를 정하고
서버 계정 권한을 분리하고
Playwright 실행 환경을 맞추고
실패 증적을 artifact로 남기는 구조
```

CI/CD + QA 파이프라인은 workflow 파일 하나로 완성되지 않는다. 실행 위치, 네트워크, 인증서, 포트, runner 권한, 디스크, rollback 기준이 모두 연결되어야 운영에서 쓸 수 있다.
