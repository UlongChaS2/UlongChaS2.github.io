---
title: '손으로 베낀 API 타입 지우기 — openapi-typescript와 zod로 타입 drift 없애기'
date: '2026-07-14'
category: 'study'
keywords: ['zod', 'openapi', 'CI']
---

> 손으로 베껴 적던 API 타입 200여 개를 BE의 OpenAPI 스펙에서 자동 생성으로 바꾸고, 스펙이 없는 곳은 zod로 막고, 재생성 누락은 CI로 잡은 기록.

<!--more-->

실무 프로젝트의 FE 타입을 정리하다가 세어보니 API 응답을 손으로 베껴 적은 인터페이스가 200개를 넘게 있었다. 백엔드 개발자가 DTO를 만들면 내가 그걸 보고 TypeScript 인터페이스로 옮겨 적는 방식이었는데, 처음엔 잘 맞았지만 시간이 지나면서 BE가 필드를 바꿔도 FE 타입은 그대로인 케이스가 쌓였다. 타입은 있는데 믿을 수가 없는 상태. 어디가 어긋났는지는 화면에서 undefined가 떠야 알 수 있었다.

그래서 손타입을 전부 BE 스펙에서 **자동 생성**으로 바꾸는 작업을 했고, 그 과정에서 "어떤 타입은 바꾸면 안 되는지", "스펙이 거짓말할 때는 어떻게 하는지"를 꽤 많이 배웠다. 그 기록.

## 개요

핵심은 한 문장이다. **FE의 API 타입을 손으로 쓰지 않고, BE(springdoc)가 이미 발행하는 OpenAPI 스펙에서 기계적으로 생성한다.**

```
BE (springdoc) ──/v3/api-docs──▶ openapi.json (스냅샷, git 커밋)
                                     │  openapi-typescript
                                     ▼
                              schema.d.ts (생성물, git 커밋)
                                     │  components['schemas'][...] 파생
                                     ▼
                        각 도메인 model.ts의 타입 ──▶ 컴포넌트/훅
```

이렇게 하면 BE가 필드를 바꿨을 때 → 타입 재생성 → 그 타입을 쓰는 모든 코드에 **컴파일 에러**가 뜬다. 전에는 런타임에 undefined로 조용히 터지던 게, 이제는 코딩하는 순간 빨간 줄로 보인다.

## 요약

- API 응답 타입은 `openapi-typescript`로 BE 스펙에서 파생 (경로①, 기본)
- 스펙에 스키마가 없는 엔드포인트는 `zod` 스키마 + `z.infer` + 경계 검증 (경로②)
- 재생성을 잊는 건 CI가 잡는다 — 스펙 스냅샷을 커밋해두고 PR마다 diff 검사
- **모든 타입이 대상은 아니다** — 폼 상태·편집 행 타입은 FE 소유라 손타입 유지
- 보정(Omit)이 필드 절반을 넘으면 파생을 포기하는 게 낫다

## 경로① — 컴파일 타임 파생 (기본)

`schema.d.ts`는 타입 선언만 있는 파일이라 번들에 0바이트다. 도메인 모델에서는 alias만 긋는다:

```ts
import type { components } from '@/shared/api/schema'

// 손으로 베끼는 대신 파생
export type ProductResponse = components['schemas']['ProductResponse']
```

스펙과 실제가 다른 필드가 있으면 그 필드만 보정하고 이유를 주석으로 남긴다:

```ts
// id: 스펙은 optional이지만 목록 행엔 항상 존재 — 필수로 조임
export type ProductRow = components['schemas']['ProductResponse'] & { id: string }
```

포인트는 **export 타입명을 유지**하는 것. 그러면 사용처는 한 줄도 안 바뀌고, model.ts 안의 정의만 교체된다. 덕분에 도메인 하나씩 점진적으로 갈 수 있었다 (빅뱅 금지).

## 경로② — zod 런타임 검증 (스펙에 스키마가 없을 때)

BE가 응답을 `Object`로 반환하면 스펙에 타입 정보가 아예 없다. 이런 엔드포인트는 코드젠이 불가능해서 zod로 계약을 직접 고정했다:

```ts
import { z } from 'zod'

export const orderSummarySchema = z.object({
  orderId: z.string(),
  totalAmount: z.number(),
  status: z.enum(['PENDING', 'PAID', 'CANCELED']),
})
export type OrderSummary = z.infer<typeof orderSummarySchema>  // 손타입 불필요

// api.ts — 무검증 캐스팅을 경계 검증으로
const res = await api.get(url).json<ApiEnvelope<unknown>>()
return { ...res, data: parseResponse(orderSummarySchema, res.data) }
```

경로①의 타입은 "BE가 약속을 지킨다고 가정"만 한다. zod는 응답이 실제로 계약과 맞는지 **매 요청 검사**하고, 어긋나면 화면 깊은 곳이 아니라 경계에서 어떤 필드가 어떻게 다른지까지 찍으면서 throw한다. 대신 이건 런타임 동작 변경이라, 지금까지 조용히 어긋나 있던 응답이 배포 후에 시끄럽게 터질 수 있다 — 도입할 때 주요 화면 스모크 테스트는 필수였다.

## CI drift 게이트 — 재생성을 사람이 잊는 문제

이 구조의 최대 리스크는 도구가 아니라 사람이다. BE가 바뀌었는데 아무도 `gen:api`를 안 돌리면? 코드가 멀쩡히 컴파일되니까 tsc도 못 잡는다. 그래서 CI에 이걸 넣었다:

```yaml
- name: API 타입 drift 검사
  run: |
    npm run gen:api:types          # 커밋된 openapi.json → schema.d.ts 재생성
    git diff --exit-code -- src/shared/api/schema.d.ts
```

스크립트는 두 개로 쪼갰다:

```json
"gen:api":       "BE 스펙 다운로드 → 키 정렬 → openapi.json 저장 → gen:api:types",
"gen:api:types": "openapi-typescript openapi.json -o src/shared/api/schema.d.ts"
```

처음엔 `openapi-typescript http://localhost:8080/v3/api-docs -o schema.d.ts` 한 줄이었다. 그런데 CI에서 검증하려면 CI가 BE를 띄워야 하는 문제가 생겼고(느리고 DB 필요), 스펙을 **파일(openapi.json)로 커밋**하는 걸로 풀었다. CI는 BE 없이 커밋된 스냅샷에서 재생성만 해서 diff를 비교하면 된다. 스냅샷은 JSON 키를 재귀 정렬해서 저장하는데, springdoc이 주는 키 순서가 실행마다 달라질 수 있어서 정렬 안 하면 내용이 같아도 diff가 매번 지저분해지기 때문이다.

## 전환 못 한 것들 — 그리고 어떻게 정리했나

작업하면서 제일 중요했던 건 도구 사용법이 아니라 **분류**였다. 손타입 200여 개를 까보니 세 부류가 섞여 있었다:

1. **BE 응답 미러** → 전환 대상. 같은 사실을 두 군데 적고 있던 것
2. **UI 상태** (검색 필터 폼, 낙관적 업데이트 상태) → 유지. BE 스펙에 존재 자체가 없다
3. **그리드 편집 행 타입** → 유지. 폼-행 타입을 응답 타입과 분리한 건 의도된 설계

그리고 1번 중에서도 전환 못 한 케이스들이 있었다:

| 케이스 | 정리 |
|---|---|
| BE가 스펙에 타입을 안 실음 (`Object` 반환) | 경로②(zod)로 전환 |
| FE가 일부러 필드명을 개명 (`errorMessage`→`error`) | 유지 — 파생하면 사용처 전체 리팩토링이라 별도 과제 |
| DB nullable 필드를 FE가 필수로 단정하고 있음 | 보정이 절반 넘으면 파생 포기 + 유지 사유 주석 |
| 사용처 없는 죽은 타입 | 어느 엔드포인트인지 확정 불가 → 파생 불가 |
| as-const 런타임 enum | 대상 외 — 타입만 바꾸면 런타임 값을 잃음 |

여기서 원칙 두 개가 생겼다:

- **보정(Omit 재정의)이 필드 절반을 넘으면 파생 가치가 없다.** `Omit<S,'a'|'b'|'c'|'d'> & {...}` 도배는 손타입보다 읽기 나쁘다.
- **required 거짓말이 optional 거짓말보다 나쁘다.** 스펙이 "없을 수도 있다"고 하면 FE가 null 체크를 하니까 안전한데, 안 오는 필드를 required로 박으면 FE가 체크를 지우고 프로덕션에서 터진다.

## 반전 — 스펙이 맞고 FE가 틀린 경우

한 엔드포인트는 스펙이 실제 응답과 전혀 다른 DTO를 가리키고 있어서 "BE 스펙이 잘못 문서화됐네" 하고 zod로 손타입 모양을 고정했다. 그런데 BE 코드를 파보니 **반대였다.** 두 달 전 커밋에서 BE가 응답 구조를 바꿨고(원본 데이터 passthrough → 처리 요약만 반환), FE 손타입이 옛날 모양을 기억하고 있던 거다. 심지어 손타입의 필드들이 BE의 **내부 파싱용 DTO**와 글자 단위로 일치했다 — 애초에 응답이 아니라 내부 DTO를 베낀 거였다.

화면이 안 터졌던 이유는 허무했는데, 그 응답 바디를 읽는 코드가 아무 데도 없었다. 버튼 누르면 refetch만 하고 결과는 다른 API로 조회하는 구조.

교훈: **스펙과 손타입이 다를 때 손타입이 맞다고 단정하지 말 것.** git 히스토리부터 봐야 한다. 손타입은 "한때 맞았던 기록"일 수 있다.

## BE 쪽도 고쳐야 열리는 것들

FE만으로는 한계가 있었다. 스펙이 부실한 근본 원인이 BE에 두 개 있었다.

**① ID 값 객체가 스펙에서 빈 객체(`{}`)로 노출.** 런타임은 Jackson 커스텀 직렬화로 ID를 문자열로 내보내는데 springdoc은 그걸 몰라서, 코드젠 결과가 `id: Record<string, never>`로 나왔다. FE에서 전부 `Omit<S,'id'> & { id: string }`으로 우회하고 있었는데, BE에 springdoc `ModelConverter` 한 클래스를 넣어서 해결했다:

```java
@Component
public class IdSchemaConverter implements ModelConverter {
    @Override
    public Schema<?> resolve(AnnotatedType type, ModelConverterContext ctx, Iterator<ModelConverter> chain) {
        JavaType t = Json.mapper().constructType(type.getType());
        if (t != null && t.getRawClass().getName().startsWith("com.example.shared.identifier.")) {
            return new StringSchema().format("uuid");  // 스펙만 진실로, 런타임 무변경
        }
        return chain.hasNext() ? chain.next().resolve(type, ctx, chain) : null;
    }
}
```

처음엔 ID 클래스 수십 개에 `@Schema(type="string")`을 하나씩 붙이는 방향으로 갔다가 컴파일이 깨졌다. ID 클래스들은 도메인 모듈에 있는데 거기엔 swagger 의존성이 없었던 것. 도메인 레이어에 문서화 라이브러리를 넣는 건 모듈 경계를 깨는 거라, web 모듈의 컨버터 한 개로 방향을 틀었다. 결과적으로 앞으로 생길 ID 클래스까지 자동 커버되니 이쪽이 더 낫다.

**② 전 필드 optional로 뽑히는 DTO.** springdoc은 기본적으로 모든 필드를 optional로 문서화한다. 그래서 required를 명시했는데, 조건을 하나 걸었다 — **엔티티 컬럼 `nullable=false` 같은 코드 근거가 있는 필드만**:

```java
public record ProductResponse(
        @Schema(description = "상품 ID", requiredMode = Schema.RequiredMode.REQUIRED)
        ProductId id,          // 엔티티 컬럼 nullable = false → 근거 있음
        @Schema(description = "상품명")
        String name            // DB nullable → optional 유지
) { ... }
```

이 감사에서 재밌는 게 나왔는데, "FE는 필수라고 믿는데 DB는 nullable인 필드"가 여러 개 발견됐다. 스펙을 정직하게 만들면 FE가 어디서 낙관하고 있었는지가 드러난다.

## 재사용 함정 — 응답 타입이 요청 payload를 겸할 때

required 정리 후 `id`를 스펙대로 필수로 파생했더니 그리드 화면들이 컴파일 에러가 났다. 원인을 따라가 보니 같은 타입을 **신규 행 생성 payload**(아직 id 없음)로도 쓰고 있었다:

```ts
// 응답+생성 payload 겸용이라 id만 다시 넓힘
export type CategoryResponse = Omit<components['schemas']['CategoryResponse'], 'id'> & {
  id?: string  // 응답엔 항상 오지만 생성 시엔 없음
}
```

손타입 시절엔 이 겸용 사실이 아무 데도 드러나지 않았다. 파생으로 조이는 순간 tsc가 강제로 자백시킨 것 — 이런 발견이 이관의 부수 수확이었다.

## 방어선 정리 — 에러를 없애는 게 아니라 터지는 위치를 옮기는 것

이번 작업을 하면서 정리된 관점인데, 에러가 "안 나게" 만들 수는 없다. BE는 계속 바뀌고 사람은 재생성을 잊는다. 설계할 수 있는 건 **에러가 어디서 터지느냐**다:

```
코딩 중 tsc 빨간 줄         →  수정 10초
커밋/PR에서 CI 실패         →  수정 10분
배포 후 명확한 런타임 에러    →  반나절 + 사용자 피해
배포 후 조용한 undefined    →  발견까지 몇 주
```

결함을 이 사다리의 위쪽으로 끌어올리고(shift-left), 못 올리는 건 최소한 시끄럽게 터지게(fail-fast). 진짜 적은 맨 아래 칸 — 조용한 실패 — 하나다.

| 방어선 | 잡는 실패 | 실제 잡은 사례 |
|---|---|---|
| ① tsc (타입 파생) | BE가 필드를 바꿈 | 재사용 함정, optional 필드 폴백 누락 |
| ② pre-commit 훅 | 검사 없이 커밋 | 매 커밋 |
| ③ CI drift 게이트 | 재생성 잊음 (컴파일은 통과하니 ①이 못 잡음) | — |
| ④ zod 경계 검증 | BE가 계약과 다르게 응답 (컴파일 타임에 원리적으로 불가) | 미타이핑 엔드포인트 상시 감시 |

각 층이 잡는 실패가 다르다는 게 포인트. "체크를 몇 개 두지?"가 아니라 "실패 경로를 나열했을 때 각 경로가 어느 층에 걸리나?"로 생각하면 빈 구멍이 보인다.

체크 자체의 신뢰도도 관리 대상이다. 실제로 코드 주석에 PR 번호를 `#298`로 적었다가 CI의 하드코딩 hex 색상 검사(`#[0-9a-fA-F]{3,8}`)에 오탐으로 걸렸다. 사소하지만 이런 오탐을 방치하면 체크 결과를 아무도 안 믿게 되니까 바로 고쳤다 (`PR 298` 표기로).

그리고 이 모든 것의 실질적인 보상은 에러가 줄어드는 것보다, **BE 변경이 무섭지 않아진 것**이다. DTO 리팩토링하면 FE 어디가 깨질지 몰라 망설이던 상태에서, `gen:api` 돌리고 빨간 줄 따라가면 되는 상태로.

## 유지보수 — 이후에 할 일

1. **BE API 변경 후 `npm run gen:api` 한 번** → `openapi.json` + `schema.d.ts` + 수정 코드 함께 커밋. 잊어도 CI가 PR을 막는다
2. **새 응답 타입은 파생이 기본, 손 미러 금지** — 코드리뷰에서 잡는다. 스펙과 다른 필드는 개별 Omit 보정 + 사유 주석
3. **ZodError가 나면** BE가 계약을 바꿨거나 원래 어긋나 있던 것 — 에러 메시지가 필드를 짚어주니 스키마 한 줄 수정으로 대응
4. `schema.d.ts`·`openapi.json`은 생성물 — 직접 수정 금지
5. BE에서 새 DTO 만들 때 항상 오는 필드는 `requiredMode=REQUIRED` 붙이기 — 안 붙이면 FE에서 전부 optional로 떠서 보정 노가다가 되살아난다

## 키워드 정리 (학습용)

이 글에 나온 용어들. 면접/문서에서 자주 나오는 것들이라 따로 정리.

| 키워드 | 뜻 | 이 글에서의 맥락 |
|---|---|---|
| **OpenAPI (Swagger)** | REST API를 기술하는 표준 명세 포맷(JSON/YAML). 엔드포인트·요청·응답 스키마를 기계가 읽을 수 있게 정의 | BE(springdoc)가 자동 발행하는 `/v3/api-docs`가 모든 것의 원천 |
| **springdoc** | Spring Boot 코드(컨트롤러·DTO)에서 OpenAPI 스펙을 자동 생성하는 라이브러리 | 어노테이션 안 붙이면 전 필드 optional로 뽑는 기본 동작이 문제의 시작 |
| **openapi-typescript** | OpenAPI 스펙 → TypeScript 타입 선언(.d.ts) 생성기. 런타임 코드 0 | 경로①의 핵심 도구 |
| **코드젠 (codegen)** | 명세·스키마에서 코드를 자동 생성하는 것 전반 | "손으로 베끼지 않는다"의 수단 |
| **타입 drift** | 두 시스템(BE 실제 ↔ FE 타입)이 시간이 지나며 어긋나는 현상 | 이 프로젝트가 없애려던 것 |
| **SSOT (Single Source of Truth)** | 같은 정보의 원본을 한 곳에만 두는 원칙 | 타입의 원본 = BE 스펙. 손타입은 SSOT 위반(같은 사실을 두 군데 기록) |
| **파생 타입 (derived type)** | 원본 타입에서 `Omit`/`Pick`/교차(`&`)로 만들어낸 타입 | `components['schemas'][...]` alias + 필드 보정 |
| **`Omit<T, K>` / 교차 타입 `&`** | TS 유틸리티 — 필드 제거 / 타입 합성. `{id?: string} & {id: string}`은 required로 좁혀짐 | 스펙과 현실이 다른 필드의 "보정" 수단 |
| **zod** | TS 런타임 스키마 검증 라이브러리. `z.infer`로 스키마에서 타입도 뽑음 | 경로② — 스키마가 곧 타입의 원본이라 손타입이 사라짐 |
| **신뢰 경계 (trust boundary)** | 검증 없이 믿으면 안 되는 데이터가 넘어오는 지점(외부 API, 사용자 입력) | zod 검증을 api.ts 경계에 두는 이유. "안에선 관대, 밖에선 엄격" |
| **shift-left** | 결함 발견 시점을 개발 흐름의 앞쪽(코딩·빌드)으로 당기는 것 | 런타임 undefined → 컴파일 에러로 이동 |
| **fail-fast** | 문제를 조용히 넘기지 말고 최대한 빨리·시끄럽게 실패시키는 설계 | ZodError가 경계에서 즉시 throw |
| **drift gate / CI 게이트** | 특정 조건을 만족 못 하면 머지를 막는 CI 검사 | `gen:api:types` + `git diff --exit-code` |
| **결정적 출력 (deterministic output)** | 같은 입력이면 바이트 단위로 같은 출력. diff·캐시·재현성의 전제 | 스냅샷 JSON 키 재귀 정렬을 한 이유 |
| **ModelConverter** | springdoc/swagger-core의 확장점 — 특정 타입이 스펙에서 어떻게 표현될지 가로채는 훅 | ID 값 객체를 `string(uuid)`으로 노출 |
| **`requiredMode = REQUIRED`** | springdoc `@Schema` 속성 — 필드를 스펙의 required 목록에 올림 | "코드 근거 있는 필드만" 원칙과 세트 |
| **값 객체 (Value Object)** | 식별자 없이 값으로 동등성을 판단하는 도메인 객체 (ID 래퍼, Money 등) | 직렬화는 string인데 스펙은 객체로 뜨던 갭의 주인공 |
| **모듈 경계 / 헥사고날** | 도메인 레이어는 프레임워크(웹·문서화)에 의존하지 않게 나누는 구조 | 도메인 모듈에 swagger 의존성을 안 넣고 컨버터로 푼 이유 |
| **defense in layers (심층 방어)** | 서로 다른 실패를 잡는 검증을 여러 층에 겹치는 설계 | tsc / pre-commit / CI / zod 4겹 |
| **스모크 테스트 (smoke test)** | 핵심 동선만 빠르게 훑어 "기본은 돈다"를 확인하는 최소 테스트 | zod 도입 후 로그인→메인 진입 확인 |

## 관련 개념

- react-compiler 도입 시도하다 ESLint & useEffect 톺은 이야기 (aka. useEffect와 react-compiler의 연관관계) — 같은 프로젝트의 다른 개선기
