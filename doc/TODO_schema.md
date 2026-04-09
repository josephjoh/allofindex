# DB 스키마 설계 — fear-greed-index-fe2

> 기준일: 2026-04-07  
> TODO_pub.md (UI 기획) + TODO_api.md (API 명세) 기반으로 설계.  
> RDBMS(PostgreSQL) 기준. 추후 NoSQL(MongoDB) 전환 시 별도 매핑 필요.

---

## 목차

1. [설계 원칙](#1-설계-원칙)
2. [ERD 개요](#2-erd-개요)
3. [테이블 정의](#3-테이블-정의)
   - [users](#31-users)
   - [markets](#32-markets)
   - [market_indicators](#33-market_indicators)
   - [market_history](#34-market_history)
   - [votes](#35-votes)
   - [news](#36-news)
   - [keywords](#37-keywords)
4. [인덱스 전략](#4-인덱스-전략)
5. [API ↔ 테이블 매핑](#5-api--테이블-매핑)
6. [구현 우선순위](#6-구현-우선순위)

---

## 1. 설계 원칙

- **시계열 데이터 분리**: 현재값(`markets`)과 이력(`market_history`)을 분리해 최신 조회 성능 보장
- **마켓별 지표 동적화**: 지표 개수가 마켓마다 다름 (sp500: 7개, kospi: 6개, kosdaq: 5~6개) → `market_indicators` 별도 테이블
- **일별 집계**: 키워드·투표는 날짜 단위 집계 — 원본 기록 + 집계 캐시 테이블 분리
- **소프트 딜리트 없음**: 뉴스·히스토리는 누적 보존, users만 `deleted_at` 관리
- **UUID 기본키**: 사용자·뉴스 등 외부 노출 가능한 ID에 UUID 사용, 내부 집계 테이블은 `BIGSERIAL`

---

## 2. ERD 개요

```
markets ──────────────────────────────────────────────┐
  │                                                    │
  ├─── market_indicators (1:N)                         │
  │      └─ 지표별 현재값                               │
  │                                                    │
  ├─── market_history (1:N)                            │
  │      └─ 날짜별 지수 기록                            │
  │                                                    │
  └─── votes (1:N, 날짜 기준 집계)                      │
         └─ 사용자 투표 기록 (users FK)                 │
                                                       │
users ─────────────────────────────────────────────────┘
  │
  └─── votes (1:N)


news (단독 — 마켓 ID는 문자열 참조, FK 없음)
keywords_snapshot (단독 — 날짜별 키워드 랭킹 스냅샷)
```

---

## 3. 테이블 정의

### 3.1 `users`

로그인 사용자 정보. 투표 중복 방지에 사용.

```sql
CREATE TABLE users (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  email        VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,                      -- bcrypt hash
  roles        TEXT[]       NOT NULL DEFAULT '{user}',      -- 'admin' | 'user' | 'viewer'
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
  deleted_at   TIMESTAMPTZ                                  -- 소프트 딜리트
);
```

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | UUID | PK, `gen_random_uuid()` 자동 생성 |
| `email` | VARCHAR(255) | 로그인 식별자, 유니크 |
| `password_hash` | VARCHAR(255) | bcrypt 해시 (원문 저장 금지) |
| `roles` | TEXT[] | 권한 배열 (`user`, `admin`, `viewer`) |
| `deleted_at` | TIMESTAMPTZ | NULL = 활성, NOT NULL = 탈퇴 |

---

### 3.2 `markets`

마켓 메타 정보 + 현재 지수값. `GET /api/markets`, `GET /api/markets/:id` 기반.

```sql
CREATE TABLE markets (
  id                    VARCHAR(20)  PRIMARY KEY,           -- 'sp500' | 'kospi' | 'kosdaq'
  name                  VARCHAR(50)  NOT NULL,              -- 'S&P 500'
  name_ko               VARCHAR(50)  NOT NULL,              -- '미국 주식'
  region                VARCHAR(20)  NOT NULL,              -- '미국' | '한국'
  description           TEXT,                               -- 지수 설명
  current_value         SMALLINT     NOT NULL DEFAULT 0,    -- 0~100
  current_classification VARCHAR(20) NOT NULL DEFAULT 'Neutral',  -- FearGreedClassification
  sparkline             SMALLINT[]   NOT NULL DEFAULT '{}', -- 최근 10일 값
  last_updated_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
  time_until_update     VARCHAR(20)                         -- '14 hours' 등 표시용
);
```

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | VARCHAR(20) | PK, 고정값 (`sp500`, `kospi`, `kosdaq`) |
| `current_value` | SMALLINT | 현재 지수 (0~100) |
| `sparkline` | SMALLINT[] | 최근 10일 값 배열, MarketSummaryCard 스파크라인 |
| `last_updated_at` | TIMESTAMPTZ | 마지막 지수 계산 시각 |

---

### 3.3 `market_indicators`

마켓별 세부 지표. `GET /api/markets/:id` → `indicators[]` 배열에 대응.  
마켓마다 개수 다름 (sp500: 7, kospi: 6, kosdaq: 5~6).

```sql
CREATE TABLE market_indicators (
  id           BIGSERIAL    PRIMARY KEY,
  market_id    VARCHAR(20)  NOT NULL REFERENCES markets(id),
  name         VARCHAR(100) NOT NULL,    -- 'Stock Price Momentum'
  name_ko      VARCHAR(100) NOT NULL,    -- '주가 모멘텀'
  description  TEXT,
  value        SMALLINT     NOT NULL DEFAULT 0,   -- 0~100
  sort_order   SMALLINT     NOT NULL DEFAULT 0,   -- 표시 순서
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);
```

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `market_id` | VARCHAR(20) | FK → `markets.id` |
| `value` | SMALLINT | 개별 지표 점수 (0~100) |
| `sort_order` | SMALLINT | 프론트 그리드 표시 순서 |

**초기 데이터 (sp500)**

| sort_order | name | name_ko |
|-----------|------|---------|
| 1 | Stock Price Momentum | 주가 모멘텀 |
| 2 | Stock Price Strength | 주가 강도 |
| 3 | Stock Price Breadth | 주가 폭 |
| 4 | Put & Call Options | 풋/콜 비율 |
| 5 | Junk Bond Demand | 정크본드 수요 |
| 6 | Market Volatility | 시장 변동성 |
| 7 | Safe Haven Demand | 안전자산 수요 |

**초기 데이터 (kospi)**

| sort_order | name | name_ko |
|-----------|------|---------|
| 1 | VKOSPI | 한국 변동성 지수 |
| 2 | KOSPI Momentum | KOSPI 모멘텀 |
| 3 | Stock Price Strength | 주가 강도 |
| 4 | KOSPI Trend | 주가 추세 |
| 5 | KOSDAQ Change Rate | KOSDAQ 등락률 |
| 6 | Safe Haven Demand | 안전자산 수요 |

---

### 3.4 `market_history`

날짜별 지수 이력. `GET /api/markets/:id/history` 응답 소스.  
`ZoneDistributionChart`는 이 데이터를 클라이언트에서 집계.

```sql
CREATE TABLE market_history (
  id                    BIGSERIAL    PRIMARY KEY,
  market_id             VARCHAR(20)  NOT NULL REFERENCES markets(id),
  trade_date            DATE         NOT NULL,              -- 거래일 기준
  value                 SMALLINT     NOT NULL,              -- 0~100
  value_classification  VARCHAR(20)  NOT NULL,              -- FearGreedClassification
  recorded_at           TIMESTAMPTZ  NOT NULL DEFAULT now(),

  UNIQUE (market_id, trade_date)                            -- 마켓·날짜 중복 방지
);
```

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `market_id` | VARCHAR(20) | FK → `markets.id` |
| `trade_date` | DATE | 거래일 (타임존 없음, 현지 날짜 기준) |
| `value` | SMALLINT | 해당 날짜 지수값 (0~100) |
| `value_classification` | VARCHAR(20) | 구간명 (`Extreme Fear` ~ `Extreme Greed`) |

> `UNIQUE (market_id, trade_date)` — 동일 마켓·날짜에 한 row만 허용.  
> `sparkline` 조회 시: `ORDER BY trade_date DESC LIMIT 10`.  
> `ZoneDistributionChart` 구간 집계 예시:
> ```sql
> SELECT value_classification, COUNT(*) AS cnt
> FROM market_history
> WHERE market_id = 'sp500' AND trade_date >= CURRENT_DATE - 30
> GROUP BY value_classification;
> ```
> _(실제로는 API가 배열 반환 → 클라이언트 집계)_

---

### 3.5 `votes`

커뮤니티 투표. `POST /api/votes` (등록) + `GET /api/votes/:marketId` (집계 조회).  
**로그인 필수**, userId + date 기준 중복 방지.

```sql
-- 투표 원본 기록
CREATE TABLE votes (
  id          BIGSERIAL    PRIMARY KEY,
  user_id     UUID         NOT NULL REFERENCES users(id),
  market_id   VARCHAR(20)  NOT NULL REFERENCES markets(id),
  choice      VARCHAR(10)  NOT NULL CHECK (choice IN ('bearish', 'bullish')),
  vote_date   DATE         NOT NULL DEFAULT CURRENT_DATE,   -- 한국 시각 기준 날짜
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),

  UNIQUE (user_id, market_id, vote_date)                    -- 1인 1일 1마켓 1표
);

-- 일별 집계 캐시 (읽기 성능 최적화)
CREATE TABLE votes_daily_summary (
  market_id   VARCHAR(20)  NOT NULL REFERENCES markets(id),
  vote_date   DATE         NOT NULL,
  bearish     INTEGER      NOT NULL DEFAULT 0,
  bullish     INTEGER      NOT NULL DEFAULT 0,
  total       INTEGER      GENERATED ALWAYS AS (bearish + bullish) STORED,
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),

  PRIMARY KEY (market_id, vote_date)
);
```

**`votes` 테이블**

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `user_id` | UUID | FK → `users.id`, 로그인 필수 |
| `choice` | VARCHAR(10) | `bearish` 또는 `bullish` |
| `vote_date` | DATE | 투표일 (한국 시각 기준 KST) |
| UNIQUE | `(user_id, market_id, vote_date)` | 동일 날짜 중복 투표 방지 |

**`votes_daily_summary` 테이블**

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `total` | GENERATED ALWAYS | `bearish + bullish` 자동 계산 |

> **집계 갱신 전략**: `votes` INSERT 후 `votes_daily_summary` UPSERT.  
> ```sql
> INSERT INTO votes_daily_summary (market_id, vote_date, bearish, bullish)
> VALUES ($1, CURRENT_DATE, 0, 0)
> ON CONFLICT (market_id, vote_date)
> DO UPDATE SET
>   bearish  = votes_daily_summary.bearish + CASE WHEN $2 = 'bearish' THEN 1 ELSE 0 END,
>   bullish  = votes_daily_summary.bullish + CASE WHEN $2 = 'bullish' THEN 1 ELSE 0 END,
>   updated_at = now();
> ```

---

### 3.6 `news`

뉴스 기사. `GET /api/news` 응답 소스.  
RSS 파싱 결과를 저장 (연합뉴스, Reuters 등).

```sql
CREATE TABLE news (
  id           BIGSERIAL    PRIMARY KEY,
  external_id  VARCHAR(255) UNIQUE,                         -- RSS guid / URL 해시 (중복 방지)
  title        VARCHAR(500) NOT NULL,
  source       VARCHAR(100) NOT NULL,                       -- 'Bloomberg', '한국경제' 등
  market       VARCHAR(20)  NOT NULL DEFAULT 'global'       -- 'sp500' | 'kospi' | 'kosdaq' | 'global'
                            CHECK (market IN ('sp500', 'kospi', 'kosdaq', 'global')),
  url          TEXT         NOT NULL,
  published_at TIMESTAMPTZ  NOT NULL,                       -- 원문 발행 시각
  fetched_at   TIMESTAMPTZ  NOT NULL DEFAULT now()          -- 수집 시각
);
```

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `external_id` | VARCHAR(255) | RSS `<guid>` 또는 URL 해시, 중복 수집 방지 |
| `market` | VARCHAR(20) | 연관 마켓 분류 (프론트 필터 기준) |
| `published_at` | TIMESTAMPTZ | API 응답 `publishedAt` 필드 소스 |
| `fetched_at` | TIMESTAMPTZ | Nitro 크론/수집 시각 |

> **프론트 타입 변환**: `published_at` → 프론트에서 `"N시간 전"` 상대 시간으로 변환.  
> `NewsItem.time` 필드는 API 연동 시 제거하고 `publishedAt` (ISO 8601)으로 대체 예정 (TODO_api.md 참조).

**페이지네이션 쿼리 예시**
```sql
SELECT id, title, source, market, url, published_at
FROM news
WHERE (market = $1 OR $1 IS NULL)
  AND (title ILIKE '%' || $2 || '%' OR source ILIKE '%' || $2 || '%' OR $2 IS NULL)
ORDER BY published_at DESC
LIMIT $3 OFFSET $4;
```

---

### 3.7 `keywords`

일별 키워드 랭킹 스냅샷. `GET /api/keywords` 응답 소스.  
네이버 데이터랩 API 또는 구글 트렌드 수집 결과를 날짜별로 저장.

```sql
CREATE TABLE keywords (
  id           BIGSERIAL    PRIMARY KEY,
  snapshot_date DATE        NOT NULL,                       -- 집계 기준일
  rank         SMALLINT     NOT NULL,                       -- 1~N
  keyword      VARCHAR(100) NOT NULL,
  count        INTEGER      NOT NULL DEFAULT 0,             -- 검색량 지수
  trend        VARCHAR(10)  NOT NULL DEFAULT 'same'
               CHECK (trend IN ('up', 'down', 'same')),     -- 전일 대비 방향
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),

  UNIQUE (snapshot_date, rank)                              -- 날짜·순위 중복 방지
);
```

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `snapshot_date` | DATE | 집계 기준일 |
| `rank` | SMALLINT | 순위 (1부터 시작) |
| `count` | INTEGER | 검색량 지수 (절대값 또는 지수화된 값) |
| `trend` | VARCHAR(10) | 전일 대비 증감 방향 |
| UNIQUE | `(snapshot_date, rank)` | 동일 날짜 동일 순위 중복 방지 |

**최신 랭킹 조회 쿼리**
```sql
SELECT rank, keyword, count, trend
FROM keywords
WHERE snapshot_date = (SELECT MAX(snapshot_date) FROM keywords)
ORDER BY rank
LIMIT $1;
```

---

## 4. 인덱스 전략

```sql
-- market_history: 히스토리 범위 조회 (가장 빈번)
CREATE INDEX idx_market_history_market_date
  ON market_history (market_id, trade_date DESC);

-- votes: 사용자별 투표 여부 확인
CREATE INDEX idx_votes_user_market_date
  ON votes (user_id, market_id, vote_date);

-- votes_daily_summary: 마켓별 오늘 집계 조회
CREATE INDEX idx_votes_summary_market_date
  ON votes_daily_summary (market_id, vote_date DESC);

-- news: 마켓 필터 + 발행일 정렬 (대시보드·뉴스 페이지)
CREATE INDEX idx_news_market_published
  ON news (market, published_at DESC);

-- news: 검색어 인덱스 (제목 전문검색)
CREATE INDEX idx_news_title_fts
  ON news USING GIN (to_tsvector('simple', title));

-- keywords: 최신 날짜 조회
CREATE INDEX idx_keywords_date_rank
  ON keywords (snapshot_date DESC, rank);

-- users: 이메일 로그인 조회
CREATE UNIQUE INDEX idx_users_email_active
  ON users (email)
  WHERE deleted_at IS NULL;
```

---

## 5. API ↔ 테이블 매핑

| API 엔드포인트 | 주요 테이블 | 작업 |
|--------------|-----------|------|
| `GET /api/markets` | `markets` | SELECT all |
| `GET /api/markets/:id` | `markets`, `market_indicators` | JOIN |
| `GET /api/markets/:id/history` | `market_history` | SELECT + ORDER BY date DESC |
| `GET /api/markets/comparison` | `market_history` | SELECT multiple markets |
| `GET /api/votes/:marketId` | `votes_daily_summary` | SELECT by market + today |
| `POST /api/votes` 🔒 | `votes`, `votes_daily_summary` | INSERT + UPSERT |
| `GET /api/news` | `news` | SELECT + filter + pagination |
| `GET /api/keywords` | `keywords` | SELECT latest snapshot |
| `POST /api/auth/login` | `users` | SELECT + compare hash |
| `GET /api/auth/me` | `users` | SELECT by id |
| `POST /api/auth/logout` | _(쿠키 무효화, DB 조작 없음)_ | — |

---

## 6. 구현 우선순위

TODO_api.md의 API 우선순위와 동일하게 정렬.

| 우선순위 | 테이블 | 이유 |
|---------|-------|------|
| ⭐⭐⭐ P0 | `markets`, `market_history` | 대시보드 핵심 데이터 |
| ⭐⭐⭐ P0 | `market_indicators` | indices/[market].vue 세부 지표 그리드 |
| ⭐⭐⭐ P0 | `votes`, `votes_daily_summary` | CommunityVoteCard (로그인 필수) |
| ⭐⭐ P1 | `news` | news.vue + 대시보드 NewsList |
| ⭐⭐ P1 | `keywords` | 대시보드 KeywordRanking |
| ⭐ P2 | `users` | 인증 완성 시 필요 (현재 mock 세션) |

---

## 부록: 마켓 초기 데이터 INSERT 예시

```sql
INSERT INTO markets (id, name, name_ko, region, description, current_value, current_classification) VALUES
  ('sp500',  'S&P 500', '미국 주식',        '미국', 'S&P 500 기반 7개 지표의 동일 가중치 평균. NYSE 시황, VIX, 풋/콜 비율 등을 반영합니다.', 72, 'Greed'),
  ('kospi',  'KOSPI',   '한국 주식 (코스피)', '한국', 'VKOSPI, KOSPI 모멘텀, 주가 강도 등 6개 지표를 가중 평균해 산출합니다.', 48, 'Neutral'),
  ('kosdaq', 'KOSDAQ',  '한국 주식 (코스닥)', '한국', 'KOSDAQ 전용 변동성·모멘텀·강도 지표를 바탕으로 코스닥 심리를 수치화합니다.', 35, 'Fear');
```
