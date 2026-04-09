# Error Fix Log — fear-greed-index-fe2

개발 진행 중 발생한 에러 및 해결 방법을 기록합니다.

---

## 형식

```
## [날짜] 에러 제목

**환경**: 발생 환경 (dev / build / runtime)
**에러 메시지**:
\`\`\`
에러 메시지 전문
\`\`\`

**원인**: 에러 발생 원인 설명

**해결 방법**:
\`\`\`
수정 내용 또는 명령어
\`\`\`

**참고**: 관련 링크 또는 추가 설명
```

---

<!-- 이 아래에 에러 발생 시 기록을 추가하세요 -->

## [2026-03-31] Nuxt 자동 임포트 중복 경고

**환경**: postinstall (nuxt prepare)

**에러 메시지**:

```
WARN Duplicated imports "useAuthStore", the one from "app/stores/auth.ts" has been ignored and "app/stores/index.ts" is used
WARN Duplicated imports "useFearGreedStore" ...
WARN Duplicated imports "useUiStore" ...
WARN Duplicated imports "Theme" ...
```

**원인**: `app/stores/index.ts`에서 개별 스토어를 re-export하면 Nuxt 자동 임포트 시스템이 동일한 심볼을 두 곳(개별 파일 + index.ts)에서 발견하여 중복 경고 발생.

**해결 방법**:

```bash
rm app/stores/index.ts
npx nuxt prepare
```

Nuxt가 `app/stores/` 하위 파일들을 이미 각각 자동 임포트하므로 `index.ts` 불필요.

**참고**: Nuxt 자동 임포트 대상 디렉토리(`composables/`, `stores/`, `utils/`)에서는 배럴 re-export 파일을 만들지 않는다.

---

## [2026-03-31] tsconfig.json include 오버라이드로 자동 임포트 타입 누락

**환경**: IDE (빨간줄) / nuxt typecheck

**에러 메시지**:

```
Cannot find name 'ref'.
Cannot find name 'computed'.
Cannot find name 'useFetch'.
Cannot find name 'defineNuxtRouteMiddleware'.
... (Nuxt/Vue 자동 임포트 전체 에러)
```

**원인**: 루트 `tsconfig.json`에 `"include"` 배열을 직접 지정하면 `.nuxt/tsconfig.json`의 include가 덮어써짐. `.nuxt/tsconfig.json`의 include에는 자동 임포트 타입이 선언된 `.nuxt/nuxt.d.ts`가 포함되어 있어서 이게 제외되면 모든 Nuxt/Vue 전역 함수 타입이 사라짐.

**해결 방법**: 루트 `tsconfig.json`에서 `include`/`exclude` 제거, `compilerOptions`만 오버라이드.

```json
{
  "extends": "./.nuxt/tsconfig.json",
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": false,
    "verbatimModuleSyntax": true
  }
}
```

**참고**: Nuxt 프로젝트의 루트 tsconfig.json은 `extends`만 하고 include/exclude는 `.nuxt/tsconfig.json`에 위임하는 것이 원칙.

---

## [2026-03-31] 서버 라우트에서 `~/shared/types` 경로 미해석

**환경**: nuxt typecheck (server 컨텍스트)

**에러 메시지**:

```
server/api/fear-greed/current.get.ts: Cannot find module '~/shared/types'
```

**원인**: `~` 별칭은 `app/` 디렉토리를 가리키므로 `server/` 파일에서는 유효하지 않음. 서버 컨텍스트는 별도의 `.nuxt/tsconfig.server.json`을 사용.

**해결 방법**: 상대 경로로 변경.

```typescript
import type { FearGreedApiResponse } from '../../../shared/types/index'
```

---

## [2026-03-31] useApi.ts — $fetch 반환 타입 불일치

**환경**: nuxt typecheck

**에러 메시지**:

```
Type 'TypedInternalResponse<NitroFetchRequest, T, "get">' is not assignable to type 'T'.
```

**원인**: Nuxt의 `$fetch`가 `TypedInternalResponse` 타입을 반환하는데 제네릭 `T`에 직접 할당 불가.

**해결 방법**: 타입 단언(as T) 추가.

```typescript
return data as T
```

---

## [2026-03-31] server/api/health.get.ts — process 타입 없음

**환경**: nuxt typecheck

**에러 메시지**:

```
Cannot find name 'process'. Do you need to install type definitions for node?
```

**해결 방법**: `@types/node` 설치.

```bash
npm install --save-dev @types/node
```
