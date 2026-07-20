---
title: 'Firebase Cloud Messaging으로 웹 푸시 구현하기 (2) — 포그라운드 수신'
date: '2025-09-09'
category: 'study'
---

> ⚠️ 초안입니다. 실제 구현 경험 부분은 보강 예정입니다.

# 개요

1편에서는 Firebase 설정과 초기화, 그리고 FCM 토큰을 발급받아 서버로 전달하는 부분까지 다뤘습니다. 토큰이 준비됐다면 이제 실제로 메시지를 받아볼 차례입니다.

FCM은 앱이 **포그라운드**에 있을 때와 **백그라운드**에 있을 때의 메시지 처리 경로가 완전히 다릅니다. 이번 포스트에서는 그중 포그라운드, 즉 **사용자가 지금 우리 웹 페이지를 보고 있는 상태**에서 메시지를 받는 방법을 다룹니다. 백그라운드와 서비스 워커는 다음 편에서 이어집니다.

# 포그라운드에서는 알림이 자동으로 뜨지 않습니다

가장 먼저 짚고 넘어가야 할 부분입니다. FCM 콘솔이나 서버에서 알림 메시지를 보냈는데 페이지를 켜둔 상태에서는 아무것도 안 뜨는 경우가 있습니다. 이건 버그가 아니라 **의도된 동작**입니다.

FCM 웹 SDK는 페이지가 포그라운드일 때 브라우저 기본 알림을 자동으로 띄우지 않습니다. 사용자가 이미 화면을 보고 있는데 같은 내용을 OS 알림으로 또 띄우면 오히려 방해가 되기 때문입니다. 대신 SDK는 메시지를 `onMessage` 콜백으로 넘겨주고, **어떻게 보여줄지는 전적으로 개발자에게 맡깁니다.**

정리하면 이렇습니다.

| 앱 상태 | 처리 주체 | 알림 표시 |
|---|---|---|
| 포그라운드 | 페이지의 `onMessage` | 직접 구현 |
| 백그라운드 / 종료 | 서비스 워커 | 브라우저가 자동 표시 |

# onMessage로 메시지 받기

`getMessaging`으로 메시징 인스턴스를 가져온 뒤 `onMessage`를 등록하면 됩니다.

```jsx
import { getMessaging, onMessage } from 'firebase/messaging'
import { app } from './firebase' // 1편에서 initializeApp으로 만든 인스턴스

const messaging = getMessaging(app)

const unsubscribe = onMessage(messaging, (payload) => {
  console.log('포그라운드 메시지 수신:', payload)
})
```

`onMessage`는 **구독 해제 함수를 반환**합니다. React 컴포넌트 안에서 등록한다면 반드시 정리해줘야 합니다. 그렇지 않으면 리렌더링이나 라우팅마다 리스너가 쌓여서 알림이 중복으로 처리됩니다.

```jsx
import { useEffect } from 'react'

function usePushMessage(onReceive) {
  useEffect(() => {
    const messaging = getMessaging(app)
    const unsubscribe = onMessage(messaging, onReceive)

    return () => unsubscribe()
  }, [onReceive])
}
```

`onReceive`를 의존성 배열에 넣었기 때문에, 호출하는 쪽에서는 `useCallback`으로 감싸주지 않으면 매 렌더마다 재구독이 일어납니다. 이 부분은 커스텀 훅을 쓸 때 놓치기 쉬운 지점입니다.

<!-- TODO: (여기에 실제 겪은 문제/해결 과정을 적을 것) -->

# payload 구조 이해하기

`onMessage`로 들어오는 payload는 서버가 어떤 형태로 메시지를 보냈느냐에 따라 모양이 달라집니다. FCM 메시지는 크게 두 가지 필드를 가질 수 있습니다.

```jsonc
{
  "notification": {
    "title": "새 댓글이 달렸습니다",
    "body": "작성하신 글에 댓글이 등록되었습니다."
  },
  "data": {
    "postId": "1234",
    "type": "COMMENT"
  }
}
```

- `notification` — 제목/본문처럼 **표시용** 필드입니다. 백그라운드일 때 브라우저가 이 값을 그대로 읽어 알림을 자동 생성합니다.
- `data` — 개발자가 정의하는 **임의의 키-값** 데이터입니다. 값은 항상 문자열이어야 합니다. 숫자나 객체를 넣고 싶다면 직렬화해서 보내고 클라이언트에서 파싱해야 합니다.

여기서 실무적으로 중요한 선택지가 하나 생깁니다. **`notification` 없이 `data`만 보내는 방식(data-only 메시지)** 입니다.

`notification` 필드가 있으면 백그라운드에서 브라우저가 알림을 자동으로 띄우기 때문에 개발자가 표시 방식을 제어할 여지가 줄어듭니다. 반대로 data-only로 보내면 포그라운드/백그라운드 양쪽 모두 코드에서 직접 처리하게 되므로 동작이 일관됩니다. 알림 UI를 서비스 디자인에 맞춰 통제하고 싶다면 data-only 쪽이 다루기 편합니다.

```jsx
onMessage(messaging, (payload) => {
  const { title, body } = payload.notification ?? {}
  const { postId, type } = payload.data ?? {}

  // notification이 없을 수도 있으므로 항상 옵셔널하게 접근합니다
})
```

# 1. 앱 내부 UI로 렌더링하기

포그라운드라면 사용자가 이미 화면을 보고 있으므로, OS 알림보다 **인앱 토스트**가 자연스러운 경우가 많습니다.

```jsx
function PushListener() {
  const [toast, setToast] = useState(null)

  useEffect(() => {
    const messaging = getMessaging(app)

    const unsubscribe = onMessage(messaging, (payload) => {
      setToast({
        title: payload.notification?.title ?? '알림',
        body: payload.notification?.body ?? '',
        link: payload.data?.link,
      })
    })

    return () => unsubscribe()
  }, [])

  if (!toast) return null

  return <Toast {...toast} onClose={() => setToast(null)} />
}
```

이 방식의 장점은 명확합니다. 알림 권한 상태와 무관하게 항상 동작하고, 클릭 시 라우터로 바로 이동시킬 수 있으며, 디자인 시스템에 맞춰 스타일을 통일할 수 있습니다.

<!-- TODO: (여기에 실제 겪은 문제/해결 과정을 적을 것) -->

# 2. Notification API로 OS 알림 띄우기

인앱 UI로는 부족하고 OS 레벨 알림이 필요하다면 브라우저 표준인 `Notification` API를 직접 호출하면 됩니다.

```jsx
onMessage(messaging, (payload) => {
  if (Notification.permission !== 'granted') return

  const notification = new Notification(payload.notification?.title ?? '알림', {
    body: payload.notification?.body,
    icon: '/icons/notification.png',
    tag: payload.data?.type, // 같은 tag는 하나로 합쳐집니다
    data: payload.data,
  })

  notification.onclick = (event) => {
    event.preventDefault()
    window.focus()
    notification.close()
  }
})
```

몇 가지 주의할 점이 있습니다.

- **권한 확인은 필수입니다.** `Notification.permission`이 `'granted'`가 아닌 상태에서 생성자를 호출하면 알림이 뜨지 않습니다. 권한 요청은 1편에서 토큰을 발급받기 전에 이미 처리했겠지만, 사용자가 브라우저 설정에서 나중에 권한을 취소할 수 있으므로 매번 확인하는 편이 안전합니다.
- **`tag`를 활용하면 중복 알림을 합칠 수 있습니다.** 같은 `tag` 값을 가진 알림은 새 알림이 기존 알림을 대체합니다. 짧은 시간에 같은 종류의 알림이 여러 번 오는 경우 유용합니다.
- **모바일 브라우저에서는 생성자 방식이 막혀 있습니다.** Android Chrome을 비롯한 일부 환경에서는 `new Notification()`이 `TypeError`를 던집니다. 이 환경에서는 서비스 워커의 `showNotification()`을 써야 합니다.

마지막 항목 때문에, OS 알림을 확실하게 띄우고 싶다면 생성자 대신 서비스 워커 등록 객체를 경유하는 쪽이 안전합니다.

```jsx
async function showNotification(title, options) {
  const registration = await navigator.serviceWorker.ready
  await registration.showNotification(title, options)
}
```

`showNotification`은 포그라운드에서도 호출할 수 있고, 모바일을 포함한 대부분의 환경에서 동작합니다. 다만 이 방식으로 띄운 알림의 클릭 처리는 페이지가 아니라 **서비스 워커의 `notificationclick` 이벤트**에서 받게 되므로, 라우팅 로직도 그쪽으로 옮겨가야 합니다. 이 부분은 3편에서 다룹니다.

# 페이지 가시성에 따른 분기

`onMessage`는 페이지가 열려 있기만 하면 호출됩니다. 즉 사용자가 다른 탭을 보고 있어도 이 탭이 살아 있다면 포그라운드 핸들러가 돕니다. 이때 인앱 토스트를 띄워봤자 사용자는 보지 못합니다.

`document.visibilityState`로 분기해주면 자연스럽습니다.

```jsx
onMessage(messaging, (payload) => {
  if (document.visibilityState === 'visible') {
    showInAppToast(payload)
  } else {
    showNotification(payload.notification?.title ?? '알림', {
      body: payload.notification?.body,
      data: payload.data,
    })
  }
})
```

# 개발 환경에서의 제약

포그라운드 수신을 테스트할 때 걸리는 조건들이 있습니다.

- **HTTPS 또는 localhost에서만 동작합니다.** Push API와 Service Worker는 보안 컨텍스트를 요구합니다. `localhost`는 예외로 허용되므로 로컬 개발에는 문제가 없지만, `192.168.x.x` 같은 사설 IP로 모바일에서 접속해 테스트하려 하면 동작하지 않습니다. 이 경우 터널링 도구로 HTTPS 주소를 만들어 접속해야 합니다.
- **시크릿 모드에서는 알림 권한과 토큰이 세션마다 초기화됩니다.**
- **`onMessage`가 호출되려면 서비스 워커가 등록되어 있어야 합니다.** 포그라운드 처리인데도 그렇습니다. FCM 웹 SDK는 메시지 수신 자체를 서비스 워커를 통해 받고, 페이지가 살아 있으면 그 메시지를 `onMessage`로 넘겨주는 구조이기 때문입니다. 그래서 `firebase-messaging-sw.js`가 없거나 등록에 실패하면 포그라운드 수신도 함께 실패합니다.

마지막 항목은 "포그라운드는 서비스 워커랑 무관하겠지"라고 생각하기 쉬운 지점입니다. 실제로는 서비스 워커가 모든 수신 경로의 전제 조건입니다.

<!-- TODO: (여기에 실제 겪은 문제/해결 과정을 적을 것) -->

# 정리

- 포그라운드에서는 브라우저 기본 알림이 자동으로 뜨지 않습니다. SDK가 의도적으로 개발자에게 표시 책임을 넘깁니다.
- `onMessage`로 payload를 받고, 인앱 UI나 `Notification` API 중 상황에 맞는 방식으로 직접 렌더링합니다.
- 리스너는 반드시 구독 해제해야 중복 처리가 생기지 않습니다.
- `document.visibilityState`로 실제 사용자가 화면을 보고 있는지 판단해 표시 방식을 나누면 좋습니다.
- 포그라운드 수신조차 서비스 워커 등록에 의존합니다.

다음 편에서는 그 서비스 워커 자체를 다룹니다. `firebase-messaging-sw.js` 작성, `onBackgroundMessage`, 알림 클릭 처리, 그리고 스코프와 라이프사이클에서 오는 함정들을 살펴봅니다.
