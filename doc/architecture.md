# Architecture — fear-greed-index-fe2

Nuxt 4 기반 Fear & Greed Index 프론트엔드 아키텍처 문서.

---

## 기술 스택

| 항목          | 버전 / 패키지                           |
| ------------- | --------------------------------------- |
| 프레임워크    | Nuxt 3.16.1 (`compatibilityVersion: 4`) |
| UI 라이브러리 | Vue 3.5.13 (`<script setup>` 전용)      |
| 언어          | TypeScript 5.8.2 (strict mode)          |
| 상태 관리     | Pinia 2.3.1 + `@pinia/nuxt`             |
| 스타일        | Tailwind CSS v4 + `@tailwindcss/vite`   |
| HTTP          | `$fetch` / `useFetch` (Nuxt 내장)       |
| 유틸          | `@vueuse/nuxt`, `@nuxt/icon`            |
| 코드 품질     | ESLint 9 (flat config) + Prettier 3.5   |
| 런타임        | Node >= 24                              |

---

## 디렉토리 구조

```
fear-greed-index-fe2/
├── app/                          # Nuxt 4 앱 소스 루트
│   ├── types/                    # TypeScript 타입 정의 (배럴 re-export)
│   │   ├── api.ts                # ApiResponse<T>, ApiError, RequestOptions
│   │   ├── auth.ts               # User, AuthSession, AuthTokens
│   │   ├── fear-greed.ts         # FearGreedReading, FearGreedClassification
│   │   └── index.ts              # export type * from 각 파일 (배럴)
│   ├── composables/              # 재사용 가능한 로직 (Nuxt 자동 임포트)
│   │   ├── useApi.ts             # $fetch 래퍼 + 중앙 에러 핸들링
│   │   ├── useAuth.ts            # 로그인/로그아웃 + 스토어 연동
│   │   ├── useFearGreedIndex.ts  # SSR-safe 데이터 페칭 composable
│   │   └── useNotification.ts    # 모듈 레벨 싱글턴 토스트 알림
│   ├── stores/                   # Pinia 스토어 (Nuxt 자동 임포트)
│   │   ├── auth.ts               # 인증 상태 + useCookie 연동
│   │   ├── fearGreed.ts          # 데이터 상태 + isFresh 캐시 판단
│   │   └── ui.ts                 # 사이드바, 다크모드 테마
│   ├── middleware/               # 라우트 가드
│   │   ├── auth.ts               # 인증 필요 라우트 보호 → /auth/login 리다이렉트
│   │   └── guest.ts              # 이미 로그인된 유저 → / 리다이렉트
│   ├── plugins/                  # Nuxt 플러그인 (자동 등록)
│   │   ├── api.client.ts         # 클라이언트 전용: 세션 복원 + 테마 초기화
│   │   └── error-handler.ts      # 전역 Vue 에러 핸들러
│   ├── components/
│   │   ├── base/                 # 디자인 시스템 원자 컴포넌트
│   │   │   ├── BaseButton.vue
│   │   │   ├── BaseCard.vue
│   │   │   ├── BaseInput.vue
│   │   │   ├── BaseModal.vue
│   │   │   └── BaseSpinner.vue
│   │   └── common/               # 앱 공통 컴포넌트
│   │       ├── AppHeader.vue
│   │       ├── AppFooter.vue
│   │       ├── AppSidebar.vue
│   │       └── AppNotification.vue
│   ├── layouts/
│   │   ├── default.vue           # 헤더 + 푸터
│   │   ├── dashboard.vue         # 사이드바 + 헤더 (인증 필요 페이지)
│   │   └── blank.vue             # 최소 레이아웃 (로그인 등)
│   ├── pages/
│   │   ├── index.vue             # 현재 Fear & Greed 지수
│   │   ├── history.vue           # 30일 히스토리
│   │   ├── about.vue             # 소개
│   │   └── auth/
│   │       ├── login.vue
│   │       └── logout.vue
│   ├── utils/                    # 순수 유틸 함수 (Nuxt 자동 임포트)
│   │   ├── constants.ts          # FEAR_GREED_THRESHOLDS, CACHE_TTL_MS, API_ENDPOINTS
│   │   └── formatters.ts         # formatTimestamp, classifyScore, getClassificationColor
│   ├── assets/css/main.css       # Tailwind v4 @import + @theme 디자인 토큰
│   └── app.vue                   # 루트 컴포넌트 (NuxtLayout + NuxtPage + 알림 오버레이)
├── server/
│   ├── api/
│   │   ├── health.get.ts         # GET /api/health
│   │   └── fear-greed/
│   │       ├── current.get.ts    # GET /api/fear-greed/current
│   │       └── history.get.ts    # GET /api/fear-greed/history?limit=N
│   └── middleware/
│       └── logger.ts             # 서버 사이드 요청 로거
├── shared/
│   └── types/index.ts            # app + server 공유 타입 브릿지
├── nuxt.config.ts
├── tsconfig.json
├── eslint.config.mjs
└── TODO.md
```

---

## 요청 흐름 (Request Flow)

### 페이지 초기 로드 (SSR)

```
브라우저 요청
    │
    ▼
Nuxt SSR (서버 사이드)
    │
    ├─► middleware/auth.ts or guest.ts  ─── 인증 여부 체크
    │       │ 실패 시 리다이렉트
    │       │ 통과 시 계속
    │
    ├─► layouts/default.vue | dashboard.vue | blank.vue
    │
    ├─► pages/*.vue
    │       │
    │       └─► useFearGreedIndex()  ─── useFetch('/api/fear-greed/current')
    │                                           │
    │                                           ▼
    │                               server/api/fear-greed/current.get.ts
    │                                           │
    │                                           ▼
    │                               외부 API (api.alternative.me/fng/)
    │                                           │
    │                                           ▼
    │                               FearGreedApiResponse 반환
    │
    └─► 완성된 HTML 클라이언트 전송 (Hydration)
```

### 클라이언트 사이드 초기화

```
Hydration 완료
    │
    ▼
plugins/api.client.ts (.client 접미사 → 브라우저만 실행)
    ├─► authStore.initFromCookie()   ─── JWT 쿠키에서 세션 복원
    └─► uiStore.initTheme()          ─── localStorage에서 테마 복원
                                              + window.matchMedia 시스템 감지
```

### 사용자 인터랙션 (클라이언트 페칭)

```
사용자 액션 (버튼 클릭 등)
    │
    ▼
composables/useApi.ts
    │  useApi().get<T>(path, options)
    │  useApi().post<T>(path, body)
    │
    ▼
$fetch(url, { method, body, headers })
    │  baseURL = runtimeConfig.public.apiBase ('/api')
    │
    ▼
server/api/**  (Nitro 서버 라우트)
    │
    ├── 성공: ApiResponse<T> 반환
    └── 실패: useNotification().error() 호출 → 토스트 표시
             (401은 제외 — 인증 흐름에서 별도 처리)
```

---

## API 흐름도

### Fear & Greed 데이터 흐름

```
┌─────────────────────────────────────────────────────────────┐
│                     브라우저 (클라이언트)                      │
│                                                             │
│  pages/index.vue                                            │
│    └─► useFearGreedIndex()                                  │
│            ├─► currentReading  (useFetch, SSR)              │
│            └─► fetchHistory()  (useFetch, lazy)             │
│                                                             │
│  fearGreedStore ◄──────────────────────────────┐            │
│    ├── currentReading: FearGreedReading | null │            │
│    ├── history: FearGreedHistoryEntry[]        │            │
│    ├── isFresh: boolean (< 5분 캐시)            │            │
│    └── classificationColor: string             │            │
└────────────────────────┬───────────────────────┘            │
                         │ watch(currentReading)              │
                         ▼                                    │
              fearGreedStore.setCurrentReading() ─────────────┘
```

```
┌───────────────────────────────────────────────────────────────┐
│                    Nuxt Server (Nitro)                         │
│                                                               │
│  GET /api/fear-greed/current                                  │
│    server/api/fear-greed/current.get.ts                       │
│      ├── $fetch(apiBaseUrl + '?limit=1&format=json')          │
│      ├── 선택적 Authorization 헤더 (apiSecret 설정 시)        │
│      └── 실패 시 createError(502)                             │
│                                                               │
│  GET /api/fear-greed/history?limit=N                          │
│    server/api/fear-greed/history.get.ts                       │
│      ├── getQuery(event).limit 검증 (1-365, 기본 30)          │
│      ├── $fetch(apiBaseUrl + '?limit=N&format=json')          │
│      └── 실패 시 createError(502), 잘못된 limit → createError(400) │
│                                                               │
│  GET /api/health                                              │
│    server/api/health.get.ts                                   │
│      └── { status: 'ok', timestamp: ISO 8601, version }       │
│                                                               │
│  server/middleware/logger.ts                                  │
│      └── [METHOD] /path — Xms (모든 요청에 적용)              │
└──────────────────────────────┬────────────────────────────────┘
                               │ $fetch (서버 → 외부)
                               ▼
┌──────────────────────────────────────────────────────────────┐
│              외부 API: api.alternative.me/fng/               │
│                                                              │
│  응답 구조 (FearGreedApiResponse):                           │
│  {                                                           │
│    name: "Fear and Greed Index",                             │
│    data: [                                                   │
│      {                                                       │
│        value: "72",                                          │
│        value_classification: "Greed",                        │
│        timestamp: "1234567890",                              │
│        time_until_update: "3600"                             │
│      }                                                       │
│    ],                                                        │
│    metadata: { error: null }                                 │
│  }                                                           │
└──────────────────────────────────────────────────────────────┘
```

### runtimeConfig 구조

```
nuxt.config.ts
├── runtimeConfig.apiSecret      ─── 서버 전용 (브라우저 미노출)
├── runtimeConfig.apiBaseUrl     ─── 외부 API URL (서버 전용)
└── runtimeConfig.public
    ├── apiBase    = '/api'       ─── 클라이언트 baseURL
    ├── appName    = 'Fear & Greed Index'
    └── appVersion = '1.0.0'
```

---

## 인증 흐름

```
로그인 요청
    │
    ▼
pages/auth/login.vue
    ├── 클라이언트 유효성 검사 (이메일 형식, 비밀번호 8자 이상)
    └── useAuth().login(credentials)
            │
            ▼
        composables/useAuth.ts
            ├── useApi().post('/api/auth/login', credentials)
            │
            ├── 성공: authStore.setSession(session)
            │           ├── state.user = session.user
            │           ├── state.tokens = session.tokens
            │           └── useCookie('auth_token').value = accessToken
            │                  (maxAge: expiresIn, secure, sameSite: lax)
            │
            └── navigateTo('/')  →  middleware/auth.ts 통과

로그아웃 요청
    │
    ▼
useAuth().logout()
    ├── useApi().post('/api/auth/logout')
    ├── authStore.clearSession()
    │       ├── state.user = null
    │       ├── state.tokens = null
    │       └── useCookie('auth_token').value = null
    └── navigateTo('/auth/login')

라우트 가드
    ├── middleware/auth.ts   → !isAuthenticated → /auth/login
    └── middleware/guest.ts  → isAuthenticated  → /
```

---

## 상태 관리 구조

### Pinia 스토어 관계

```
┌─────────────────┐   ┌──────────────────────┐   ┌──────────────────┐
│   authStore     │   │   fearGreedStore      │   │    uiStore       │
│                 │   │                      │   │                  │
│ user            │   │ currentReading       │   │ theme            │
│ tokens          │   │ history[]            │   │ sidebarOpen      │
│ isLoading       │   │ lastFetchedAt        │   │ mobileMenuOpen   │
│                 │   │ isLoading            │   │                  │
│ isAuthenticated │   │ isFresh (< 5분)      │   │ setTheme()       │
│ hasRole(role)   │   │ classificationColor  │   │ initTheme()      │
│ setSession()    │   │ currentValue         │   │ toggleSidebar()  │
│ clearSession()  │   │                      │   │                  │
│ initFromCookie()│   │ setCurrentReading()  │   │ localStorage     │
└────────┬────────┘   │ setHistory()         │   │ + matchMedia     │
         │            └──────────┬───────────┘   └──────────────────┘
         │                       │
    useCookie                 캐시 TTL
    'auth_token'               상수 (5분 / 30분)
```

### 알림 시스템 (모듈 레벨 싱글턴)

```
useNotification()  ←  모듈 레벨 ref (컴포넌트 간 공유)
    │
    ├── notify({ type, message, duration })
    │       └── 4초 후 자동 dismiss
    │
    ├── success(msg) / error(msg) / warning(msg) / info(msg)
    │
    └── notifications (readonly) ───► AppNotification.vue
                                           └── app.vue 에서 전역 렌더링
                                               (NuxtLayout 바깥 teleport)
```

---

## 컴포넌트 계층

```
app.vue
├── NuxtLayout
│   ├── layouts/default.vue
│   │   ├── AppHeader.vue
│   │   │   ├── 로고, 내비게이션 링크
│   │   │   ├── 다크모드 토글 버튼
│   │   │   └── 로그인/로그아웃 버튼 (isAuthenticated 기반)
│   │   ├── <slot> (NuxtPage)
│   │   │   ├── pages/index.vue      ─ BaseSpinner, BaseCard
│   │   │   ├── pages/history.vue    ─ BaseSpinner, BaseButton
│   │   │   └── pages/about.vue      ─ BaseCard
│   │   └── AppFooter.vue
│   │
│   ├── layouts/dashboard.vue
│   │   ├── AppSidebar.vue  (lg: fixed, mobile: overlay)
│   │   ├── AppHeader.vue   (compact prop)
│   │   └── <slot> (NuxtPage)
│   │
│   └── layouts/blank.vue
│       ├── <slot> (NuxtPage)
│       │   ├── pages/auth/login.vue   ─ BaseInput, BaseButton
│       │   └── pages/auth/logout.vue  ─ BaseSpinner
│
└── AppNotification.vue   (teleport to body, z-50, 전역)
        └── useNotification().notifications
```

---

## 타입 시스템

### 주요 타입 정의

```typescript
// app/types/fear-greed.ts
type FearGreedClassification = 'Extreme Fear' | 'Fear' | 'Neutral' | 'Greed' | 'Extreme Greed'

interface FearGreedReading {
  value: string // "0"–"100" (문자열로 옴)
  value_classification: FearGreedClassification
  timestamp: string // Unix timestamp 문자열
  time_until_update?: string
}

// app/types/api.ts
interface ApiResponse<T> {
  data?: T
  error?: ApiError
  metadata?: Record<string, unknown>
}

// app/types/auth.ts
interface User {
  id: string
  email: string
  roles: ('admin' | 'user' | 'viewer')[]
}
```

### 타입 import 경로

```typescript
// ✅ app/ 내부: 배럴 경유
import type { FearGreedReading, ApiResponse } from '~/types'

// ✅ server/ 내부: 공유 타입은 반드시 상대 경로
import type { FearGreedApiResponse } from '../../../shared/types/index'
// ❌ server/에서 ~/types 사용 불가 (별칭 미지원)
```
