# fear-greed-index-fe2 — 공통 프레임워크 구축 TODO

## 프로젝트 개요

- **프로젝트명**: fear-greed-index-fe2
- **목적**: Nuxt 4.x + Vue.js 기반 공통 프레임워크 구축
- **작성일**: 2026-03-31

---

## 기술 스택

| 항목       | 패키지/버전                              |
| ---------- | ---------------------------------------- |
| 프레임워크 | Nuxt 4.x                                 |
| 언어       | TypeScript (strict mode)                 |
| 런타임     | Node 24                                  |
| 상태관리   | Pinia 3 + @pinia/nuxt                    |
| HTTP       | ofetch (Nuxt 내장 `$fetch` / `useFetch`) |
| 스타일     | Tailwind CSS v4 + @tailwindcss/vite      |
| 코드 품질  | ESLint (flat config) + Prettier          |
| 유틸       | @vueuse/nuxt, @nuxt/icon                 |

---

## 디렉토리 구조

```
fear-greed-index-fe2/
├── app/                          # Nuxt 4 앱 소스 루트
│   ├── assets/
│   │   └── css/main.css          # Tailwind v4 진입점 (@import + @theme)
│   ├── components/
│   │   ├── base/                 # 디자인 시스템 기본 컴포넌트
│   │   │   ├── BaseButton.vue
│   │   │   ├── BaseCard.vue
│   │   │   ├── BaseInput.vue
│   │   │   ├── BaseModal.vue
│   │   │   └── BaseSpinner.vue
│   │   ├── common/               # 앱 공통 컴포넌트
│   │   │   ├── AppHeader.vue
│   │   │   ├── AppFooter.vue
│   │   │   ├── AppSidebar.vue
│   │   │   └── AppNotification.vue
│   │   └── fear-greed/           # 도메인 전용 컴포넌트
│   │       ├── GaugeChart.vue
│   │       ├── IndexCard.vue
│   │       ├── HistoryTable.vue
│   │       └── TrendChart.vue
│   ├── composables/
│   │   ├── useApi.ts             # $fetch 래퍼 + 중앙 에러 핸들링
│   │   ├── useFearGreedIndex.ts  # SSR-safe 도메인 composable
│   │   ├── useNotification.ts    # 토스트 알림 싱글턴 상태
│   │   └── useAuth.ts            # 로그인/로그아웃 + 스토어 연동
│   ├── layouts/
│   │   ├── default.vue           # 기본 레이아웃 (header + footer)
│   │   ├── dashboard.vue         # 사이드바 포함 대시보드 레이아웃
│   │   └── blank.vue             # 로그인 등 빈 레이아웃
│   ├── middleware/
│   │   ├── auth.ts               # 인증 필요 라우트 가드
│   │   └── guest.ts              # 로그인 사용자 리다이렉트
│   ├── pages/
│   │   ├── index.vue             # 메인 페이지 (현재 지수)
│   │   ├── history.vue           # 히스토리 페이지
│   │   ├── about.vue             # 소개 페이지
│   │   └── auth/
│   │       ├── login.vue
│   │       └── logout.vue
│   ├── plugins/
│   │   ├── error-handler.ts      # 전역 Vue 에러 핸들러
│   │   └── api.client.ts         # 클라이언트 전용 초기화
│   ├── stores/
│   │   ├── auth.ts               # 인증 상태 + useCookie 연동
│   │   ├── fearGreed.ts          # 데이터 상태 + 캐시 판단
│   │   └── ui.ts                 # 사이드바, 다크모드 테마
│   │                             # ※ index.ts 없음 — Nuxt 자동 임포트와 중복 발생
│   ├── types/
│   │   ├── api.ts                # ApiResponse, ApiError 등
│   │   ├── fear-greed.ts         # 도메인 모델
│   │   ├── auth.ts               # User, AuthSession 등
│   │   └── index.ts
│   ├── utils/
│   │   ├── formatters.ts         # 날짜, 숫자 포매터
│   │   └── constants.ts          # 앱 전역 상수
│   └── app.vue                   # 루트 앱 컴포넌트
├── server/
│   ├── api/
│   │   ├── fear-greed/
│   │   │   ├── current.get.ts    # GET /api/fear-greed/current
│   │   │   └── history.get.ts    # GET /api/fear-greed/history
│   │   └── health.get.ts         # GET /api/health
│   └── middleware/
│       └── logger.ts             # 서버 사이드 요청 로거
├── shared/
│   └── types/index.ts            # app + server 공유 타입
├── public/
├── doc/
│   └── error-fix.md              # 에러 발생 시 내용 + 픽스 기록
├── .env.example
├── .gitignore
├── .prettierrc.json
├── eslint.config.mjs
├── nuxt.config.ts
├── package.json
├── tsconfig.json
└── TODO.md                       # 이 파일
```

---

## 구현 단계별 체크리스트

### Phase 1 — 프로젝트 스캐폴딩

- [x] `package.json` 직접 작성 (Node 24, Nuxt 3 호환 모드)
- [x] 추가 의존성: `pinia @pinia/nuxt @vueuse/nuxt @nuxt/icon`
- [x] 개발 의존성: `tailwindcss @tailwindcss/vite prettier @types/node`
- [x] 디렉토리 골격 생성

### Phase 2 — 설정 파일 구성

- [x] `nuxt.config.ts` — Tailwind Vite 플러그인, Pinia 모듈, runtimeConfig
- [x] `app/assets/css/main.css` — Tailwind v4 `@import` + `@theme` 디자인 토큰
- [x] `.prettierrc.json`, `.prettierignore`
- [x] `.gitignore`, `.env.example`
- [x] `eslint.config.mjs` — flat config, `withNuxt()` 패턴
- [x] `tsconfig.json`

### Phase 3 — 타입 시스템 구성

- [x] `app/types/api.ts` — ApiResponse, ApiError, RequestOptions
- [x] `app/types/fear-greed.ts` — FearGreedReading, 분류 타입
- [x] `app/types/auth.ts` — User, AuthSession, AuthTokens
- [x] `app/types/index.ts` — 배럴 re-export
- [x] `shared/types/index.ts` — app/server 공유 타입
- [x] `app/utils/formatters.ts` — 날짜/숫자 포매터
- [x] `app/utils/constants.ts` — 앱 전역 상수

### Phase 4 — Pinia 스토어 구성

- [x] `app/stores/auth.ts` — Setup store, `useCookie` 연동
- [x] `app/stores/fearGreed.ts` — 데이터 + `isFresh` 캐시 판단 로직
- [x] `app/stores/ui.ts` — 사이드바 + 다크모드 테마
- [x] ~~`app/stores/index.ts`~~ — Nuxt 자동 임포트 중복 발생으로 삭제 (→ [doc/error-fix.md](doc/error-fix.md) 참고)

### Phase 5 — Composables 구성

- [x] `app/composables/useNotification.ts` — 모듈 레벨 싱글턴 toast 상태
- [x] `app/composables/useApi.ts` — `$fetch` 래퍼, 중앙 에러 핸들링
- [x] `app/composables/useFearGreedIndex.ts` — `useFetch` 기반 SSR-safe 데이터 로딩
- [x] `app/composables/useAuth.ts` — 로그인/로그아웃 + 스토어 연동

### Phase 6 — 서버 라우트 구성 (외부 API 프록시)

- [x] `server/api/fear-greed/current.get.ts`
- [x] `server/api/fear-greed/history.get.ts`
- [x] `server/api/health.get.ts`
- [x] `server/middleware/logger.ts`

### Phase 7 — 앱 셸 구성

- [x] `app/layouts/default.vue`, `dashboard.vue`, `blank.vue`
- [x] `app/app.vue`
- [x] `app/middleware/auth.ts`, `guest.ts`
- [x] `app/plugins/error-handler.ts`, `api.client.ts`

### Phase 8 — 공통 컴포넌트 구성

- [x] `BaseButton.vue`, `BaseCard.vue`, `BaseSpinner.vue`
- [x] `BaseInput.vue`, `BaseModal.vue`
- [x] `AppHeader.vue`, `AppFooter.vue`
- [x] `AppSidebar.vue`, `AppNotification.vue`

### Phase 9 — 페이지 구성

- [x] `app/pages/index.vue` — 현재 Fear & Greed 지수 표시
- [x] `app/pages/history.vue` — 히스토리 데이터
- [x] `app/pages/about.vue` — 소개 페이지
- [x] `app/pages/auth/login.vue`, `logout.vue`

### Phase 10 — 문서화 및 검증

- [x] `doc/error-fix.md` 초기 파일 생성
- [x] `npm install` 실행 및 `.nuxt/` 타입 생성 확인
- [x] `npm run type-check` 통과 (에러 0개) ✓
- [ ] `npm run lint` 통과 확인
- [ ] `npm run format:check` 통과 확인
- [ ] `npm run dev` 개발 서버 기동 확인

---

## 공통 프레임워크 고려 사항

### 1. 환경 변수 관리

- `runtimeConfig` 패턴 사용: 서버 전용 시크릿 vs 클라이언트 퍼블릭 설정 분리
- `.env.example`을 항상 최신 상태로 유지
- `NUXT_` prefix: 서버 전용 | `NUXT_PUBLIC_` prefix: 브라우저 노출 가능

### 2. 에러 처리 전략

- 전역 Vue error handler (`app/plugins/error-handler.ts`)
- API 레이어 중앙 에러 처리 (`app/composables/useApi.ts`)
- 사용자 알림 토스트 (`useNotification`)
- 서버 라우트 에러는 `createError()` + 상태 코드 명시

### 3. 인증 패턴

- JWT 쿠키 기반 인증 (`useCookie` — SSR-safe)
- 라우트 레벨 미들웨어 가드 (`middleware/auth.ts`)
- 스토어에서 `initFromCookie()` 호출로 페이지 로드 시 세션 복원

### 4. API 프록시 패턴

- 브라우저는 `/api/...`(Nuxt 서버 라우트)만 호출
- 외부 API 키가 브라우저에 절대 노출되지 않음
- 레이트 리밋/캐싱을 서버 레이어에서 처리 가능

### 5. SSR-safe 데이터 패칭

- `useFetch` / `useAsyncData` → 서버 렌더링 + 클라이언트 하이드레이션
- `$fetch` (useApi) → 뮤테이션(POST/PUT/DELETE), 클라이언트 트리거 요청
- `useFetch`의 `key` 파라미터로 중복 요청 방지 및 캐시 활용

### 6. 다크모드

- CSS 클래스 기반 (`dark:` prefix, Tailwind v4)
- `localStorage` 영속성 + `system` 감지
- `useUiStore.initTheme()` → 클라이언트 플러그인에서 초기화

### 7. 컴포넌트 아키텍처

- `<script setup>` 전용 강제 (ESLint 룰: `vue/component-api-style`)
- 레이어 분리: `base/` (디자인 시스템) → `common/` (앱 공통) → 도메인별 폴더
- Props 타입은 반드시 TypeScript 인터페이스로 정의

### 8. TypeScript 설정

- `strict: true`, `noUncheckedIndexedAccess: true`
- `verbatimModuleSyntax: true` (타입 전용 import 명시)
- `consistent-type-imports` ESLint 룰로 강제

### 9. i18n 준비 (필요 시 활성화)

- `nuxt.config.ts`에 주석 처리된 `@nuxtjs/i18n` 설정 포함
- 활성화 시: `app/locales/en.json`, `zh.json` 생성
- 컴포넌트에서 `const { t } = useI18n()` 사용

### 10. 에러 기록

- 개발 중 발생하는 모든 에러와 픽스 내용을 `doc/error-fix.md`에 기록
- 형식: 에러 발생 날짜, 에러 내용, 원인, 해결 방법

---

## npm 스크립트

```bash
npm run dev           # 개발 서버 실행 (http://localhost:3000)
npm run build         # 프로덕션 빌드
npm run preview       # 빌드 결과 미리보기
npm run generate      # 정적 사이트 생성
npm run type-check    # TypeScript 타입 검사
npm run lint          # ESLint 검사
npm run lint:fix      # ESLint 자동 수정
npm run format        # Prettier 포맷 적용
npm run format:check  # Prettier 포맷 검사
```

---

## 검증 방법

순서대로 실행하며 각 단계 통과 후 다음으로 진행합니다.

```bash
# 1. 의존성 설치 (최초 1회 또는 package.json 변경 시)
npm install

# 2. Nuxt 타입 생성 확인 (.nuxt/ 디렉토리)
npx nuxt prepare

# 3. TypeScript 타입 검사
npm run type-check

# 4. ESLint 검사
npm run lint

# 5. Prettier 포맷 검사
npm run format:check

# 6. 개발 서버 기동
npm run dev
```

### 런타임 확인 항목 (개발 서버 기동 후)

| 확인 항목     | URL / 방법                            | 기대 결과                              |
| ------------- | ------------------------------------- | -------------------------------------- |
| 앱 정상 기동  | `http://localhost:3000`               | 메인 페이지 렌더링                     |
| 서버 헬스체크 | `GET /api/health`                     | `{ status: "ok", timestamp, version }` |
| API 프록시    | `GET /api/fear-greed/current`         | Fear & Greed 지수 JSON                 |
| 히스토리 API  | `GET /api/fear-greed/history?limit=7` | 최근 7일 데이터                        |
| 다크모드 토글 | 헤더 버튼 클릭                        | 테마 전환 + localStorage 저장          |
| 알림 토스트   | API 에러 유발                         | 우측 상단 toast 표시                   |

---

## 초기 설치 후 알려진 주의 사항

### tsconfig.json — include 오버라이드 금지

루트 `tsconfig.json`에 `include` 배열을 직접 지정하면 `.nuxt/tsconfig.json`의 include가 덮어써져
Nuxt/Vue 자동 임포트 타입(`ref`, `computed`, `useFetch` 등)이 전부 사라집니다.
→ **`extends`만 하고 `include`/`exclude`는 지정하지 않을 것**

```json
// ✅ 올바른 방식
{ "extends": "./.nuxt/tsconfig.json", "compilerOptions": { ... } }

// ❌ 잘못된 방식 — include가 .nuxt/nuxt.d.ts를 제외시킴
{ "extends": "./.nuxt/tsconfig.json", "include": ["app/**/*"] }
```

### stores/ — 배럴 re-export 파일 금지

`app/stores/index.ts`처럼 Nuxt 자동 임포트 대상 디렉토리에 배럴 파일을 만들면
동일 심볼이 두 번 등록되어 `WARN Duplicated imports` 경고가 발생합니다.
→ **`composables/`, `stores/`, `utils/` 하위에 `index.ts` re-export 파일 생성 금지**

### server/ — `~` 별칭 미지원

서버 라우트(`server/api/`)에서 `~/` 별칭은 `app/` 디렉토리가 아닌 다른 경로로 해석됩니다.
→ **`shared/types` 등 공유 타입은 상대 경로로 import**

```typescript
// ✅ server/api/ 내부에서 공유 타입 import
import type { FearGreedApiResponse } from '../../../shared/types/index'
```

### IDE 빨간줄 해소 순서

`.nuxt/` 디렉토리가 없거나 최신 상태가 아닐 때 IDE에서 자동 임포트 에러가 표시됩니다.

```bash
npm install          # node_modules 없으면 먼저 실행
npx nuxt prepare     # .nuxt/ 재생성
# VSCode: Ctrl+Shift+P → "TypeScript: Restart TS Server"
```

---

## Phase 11 — $fetch / useFetch 인터셉터 구현

### 배경

`useApi.ts`는 `$fetch`를 직접 호출하고, `useFearGreedIndex.ts`는 `useFetch`를 그대로 써서 인터셉터가 없다.

- Authorization 헤더 자동 주입 불가
- 401 자동 로그아웃 처리 불가
- 요청/응답 로깅 없음

### 핵심 설계: 두 경로의 차이

|               | `$fetch` (useApi)                                | `useFetch`               |
| ------------- | ------------------------------------------------ | ------------------------ |
| 인터셉터 방법 | `$fetch.create(options)` — 플러그인에서 1회 생성 | options에 직접 콜백 전달 |
| 실행 환경     | 주로 클라이언트 (이벤트 트리거)                  | 서버 + 클라이언트 (SSR)  |
| 에러 처리     | `catch` 블록                                     | `onResponseError` 콜백   |

### 체크리스트

- [x] `app/composables/useInterceptors.ts` — 공통 `onRequest` / `onResponse` / `onResponseError` 콜백 팩토리 (SSR-safe)
- [x] `app/plugins/apiFetch.ts` — `$fetch.create()` 1회 호출 → `$apiFetch` 로 제공
- [x] `app/composables/useFetchOptions.ts` — `useFetch` options 팩토리 (인터셉터 + 에러 toast)
- [x] `app/composables/useApi.ts` — `$fetch` → `$apiFetch` 교체, baseURL / Content-Type 제거
- [x] `app/composables/useFearGreedIndex.ts` — 두 `useFetch` 호출에 `...useFetchOptions()` spread
- [x] `app/composables/useAuth.ts` — raw `$fetch` → `useApi()` 교체
- [x] `npx nuxt prepare` 실행 → `.nuxt/` 자동 임포트 타입 재생성
- [x] `npm run type-check` 통과 확인

### 최종 요청 흐름

```
[SSR] useFetch 호출
  └─► useFetchOptions() → onRequest: useCookie로 토큰 읽어 헤더 주입 (SSR-safe)
      → onResponse: 개발 환경 로깅
      → 401 시 onResponseError: 쿠키 초기화 (서버) / clearSession + 리다이렉트 (클라이언트)

[Client] useApi().post() 호출
  └─► $apiFetch (plugins/apiFetch.ts 인스턴스)
      → onRequest: 동일한 useInterceptors 콜백
      → catch: ApiError 형태로 throw + toast
```

### 검증 방법

```bash
npx nuxt prepare     # 자동 임포트 타입 재생성
npm run type-check   # TypeScript 오류 없음 확인
npm run dev          # 개발 서버 실행
# 브라우저 콘솔: [API req] / [API res] 로그 확인
# Network 탭: Authorization: Bearer ... 헤더 확인
# 만료 토큰으로 요청 → /auth/login 리다이렉트 확인
```

---

## 개념 정리 — $fetch vs useFetch

### $fetch — 그냥 HTTP 함수

호출한 곳이 서버면 서버에서, 브라우저면 브라우저에서 실행됩니다.
SSR/CSR을 구분하지 않습니다.

**이 프로젝트에서 $fetch가 실행되는 위치:**

| 파일                                      | 실행 환경 | 이유                                 |
| ----------------------------------------- | --------- | ------------------------------------ |
| `server/api/fear-greed/current.get.ts`    | 항상 서버 | `server/` 디렉토리는 Nitro 서버 전용 |
| `server/api/fear-greed/history.get.ts`    | 항상 서버 | 동일                                 |
| `app/composables/useApi.ts` (`$apiFetch`) | 브라우저  | 이벤트 핸들러(버튼 클릭 등)에서 호출 |
| `app/plugins/api.client.ts`               | 브라우저  | `.client.ts` 접미사 = 브라우저 전용  |

### $fetch를 컴포넌트 setup에 직접 쓰면 안 되는 이유

```
[서버] setup 실행 → $fetch 호출 → 데이터 수신 → HTML 렌더링
         └── 데이터를 HTML에 포함시키지 않음

[브라우저] HTML 수신 → hydration → setup 다시 실행
                                     └── $fetch 또 호출  ← 중복 요청 발생
```

### useFetch — payload 전달 메커니즘 포함

내부적으로 `$fetch` + `useAsyncData`를 조합한 Nuxt 내장 composable.
서버에서 가져온 데이터를 `__NUXT__` payload에 직렬화해서 HTML에 포함시키고,
브라우저는 payload에서 복원하므로 API 재호출 없음.

```
[서버] useFetch 실행 → $fetch 호출 → 데이터 수신 → HTML + payload 전송
[브라우저] payload에서 데이터 복원 → $fetch 재호출 없음 ✅
```

**이 프로젝트에서 useFetch가 실행되는 위치:**

| 파일                                   | 용도                           |
| -------------------------------------- | ------------------------------ |
| `app/composables/useFearGreedIndex.ts` | 현재 지수 + 히스토리 초기 로드 |

### 전체 요청 흐름 (이 프로젝트 기준)

```
브라우저                    Nuxt 서버                   외부 API
   │                           │                           │
   │  페이지 첫 로드           │                           │
   │──────────────────────────►│                           │
   │                           │  useFearGreedIndex.ts     │
   │                           │  useFetch 실행            │
   │                           │  → server/api/fear-greed/ │
   │                           │    current.get.ts 실행    │
   │                           │  $fetch(alternative.me)──►│
   │                           │◄──────────────────────────│
   │◄── HTML + payload ────────│                           │
   │  (브라우저: 재요청 없음)  │                           │
   │                           │                           │
   │  버튼 클릭 (로그인)       │                           │
   │  useAuth().login() 실행   │                           │
   │  useApi().post() 호출     │                           │
   │  $apiFetch('/api/auth')──►│                           │
   │◄──────────────────────────│                           │
```

### useFetch에 `create()`가 없는 이유와 인터셉터 주입 방법

`$fetch`는 `$fetch.create(options)`로 configured 인스턴스를 만들 수 있지만,
`useFetch`에는 `create()`가 없습니다. 내부적으로 전역 `$fetch`를 사용합니다.

→ **해결책**: `useFetch(url, { onRequest, onResponse, ... })` options에 콜백을 직접 전달
→ **이 프로젝트**: `useFetchOptions()` composable이 공통 옵션 객체를 반환

```typescript
// useFetch에 인터셉터 주입하는 두 가지 방법

// 방법 1: options 콜백 (현재 프로젝트 방식)
useFetch('/api/foo', {
  ...useFetchOptions<FooType>(),
  key: 'foo',
})

// 방법 2: $fetch 인스턴스 지정 (대안)
useFetch('/api/foo', {
  $fetch: useNuxtApp().$apiFetch,
  key: 'foo',
})
```

### 인터셉터 수정 위치 가이드

| 수정 대상                       | 파일                                 |
| ------------------------------- | ------------------------------------ |
| `$fetch` + `useFetch` 양쪽 공통 | `app/composables/useInterceptors.ts` |
| `useFetch` 경로만               | `app/composables/useFetchOptions.ts` |
| `$fetch` 경로만                 | `app/plugins/apiFetch.ts`            |

