# CLAUDE.md — fear-greed-index-fe2

Nuxt 4 기반 Fear & Greed Index 프론트엔드 공통 프레임워크. 이 파일은 Claude Code가 이 프로젝트를 이해하고 일관되게 작업하기 위한 참조 문서입니다.

아키텍처 상세 문서: [doc/architecture.md](doc/architecture.md)

---

## 개발 규칙 및 컨벤션

### 코드 스타일

- `<script setup lang="ts">` 전용 — Options API 사용 금지
- `verbatimModuleSyntax: true` — 타입 import는 `import type` 명시
- `consistent-type-imports` ESLint 룰로 강제
- `no-console` except `console.warn`, `console.error`

### 파일 배치 규칙

| 위치               | 역할         | index.ts 배럴                     |
| ------------------ | ------------ | --------------------------------- |
| `app/types/`       | 타입 정의    | ✅ 허용 (자동 임포트 대상 아님)   |
| `app/composables/` | 재사용 로직  | ❌ 금지 (Nuxt 자동 임포트 충돌)   |
| `app/stores/`      | Pinia 스토어 | ❌ 금지 (Duplicated imports 경고) |
| `app/utils/`       | 순수 함수    | ❌ 금지 (Nuxt 자동 임포트 충돌)   |
| `shared/types/`    | 공유 타입    | ✅ 허용                           |

### 데이터 페칭 선택 기준

| 상황                                     | 사용 방법                               |
| ---------------------------------------- | --------------------------------------- |
| 페이지 초기 데이터 (SSR 필요)            | `useFetch` / `useAsyncData`             |
| 사용자 트리거 뮤테이션 (POST/PUT/DELETE) | `useApi().post()` → 내부적으로 `$fetch` |
| 클라이언트 전용 추가 요청                | `useApi().get()`                        |

### 캐시 TTL 상수 (`app/utils/constants.ts`)

```typescript
CACHE_TTL_MS.CURRENT_INDEX = 5 * 60 * 1000 // 5분
CACHE_TTL_MS.HISTORY = 30 * 60 * 1000 // 30분
```

`fearGreedStore.isFresh`가 `true`이면 재요청 생략 가능.

---

## 주의 사항

### tsconfig.json — include 오버라이드 금지

```json
// ✅ 올바른 방식
{ "extends": "./.nuxt/tsconfig.json", "compilerOptions": { ... } }

// ❌ 잘못된 방식 — .nuxt/nuxt.d.ts가 제외되어 자동 임포트 타입 소멸
{ "extends": "./.nuxt/tsconfig.json", "include": ["app/**/*"] }
```

### stores/ — 배럴 re-export 파일 금지

`app/stores/index.ts`를 만들면 `WARN Duplicated imports` 경고 발생.
`composables/`, `stores/`, `utils/` 하위에 `index.ts` 생성 금지.

### server/ — `~/` 별칭 미지원

서버 라우트에서 `~/` 는 `app/` 디렉토리로 해석되지 않음.
공유 타입은 반드시 상대 경로 사용.

### IDE 빨간줄 해소 순서

```bash
npm install          # node_modules 없으면 먼저
npx nuxt prepare     # .nuxt/ 재생성
# VSCode: Ctrl+Shift+P → "TypeScript: Restart TS Server"
```

---

## npm 스크립트

```bash
npm run dev           # 개발 서버 (http://localhost:3000)
npm run build         # 프로덕션 빌드
npm run type-check    # TypeScript 타입 검사
npm run lint          # ESLint 검사
npm run lint:fix      # ESLint 자동 수정
npm run format        # Prettier 포맷 적용
npm run format:check  # Prettier 포맷 검사
```

---

## 환경 변수

| 변수명                    | 스코프    | 설명                                                   |
| ------------------------- | --------- | ------------------------------------------------------ |
| `NUXT_API_SECRET`         | 서버 전용 | 외부 API 인증 헤더 (선택)                              |
| `NUXT_API_BASE_URL`       | 서버 전용 | 외부 API URL (기본: `https://api.alternative.me/fng/`) |
| `NUXT_PUBLIC_API_BASE`    | 공개      | 클라이언트 API baseURL (기본: `/api`)                  |
| `NUXT_PUBLIC_APP_NAME`    | 공개      | 앱 이름                                                |
| `NUXT_PUBLIC_APP_VERSION` | 공개      | 앱 버전                                                |
