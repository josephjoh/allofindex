# DB Schema

Fear & Greed Index 서버의 H2 in-memory DB 스키마입니다. (`ddl-auto: create-drop`)

> 기준일: 2026-04-08  
> `users`, `votes`, `news`, `keywords` 테이블은 FE 퍼블리싱 명세(`TODO_schema.md`) 기준으로 추가.

---

## 데이터 흐름

```
[수집]    indicator_raw              (7개 원천값 / 마켓 / 날짜)
               │
               ▼
[계산]    정규화 + 가중합
               │
     ┌─────────┴──────────┐
     ▼                    ▼
[저장] market_history       indicator_history
      (합산 지수 1행)       (지표별 기여도 7행)
           │                 └─ 계산 당시 정규화값 스냅샷
           │                    (이후 indicator_raw 수정 시에도 과거 결과 추적 가능)
           ▼
[캐시] market_indicators 갱신  ← GET /api/markets/:id 응답용 (현재값 + 메타)
      (name_ko, sort_order, current_value 등)
```

---

## ERD (관계 요약)

```
market (1) ──< indicator_raw      (N)   -- 외부 API 원천 수집값
market (1) ──< market_history     (N)   -- 계산 완료된 일별 합산 지수
market (1) ──< market_indicators  (N)   -- 현재 지표값 캐시 + API 표시 메타
market_history (1) ──< indicator_history (N)  -- 지표별 정규화 점수 이력 (감사·디버깅)

users (1) ──< votes (N)              -- 커뮤니티 투표
market (1) ──< votes (N)
market (1) ──< votes_daily_summary (N)  -- 투표 일별 집계 캐시

news      (독립 — market_code 문자열 분류)
keywords  (독립 — 날짜별 키워드 랭킹 스냅샷)
```

---

## Tables

### `market`

시장 메타정보. 서버 기동 시 `MarketDataInitializer`가 SP500 / KOSPI / KOSDAQ 3건을 삽입한다.

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| `id` | BIGINT | PK, AUTO_INCREMENT | |
| `market_code` | VARCHAR(20) | UNIQUE, NOT NULL | `SP500`, `KOSPI`, `KOSDAQ` |
| `market_name` | VARCHAR(255) | NOT NULL | `S&P 500` 등 표시 이름 |
| `market_type` | VARCHAR(10) | NOT NULL | `INDEX` \| `STOCK` |
| `country` | VARCHAR(5) | NOT NULL | `US` \| `KR` |
| `symbol` | VARCHAR(255) | nullable | Yahoo Finance 심볼 (`^GSPC`, `^KS11`, `^KQ11`) |
| `created_at` | TIMESTAMP | NOT NULL | BaseEntity — JPA Auditing |
| `updated_at` | TIMESTAMP | NOT NULL | BaseEntity — JPA Auditing |

---

### `indicator_raw`

수집기가 저장하는 원천 지표값. 날짜·지표 단위로 중복 수집을 방지한다.

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| `id` | BIGINT | PK, AUTO_INCREMENT | |
| `market_id` | BIGINT | NOT NULL, FK → `market.id` | |
| `indicator_type` | VARCHAR(30) | NOT NULL | 아래 Enum 참조 |
| `trade_date` | DATE | NOT NULL | 거래일 |
| `indicator_value` | DECIMAL(20,6) | NOT NULL | 주요 수집 값 |
| `extra_value` | DECIMAL(20,6) | nullable | 보조 값 (신저가 수, 하락 거래량 등) |
| `source` | VARCHAR(20) | nullable | `CNN`, `YAHOO`, `ECOS`, `FRED` 등 |
| `created_at` | TIMESTAMP | NOT NULL | BaseEntity |
| `updated_at` | TIMESTAMP | NOT NULL | BaseEntity |

**Unique Constraint** `uq_indicator_raw` : `(market_id, indicator_type, trade_date)`

---

### `market_history`

계산 완료된 일별 합산 공포탐욕지수. 시장·날짜 단위로 1건만 유지하며 재계산 시 덮어쓴다.

> `fear_greed_index`에서 이름 변경. 암호화폐 외 S&P 500 / KOSPI / KOSDAQ 등 다중 지수를 포괄하는 이름으로 일반화.

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| `id` | BIGINT | PK, AUTO_INCREMENT | |
| `market_id` | BIGINT | NOT NULL, FK → `market.id` | |
| `trade_date` | DATE | NOT NULL | 거래일 |
| `score` | INT | NOT NULL | 최종 합산 지수 (0 ~ 100) |
| `grade` | VARCHAR(20) | NOT NULL | 아래 Enum 참조 |
| `calculated_at` | TIMESTAMP | NOT NULL | 계산 수행 시각 |
| `created_at` | TIMESTAMP | NOT NULL | BaseEntity |
| `updated_at` | TIMESTAMP | NOT NULL | BaseEntity |

**Unique Constraint** : `(market_id, trade_date)`

---

### `market_indicators`

마켓별 **현재** 지표값 캐시 + API 표시 메타. `GET /api/markets/:id` → `indicators[]` 응답 소스.  
배치 계산 완료 시 최신값으로 갱신. 마켓마다 지표 개수 다름 (sp500: 7개, kospi: 6개, kosdaq: 5~6개).

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| `id` | BIGINT | PK, AUTO_INCREMENT | |
| `market_id` | BIGINT | NOT NULL, FK → `market.id` | |
| `indicator_type` | VARCHAR(30) | NOT NULL | 아래 Enum 참조 |
| `name` | VARCHAR(100) | NOT NULL | `Stock Price Momentum` |
| `name_ko` | VARCHAR(100) | NOT NULL | `주가 모멘텀` |
| `description` | TEXT | nullable | 지표 설명 |
| `current_value` | SMALLINT | NOT NULL, DEFAULT 0 | 0~100 정규화 점수 (현재값) |
| `weight` | DECIMAL(5,4) | NOT NULL, DEFAULT 0.1429 | 지표 가중치 |
| `sort_order` | SMALLINT | NOT NULL, DEFAULT 0 | 프론트 표시 순서 |
| `updated_at` | TIMESTAMP | NOT NULL | |

**Unique Constraint** : `(market_id, indicator_type)`

**초기 데이터 (sp500)**

| sort_order | indicator_type | name | name_ko | weight |
|-----------|---------------|------|---------|--------|
| 1 | `MARKET_MOMENTUM` | Stock Price Momentum | 주가 모멘텀 | 0.1429 |
| 2 | `STOCK_PRICE_STRENGTH` | Stock Price Strength | 주가 강도 | 0.1429 |
| 3 | `STOCK_PRICE_BREADTH` | Stock Price Breadth | 주가 폭 | 0.1429 |
| 4 | `PUT_CALL_RATIO` | Put & Call Options | 풋/콜 비율 | 0.1429 |
| 5 | `JUNK_BOND_DEMAND` | Junk Bond Demand | 정크본드 수요 | 0.1429 |
| 6 | `MARKET_VOLATILITY` | Market Volatility | 시장 변동성 | 0.1429 |
| 7 | `SAFE_HAVEN_DEMAND` | Safe Haven Demand | 안전자산 수요 | 0.1429 |

**초기 데이터 (kospi)**

| sort_order | indicator_type | name | name_ko | weight |
|-----------|---------------|------|---------|--------|
| 1 | `MARKET_VOLATILITY` | VKOSPI | 한국 변동성 지수 | 0.30 |
| 2 | `MARKET_MOMENTUM` | KOSPI Momentum | KOSPI 모멘텀 | 0.25 |
| 3 | `STOCK_PRICE_STRENGTH` | Stock Price Strength | 주가 강도 | 0.15 |
| 4 | `STOCK_PRICE_BREADTH` | KOSPI Trend | 주가 추세 | 0.15 |
| 5 | `PUT_CALL_RATIO` | KOSDAQ Change Rate | KOSDAQ 등락률 | 0.10 |
| 6 | `SAFE_HAVEN_DEMAND` | Safe Haven Demand | 안전자산 수요 | 0.05 |

---

### `indicator_history`

`market_history` 1건에 딸린 지표별 정규화 점수 이력. 역추적·디버깅 용도.

> 기존 `indicator_score` → `market_indicators` → `indicator_history` 로 이름 변경.  
> `market_indicators`(현재값 캐시)와 역할 분리: 이 테이블은 **과거 계산 당시의 스냅샷** 보존.

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| `id` | BIGINT | PK, AUTO_INCREMENT | |
| `market_history_id` | BIGINT | NOT NULL, FK → `market_history.id` | CascadeType.ALL + orphanRemoval |
| `indicator_type` | VARCHAR(30) | NOT NULL | 아래 Enum 참조 |
| `raw_value` | DECIMAL(20,6) | nullable | 정규화 전 원천값 |
| `normalized_score` | DECIMAL(5,2) | nullable | 0 ~ 100 정규화된 점수 |
| `weight` | DECIMAL(5,4) | nullable | 기본 1/7 ≈ 0.1429 |
| `created_at` | TIMESTAMP | NOT NULL | BaseEntity |
| `updated_at` | TIMESTAMP | NOT NULL | BaseEntity |

---

### `users`

로그인 사용자 정보. 투표 중복 방지에 사용.

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| `id` | VARCHAR(36) | PK | UUID (`gen_random_uuid()`) |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | 로그인 식별자 |
| `password_hash` | VARCHAR(255) | NOT NULL | bcrypt 해시 (원문 저장 금지) |
| `roles` | VARCHAR(255) | NOT NULL, DEFAULT `'user'` | 콤마 구분 문자열 또는 별도 role 테이블 (`user`, `admin`, `viewer`) |
| `created_at` | TIMESTAMP | NOT NULL | BaseEntity |
| `updated_at` | TIMESTAMP | NOT NULL | BaseEntity |
| `deleted_at` | TIMESTAMP | nullable | NULL = 활성, NOT NULL = 탈퇴 (소프트 딜리트) |

---

### `votes`

커뮤니티 투표 원본 기록. **로그인 필수**, 1인 1일 1마켓 1표.

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| `id` | BIGINT | PK, AUTO_INCREMENT | |
| `user_id` | VARCHAR(36) | NOT NULL, FK → `users.id` | |
| `market_id` | BIGINT | NOT NULL, FK → `market.id` | |
| `choice` | VARCHAR(10) | NOT NULL, CHECK IN (`bearish`, `bullish`) | |
| `vote_date` | DATE | NOT NULL, DEFAULT CURRENT_DATE | KST 기준 날짜 |
| `created_at` | TIMESTAMP | NOT NULL | BaseEntity |

**Unique Constraint** : `(user_id, market_id, vote_date)` — 1인 1일 1마켓 중복 방지

---

### `votes_daily_summary`

투표 일별 집계 캐시. `GET /api/votes/:marketId` 응답 소스.  
`votes` INSERT 시 UPSERT로 동시 갱신.

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| `market_id` | BIGINT | PK (복합), FK → `market.id` | |
| `vote_date` | DATE | PK (복합) | |
| `bearish` | INT | NOT NULL, DEFAULT 0 | |
| `bullish` | INT | NOT NULL, DEFAULT 0 | |
| `total` | INT | NOT NULL, DEFAULT 0 | `bearish + bullish` (갱신 시 동시 계산) |
| `updated_at` | TIMESTAMP | NOT NULL | |

---

### `news`

뉴스 기사. RSS 파싱 수집 결과 저장. `GET /api/news` 응답 소스.

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| `id` | BIGINT | PK, AUTO_INCREMENT | |
| `external_id` | VARCHAR(255) | UNIQUE, nullable | RSS `<guid>` 또는 URL 해시 (중복 수집 방지) |
| `title` | VARCHAR(500) | NOT NULL | |
| `source` | VARCHAR(100) | NOT NULL | `Reuters`, `연합뉴스` 등 |
| `market_code` | VARCHAR(20) | NOT NULL, DEFAULT `global` | `sp500` \| `kospi` \| `kosdaq` \| `global` |
| `url` | TEXT | NOT NULL | |
| `published_at` | TIMESTAMP | NOT NULL | 원문 발행 시각, API 응답 `publishedAt` 소스 |
| `fetched_at` | TIMESTAMP | NOT NULL | 수집 시각 |

> FK 없음 — `market_code`는 `market.market_code` 참조용 문자열이나 강제 제약 미적용 (뉴스 수집 파이프라인 유연성 확보).

---

### `keywords`

일별 키워드 랭킹 스냅샷. `GET /api/keywords` 응답 소스.

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| `id` | BIGINT | PK, AUTO_INCREMENT | |
| `snapshot_date` | DATE | NOT NULL | 집계 기준일 |
| `rank` | SMALLINT | NOT NULL | 순위 (1부터 시작) |
| `keyword` | VARCHAR(100) | NOT NULL | |
| `count` | INT | NOT NULL, DEFAULT 0 | 검색량 지수 |
| `trend` | VARCHAR(10) | NOT NULL, DEFAULT `same` | `up` \| `down` \| `same` |
| `source` | VARCHAR(20) | NOT NULL, DEFAULT `naver` | `naver` (국내) \| `google` (해외) |
| `updated_at` | TIMESTAMP | NOT NULL | |

**Unique Constraint** : `(snapshot_date, source, rank)` — 날짜·소스·순위 중복 방지

---

## Enum 값

### `IndicatorType` (VARCHAR 30)

| 값 | 표시명 | 설명 |
|----|--------|------|
| `MARKET_VOLATILITY` | 시장 변동성 | US: VIX / KR: VKOSPI 또는 20일 실현 변동성 |
| `MARKET_MOMENTUM` | 시장 모멘텀 | US: S&P500 vs 125일 MA / KR: KOSPI·KOSDAQ 종가 위치 |
| `STOCK_PRICE_STRENGTH` | 주가 강도 | US: 52주 신고가/신저가 비율 / KR: 252일 상대 위치 |
| `STOCK_PRICE_BREADTH` | 주가 확산도 | US: McClellan 지수 / KR: 거래량 MA 이탈도 |
| `PUT_CALL_RATIO` | 풋콜 비율 | US: CBOE P/C 비율 5일 MA / KR: 외국인 순매수 역수 |
| `JUNK_BOND_DEMAND` | 정크본드 수요 | US: OAS 스프레드 / KR: 회사채-국고채 스프레드 |
| `SAFE_HAVEN_DEMAND` | 안전채권 수요 | US·KR: 주식 vs 국채 20일 수익률 차 |

### `FearGreedGrade` (VARCHAR 20)

| 값 | 점수 범위 |
|----|----------|
| `EXTREME_FEAR` | 0 ~ 24 |
| `FEAR` | 25 ~ 44 |
| `NEUTRAL` | 45 ~ 54 |
| `GREED` | 55 ~ 74 |
| `EXTREME_GREED` | 75 ~ 100 |

### `MarketType` (VARCHAR 10)

| 값 | 설명 |
|----|------|
| `INDEX` | 시장 지수 (SP500, KOSPI, KOSDAQ) |
| `STOCK` | 개별 종목 (향후 확장용) |

### `Country` (VARCHAR 5)

| 값 | 설명 |
|----|------|
| `US` | 미국 시장 |
| `KR` | 한국 시장 |

---

## DDL (참고용)

```sql
CREATE TABLE market (
    id           BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    market_code  VARCHAR(20)  NOT NULL UNIQUE,
    market_name  VARCHAR(255) NOT NULL,
    market_type  VARCHAR(10)  NOT NULL,
    country      VARCHAR(5)   NOT NULL,
    symbol       VARCHAR(255),
    created_at   TIMESTAMP    NOT NULL,
    updated_at   TIMESTAMP    NOT NULL
);

CREATE TABLE indicator_raw (
    id              BIGINT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
    market_id       BIGINT          NOT NULL,
    indicator_type  VARCHAR(30)     NOT NULL,
    trade_date      DATE            NOT NULL,
    indicator_value DECIMAL(20, 6)  NOT NULL,
    extra_value     DECIMAL(20, 6),
    source          VARCHAR(20),
    created_at      TIMESTAMP       NOT NULL,
    updated_at      TIMESTAMP       NOT NULL,
    CONSTRAINT fk_ir_market FOREIGN KEY (market_id) REFERENCES market (id),
    CONSTRAINT uq_indicator_raw UNIQUE (market_id, indicator_type, trade_date)
);

CREATE TABLE market_history (
    id            BIGINT      NOT NULL AUTO_INCREMENT PRIMARY KEY,
    market_id     BIGINT      NOT NULL,
    trade_date    DATE        NOT NULL,
    score         INT         NOT NULL,
    grade         VARCHAR(20) NOT NULL,
    calculated_at TIMESTAMP   NOT NULL,
    created_at    TIMESTAMP   NOT NULL,
    updated_at    TIMESTAMP   NOT NULL,
    CONSTRAINT fk_mh_market FOREIGN KEY (market_id) REFERENCES market (id),
    CONSTRAINT uq_market_history UNIQUE (market_id, trade_date)
);

CREATE TABLE market_indicators (
    id              BIGINT         NOT NULL AUTO_INCREMENT PRIMARY KEY,
    market_id       BIGINT         NOT NULL,
    indicator_type  VARCHAR(30)    NOT NULL,
    name            VARCHAR(100)   NOT NULL,
    name_ko         VARCHAR(100)   NOT NULL,
    description     TEXT,
    current_value   SMALLINT       NOT NULL DEFAULT 0,
    weight          DECIMAL(5, 4)  NOT NULL DEFAULT 0.1429,
    sort_order      SMALLINT       NOT NULL DEFAULT 0,
    updated_at      TIMESTAMP      NOT NULL,
    CONSTRAINT fk_mi_market  FOREIGN KEY (market_id) REFERENCES market (id),
    CONSTRAINT uq_mi         UNIQUE (market_id, indicator_type)
);

CREATE TABLE indicator_history (
    id                  BIGINT         NOT NULL AUTO_INCREMENT PRIMARY KEY,
    market_history_id   BIGINT         NOT NULL,
    indicator_type      VARCHAR(30)    NOT NULL,
    raw_value           DECIMAL(20, 6),
    normalized_score    DECIMAL(5, 2),
    weight              DECIMAL(5, 4),
    created_at          TIMESTAMP      NOT NULL,
    updated_at          TIMESTAMP      NOT NULL,
    CONSTRAINT fk_ih_market_history FOREIGN KEY (market_history_id) REFERENCES market_history (id)
);

CREATE TABLE users (
    id            VARCHAR(36)  NOT NULL PRIMARY KEY,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    roles         VARCHAR(255) NOT NULL DEFAULT 'user',
    created_at    TIMESTAMP    NOT NULL,
    updated_at    TIMESTAMP    NOT NULL,
    deleted_at    TIMESTAMP
);

CREATE TABLE votes (
    id          BIGINT      NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id     VARCHAR(36) NOT NULL,
    market_id   BIGINT      NOT NULL,
    choice      VARCHAR(10) NOT NULL,
    vote_date   DATE        NOT NULL DEFAULT (CURRENT_DATE),
    created_at  TIMESTAMP   NOT NULL,
    CONSTRAINT fk_v_user   FOREIGN KEY (user_id)   REFERENCES users (id),
    CONSTRAINT fk_v_market FOREIGN KEY (market_id) REFERENCES market (id),
    CONSTRAINT chk_choice  CHECK (choice IN ('bearish', 'bullish')),
    CONSTRAINT uq_vote     UNIQUE (user_id, market_id, vote_date)
);

CREATE TABLE votes_daily_summary (
    market_id   BIGINT    NOT NULL,
    vote_date   DATE      NOT NULL,
    bearish     INT       NOT NULL DEFAULT 0,
    bullish     INT       NOT NULL DEFAULT 0,
    total       INT       NOT NULL DEFAULT 0,
    updated_at  TIMESTAMP NOT NULL,
    CONSTRAINT pk_vds     PRIMARY KEY (market_id, vote_date),
    CONSTRAINT fk_vds_market FOREIGN KEY (market_id) REFERENCES market (id)
);

CREATE TABLE news (
    id           BIGINT        NOT NULL AUTO_INCREMENT PRIMARY KEY,
    external_id  VARCHAR(255)  UNIQUE,
    title        VARCHAR(500)  NOT NULL,
    source       VARCHAR(100)  NOT NULL,
    market_code  VARCHAR(20)   NOT NULL DEFAULT 'global',
    url          TEXT          NOT NULL,
    published_at TIMESTAMP     NOT NULL,
    fetched_at   TIMESTAMP     NOT NULL
);

CREATE TABLE keywords (
    id            BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    snapshot_date DATE         NOT NULL,
    rank          SMALLINT     NOT NULL,
    keyword       VARCHAR(100) NOT NULL,
    count         INT          NOT NULL DEFAULT 0,
    trend         VARCHAR(10)  NOT NULL DEFAULT 'same',
    source        VARCHAR(20)  NOT NULL DEFAULT 'naver',
    updated_at    TIMESTAMP    NOT NULL,
    CONSTRAINT chk_trend    CHECK (trend IN ('up', 'down', 'same')),
    CONSTRAINT uq_keywords  UNIQUE (snapshot_date, source, rank)
);
```
