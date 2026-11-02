---
title: '운영 배포 안정화기 (2) - CI/CD와 QA 파이프라인 붙이기'
date: '2026-05-29'
category: 'project'
keywords: ['CI/CD', 'GitHub Actions', 'Infra']
---

> 없던 CI/CD와 QA 파이프라인을 만들려고 JAR rollback 구조 위에 GitHub Actions, self-hosted runner, Playwright QA, 실패 증적 수집을 단계적으로 붙인 기록입니다. 인증서 만료와 포트, 계정 권한 문제를 만난 과정까지 남겼습니다

<!--more-->

## 개요

[1편](/project/deployment-stabilization-1)에서는 운영 서버의 배포 기준을 정리했습니다. 흩어진 배포 산출물을 별도 운영 경로로 모으고, `releases/current/previous` 기반 JAR rollback과 Actuator liveness/readiness health check를 붙였습니다

2편에서는 그 위에 CI/CD와 QA 자동화를 얹었습니다. GitHub Actions로 QA를 실행하려다 GitHub-hosted runner가 막혀 self-hosted runner로 돌아섰고, runner 계정과 앱 실행 계정을 분리했습니다. 그 과정에서 인증서 만료, 포트, sudo 권한, 환경변수 정규화 문제를 차례로 만났습니다

## 왜 CI/CD와 QA 파이프라인이 필요했나

기존에는 배포와 QA가 느슨하게 연결되어 있었습니다. 로컬에서 JAR를 빌드해 서버에 올리고 재시작한 뒤, 사람이 화면을 확인하고 문제가 생기면 로그를 직접 열어보는 흐름이었습니다

간단하지만 문제가 쌓여 있었습니다. 어떤 JAR가 실제 실행 기준인지 애매해질 수 있고, 배포에 실패해도 이전 버전으로 즉시 돌아가기 어려웠습니다. 앱이 떴는지와 DB 준비가 됐는지도 구분되지 않았습니다. 무엇보다 QA 결과가 기록으로 남지 않았습니다. 실패 화면이나 trace, 로그가 구조적으로 보관되지 않으니 나중에 원인을 되짚기 어려웠고, 배포 자동화를 붙이려 해도 권한 기준이 없었습니다

그래서 목표를 이렇게 잡았습니다

```text
1. 배포 산출물은 rollback 가능하게 보관한다
2. 배포 성공 여부는 liveness/readiness로 판단한다
3. 배포 후 최소 QA는 GitHub Actions에서 실행한다
4. 접근 제한으로 GitHub-hosted runner가 안 되면 self-hosted runner를 쓴다
5. QA 실패 증적은 artifact로 남긴다
6. 테스트 안정화 전에는 GitHub Issue 자동 생성을 꺼둔다
7. 나중에 CD까지 붙일 수 있도록 QA 권한과 배포 권한을 분리한다
```

## 전체 구조

만들고 있는 구조는 이렇습니다

```text
GitHub Repository
  ├─ application / backend modules
  ├─ client / Playwright E2E tests
  ├─ .github/workflows/qa-after-deploy.yml
  └─ Repository secrets (QA_BASE_URL, QA_USERNAME, QA_PASSWORD)

GitHub Actions - QA After Deploy
  checkout → setup-node → npm ci → Playwright Chromium install
  → target reachability check → Playwright E2E → artifact upload

app-dev server
  ├─ appuser    앱 실행/배포 기준 계정, /opt/myapp 관리
  ├─ qarunner   QA self-hosted runner 계정, /opt/myapp-github-runner 관리
  ├─ /opt/myapp                deploy, releases, current.jar, previous, logs, app.pid
  └─ /opt/myapp-github-runner  actions-runner, _work, .npm, .cache
```

실행 흐름은 GitHub Actions가 job을 전달하면 app-dev 서버 안의 self-hosted runner가 Playwright를 실행하고, 그 요청이 Nginx 443을 거쳐 Spring Boot 내부 포트로 들어가는 구조입니다

이 구조에서 GitHub는 서버로 SSH 접속하지 않습니다. 서버 안의 runner 프로세스가 먼저 GitHub로 outbound 연결을 맺고, GitHub가 job을 내려주면 그 job을 서버 안에서 실행합니다

## self-hosted runner를 쓴 이유

처음에는 GitHub-hosted runner로 QA를 돌리려 했습니다. 그런데 운영 서버의 HTTPS 접근이 source IP 기준으로 제한되어 있어서 GitHub-hosted runner가 접근하지 못했습니다

```text
curl: (28) Failed to connect to app.example.com port 443
```

GitHub-hosted runner는 GitHub가 제공하는 외부 임시 VM이라 실행 IP를 고정 운영하기 어렵고, 그래서 서버 보안 그룹이나 방화벽 접근 제한에 걸립니다. 반면 self-hosted runner는 운영 서버 내부에서 실행되니 외부 IP 제한 문제를 피할 수 있고, 내부 네트워크에서 QA 대상에 접근할 수 있습니다

그래서 기존 `app-dev` 서버 안에 QA runner를 설치했습니다. 서버를 새로 만들면 비용과 권한 문제가 생기므로, 서버 한 대 안에서 계정만 분리하는 방식으로 시작했습니다

## 서버는 하나, 계정은 분리

서버는 하나만 쓰지만 계정은 역할에 따라 나눴습니다

| 계정 | 역할 | 관리 경로 |
| --- | --- | --- |
| `appuser` | 앱 실행, JAR 배포 기준 | `/opt/myapp` |
| `qarunner` | QA 실행 (앱 배포 디렉터리 쓰기 권한 없음) | `/opt/myapp-github-runner` |

이렇게 나눈 이유는 self-hosted runner가 workflow의 shell 명령을 실제 서버에서 실행하기 때문입니다. runner를 `appuser`로 돌리면 GitHub Actions에서 이런 명령도 가능해집니다

```bash
rm -rf /opt/myapp/deploy
kill $(cat /opt/myapp/app.pid)
ln -sfn wrong.jar /opt/myapp/deploy/current.jar
```

QA workflow의 실수가 앱 운영 파일 손상으로 이어질 수 있다는 뜻입니다. 그래서 QA는 낮은 권한 계정으로 실행합니다. QA runner는 checkout, `npm ci`, Playwright 실행, artifact 생성까지만 할 수 있고, `current.jar` 변경이나 `previous` 변경, 앱 프로세스 kill, deploy/releases 삭제, restart.sh 실행은 하지 못합니다

혼자 운영하더라도 이 분리는 의미가 있었습니다. 분리한 목적이 실수했을 때 영향 범위를 줄이는 것이었기 때문입니다

## CI, QA, CD를 어떻게 나눌 것인가

지금 만든 건 우선 QA 실행 구조입니다. CI/CD 전체를 한 번에 완성한 게 아닙니다. 단계를 나누면 이렇게 됩니다

| 단계 | 무엇 | 하는 일 |
| --- | --- | --- |
| 1단계 | QA runner | Playwright 실행, artifact 업로드, 실패 원인 수집 (낮은 권한) |
| 2단계 | CI artifact | GitHub Actions에서 Gradle build, JAR artifact 생성·보관 |
| 3단계 | CD runner | artifact를 releases에 배치, current.jar 변경, restart, health check, 실패 시 rollback |

QA와 CD는 권한이 다릅니다. QA가 실패하면 테스트가 실패하고 artifact를 확인하면 되지만 서비스에는 직접 영향이 없습니다. 반면 CD가 실패하면 앱 재시작이 실패하거나 `current.jar`가 잘못 바뀌어 서비스가 중단될 수 있고, rollback이 필요합니다

그래서 나중에 CD까지 붙이면 `qarunner`를 그대로 쓰지 않고 별도 계정(`deployer`)을 두고 label도 나눌 생각입니다(`myapp-qa` / `myapp-deploy`). runner를 또 만든다는 게 서버를 또 만든다는 뜻은 아닙니다. 같은 서버 안에서 계정과 label을 나눠 QA workflow와 deploy workflow가 서로 다른 권한으로 실행되게 하는 것입니다

## Playwright QA workflow 구성

현재 QA workflow는 이 순서로 실행됩니다

1. checkout
2. 배포 후 대기
3. Node 22.14.0 설정
4. `npm ci`
5. `npx playwright install chromium`
6. QA 대상 reachability check
7. `npm run test:e2e`
8. artifact 업로드

처음에는 실패하면 GitHub Issue를 자동 생성하게 했습니다. `qa:failed` label을 만들고 backend/frontend/triage로 분류해 assignee를 매핑하고, artifact 링크를 포함한 이슈를 만드는 방식이었습니다

그런데 self-hosted runner와 테스트 환경이 아직 안정화되지 않은 상태에서는 실패할 때마다 불필요한 이슈가 쌓였습니다. 그래서 이슈 생성 step을 잠시 꺼뒀습니다

```yaml
- name: Create QA failure issue
  if: false
```

지금 단계에서는 실패 증적을 Issue가 아니라 artifact와 로그로 먼저 확인합니다. trace와 screenshot, 로그로 원인을 파악하고, 테스트가 안정화되면 실패 이슈 생성을 다시 켜고 성공 시 기존 실패 이슈를 자동 종료하도록 붙일 계획입니다

## 운영 네트워크 정리

이번 작업에서 포트와 라우팅에 대한 이해가 필요했습니다

| 포트 | 설명 |
| --- | --- |
| 443 | HTTPS 표준 포트. 외부 사용자가 도메인으로 접근하는 입구, Nginx가 받음 |
| 80 | HTTP 표준 포트. QA에는 직접 필요 없지만 Let's Encrypt HTTP-01 갱신에 필요 |
| 내부 포트 | Spring Boot가 로컬에서 listen하는 포트. Nginx가 443 요청을 127.0.0.1로 프록시 |

방화벽과 Nginx의 역할도 다릅니다. 방화벽은 source IP와 port 기준으로만 허용하거나 차단하고, domain은 보지 않습니다. Nginx는 443으로 들어온 요청의 Host header를 보고 서비스를 분기합니다

그래서 방화벽 규칙 설명에 특정 프로젝트명이 적혀 있어도, 기술적으로는 해당 source IP가 서버의 443으로 들어올 수 있다는 뜻입니다. 실제로 어떤 서비스로 갈지는 Nginx가 domain 기준으로 결정합니다

## 트러블슈팅 1 - HTTPS 인증서 만료

self-hosted runner를 구성한 뒤 서버에서 curl을 확인했을 때 에러가 났습니다

```text
curl: (60) SSL certificate problem: certificate has expired
```

인증서 날짜를 확인해봤습니다

```bash
echo | openssl s_client -servername app.example.com -connect app.example.com:443 2>/dev/null | openssl x509 -noout -dates -subject -issuer
```

만료일이 5월 5일인데 그날이 5월 27일이었습니다. Let's Encrypt 인증서가 만료돼 있었던 것입니다. QA가 실패한 이유가 테스트 코드가 아니라 HTTPS 인증서 문제였습니다

QA 자동화가 화면 오류만이 아니라 인증서 만료 같은 운영 문제도 잡아낸다는 걸 여기서 알게 됐습니다

## 트러블슈팅 2 - certbot 갱신과 80 포트

인증서를 갱신하려고 `certbot renew --dry-run`을 실행하니 이번엔 timeout이 났습니다

```text
Timeout during connect
Fetching http://app.example.com/.well-known/acme-challenge/...
```

원인은 HTTP-01 challenge였습니다. certbot은 Let's Encrypt가 외부에서 80 포트로 접근해 인증 파일을 확인하는 방식으로 동작하는데, 방화벽에서 80이 닫혀 있어 접근하지 못했습니다

| 용도 | 주소 | 포트 |
| --- | --- | --- |
| Playwright QA | `https://app.example.com` | 443 |
| 인증서 갱신 HTTP-01 | `http://app.example.com/.well-known/...` | 80 |

QA는 443만 쓰고, 80은 인증서 갱신에만 필요했습니다. 단기적으로는 갱신할 때만 80을 임시로 열고 `certbot renew` 후 nginx를 reload한 다음 다시 닫는 방식으로 처리했습니다. 장기적으로는 80 포트 없이 DNS TXT record로 갱신하는 DNS-01 challenge 전환을 검토하고 있습니다

## 트러블슈팅 3 - Playwright --with-deps sudo 실패

GitHub Actions에서 이 단계가 실패했습니다

```bash
npx playwright install --with-deps chromium
```

```text
Switching to root user to install dependencies...
sudo: a password is required
```

원인은 `--with-deps`였습니다. 이 옵션은 Chromium 브라우저와 함께 시스템 패키지까지 설치하려고 합니다. self-hosted runner는 `qarunner` 권한으로 실행되는데 이 계정에 sudo 권한을 주지 않았으니 OS 패키지 설치가 실패한 것입니다

해결은 역할을 나누는 것이었습니다. 필요한 Playwright OS dependency는 서버 관리자가 `sudo apt-get install`로 한 번 설치하고, GitHub Actions에서는 `npx playwright install chromium`만 실행하도록 했습니다. 캐시 경로도 `/opt` 아래로 옮겼습니다

```yaml
NPM_CONFIG_CACHE: /opt/myapp-github-runner/.npm
PLAYWRIGHT_BROWSERS_PATH: /opt/myapp-github-runner/.cache/ms-playwright

run: npx playwright install chromium
```

그 뒤로 self-hosted runner의 workflow에서는 서버 관리 작업을 하지 않기로 했습니다. OS 패키지 설치는 관리자가 하고, runner는 테스트만 실행합니다

## 트러블슈팅 4 - QA_BASE_URL trailing slash

QA 실행 중 이상한 URL로 접근하고 있었습니다

```text
https://app.example.com//front/signin
→ HTTP/2 401
→ Timeout waiting for getByTestId('id-input')
```

GitHub Secret의 `QA_BASE_URL` 값 끝에 `/`가 있었고, 코드에서 다시 `/front/signin`을 붙여 `//front/signin`이 된 것이었습니다. 이 경로가 로그인 HTML이 아니라 401 JSON 응답으로 처리되어 Playwright가 로그인 input을 찾지 못했습니다

workflow와 Playwright global setup 양쪽에서 trailing slash를 제거했습니다

```bash
qa_base_url="${QA_BASE_URL%/}"
```

```ts
const baseURL = (process.env.QA_BASE_URL || `http://localhost:${basePort}`).replace(/\/+$/, '')
```

이 일 이후로 Secrets에 들어간 값을 그대로 믿지 않고, 쓰기 전에 정규화하게 됐습니다

## 디스크 사용량 관리

서버의 root 디스크는 작고(약 10GB) 별도 데이터 파티션은 여유가 있어서(약 100GB), runner와 캐시는 `/opt` 아래에 뒀습니다

```text
/opt/myapp-github-runner
  ├── actions-runner
  ├── _work
  ├── .npm
  └── .cache/ms-playwright
```

설치 전후 변화는 root가 약 +0.1GB, `/opt`가 약 +1GB 수준으로 크지 않았습니다. 다만 Playwright trace, npm cache, node_modules, browser cache가 쌓이면 더 늘 수 있어서 QA runner는 8~15GB 정도까지 고려해야 합니다

## CD runner를 나중에 붙인다면

지금은 CD runner를 만들지 않았습니다. 나중에 GitHub Actions에서 배포까지 하게 되면 QA runner와 CD runner를 나눌 생각입니다. CD runner는 운영 파일을 바꾸므로 QA runner보다 큰 권한이 필요해서, 같은 계정을 쓰지 않으려고 합니다

용량 면에서는 오히려 CD runner가 부담이 작습니다. QA runner는 node_modules, npm cache, Chromium, trace와 report를 쓰지만 CD runner는 runner 본체와 artifact 다운로드, JAR 임시 보관 정도라 1~3GB로 관리할 수 있습니다

용량보다 신경 쓰이는 건 `/opt/myapp/deploy/releases`에 JAR가 계속 쌓이는 문제입니다. 그래서 CD를 붙이면 JAR 보관 정책도 같이 필요합니다. 최근 5개만 남기거나 최근 14일치를 보관하되, `current.jar`와 `previous`가 가리키는 JAR는 삭제하지 않는 식입니다

## 현재 상태

**완료한 것.** 별도 운영 경로 기준 정리, JAR rollback 구조, Actuator liveness/readiness, self-hosted QA runner 구성과 계정 분리, GitHub Actions QA workflow 작성, Playwright OS dependency 서버 설치, npm과 Playwright cache 경로 분리, `QA_BASE_URL` 정규화, 실패 이슈 생성 임시 비활성화

**진행 중인 것.** Playwright QA가 끝까지 도는지 확인, 로그인 이후 selector와 데이터 조건 안정화, artifact 기반 실패 원인 확인

**보류한 것.** 실패 이슈 자동 생성 재활성화, GitHub Actions JAR artifact build, CD runner 계정과 권한 설계, DNS-01 인증서 갱신 전환, 운영 DB 백업과 복구 자동화

순서로는 QA workflow를 이슈 생성 없이 먼저 안정화하고, 실패 원인은 artifact와 로그로 확인합니다. smoke QA가 안정되면 실패 이슈 생성을 다시 켜고, 그다음 JAR artifact build를 정리한 뒤 배포 전용 계정과 deploy runner를 만들 생각입니다

## 마치며

GitHub Actions를 붙였다고 끝나는 일은 아니었습니다. 1편에서 만든 배포 기반 위에 QA를 어디서 실행할지 정하고, 서버 계정 권한을 나누고, Playwright 실행 환경을 맞추고, 실패 증적을 artifact로 남기는 구조를 하나씩 만들었습니다

실행 위치, 네트워크, 인증서, 포트, runner 권한, 디스크, rollback 기준을 하나씩 맞추고 나서야 운영에서 쓸 수 있는 구조가 됐습니다
