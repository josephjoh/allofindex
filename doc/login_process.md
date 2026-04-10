# 소셜 로그인 구현 설계 (Nuxt + Spring Boot)

> 기준일: 2026-04-10  
> 제공 소셜: Google, Kakao  
> 구현 방식: 직접 OAuth 2.0 Authorization Code Flow

---

## 아키텍처

```
브라우저 → Nuxt (BFF) → Spring Boot API → DB (H2/MySQL)
```

OAuth 콜백 수신 및 쿠키 발급은 **Nuxt**가 담당하고,  
유저 upsert / JWT 발급 / 비즈니스 로직은 **Spring Boot**가 담당한다.

---

## 역할 분담

### Nuxt (BFF) 담당

| 역할 | 파일 | 내용 |
|------|------|------|
| OAuth 리다이렉트 | `server/api/auth/google.get.ts` | state 생성 후 Google 동의 화면으로 리다이렉트 |
| OAuth 콜백 처리 | `server/api/auth/google/callback.get.ts` | code → access_token 교환 → 프로필 파싱 → Spring Boot 호출 |
| Kakao 리다이렉트 | `server/api/auth/kakao.get.ts` | state 생성 후 Kakao 동의 화면으로 리다이렉트 |
| Kakao 콜백 처리 | `server/api/auth/kakao/callback.get.ts` | code → access_token 교환 → 프로필 파싱 → Spring Boot 호출 |
| 쿠키 발급 | 콜백 핸들러 내부 | Spring Boot에서 받은 JWT를 `auth_token` httpOnly 쿠키로 세팅 |
| 유저 정보 조회 | `server/api/auth/me.get.ts` | `auth_token` 쿠키 → Spring Boot `/api/users/me` 프록시 |
| 로그아웃 | `server/api/auth/logout.post.ts` | 쿠키 삭제 + Spring Boot `/api/auth/logout` 호출 |
| state 검증 유틸 | `server/utils/oauth.ts` | CSRF 방어용 state 생성/검증 (인메모리 Set 또는 쿠키 기반) |

### Spring Boot 담당

| 역할 | 엔드포인트 | 내용 |
|------|-----------|------|
| 유저 upsert | `POST /api/users/social-login` | provider + profile로 신규/기존 유저 처리 후 JWT 발급 |
| JWT 검증 + 유저 조회 | `GET /api/users/me` | Authorization 헤더 또는 쿠키 JWT 검증 → 유저 정보 반환 |
| 로그아웃 처리 | `POST /api/auth/logout` | refresh_token 무효화 (구현 시) |
| 회원 탈퇴 | `DELETE /api/users/me` | soft delete + Kakao 연결 해제 API 호출 포함 |
| JWT 발급/갱신 | `POST /api/auth/refresh` | refresh_token → 새 access_token 발급 (선택) |

---

## OAuth 인증 흐름

```
1. 브라우저 → GET /api/auth/google  (Nuxt)
      │  state 값 생성 (CSRF 방어용) → 쿠키 또는 인메모리 저장
      │
      ▼
2. Nuxt → 302 redirect → Google OAuth 동의 화면
      (scope: openid email profile)
      │
      ▼ Google 인증 완료 후 콜백
3. GET /api/auth/google/callback?code=xxx&state=yyy  (Nuxt)
      │
      ├─ state 검증 (저장된 값과 비교 → 불일치 시 400)
      ├─ Google API: code → access_token 교환
      ├─ Google API: access_token → 프로필 조회
      │     { sub, email, name, picture }
      │
      ▼
4. POST /api/users/social-login  (Spring Boot)
      │  { provider: "google", providerId: sub, email, displayName: name, avatarUrl: picture }
      │
      ├─ users 테이블 조회 (provider + provider_id)
      ├─ 없으면 INSERT, 있으면 last_login_at UPDATE
      ├─ JWT access_token 발급 (+ refresh_token 선택)
      │
      ▼
5. Spring Boot → Nuxt: { accessToken, expiresIn, user }
      │
      ▼
6. Nuxt → 브라우저
      ├─ Set-Cookie: auth_token=<JWT> (httpOnly, sameSite=lax)
      └─ 302 redirect → /dashboard
```

---

## DB 스키마 변경

### `users` 테이블 변경사항

현재 스키마에서 소셜 로그인 지원을 위해 아래 컬럼 추가 및 변경이 필요하다.

#### 추가 컬럼

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| `provider` | VARCHAR(20) | NOT NULL, DEFAULT `'local'` | `local` \| `google` \| `kakao` |
| `provider_id` | VARCHAR(255) | nullable | Google `sub`, Kakao `id` (소셜 고유 식별자) |
| `display_name` | VARCHAR(100) | nullable | 소셜에서 가져온 표시 이름 |
| `avatar_url` | VARCHAR(500) | nullable | 프로필 이미지 URL |
| `last_login_at` | TIMESTAMP | nullable | 마지막 로그인 시각 |

#### 기존 컬럼 변경

| 컬럼 | 현재 | 변경 후 | 이유 |
|------|------|---------|------|
| `password_hash` | NOT NULL | **nullable** | 소셜 로그인 유저는 비밀번호 없음 |

#### 유니크 제약 추가

```sql
CONSTRAINT uq_provider UNIQUE (provider, provider_id)
```
> 같은 소셜 계정이 중복 등록되지 않도록 방지

#### 변경된 DDL

```sql
ALTER TABLE users
    ADD COLUMN provider      VARCHAR(20)  NOT NULL DEFAULT 'local',
    ADD COLUMN provider_id   VARCHAR(255),
    ADD COLUMN display_name  VARCHAR(100),
    ADD COLUMN avatar_url    VARCHAR(500),
    ADD COLUMN last_login_at TIMESTAMP,
    MODIFY COLUMN password_hash VARCHAR(255) NULL,
    ADD CONSTRAINT uq_provider UNIQUE (provider, provider_id);
```

#### 변경 후 전체 `users` 테이블

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| `id` | VARCHAR(36) | PK | UUID |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | 로그인 식별자 |
| `password_hash` | VARCHAR(255) | **nullable** | bcrypt 해시 (소셜 로그인 시 NULL) |
| `provider` | VARCHAR(20) | NOT NULL, DEFAULT `'local'` | `local` \| `google` \| `kakao` |
| `provider_id` | VARCHAR(255) | nullable | 소셜 고유 ID |
| `display_name` | VARCHAR(100) | nullable | 표시 이름 |
| `avatar_url` | VARCHAR(500) | nullable | 프로필 이미지 URL |
| `roles` | VARCHAR(255) | NOT NULL, DEFAULT `'user'` | `user`, `admin`, `viewer` |
| `last_login_at` | TIMESTAMP | nullable | 마지막 로그인 시각 |
| `created_at` | TIMESTAMP | NOT NULL | BaseEntity |
| `updated_at` | TIMESTAMP | NOT NULL | BaseEntity |
| `deleted_at` | TIMESTAMP | nullable | NULL = 활성, NOT NULL = 탈퇴 |

---

## Nuxt 추가 파일 목록

```
server/
├── api/auth/
│   ├── google.get.ts              # ✅ GET /api/auth/google — 리다이렉트
│   ├── google/
│   │   └── callback.get.ts        # ✅ GET /api/auth/google/callback (mock 토큰)
│   ├── kakao.get.ts               # ✅ GET /api/auth/kakao — 리다이렉트
│   └── kakao/
│       └── callback.get.ts        # ✅ GET /api/auth/kakao/callback (mock 토큰)
└── utils/
    └── oauth.ts                   # ✅ state 생성/검증 공통 유틸
```

### 환경변수 추가 (`.env` / `.env.example`) — ✅ 완료

> ⚠️ Nuxt runtimeConfig 자동 매핑은 `NUXT_` 접두사 필수

```env
# Google OAuth
NUXT_GOOGLE_CLIENT_ID=
NUXT_GOOGLE_CLIENT_SECRET=
NUXT_GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback

# Kakao OAuth
NUXT_KAKAO_CLIENT_ID=
NUXT_KAKAO_CLIENT_SECRET=
NUXT_KAKAO_REDIRECT_URI=http://localhost:3000/api/auth/kakao/callback

# Spring Boot API
NUXT_SPRING_API_BASE=http://localhost:8080
```

---

## 고려사항

### 1. Kakao 이메일 미동의 케이스

카카오 로그인에서 이메일은 **선택 동의** 항목이다.  
이메일 없이 가입한 경우 `provider_id`(카카오 고유 ID)로만 식별한다.

```
처리 방법:
- email이 있는 경우 → email + provider + provider_id 로 저장
- email이 없는 경우 → email = null 허용 (users.email UNIQUE 제약 주의)
  또는 가상 이메일 생성: kakao_{provider_id}@kakao.local
```

> **주의**: `users.email UNIQUE NOT NULL` 제약 조정 필요  
> → email을 nullable로 변경하거나, 가상 이메일 전략 채택

### 2. 동일 이메일 계정 충돌

같은 이메일로 Google과 Kakao 모두 가입하는 경우:

| 정책 옵션 | 설명 | 추천 여부 |
|----------|------|----------|
| 동일 계정 연결 | email 기준으로 같은 유저로 처리 | ✅ 일반적 |
| 별도 계정 분리 | provider 조합으로 별개 계정 | 혼란 유발 |
| 계정 연동 UI 제공 | 마이페이지에서 연결/해제 | 추후 확장 |

**초기에는 email 기준 동일 계정 연결 채택**, provider 컬럼은 마지막 로그인 방식으로 업데이트.

### 3. CSRF 방어 (state 파라미터)

OAuth 흐름에서 `state` 파라미터로 CSRF 공격을 방어해야 한다.

```
구현 방법:
- 리다이렉트 시 random state 생성 → httpOnly 쿠키에 저장
- 콜백 수신 시 쿼리 파라미터 state == 쿠키 state 검증
- 검증 후 state 쿠키 즉시 삭제
```

### 4. JWT 전략

| 항목 | 내용 |
|------|------|
| access_token 만료 | 1시간 권장 |
| refresh_token | 30일, DB 저장 (선택 구현) |
| 저장 위치 | httpOnly Cookie (XSS 방어) |
| 전달 방식 | Nuxt BFF가 Spring Boot 호출 시 Authorization 헤더로 전달 |

### 5. 회원 탈퇴 처리

- **Google**: 별도 연결 해제 API 없음. DB soft delete 처리로 충분.
- **Kakao**: 탈퇴 시 Kakao `POST https://kapi.kakao.com/v1/user/unlink` 호출 필요.  
  호출하지 않으면 카카오 앱 연결이 유지됨 → 재가입 시 기존 연결 정보 충돌 가능.

### 6. 프로필 이미지 정책

소셜에서 받은 `avatar_url`은 외부 URL이다.  
Google 이미지는 만료될 수 있고, Kakao 이미지는 사용자가 변경할 수 있다.  
초기에는 URL 그대로 저장하되, 추후 자체 스토리지(S3 등)로 이전 검토.

### 7. 로컬 계정 병행 여부

현재 `email + password` 로컬 로그인 mock이 구현되어 있다.  
소셜 로그인 도입 후 로컬 계정을 유지할지 결정 필요.

| 선택지 | 설명 |
|--------|------|
| 소셜 전용 | 로컬 로그인 제거, 구현 단순화 |
| 병행 유지 | 관리자 계정 등 로컬 로그인 유지 |

**권장: 초기에는 소셜 전용**, admin 계정만 로컬 유지.

---

## 구현 단계 (Phase)

### Phase 1 — Spring Boot 준비 🔲 Backend 작업 필요

- [ ] `users` 테이블 스키마 변경 (ALTER TABLE — [DB 스키마 변경](#db-스키마-변경) 섹션 참조)
- [ ] `POST /api/users/social-login` 구현 (provider + profile → 유저 upsert + JWT 발급)
- [ ] JWT 발급/검증 구현 (Spring Security + JJWT)
- [ ] `GET /api/users/me` 구현 (JWT 검증 → 유저 정보 반환)

### Phase 2 — Nuxt Google 로그인 ✅ 완료

- [x] `server/utils/oauth.ts` — state 생성/검증 유틸 (인메모리 Map, 1회용)
- [x] `server/api/auth/google.get.ts` — Google OAuth 리다이렉트
- [x] `server/api/auth/google/callback.get.ts` — 콜백 처리 (현재 mock 토큰)
- [x] 로그인 페이지 Google 버튼 추가

### Phase 3 — Nuxt Kakao 로그인 ✅ 완료

- [x] `server/api/auth/kakao.get.ts` — Kakao OAuth 리다이렉트
- [x] `server/api/auth/kakao/callback.get.ts` — 콜백 처리 (현재 mock 토큰)
- [x] Kakao 이메일 미동의 케이스 처리 (`kakao_{id}@kakao.local` 가상 이메일)
- [x] 로그인 페이지 Kakao 버튼 추가

### Phase 4 — 기존 mock 교체 🔲 Phase 1 완료 후 작업

- [ ] `google/callback.get.ts` → `POST ${springApiBase}/api/users/social-login` 실제 호출로 교체
- [ ] `kakao/callback.get.ts` → `POST ${springApiBase}/api/users/social-login` 실제 호출로 교체
- [ ] `me.get.ts` → Spring Boot `/api/users/me` 프록시로 교체
- [ ] `logout.post.ts` → 쿠키 삭제 + Spring Boot 호출

### Phase 5 — 추가 기능 (선택) 🔲 추후 검토

- [ ] refresh_token 갱신 흐름
- [ ] 계정 연동/해제 UI (마이페이지)
- [ ] 프로필 이미지 자체 스토리지 이전 (S3 등)

---

## 외부 서비스 등록

### Google Cloud Console ✅ 완료

- [x] 프로젝트 생성
- [x] OAuth 동의 화면 설정
- [x] OAuth 2.0 클라이언트 ID 생성 + 시크릿 발급
- [x] 승인된 리디렉션 URI 등록: `http://localhost:3000/api/auth/google/callback`
- [ ] 운영 URI 추가: `https://{도메인}/api/auth/google/callback` (배포 시)

### Kakao Developers ✅ 완료

- [x] 애플리케이션 추가
- [x] Web 사이트 도메인 등록
- [x] 카카오 로그인 활성화
- [x] Redirect URI 등록: `http://localhost:3000/api/auth/kakao/callback`
- [x] 동의항목 설정 (이메일 선택, 프로필 닉네임 필수, 프로필 사진 선택)
- [ ] 운영 URI 추가: `https://{도메인}/api/auth/kakao/callback` (배포 시)
