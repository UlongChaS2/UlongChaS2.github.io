---
title: 'FastAPI 백엔드 온보딩'
date: '2026-03-12'
category: 'project'
keywords: ['FastAPI', 'Python', 'BE']
---

> React 개발자가 풀스택으로 전환하며 처음 접하는 FastAPI 백엔드를 정리한 기록이다.

## 개요

```
be/
├── main.py              # 앱 생성 + 미들웨어 + 라우터 연결 (설정 파일)
├── app/
│   ├── core/            # 인프라 — 환경변수, DB 연결, JWT
│   ├── domain/          # 순수 계산 함수 (외부 의존성 없음)
│   ├── entities/        # ORM — DB 테이블 매핑
│   ├── repositories/    # DB CRUD 함수
│   ├── schemas/         # 요청/응답 타입 정의 (Pydantic)
│   ├── services/        # 비즈니스 로직
│   └── api/v1/routers/  # HTTP 엔드포인트
```

### 레이어 의존성 규칙
```
routers → services → repositories → entities
```

---

## 파악 우선순위 (FE 개발자 기준)

| 순위 | 파일/폴더 | 이유 |
|------|-----------|------|
| 1 | `app/schemas/` | API 요청/응답 타입 = FE 인터페이스 직결 |
| 2 | `app/api/v1/routers/` | 실제 엔드포인트 목록 |
| 3 | `app/core/security.py` | 인증 흐름 이해 필수 |
| 4 | `app/entities/` | 어떤 데이터가 존재하는지 파악 |
| 5 | `app/services/` | 비동기 흐름 이해 |

---

## FastAPI란?

Next.js가 React 위에서 동작하듯, FastAPI는 Python 위에서 동작하는 API 프레임워크.

```
Next.js  → React 기반 웹 프레임워크
FastAPI  → Python 기반 API 프레임워크
```

핵심 기능 3가지:
1. **라우팅** — URL과 함수 연결
2. **자동 타입 검증** — Pydantic 스키마로 요청/응답 자동 검증
3. **의존성 주입(Depends)** — DB 세션, 인증 등을 함수에 자동으로 주입

---

## main.py — 앱 세팅 위치

```python
# 1. 앱 생성 (next.config.js + _app.tsx 역할)
app = FastAPI(title=settings.APP_NAME, lifespan=lifespan)

# 2. 미들웨어 (middleware.ts 역할)
app.add_middleware(SlowAPIMiddleware)   # Rate limiting
app.add_middleware(CORSMiddleware)      # CORS

# 3. 라우터 연결
app.include_router(api_router, prefix="/api/v1")
```

### URL이 만들어지는 흐름
```
main.py prefix "/api/v1"
  + router.py prefix "/orders"
  + orders.py @router.post("/analyze")
= POST /api/v1/orders/analyze
```

### 코드를 보다 발견한 문제

- `Request`, `JSONResponse` import 되어 있지만 **사용하지 않음** → 삭제 필요
- `limiter` 인스턴스가 `main.py`와 라우터 파일에 **각각 따로 생성됨** → 하나로 통합 필요

---

## app/core/config.py — 환경변수 관리

```python
# process.env.XXX 와 동일하지만 타입 강제 + 서버 시작 시 검증
settings.APP_NAME
settings.DATABASE_URL
settings.SECRET_KEY
settings.CORS_ORIGINS  # ["http://localhost:3000"]
```

| React | Python |
|-------|--------|
| `process.env.NEXT_PUBLIC_API_URL` | `settings.API_V1_PREFIX` |
| 타입 없음 (전부 string) | 타입 강제 (틀리면 서버 시작 시 에러) |
| 런타임에 undefined 가능 | 기본값 없으면 즉시 에러 |

---

## app/core/security.py — JWT 인증

### 토큰 종류
- Access Token: **30분** 만료
- Refresh Token: **7일** 만료

### 인증 흐름
```
소셜 로그인 성공
  → create_access_token(user_id)   # 30분
  → create_refresh_token(user_id)  # 7일
  → FE에 토큰 전달

FE가 API 요청
  → Authorization: Bearer {access_token}
  → Depends(get_current_user_id) 가 자동으로 검증
  → 통과하면 user_id 라우터 함수에 주입

30분 후 만료
  → POST /auth/refresh 에 refresh_token 전달
  → 새 access_token 발급
```

### Depends 두 종류
```python
Depends(get_current_user_id)   # 인증 필수 — 토큰 없으면 401
Depends(get_optional_user_id)  # 인증 선택 — 토큰 없으면 None 반환
```

### UTC 사용 이유
JWT의 exp는 Unix timestamp(숫자)로 저장 → 시간대 개념 없음.
한국 시간으로 저장하면 서버 환경에 따라 9시간 오차 발생 가능.
**"언제 발급했는지 스냅샷"** 개념 → 항상 UTC 기준.

---

## Python 문법 (JS 대응)

### def = function
```python
# Python
def create_access_token(user_id: str) -> str:
    return "token"

# JavaScript
function createAccessToken(userId: string): string {
    return "token"
}
```

### async def = async function
```python
# Python
async def get_current_user_id() -> str:
    return user_id

# JavaScript
async function getCurrentUserId(): Promise<string> {
    return userId
}
```

### 주요 차이점
| | Python | TypeScript |
|-|--------|------------|
| 블록 구분 | 들여쓰기 | 중괄호 `{}` |
| 타입 선언 위치 | `user_id: str` | `userId: string` |
| 반환 타입 | `-> str` | `: string` |

---

## 기타

### `__init__.py`
- 폴더를 Python 패키지로 인식시키는 파일
- 내용은 보통 비어있음
- **삭제하면 안 됨** — Pyright/pytest/alembic 등이 오작동할 수 있음

### `__pycache__`
- Python이 자동 생성하는 컴파일 캐시
- JS의 `.next/` 폴더와 동일 — 신경 안 써도 됨

### `pyrightconfig.json`
- Pyright LSP가 `.venv`를 찾을 수 있도록 설정
- 없으면 에디터에서 import 빨간 줄 발생
```json
{
  "venvPath": ".",
  "venv": ".venv"
}
```
