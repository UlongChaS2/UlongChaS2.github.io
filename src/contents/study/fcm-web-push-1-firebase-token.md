---
title: 'Firebase Cloud Messaging으로 웹 푸시 구현하기 (1) — Firebase Token'
date: '2025-09-02'
category: 'study'
keywords: ['FCM', 'Firebase', '웹 푸시']
---

> FCM으로 웹 푸시를 구현하는 시리즈의 첫 글. Firebase 설정·초기화와 Firebase Token 발급을 FE 시점에서 다룬다.

## 개요

웹 푸시 알림은 사용자의 브라우저에서 중요한 알림을 전달할 수 있는 기능이다. Firebase Cloud Messaging(FCM)을 활용하면 간단하게 웹 푸시 알림을 구현할 수 있다. 본 시리즈에서는 웹 푸시 알림의 전체적인 구현 과정을 FE 시점에서 단계별로 설명한다. 이번 포스트에서는 **Firebase 설정 및 초기화**와 **Firebase Token 생성**과 관련된 부분을 다루며, 이후 포스트에서는 포그라운드와 백그라운드 환경에서의 메시지 처리 흐름을 살펴본다.

## 전체적인 FCM 흐름

클라이언트에서 알림 권한을 요청하고 FCM 토큰을 발급받아 서버에 등록하면, 서버가 그 토큰을 대상으로 FCM에 메시지 발송을 요청하고 FCM이 브라우저 푸시 서비스를 통해 사용자에게 알림을 전달하는 구조다.

## Firebase 설정 및 초기화

1. Firebase Messaging 모듈 설치

    ```jsx
    npm install firebase
    ```

2. .env에 할당했던 Firebase sdk 설정 값을 가져와 초기화한다.

    ```jsx
    import { initializeApp } from 'firebase/app'

    const firebaseConfig = {
      apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
      authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
      storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.REACT_APP_FIREBASE_APP_ID,
      measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
    }

    export const app = initializeApp(firebaseConfig)
    ```

    Firebase sdk의 값들은 암호화 되어 외부적으로 유출되어도 상관은 없지만 환경변수를 관리하는 측면에서 `.env` 파일에 할당하는 것을 추천한다. (프론트엔드 애플리케이션은 브라우저에서 실행되므로 최종 번들 파일은 누구든지 열어볼 수 있다. 따라서 `.env` 파일의 값이 코드에 삽입된 후, 번들 파일에서 해당 값이 노출될 가능성이 있어 민감한 정보는 절대 담지 않는다.)

## Firebase Token 생성 및 관리
