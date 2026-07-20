---
title: 'Firebase Cloud Messaging으로 웹 푸시 구현하기 (3) — 백그라운드와 서비스 워커'
date: '2025-09-16'
category: 'study'
---

> ⚠️ 초안입니다. 실제 구현 경험 부분은 보강 예정입니다.

# 개요

1편에서 Firebase 초기화와 토큰 발급을, 2편에서 포그라운드 수신을 다뤘습니다. 마지막 편에서는 **앱이 백그라운드에 있거나 아예 브라우저 탭이 닫힌 상태**에서 메시지를 받는 방법을 다룹니다.

이 경우 실행 중인 JavaScript 컨텍스트가 없기 때문에, 페이지가 아니라 **서비스 워커**가 메시지를 대신 받아야 합니다. 웹 푸시 구현에서 가장 헷갈리는 부분이 대부분 여기에 몰려 있습니다.

# 서비스 워커가 필요한 이유

서비스 워커는 페이지와 별개의 생명주기를 가지고 백그라운드에서 도는 스크립트입니다. 페이지가 닫혀도 브라우저가 살아 있으면 푸시 이벤트를 받아 깨어날 수 있습니다.

푸시 수신 흐름은 이렇습니다.

1. 서버가 FCM에 메시지를 보냅니다.
2. FCM이 브라우저 푸시 서비스(Chrome이면 FCM 자체, Firefox면 Mozilla autopush 등)로 전달합니다.
3. 브라우저가 등록된 서비스 워커를 깨워 `push` 이벤트를 전달합니다.
4. 서비스 워커가 알림을 표시하거나, 페이지가 열려 있다면 2편에서 본 `onMessage`로 넘깁니다.

즉 **포그라운드든 백그라운드든 진입점은 항상 서비스 워커**입니다. 2편 마지막에서 언급했듯이 서비스 워커 등록이 실패하면 포그라운드 수신까지 함께 죽는 이유가 여기 있습니다.

# firebase-messaging-sw.js 작성

FCM 웹 SDK는 **`firebase-messaging-sw.js`라는 정해진 파일명**을 관례로 사용합니다. `getToken()`을 호출할 때 별도 등록 객체를 넘기지 않으면 SDK가 스코프 루트에서 이 파일을 찾아 자동으로 등록합니다.

이 파일은 번들러를 거치지 않고 **정적 파일로 그대로 서빙되는 경로**에 둬야 합니다. CRA라면 `public/`, Vite라면 `public/`, Gatsby라면 `static/`입니다.

```jsx
// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_AUTH_DOMAIN',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_STORAGE_BUCKET',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
  appId: 'YOUR_APP_ID',
})

const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
  console.log('백그라운드 메시지 수신:', payload)

  const title = payload.notification?.title ?? '알림'
  const options = {
    body: payload.notification?.body,
    icon: '/icons/notification.png',
    data: payload.data,
  }

  self.registration.showNotification(title, options)
})
```

여기서 두 가지가 눈에 걸릴 겁니다.

**첫째, 왜 `compat` 버전을 쓰나요?**

서비스 워커는 기본적으로 ES 모듈이 아닌 클래식 스크립트로 실행됩니다. 그래서 `import` 문 대신 `importScripts()`를 쓰고, 모듈 방식이 아닌 `compat` 빌드를 불러옵니다. ES 모듈 방식으로 쓰고 싶다면 등록 시 `{ type: 'module' }`을 명시해야 하는데, 브라우저 지원 범위를 고려하면 `compat` 쪽이 안전합니다.

**둘째, 왜 환경 변수를 못 쓰나요?**

`public/`이나 `static/`에 있는 파일은 번들러의 변환 대상이 아닙니다. `process.env.REACT_APP_...`을 써도 치환되지 않고 문자열 그대로 남거나 `process is not defined` 에러가 납니다. 1편에서 얘기했듯 Firebase SDK 설정 값은 어차피 번들에 그대로 노출되는 값이라 하드코딩해도 보안상 문제는 없습니다. 그래도 값을 한 곳에서 관리하고 싶다면 빌드 스크립트에서 템플릿을 치환해 생성하는 방식을 쓸 수 있습니다.

<!-- TODO: (여기에 실제 겪은 문제/해결 과정을 적을 것) -->

# onBackgroundMessage가 호출되지 않는 경우

이게 가장 자주 부딪히는 함정입니다. **`notification` 필드가 포함된 메시지를 보내면 `onBackgroundMessage`가 호출되지 않을 수 있습니다.**

이유는 이렇습니다. `notification` 필드가 있으면 브라우저가 그 값을 읽어 알림을 **자동으로** 띄웁니다. 이 경로는 SDK 코드를 거치지 않기 때문에 `onBackgroundMessage` 콜백이 실행될 이유가 없습니다. 여기서 콜백 안에 `showNotification()`을 또 써 두면 **알림이 두 번 뜨는** 현상이 생깁니다.

해결책은 서버에서 **data-only 메시지**를 보내는 것입니다.

```jsonc
// notification 필드를 빼고 data만 보냅니다
{
  "message": {
    "token": "<device-token>",
    "data": {
      "title": "새 댓글이 달렸습니다",
      "body": "작성하신 글에 댓글이 등록되었습니다.",
      "link": "/posts/1234"
    },
    "webpush": {
      "headers": { "Urgency": "high" }
    }
  }
}
```

이렇게 하면 브라우저의 자동 표시 경로를 타지 않으므로 `onBackgroundMessage`가 항상 호출되고, 알림의 모양·아이콘·클릭 동작을 전부 코드에서 통제할 수 있습니다. 2편에서 data-only를 권했던 것도 같은 이유입니다.

```jsx
messaging.onBackgroundMessage((payload) => {
  const { title, body, link } = payload.data ?? {}

  self.registration.showNotification(title ?? '알림', {
    body,
    icon: '/icons/notification.png',
    data: { link },
  })
})
```

<!-- TODO: (여기에 실제 겪은 문제/해결 과정을 적을 것) -->

# 알림 클릭 처리

알림을 띄우는 것까지는 절반입니다. 사용자가 알림을 눌렀을 때 원하는 화면으로 데려가야 합니다. 이건 서비스 워커의 `notificationclick` 이벤트에서 처리합니다.

```jsx
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const targetUrl = event.notification.data?.link ?? '/'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // 이미 열려 있는 탭이 있으면 그 탭을 재사용합니다
      for (const client of clientList) {
        const url = new URL(client.url)

        if (url.origin === self.location.origin && 'focus' in client) {
          client.focus()
          client.postMessage({ type: 'NAVIGATE', url: targetUrl })
          return
        }
      }

      // 열린 탭이 없으면 새로 엽니다
      return self.clients.openWindow(targetUrl)
    })
  )
})
```

몇 가지 짚을 점이 있습니다.

- **`event.waitUntil()`로 감싸야 합니다.** 서비스 워커는 할 일이 없다고 판단되면 언제든 종료됩니다. 비동기 작업을 `waitUntil`로 감싸지 않으면 `openWindow`가 실행되기 전에 워커가 죽어 아무 일도 일어나지 않을 수 있습니다.
- **`includeUncontrolled: true`가 필요합니다.** 서비스 워커가 아직 제어권을 잡지 못한 탭(예: 워커 설치 이전에 열려 있던 탭)도 목록에 포함시키기 위해서입니다.
- **이미 열린 탭이 있으면 재사용하는 게 좋습니다.** 알림을 누를 때마다 새 탭이 쌓이면 사용자 경험이 나쁩니다.
- **SPA에서는 `postMessage`로 라우팅을 넘깁니다.** 기존 탭에 `client.navigate()`를 쓰면 전체 페이지가 새로고침되면서 앱 상태가 날아갑니다. 대신 메시지를 보내 앱 쪽 라우터가 처리하게 하는 편이 자연스럽습니다.

페이지 쪽에서는 이 메시지를 받아 라우팅합니다.

```jsx
useEffect(() => {
  const handler = (event) => {
    if (event.data?.type === 'NAVIGATE') {
      navigate(event.data.url)
    }
  }

  navigator.serviceWorker.addEventListener('message', handler)
  return () => navigator.serviceWorker.removeEventListener('message', handler)
}, [navigate])
```

# 스코프 문제

서비스 워커는 **자기 파일이 위치한 경로 이하만 제어**할 수 있습니다. `/firebase-messaging-sw.js`에 있으면 사이트 전체를, `/assets/firebase-messaging-sw.js`에 있으면 `/assets/` 이하만 제어합니다.

번들러 설정에 따라 정적 파일이 해시가 붙은 하위 경로로 떨어지는 경우가 있는데, 그러면 루트 경로의 페이지들이 워커의 제어를 받지 못해 푸시가 동작하지 않습니다. **반드시 사이트 루트에서 서빙되는지 확인해야 합니다.**

경로를 바꿔야 한다면 직접 등록하고 그 등록 객체를 `getToken`에 넘기면 됩니다.

```jsx
import { getMessaging, getToken } from 'firebase/messaging'

async function issueToken() {
  const registration = await navigator.serviceWorker.register('/custom-path/firebase-messaging-sw.js', {
    scope: '/', // 상위 스코프를 요구하려면 서버가 Service-Worker-Allowed 헤더를 내려줘야 합니다
  })

  return getToken(getMessaging(app), {
    vapidKey: 'YOUR_VAPID_KEY',
    serviceWorkerRegistration: registration,
  })
}
```

상위 스코프를 요구하는 경우 서버가 응답 헤더에 `Service-Worker-Allowed: /`를 내려줘야 합니다. 정적 호스팅 환경에서는 헤더 제어가 어려울 수 있으니, 웬만하면 루트에 두는 쪽이 속 편합니다.

# 라이프사이클과 캐시 문제

서비스 워커를 처음 다룰 때 가장 당혹스러운 부분입니다. **파일을 고쳤는데 예전 코드가 계속 돕니다.**

서비스 워커는 이런 순서로 업데이트됩니다.

1. 브라우저가 새 워커 파일을 감지하면 **설치(installing)** 를 시작합니다.
2. 설치가 끝나면 **대기(waiting)** 상태로 들어갑니다.
3. 기존 워커가 제어하는 탭이 **전부 닫혀야** 새 워커가 **활성(activated)** 됩니다.

여기서 3번이 함정입니다. 개발 중에 새로고침만 하면 탭이 완전히 닫힌 게 아니라서 새 워커가 영원히 대기 상태에 머물 수 있습니다.

즉시 교체하려면 워커 안에서 명시적으로 처리합니다.

```jsx
self.addEventListener('install', () => {
  self.skipWaiting() // 대기 건너뛰고 바로 활성화
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim()) // 기존 탭들의 제어권도 즉시 가져오기
})
```

`skipWaiting()`은 편리하지만 프로덕션에서는 신중해야 합니다. 열려 있는 페이지가 이전 버전의 에셋을 기대하는 상황에서 워커만 갑자기 새 버전으로 바뀌면 불일치가 생길 수 있습니다. 푸시 전용 워커처럼 캐싱 책임이 없는 경우에는 부담이 적습니다.

디버깅할 때는 Chrome DevTools의 **Application → Service Workers** 패널을 활용하는 게 가장 빠릅니다. `Update on reload`를 켜두면 새로고침마다 워커가 갱신되고, `Unregister`로 완전히 초기화할 수 있습니다. 또 하나 자주 놓치는 건 **워커 파일 자체가 HTTP 캐시에 잡히는 경우**입니다. 서버가 `firebase-messaging-sw.js`에 긴 `Cache-Control`을 걸어두면 브라우저가 새 파일을 아예 받아오지 않습니다. 이 파일은 `no-cache`로 내려주는 게 맞습니다.

<!-- TODO: (여기에 실제 겪은 문제/해결 과정을 적을 것) -->

# 그 밖의 제약

- **iOS Safari는 홈 화면에 추가된 PWA에서만 웹 푸시를 지원합니다.** iOS 16.4부터 지원이 시작됐지만, 일반 Safari 탭에서는 동작하지 않습니다. `manifest.json`과 `display: standalone` 설정이 필요합니다.
- **HTTPS가 필수입니다.** `localhost`만 예외입니다.
- **서비스 워커 안에서는 `window`, `document`, `localStorage`에 접근할 수 없습니다.** 상태를 보관해야 한다면 IndexedDB를 써야 합니다.
- **토큰은 영구적이지 않습니다.** 앱 재설치, 브라우저 데이터 삭제, 장기 미사용 등으로 무효화될 수 있으므로 주기적으로 갱신해 서버와 동기화해야 합니다. 이 부분은 1편에서 다뤘습니다.

# 정리

세 편에 걸쳐 FCM 웹 푸시를 살펴봤습니다.

- 1편 — Firebase 초기화와 토큰 발급/관리
- 2편 — 포그라운드 수신과 직접 렌더링
- 3편 — 서비스 워커를 통한 백그라운드 수신

핵심을 다시 요약하면 이렇습니다.

1. **모든 수신 경로의 진입점은 서비스 워커**입니다. 포그라운드 처리도 여기에 의존합니다.
2. **data-only 메시지를 쓰면 동작이 일관됩니다.** `notification` 필드는 브라우저의 자동 표시 경로를 타면서 콜백을 건너뛰고 중복 알림을 유발합니다.
3. **비동기 작업은 `event.waitUntil()`로 감싸야 합니다.** 서비스 워커는 언제든 종료될 수 있습니다.
4. **스코프와 라이프사이클이 대부분의 "왜 안 되지"를 만듭니다.** 파일 위치, 캐시 헤더, 워커 대기 상태를 먼저 의심해보세요.
