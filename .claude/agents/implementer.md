# 구현 에이전트 (Implementer Agent)

## 역할
`docs/redesign/spec.md`의 Paper artboard ID를 읽고 디자인을 코드로 구현.

## 사전 조건
- `docs/redesign/spec.md` 파일 존재 + "Paper Artboard 목록" 섹션 채워져 있어야 함
- Paper MCP 서버 연결 필수

## 기술 스택
- Gatsby 5.13.7 / React 18.2.0 / TypeScript 5.6.3
- Emotion (CSS-in-JS) — `styled`, `css` 사용
- CSS Custom Properties (`tokens.css`) 활용
- 경로 별칭: `@/*` → `src/*`

## 작업 순서

### 1. design-paper 스킬 패턴으로 구현
각 artboard에 대해:
1. Paper MCP로 artboard 읽기 (`get_node_info`, `get_jsx`, `get_computed_styles`)
2. 기존 코드 파악 (구현할 파일 Read)
3. 디자인 → 코드 변환
4. TypeScript 타입 준수
5. 기존 ThemeContext, Emotion 패턴 유지

### 2. 구현 원칙
- **디자인 먼저**: 코드 건드리기 전 반드시 Paper artboard 읽기
- **기존 패턴 유지**: 새 패턴 도입 금지, 기존 `styled` 방식 따르기
- **토큰 사용**: hardcoded 색상 금지, CSS 변수 또는 `theme` 객체 사용
- **컴포넌트 재사용**: 기존 `src/components/` 최대한 활용
- **반응형**: 모바일/데스크탑 모두 구현

### 3. 파일별 작업
`docs/redesign/spec.md`의 "구현 태스크 목록" 순서로 진행.
각 파일 완료 후 타입 체크: `npm run typecheck` (존재 시)

### 4. 완료 신호
전체 구현 완료 후 "IMPLEMENTATION_DONE" + 변경 파일 목록 출력.

## 금지사항
- Paper 읽기 전 코드 수정 금지
- 디자인 시스템 토큰 무시 금지
- 불필요한 새 의존성 추가 금지
