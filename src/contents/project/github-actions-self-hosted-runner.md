---
title: 'GitHub Actions Self-hosted Runner 운영 — 실행 계정 분리'
date: '2026-05-27'
category: 'project'
keywords: ['runner', 'GitHub Actions', 'Infra']
---

> GitHub Actions 작업을 서버 안에서 실행해야 한다면 self-hosted runner를 두되, 앱 실행 계정과 runner 실행 계정은 반드시 분리한다.

<!--more-->

## 개요

브라우저 QA를 GitHub Actions에서 돌리려면 러너가 테스트 대상 URL에 실제로 접근할 수 있어야 한다. **외부 러너가 대상 서버에 네트워크로 접근할 수 없는 환경**에서는 GitHub-hosted runner로 QA를 실행할 수 없다. 내부 네트워크 안에만 존재하는 개발 서버, 특정 대역에서만 접근 가능한 스테이징 환경 등이 여기 해당한다.

이때 선택지는 두 가지다.

1. 외부 러너가 접근할 수 있도록 네트워크 경로를 여는 것
2. 러너를 접근 가능한 위치, 즉 서버 내부로 옮기는 것

1번은 보안 검토와 정책 변경이 필요하고 되돌리기도 어렵다. 그래서 보통 2번, 즉 서버 안에 self-hosted runner를 설치하고 QA를 서버 내부에서 실행하는 구조를 택하게 된다.

핵심은 **서버를 하나 더 만들지 않고도 runner를 둘 수 있지만, 앱 실행 계정과 runner 실행 계정은 분리한다**는 점이다.

```text
서버 1대 (예: app-dev)

서비스 실행 계정
- appuser
- 앱 실행, JAR 배포, 로그 관리
- /opt/myapp 관리

QA runner 계정
- runneruser
- GitHub Actions self-hosted runner 실행
- Playwright QA 실행
- /opt/myapp-github-runner 관리
```

## 연결 구조

self-hosted runner는 GitHub가 서버에 직접 SSH로 접속하는 구조가 **아니다**. 서버 안의 runner 프로세스가 GitHub로 outbound 연결을 맺고, GitHub가 작업을 내려주면 runner가 서버 안에서 실행한다.

```text
GitHub Actions
  ↓ 작업 전달
서버 내부의 runneruser 서비스
  ↓ Playwright 실행
https://app.example.com
  ↓
Nginx
  ↓
Spring Boot (127.0.0.1)
```

이 방향성이 중요한 이유는 두 가지다.

- GitHub에 서버 계정 비밀번호나 인바운드 접근 권한을 주지 않는다. outbound 연결만 있으면 된다.
- 대신 GitHub Actions job의 shell 명령이 **실제 서버에서 `runneruser` 권한으로 실행**된다. 그래서 이 계정의 권한 범위가 곧 workflow의 권한 범위가 된다.

## 왜 runner 계정을 따로 만드는가

self-hosted runner는 workflow의 shell 명령을 실제 서버에서 실행한다. 만약 앱 실행 계정인 `appuser`로 runner를 실행하면 GitHub Actions가 앱 배포 디렉터리까지 만질 수 있다.

예를 들어 실수로 이런 명령이 workflow에 들어가면 위험하다.

```bash
rm -rf /opt/myapp/deploy
kill $(cat /opt/myapp/app.pid)
ln -sfn wrong.jar /opt/myapp/deploy/current.jar
```

그래서 역할을 나눈다.

```text
appuser
- 앱 실행/배포 권한 있음
- 운영 파일 접근 가능

runneruser
- QA 실행 권한만 있음
- 앱 배포 디렉터리 쓰기 권한 없음
```

혼자 관리하는 서버라도 계정 분리는 유효하다. **사람을 나누기 위한 것이 아니라, 미래의 실수와 workflow 오작동의 영향 범위를 줄이기 위한 장치**다. YAML 한 줄 실수가 운영 파일을 건드리지 못하게 만드는 것이 목적이다.

## 설치 위치

루트 파티션이 작고 별도 데이터 디스크가 넉넉한 서버라면, runner는 루트나 `/home` 아래가 아니라 여유 공간이 큰 디스크에 둔다.

```text
/opt/myapp
- 실제 앱 배포 디렉터리
- current.jar, previous, releases, logs, app.pid

/opt/myapp-github-runner
- GitHub Actions runner 전용
- actions-runner
- .npm
- .cache
- _work
```

runner는 checkout, node_modules, 브라우저 바이너리, 테스트 리포트로 용량을 빠르게 먹는다. 이걸 루트 파티션에 두면 QA 한 번 돌릴 때마다 서버 전체 안정성이 흔들린다.

## 계정과 디렉터리 생성

```bash
sudo useradd -m -d /opt/myapp-github-runner -s /bin/bash runneruser
sudo chown -R runneruser:runneruser /opt/myapp-github-runner
```

`runneruser`에는 비밀번호를 설정하지 않아도 된다. GitHub가 이 계정으로 SSH 로그인하는 것이 아니고, systemd 서비스가 이 계정으로 runner 프로세스를 실행하기 때문이다.

관리자가 runner 계정으로 명령을 실행해야 할 때는 비밀번호 대신 `sudo -u`를 사용한다.

```bash
sudo -u runneruser -H whoami
sudo -u runneruser -H bash
```

### 앱 계정이 runner 폴더를 확인해야 할 때

`appuser`가 runner 폴더를 읽어야 하면 그룹 권한을 추가한다.

```bash
sudo usermod -aG runneruser appuser
sudo chmod 750 /opt/myapp-github-runner
sudo chmod 750 /opt/myapp-github-runner/actions-runner
```

그룹 변경은 현재 SSH 세션에 바로 반영되지 않는다. 반드시 재접속 후 확인한다.

```bash
id appuser
cd /opt/myapp-github-runner/actions-runner
```

## GitHub runner 등록

GitHub 저장소에서 다음 메뉴로 이동한다.

```text
Repository
→ Settings
→ Actions
→ Runners
→ New self-hosted runner
→ Linux
→ x64
```

서버에서는 runner 전용 계정 또는 `sudo -u`로 등록한다.

```bash
cd /opt/myapp-github-runner/actions-runner

sudo -u runneruser -H ./config.sh \
  --url https://github.com/<org>/<repo> \
  --token <new-token> \
  --name myapp-qa-runner \
  --labels myapp-qa
```

중요한 것은 runner 이름보다 **label**이다. workflow에서는 조직 공용 runner가 선택되는 것을 피하기 위해 반드시 전용 label을 사용한다.

```yaml
runs-on: [self-hosted, myapp-qa]
```

`runs-on: [self-hosted, linux, x64]`처럼 일반 label만 사용하면 조직에 공유된 다른 runner가 선택될 수 있다. 이건 단순한 실행 실패가 아니라, 내 workflow가 남의 서버에서 도는 상황이라 더 나쁘다.

## 서비스 등록과 실행

`config.sh`는 GitHub에 runner를 등록하는 작업이고, `svc.sh`는 runner를 systemd 서비스로 등록하고 실행하는 작업이다. 둘은 별개다.

```bash
cd /opt/myapp-github-runner/actions-runner

sudo ./svc.sh install runneruser
sudo ./svc.sh start
sudo ./svc.sh status
```

정상 상태는 GitHub 화면에서 `Online` 또는 `Idle`로 보인다.

서버에서 실행 계정 확인:

```bash
ps -ef | grep Runner.Listener
systemctl list-units --type=service | grep actions.runner
systemctl status <actions.runner 서비스명>
systemctl cat <actions.runner 서비스명>
```

서비스가 `runneruser`로 실행되고 있는지 반드시 확인한다. 여기서 앱 계정으로 떠 있으면 계정을 분리한 의미가 없다.

## Offline 상태일 때 확인

GitHub 화면에서 runner가 `Offline`이면 등록은 되었지만 runner 프로세스가 GitHub에 연결되어 있지 않다는 뜻이다.

확인 순서:

```bash
cd /opt/myapp-github-runner/actions-runner
sudo ./svc.sh status
sudo ./svc.sh start
sudo journalctl -u 'actions.runner*' -n 100 --no-pager
```

흔한 원인:

```text
- svc.sh start를 하지 않음
- 서비스 설치가 안 됨
- GitHub outbound 연결 실패
- runner 프로세스가 시작 직후 종료됨
```

## runner 삭제 또는 재등록

서비스부터 중지하고 제거한다.

```bash
cd /opt/myapp-github-runner/actions-runner
sudo ./svc.sh stop
sudo ./svc.sh uninstall
```

GitHub 화면에서 runner를 Remove하면 제거 토큰이 나온다. 토큰이 있으면 아래처럼 제거한다.

```bash
sudo -u runneruser -H ./config.sh remove --token <remove-token>
```

이미 GitHub 화면에서 삭제해서 remove token을 다시 볼 수 없다면, 서버에 남은 로컬 등록 파일만 정리하고 새로 등록한다.

```bash
sudo rm -f /opt/myapp-github-runner/actions-runner/.runner
sudo rm -f /opt/myapp-github-runner/actions-runner/.credentials
sudo rm -f /opt/myapp-github-runner/actions-runner/.credentials_rsaparams
```

완전히 제거되었는지 확인한다.

```bash
ls -la /opt/myapp-github-runner/actions-runner
systemctl list-units --type=service | grep actions.runner
systemctl list-unit-files | grep actions.runner
```

`.runner`, `.credentials`, `.credentials_rsaparams`가 남아 있으면 config 정보가 아직 남아 있는 것이다.

## Playwright 의존성 주의

GitHub-hosted runner에서는 다음 명령이 보통 문제 없이 실행된다.

```bash
npx playwright install --with-deps chromium
```

하지만 self-hosted runner에서는 `runneruser`가 낮은 권한 계정이므로 실패한다. `--with-deps`는 브라우저 다운로드뿐 아니라 Linux 시스템 패키지 설치도 시도하기 때문이다.

```text
브라우저 다운로드
- runner 계정으로 가능

OS 패키지 설치
- apt install 계열
- 관리자 권한 필요
```

여기서 "그럼 runner에 sudo를 주자"로 가면 계정을 분리한 의미가 사라진다. 대신 OS 의존성은 관리자 계정으로 **최초 1회만** 설치하고, workflow에서는 테스트 실행 중심으로 둔다.

```bash
# 관리자 권한으로 최초 1회
npx playwright install-deps chromium
```

workflow에서는 브라우저 설치만 수행한다.

```bash
npx playwright install chromium
```

캐시는 루트 파티션이 아니라 여유 디스크 아래로 둔다.

```yaml
env:
  NPM_CONFIG_CACHE: /opt/myapp-github-runner/.npm
  PLAYWRIGHT_BROWSERS_PATH: /opt/myapp-github-runner/.cache/ms-playwright
```

## 용량 관리

self-hosted runner와 Playwright는 대략 다음 정도의 용량을 사용한다.

```text
GitHub runner 본체: 수백 MB
repo checkout: 수백 MB ~ 수 GB
node_modules: 1GB ~ 3GB
npm cache: 수백 MB ~ 2GB
Playwright Chromium: 500MB ~ 1.5GB
테스트 리포트/trace: 수백 MB 이상

현실적인 증가량: 8GB ~ 15GB 정도
```

주기적으로 확인한다.

```bash
df -h
du -sh /opt/myapp-github-runner
du -sh /opt/myapp-github-runner/actions-runner
du -sh /opt/myapp-github-runner/.npm
du -sh /opt/myapp-github-runner/.cache
```

## 운영 원칙

```text
- 앱 실행 계정과 runner 실행 계정을 분리한다.
- runner 계정에는 비밀번호를 설정하지 않는다. (systemd로 실행)
- GitHub Actions는 runner 계정 권한으로만 QA를 실행한다.
- 배포 디렉터리와 runner 디렉터리는 분리한다.
- workflow는 전용 label을 사용한다.
- 운영 환경에서는 데이터 변경 E2E가 아니라 smoke/read-only QA 중심으로 둔다.
```

## 나중에 CD runner를 붙인다면

여기까지 만든 self-hosted runner는 QA 실행용이다. 나중에 GitHub Actions에서 배포까지 하려면, **같은 서버를 쓰더라도 QA runner와 CD runner의 권한을 분리**하는 것이 좋다.

"runner를 또 만든다"가 반드시 서버를 또 만든다는 뜻은 아니다. 같은 서버 안에서 계정과 label을 나누는 방식으로 시작할 수 있다.

```text
서버 1대

앱 실행 계정
- appuser
- Spring Boot 앱 실행
- /opt/myapp 관리

QA runner 계정
- runneruser
- Playwright QA 실행
- label: myapp-qa
- /opt/myapp-github-runner 관리

CD runner 계정
- deployuser
- GitHub Actions 배포 실행
- label: myapp-deploy
- JAR 업로드, current.jar 교체, restart, health check 수행
```

### 왜 QA runner와 CD runner를 나누는가

QA와 CD는 실패했을 때 영향 범위가 다르다.

```text
QA runner가 실패하면
- 테스트 실패
- 리포트 생성 실패
- Issue 생성 실패

CD runner가 실패하면
- 실제 서비스 중단 가능
- current.jar가 잘못 바뀔 수 있음
- 앱 프로세스가 종료될 수 있음
- rollback이 필요할 수 있음
```

그래서 QA runner는 낮은 권한으로 유지하고, CD runner에는 배포에 필요한 권한만 준다.

### 앱 계정으로 CD를 돌리는 방식은 왜 덜 좋은가

가장 단순하게는 `appuser`로 CD runner를 실행할 수도 있다. 하지만 이 경우 GitHub workflow가 앱 실행 계정 권한을 그대로 갖는다.

```text
appuser로 CD runner를 실행할 때 가능한 일
- 배포 디렉터리 수정
- current.jar symlink 변경
- app.pid 삭제
- 실행 중인 앱 프로세스 종료
- logs 삭제
```

즉 workflow YAML 한 줄 실수가 실제 앱 운영 파일에 바로 영향을 준다.

장기적으로는 다음처럼 세 갈래로 분리하는 편이 낫다.

```text
appuser
- 앱 실행 계정
- 앱 프로세스 소유

deployuser
- 배포 실행 계정
- 배포 디렉터리와 restart 권한만 제한적으로 보유

runneruser
- QA 실행 계정
- 앱 배포 디렉터리 쓰기 권한 없음
```

### CD runner가 실제로 해야 하는 일

```text
1. JAR artifact 다운로드 또는 빌드 산출물 수신
2. releases/에 새 JAR 저장
3. previous 기록 갱신
4. current.jar symlink를 새 JAR로 변경
5. restart.sh 실행
6. liveness health check
7. readiness health check
8. 실패 시 previous JAR로 rollback
```

workflow label은 QA와 다르게 잡는다.

```yaml
# QA workflow
runs-on: [self-hosted, myapp-qa]

# Deploy workflow
runs-on: [self-hosted, myapp-deploy]
```

이렇게 하면 QA workflow가 배포 권한을 가진 runner에서 실행되지 않는다.

### CD runner 계정 예시

```bash
sudo useradd -m -d /opt/myapp-github-deploy-runner -s /bin/bash deployuser
sudo chown -R deployuser:deployuser /opt/myapp-github-deploy-runner
```

runner 등록 시 label을 명확히 둔다.

```bash
sudo -u deployuser -H ./config.sh \
  --url https://github.com/<org>/<repo> \
  --token <new-token> \
  --name myapp-deploy-runner \
  --labels myapp-deploy
```

서비스 등록은 deploy 계정으로 실행되게 한다.

```bash
sudo ./svc.sh install deployuser
sudo ./svc.sh start
sudo ./svc.sh status
```

### CD runner 권한 부여 방향

`deployuser`에 무작정 sudo 전체 권한을 주면 QA runner와 분리한 의미가 약해진다. 필요한 권한은 배포 작업으로 제한한다.

```text
허용할 수 있는 작업
- releases 디렉터리 쓰기
- current.jar symlink 변경
- previous 갱신
- restart.sh 실행
- health check curl 실행

가능하면 막아야 할 작업
- 웹 서버 설정 수정
- DB 직접 수정
- /etc 전체 수정
- 임의 sudo 명령
- QA runner 디렉터리 수정
```

처음부터 CD 자동화를 붙이기보다, 기존 `deploy.sh`와 `restart.sh`가 실제로 하는 작업을 정확히 나눈 뒤 제한된 sudoers 정책을 설계하는 것이 좋다.

### CD runner는 용량을 많이 쓰는가

QA runner보다 CD runner의 추가 용량은 보통 훨씬 작다.

QA runner가 용량을 많이 쓰는 이유:

```text
- node_modules
- npm cache
- Playwright Chromium
- Playwright trace/report/screenshot
- 테스트 결과 파일
```

반면 CD runner는 보통 다음 정도만 필요하다.

```text
- GitHub runner 본체: 수백 MB
- Git checkout 또는 artifact 다운로드 공간: 수백 MB ~ 수 GB
- 배포 JAR 임시 보관: JAR 크기만큼
- 로그 약간
```

대략적인 추가 사용량:

```text
최소: 500MB ~ 1GB
보통: 1GB ~ 3GB
JAR artifact와 checkout을 많이 남기면: 5GB 이상
```

여유 디스크가 충분하다면 CD runner 자체는 용량 부담이 크지 않다. 다만 JAR releases를 계속 쌓으면 그쪽이 더 빨리 문제가 된다.

```bash
df -h
du -sh /opt/myapp-github-runner
du -sh /opt/myapp-github-deploy-runner
du -sh /opt/myapp/deploy/releases
```

릴리즈 JAR는 보관 정책을 둔다.

```text
예시
- 최근 5개 JAR 보관
- 또는 최근 14일치 보관
- current.jar와 previous가 가리키는 JAR는 삭제하지 않기
```

## 정리

- self-hosted runner는 GitHub가 서버에 접속하는 방식이 아니라, 서버의 runner가 GitHub에 outbound로 연결하는 방식이다.
- runner 실행 계정은 GitHub 로그인 계정이 아니라 서버 내부 실행 계정이다. 비밀번호 없이 systemd로 실행할 수 있다.
- 계정 분리는 사람을 나누기 위한 것이 아니라 workflow 실수의 영향 범위를 제한하기 위한 것이다.
- OS 패키지 설치는 관리자 권한으로 최초 1회, QA 실행은 낮은 권한의 runner 계정으로 한다.
- workflow는 반드시 전용 label을 사용해야 조직 공용 runner로 새지 않는다.
- 배포 자동화를 붙일 때는 QA runner를 그대로 쓰지 말고 별도 계정과 label을 추가한다.
