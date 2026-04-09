# API 명세 — fear-greed-index-fe2

> 이 문서는 프론트엔드(Nuxt Nitro 서버 라우트)가 제공해야 할 모든 API 엔드포인트의 명세입니다.
> 기준일: 2026-04-08 (API 병합 반영)

---

## 목차

1. [공통 규약](#1-공통-규약)
2. [시스템](#2-시스템)
3. [인증 (Auth)](#3-인증-auth)
4. [마켓 (Markets)](#4-마켓-markets)
5. [커뮤니티 투표 (Votes)](#5-커뮤니티-투표-votes)
6. [뉴스 (News)](#6-뉴스-news)
7. [키워드 랭킹 (Keywords)](#7-키워드-랭킹-keywords)
8. [외부 API 연동 현황](#8-외부-api-연동-현황)
9. [에러 코드 정의](#9-에러-코드-정의)
10. [구현 우선순위](#10-구현-우선순위)

---

## 1. 공통 규약

### Base URL
```
/api  (클라이언트 → Nuxt Nitro)
```

### 응답 형식
모든 응답은 `ApiResponse<T>` 래퍼를 사용합니다.

```typescript
interface ApiResponse<T> {
  data?: T
  error?: ApiError
  metadata?: Record<string, unknown>
}

interface ApiError {
  code: string      // 머신 리더블 코드 (예: "MARKET_NOT_FOUND")
  message: string   // 사람이 읽는 설명
}
```

### 인증
- 쿠키 `auth_token` (httpOnly, sameSite: lax) 방식
- 인증 필요 엔드포인트는 `🔒` 표시
- 미인증 요청 시 → `401 Unauthorized`

### 마켓 ID 목록

| id | 설명 |
|----|------|
| `sp500` | 미국 S&P 500 |
| `kospi` | 한국 코스피 |
| `kosdaq` | 한국 코스닥 |

### API 병합 요약

| 제거된 엔드포인트 | 병합된 엔드포인트 | 이유 |
|----------------|----------------|------|
| `GET /api/markets/comparison` | `GET /api/markets` | 대시보드가 두 데이터를 동시에 사용 → N+1 제거 |
| `GET /api/markets/:id/history` | `GET /api/markets/:id` | 상세 페이지가 두 데이터를 동시에 사용 → 1회 요청으로 해결 |

---

## 2. 시스템

### `GET /api/health`

서버 상태 확인.

**상태**: ✅ 구현 완료  
**관련 테이블**: 없음

**응답 예시**
```json
{
  "status": "ok",
  "timestamp": "2026-04-05T09:00:00.000Z",
  "version": "1.0.0"
}
```

---

## 3. 인증 (Auth)

### `POST /api/auth/login`

이메일 + 비밀번호로 로그인. 성공 시 `auth_token` 쿠키 발급.

**상태**: ⬜ 미구현 (스텁만 존재)  
**관련 테이블**: `users`  
**쿼리**: `SELECT * FROM users WHERE email = ? AND deleted_at IS NULL` → bcrypt 비교

**요청 본문**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**유효성 검사**
- `email`: 이메일 형식 필수
- `password`: 8자 이상

**응답 `200`**
```json
{
  "data": {
    "user": {
      "id": "u_abc123",
      "email": "user@example.com",
      "roles": ["user"]
    },
    "tokens": {
      "accessToken": "eyJ...",
      "expiresIn": 86400
    }
  }
}
```

**에러**
| 코드 | 상황 |
|------|------|
| `400` | 유효성 검사 실패 |
| `401` | 이메일 또는 비밀번호 불일치 |

---

### `POST /api/auth/logout`

🔒 로그아웃. `auth_token` 쿠키 무효화.

**상태**: ⬜ 미구현  
**관련 테이블**: 없음 (쿠키 무효화만)

**응답 `200`**
```json
{ "data": { "ok": true } }
```

---

### `GET /api/auth/me`

🔒 현재 인증된 사용자 정보 조회.

**상태**: ⬜ 미구현  
**관련 테이블**: `users`  
**쿼리**: `SELECT id, email, roles FROM users WHERE id = ?`

**응답 `200`**
```json
{
  "data": {
    "id": "u_abc123",
    "email": "user@example.com",
    "roles": ["user"]
  }
}
```

**에러**
| 코드 | 상황 |
|------|------|
| `401` | 미인증 |

---

## 4. 마켓 (Markets)

### `GET /api/markets`

전체 마켓 목록 + 현재 지수값 + 비교 차트용 히스토리.

> **병합**: 기존 `GET /api/markets/comparison` 통합. 대시보드 MarketSummaryCard 3개 + MarketComparisonChart가 모두 이 응답을 사용하므로 단일 요청으로 처리.

**상태**: ⬜ 미구현 (현재 `pages/dashboard.vue`, `pages/indices/index.vue`에 mock 하드코딩)  
**관련 테이블**: `market`, `market_history`

**서버 처리 흐름**
```
1. SELECT * FROM market                          -- 마켓 메타
2. SELECT market_id, score, trade_date
   FROM market_history
   WHERE trade_date >= CURRENT_DATE - 30         -- 비교 차트 30일 이력
   ORDER BY trade_date DESC
3. 최근 10일 score 배열 → sparkline 조립 (앱 레이어)
4. 최신 1건 score/grade → value/value_classification
```

**쿼리 파라미터**

| 파라미터 | 타입 | 기본값 | 설명 |
|---------|------|--------|------|
| `historyLimit` | `integer` | `30` | 히스토리 반환 일수 (1–365) |

**응답 `200`**
```json
{
  "data": [
    {
      "id": "sp500",
      "name": "S&P 500",
      "nameKo": "미국 주식",
      "region": "미국",
      "description": "S&P 500 기반 7개 지표의 동일 가중치 평균. NYSE 시황, VIX, 풋/콜 비율 등을 반영합니다.",
      "value": 72,
      "value_classification": "Greed",
      "sparkline": [45, 52, 58, 54, 60, 63, 67, 65, 70, 72],
      "history": [
        { "value": 72, "value_classification": "Greed",   "timestamp": "1775001600" },
        { "value": 70, "value_classification": "Greed",   "timestamp": "1774915200" }
      ],
      "timestamp": "1775001600",
      "time_until_update": "14 hours"
    },
    {
      "id": "kospi",
      "name": "KOSPI",
      "nameKo": "한국 주식 (코스피)",
      "region": "한국",
      "description": "VKOSPI, KOSPI 모멘텀, 주가 강도 등 6개 지표를 가중 평균해 산출합니다.",
      "value": 48,
      "value_classification": "Neutral",
      "sparkline": [38, 42, 40, 44, 46, 43, 47, 45, 49, 48],
      "history": [
        { "value": 48, "value_classification": "Neutral", "timestamp": "1775001600" }
      ],
      "timestamp": "1775001600",
      "time_until_update": "6 hours"
    },
    {
      "id": "kosdaq",
      "name": "KOSDAQ",
      "nameKo": "한국 주식 (코스닥)",
      "region": "한국",
      "description": "KOSDAQ 전용 변동성·모멘텀·강도 지표를 바탕으로 코스닥 심리를 수치화합니다.",
      "value": 35,
      "value_classification": "Fear",
      "sparkline": [55, 50, 46, 48, 42, 40, 38, 37, 36, 35],
      "history": [
        { "value": 35, "value_classification": "Fear",    "timestamp": "1775001600" }
      ],
      "timestamp": "1775001600",
      "time_until_update": "6 hours"
    }
  ],
  "metadata": { "historyLimit": 30 }
}
```

**타입 정의**
```typescript
interface MarketSummary {
  id: string
  name: string
  nameKo: string
  region: string
  description: string
  value: number
  value_classification: FearGreedClassification
  sparkline: number[]           // 최근 10일 값 (MarketSummaryCard 스파크라인)
  history: HistoryEntry[]       // 비교 차트용 (기존 /comparison 대체)
  timestamp: string
  time_until_update?: string
}

interface HistoryEntry {
  value: number
  value_classification: FearGreedClassification
  timestamp: string
}
```

---

### `GET /api/markets/:id`

특정 마켓의 상세 정보 + 세부 지표 + 히스토리.

> **병합**: 기존 `GET /api/markets/:id/history` 통합. `pages/indices/[market].vue`가 세부 지표(indicators)와 히스토리(TrendChart, ZoneDistributionChart, 날짜 선택기)를 동시에 사용하므로 단일 요청으로 처리.  
> **snapshots 제거**: 어제/1주일 전/1달 전/1년 전 스냅샷은 현재 UI에서 렌더링하지 않으므로 제외.

**상태**: ⬜ 미구현 (현재 `pages/indices/[market].vue`에 mock 하드코딩)  
**관련 테이블**: `market`, `market_indicators`, `market_history`

**서버 처리 흐름**
```
1. SELECT * FROM market WHERE market_code = ?                 -- 마켓 메타
2. SELECT * FROM market_indicators WHERE market_id = ?
   ORDER BY sort_order                                        -- 세부 지표 (indicators)
3. SELECT score, grade, trade_date FROM market_history
   WHERE market_id = ? AND trade_date >= CURRENT_DATE - ?
   ORDER BY trade_date DESC                                   -- 히스토리
4. market_history 최신 1건 → currentValue/currentClassification
```

**경로 파라미터**
- `id`: `sp500` | `kospi` | `kosdaq`

**쿼리 파라미터**

| 파라미터 | 타입 | 기본값 | 설명 |
|---------|------|--------|------|
| `limit` | `integer` | `30` | 히스토리 반환 일수 (1–365) |

**응답 `200`**
```json
{
  "data": {
    "id": "sp500",
    "name": "S&P 500",
    "nameKo": "미국 주식",
    "description": "S&P 500 기반 7개 지표의 동일 가중치 평균으로 미국 증시 심리를 수치화합니다.",
    "currentValue": 72,
    "currentClassification": "Greed",
    "indicators": [
      { "name": "Stock Price Momentum", "nameKo": "주가 모멘텀",   "value": 74, "description": "S&P 500이 125일 이동평균 대비 위치를 측정합니다." },
      { "name": "Stock Price Strength", "nameKo": "주가 강도",     "value": 78, "description": "NYSE 52주 신고가/신저가 비율입니다." },
      { "name": "Stock Price Breadth",  "nameKo": "주가 폭",       "value": 63, "description": "NYSE McClellan 지표입니다." },
      { "name": "Put & Call Options",   "nameKo": "풋/콜 비율",    "value": 68, "description": "CBOE 풋/콜 비율 5일 평균입니다." },
      { "name": "Junk Bond Demand",     "nameKo": "정크본드 수요", "value": 72, "description": "하이일드채 스프레드입니다." },
      { "name": "Market Volatility",    "nameKo": "시장 변동성",   "value": 66, "description": "VIX와 50일 이동평균 비교입니다." },
      { "name": "Safe Haven Demand",    "nameKo": "안전자산 수요", "value": 80, "description": "주식 대비 채권 수익률 차이입니다." }
    ],
    "history": [
      { "value": 72, "value_classification": "Greed", "timestamp": "1775001600" },
      { "value": 70, "value_classification": "Greed", "timestamp": "1774915200" }
    ]
  },
  "metadata": { "market": "sp500", "limit": 30, "count": 30 }
}
```

> **지표 개수**: 마켓마다 상이함 — `sp500` 7개, `kospi` 6개, `kosdaq` 5~6개.  
> 프론트엔드는 `indicators` 배열을 동적으로 렌더링하므로 개수 제약 없음.

**타입 정의**
```typescript
interface MarketDetail {
  id: string
  name: string
  nameKo: string
  description: string
  currentValue: number
  currentClassification: FearGreedClassification
  indicators: SubIndicator[]
  history: HistoryEntry[]       // 기존 /history 대체
}

interface SubIndicator {
  name: string
  nameKo: string
  value: number
  description: string
}
```

**에러**
| 코드 | 상황 |
|------|------|
| `400` | limit 범위 초과 |
| `404` | 알 수 없는 마켓 ID |

---

## 5. 커뮤니티 투표 (Votes)

### `GET /api/votes/:marketId`

특정 마켓의 오늘 투표 집계 조회. `CommunityVoteCard`에 사용 (`pages/dashboard.vue` + `pages/indices/[market].vue` 양쪽).

**상태**: ⬜ 미구현 (현재 `dashboard.vue` + `indices/[market].vue`에 mock 하드코딩)  
**관련 테이블**: `votes_daily_summary`, `market`

**서버 처리 흐름**
```
1. SELECT id FROM market WHERE market_code = ?
2. SELECT bearish, bullish, total FROM votes_daily_summary
   WHERE market_id = ? AND vote_date = CURRENT_DATE
3. bearishPct = ROUND(bearish / total * 100), bullishPct = 100 - bearishPct  -- 앱 레이어 계산
```

**경로 파라미터**
- `marketId`: `sp500` | `kospi` | `kosdaq`

**응답 `200`**
```json
{
  "data": {
    "marketId": "sp500",
    "date": "2026-04-05",
    "bearish": 312,
    "bullish": 748,
    "total": 1060,
    "bearishPct": 29,
    "bullishPct": 71
  }
}
```

---

### `POST /api/votes`

🔒 투표 등록. **로그인 필수**.  
`CommunityVoteCard`에 사용 (`pages/dashboard.vue` + `pages/indices/[market].vue` 양쪽).

> **중복 방지 2중 구조**
> - **클라이언트**: `localStorage` 키 `vote_{marketId}` + 날짜로 UI 선차단 (이미 구현됨)
> - **서버**: userId + 날짜 기준 중복 투표 거부 → `409` 반환 (서버가 최종 권한)
>
> **비로그인 UX**: 투표 버튼 대신 "로그인하면 투표 및 커뮤니티 지수를 확인할 수 있어요" 안내 표시 (이미 구현됨)

**상태**: ⬜ 미구현  
**관련 테이블**: `votes`, `votes_daily_summary`, `market`

**서버 처리 흐름**
```
1. SELECT id FROM market WHERE market_code = ?
2. INSERT INTO votes (user_id, market_id, choice, vote_date) VALUES (?, ?, ?, CURRENT_DATE)
   -- UNIQUE (user_id, market_id, vote_date) 위반 시 → 409
3. INSERT INTO votes_daily_summary ... ON CONFLICT DO UPDATE SET ...  -- UPSERT
4. SELECT bearish, bullish, total FROM votes_daily_summary WHERE ...  -- 갱신된 집계 반환
```

**요청 본문**
```json
{
  "marketId": "sp500",
  "choice": "bullish"
}
```

**유효성 검사**
- `marketId`: 허용된 마켓 ID 중 하나
- `choice`: `"bearish"` | `"bullish"`

**응답 `201`**
```json
{
  "data": {
    "marketId": "sp500",
    "date": "2026-04-05",
    "bearish": 312,
    "bullish": 749,
    "total": 1061,
    "bearishPct": 29,
    "bullishPct": 71
  }
}
```

**에러**
| 코드 | 상황 |
|------|------|
| `400` | 유효하지 않은 marketId 또는 choice |
| `409` | 오늘 이미 투표함 |

---

## 6. 뉴스 (News)

### `GET /api/news`

뉴스 목록 조회. `pages/news.vue` (검색+마켓 필터+페이지네이션) 및 대시보드 `NewsList`에 사용.

**상태**: ⬜ 미구현 (현재 `news.vue` 16건 + `dashboard.vue` 8건 mock 하드코딩)  
**관련 테이블**: `news`

**서버 처리 흐름**
```sql
SELECT id, title, source, market_code AS market, url, published_at
FROM news
WHERE (market_code = ? OR ? IS NULL)
  AND (title LIKE '%?%' OR source LIKE '%?%' OR ? IS NULL)
ORDER BY published_at DESC
LIMIT ? OFFSET ?
```

> `news.vue`는 현재 클라이언트 사이드에서 제목·출처 검색 및 마켓 필터를 처리 중.  
> API 연동 시 `q` 파라미터를 서버에서 처리하도록 전환.

**쿼리 파라미터**

| 파라미터 | 타입 | 기본값 | 설명 |
|---------|------|--------|------|
| `market` | `string` | (전체) | `sp500` \| `kospi` \| `kosdaq` \| `global` |
| `limit`  | `integer` | `20` | 최대 반환 수 (1–100) |
| `offset` | `integer` | `0` | 페이지네이션 오프셋 |
| `q`      | `string` | (없음) | 제목·출처 검색어 |

**응답 `200`**
```json
{
  "data": [
    {
      "id": 1,
      "title": "연준, 기준금리 동결 결정…\"추가 데이터 확인 후 인하 검토\"",
      "source": "Bloomberg",
      "publishedAt": "2026-04-05T07:00:00Z",
      "market": "sp500",
      "url": "https://bloomberg.com/..."
    }
  ],
  "metadata": {
    "total": 48,
    "limit": 20,
    "offset": 0
  }
}
```

**타입 정의**

```typescript
interface NewsApiItem {
  id: number
  title: string
  source: string
  publishedAt: string   // ISO 8601 — 프론트에서 "N시간 전" 포맷으로 변환
  market: 'sp500' | 'kospi' | 'kosdaq' | 'global'
  url: string
}
```

> **프론트 타입 업데이트 필요**: 현재 `NewsItem.time: string`은 mock에서 "2시간 전"처럼 사전 포맷된 문자열.  
> API 연동 시 `time` 필드를 제거하고 `publishedAt`(ISO 8601)으로 대체 후 프론트에서 상대 시간으로 변환.

**데이터 소스 (구현 시 선택)**
- 연합뉴스 RSS: `https://www.yna.co.kr/rss/economy.xml`
- Reuters RSS: `https://feeds.reuters.com/reuters/businessNews`
- Nitro 서버에서 RSS 파싱 → `news` 테이블 INSERT → API 응답

---

## 7. 키워드 랭킹 (Keywords)

### `GET /api/keywords`

검색량 기준 인기 키워드 랭킹. `KeywordRanking` 컴포넌트에 사용 (`pages/dashboard.vue`).

**상태**: ⬜ 미구현 (현재 `pages/dashboard.vue`에 mock 하드코딩)  
**관련 테이블**: `keywords`

**서버 처리 흐름**
```sql
SELECT rank, keyword, count, trend
FROM keywords
WHERE snapshot_date = (SELECT MAX(snapshot_date) FROM keywords WHERE source = ?)
  AND source = ?
ORDER BY rank
LIMIT ?
```

**쿼리 파라미터**

| 파라미터 | 타입 | 기본값 | 설명 |
|---------|------|--------|------|
| `limit` | `integer` | `10` | 최대 반환 수 (1–30) |
| `source` | `string` | `naver` | `naver` (국내) \| `google` (해외) |

**응답 `200`**
```json
{
  "data": [
    { "rank": 1, "keyword": "금리",      "count": 12450, "trend": "up" },
    { "rank": 2, "keyword": "연준(Fed)", "count": 9832,  "trend": "up" },
    { "rank": 3, "keyword": "반도체",   "count": 8210,  "trend": "down" }
  ],
  "metadata": { "updatedAt": "2026-04-05T06:00:00Z", "source": "naver" }
}
```

**타입 정의**
```typescript
interface KeywordItem {
  rank: number
  keyword: string
  count: number
  trend: 'up' | 'down' | 'same'
}
```

**데이터 소스 (구현 시 선택)**
- 네이버 데이터랩 API (API 키 필요): 금융 카테고리 검색량
- 구글 트렌드 (비공식 scraping): `google-trends-api` 패키지

---

## 8. 외부 API 연동 현황

| 마켓/데이터 | 외부 API | 비용 | 상태 | Nitro 라우트 |
|------------|---------|------|------|------------|
| 암호화폐 F&G | `api.alternative.me/fng/` | 무료 | ✅ 연동 중 | `/api/fear-greed/current`, `/api/fear-greed/history` |
| S&P 500 F&G | 자체 계산 또는 CNN (비공식) | 무료 | ⬜ 미구현 | `/api/markets/sp500` |
| KOSPI 데이터 | 한국투자증권 Open API (KIS) | 무료 (계좌 필요) | ⬜ 미구현 | `/api/markets/kospi` |
| KOSDAQ 데이터 | 한국투자증권 Open API (KIS) | 무료 (계좌 필요) | ⬜ 미구현 | `/api/markets/kosdaq` |
| VKOSPI | KRX OpenAPI 또는 네이버 금융 | 무료 | ⬜ 미구현 | `/api/markets/kospi` 내부 |
| 뉴스 | RSS (연합뉴스, Reuters) | 무료 | ⬜ 미구현 | `/api/news` |
| 키워드 | 네이버 데이터랩 API | 무료 (키 필요) | ⬜ 미구현 | `/api/keywords` |

### 기존 공포탐욕 라우트 관계

현재 `/api/fear-greed/*` 는 암호화폐 전용입니다.  
멀티마켓 구조로 전환 시 `/api/markets/*` 로 통합하되, 하위 호환을 위해 기존 라우트는 유지할 수 있습니다.

```
기존 (암호화폐):
  GET /api/fear-greed/current   → api.alternative.me 직접 프록시
  GET /api/fear-greed/history   → api.alternative.me 직접 프록시

신규 (멀티마켓):
  GET /api/markets              → 전체 마켓 목록 + 비교 차트 히스토리 (병합)
  GET /api/markets/:id          → 마켓 상세 + 지표 + 히스토리 (병합)
```

---

## 9. 에러 코드 정의

| HTTP 코드 | 앱 에러 코드 | 설명 |
|----------|------------|------|
| `400` | `INVALID_PARAMS` | 요청 파라미터 유효성 실패 |
| `401` | `UNAUTHENTICATED` | 인증 토큰 없음 또는 만료 |
| `403` | `FORBIDDEN` | 권한 부족 |
| `404` | `NOT_FOUND` | 리소스 없음 |
| `409` | `DUPLICATE_VOTE` | 오늘 이미 투표 완료 |
| `429` | `RATE_LIMITED` | 요청 빈도 초과 |
| `502` | `UPSTREAM_ERROR` | 외부 API 연결 실패 |
| `503` | `SERVICE_UNAVAILABLE` | 서버 점검 중 |

**에러 응답 형식**
```json
{
  "error": {
    "code": "DUPLICATE_VOTE",
    "message": "오늘 이미 투표하셨습니다. 자정 이후 다시 투표할 수 있습니다."
  }
}
```

---

## 10. 구현 우선순위

> 기준일: 2026-04-08 재조정.  
> `dashboard.vue`, `indices/index.vue`, `indices/[market].vue`, `news.vue` 4개 페이지가 mock 기반으로 구현됨.  
> API 병합으로 마켓 관련 엔드포인트 6개 → 4개로 축소.

| 우선순위 | 엔드포인트 | 관련 테이블 | 사용처 | 비고 |
|---------|-----------|-----------|-------|------|
| ⭐⭐⭐ P0 | `GET /api/markets` | `market`, `market_history` | dashboard MarketSummaryCard + MarketComparisonChart, indices/index.vue | 병합: 비교 차트 포함 |
| ⭐⭐⭐ P0 | `GET /api/markets/:id` | `market`, `market_indicators`, `market_history` | indices/[market].vue 세부지표 + TrendChart + ZoneDistributionChart | 병합: 히스토리 포함 |
| ⭐⭐⭐ P0 | `GET /api/votes/:marketId` | `votes_daily_summary`, `market` | CommunityVoteCard (dashboard + indices/[market]) | |
| ⭐⭐⭐ P0 | `POST /api/votes` 🔒 | `votes`, `votes_daily_summary`, `market` | CommunityVoteCard (로그인 사용자만) | userId + 날짜 중복 방지 |
| ⭐⭐ P1 | `GET /api/news` | `news` | `news.vue` + `dashboard` NewsList | RSS 파싱 필요, `NewsItem.time → publishedAt` 타입 업데이트 필요 |
| ⭐⭐ P1 | `GET /api/keywords` | `keywords` | `dashboard` KeywordRanking | 네이버 데이터랩 API 키 필요 |
| ⭐ P2 | `POST /api/auth/login` | `users` | 로그인 페이지 | 인증 완성 |
| ⭐ P2 | `GET /api/auth/me` | `users` | 앱 초기화 | 세션 복원 |
