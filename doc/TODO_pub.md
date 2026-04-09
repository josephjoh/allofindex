# fear-greed-index-fe2 — 퍼블리싱 기획

## 목적 및 범위

- **목적**: Fear & Greed Index를 시각적으로 보여주는 대시보드 페이지 완성 및 퍼블리싱
- **레퍼런스**: [CNN Fear & Greed](https://edition.cnn.com/markets/fear-and-greed) / [IndexerGO](https://www.indexergo.com/series/?frq=D&idxDetail=24501)
- **범위**: 도메인 컴포넌트 구현 → 대시보드 페이지 조립 → 품질 검증 → 배포 준비

---

## 사전 조사 — 레퍼런스 서비스 분석 (2026-04-02)

> 이 섹션은 구현 방향 결정을 위한 벤치마크 조사 결과입니다.
> 조사 대상: CNN, Alternative.me, feargreed.co.kr, fearandgreed.kr, INDEXerGO, feargreedmeter.com

---

### 1. CNN Fear & Greed Index (미국 주식)

**URL**: https://edition.cnn.com/markets/fear-and-greed

**지수 구성 — 7개 지표 (동일 가중치)**

| # | 지표명 | 계산 방법 | 공포 신호 | 탐욕 신호 |
|---|--------|-----------|-----------|-----------|
| 1 | **Stock Price Momentum** | S&P 500 vs 125일 이동평균 | 지수 < MA | 지수 > MA |
| 2 | **Stock Price Strength** | NYSE 52주 신고가 / 신저가 수 비율 | 신저가 多 | 신고가 多 |
| 3 | **Stock Price Breadth** | NYSE 상승 거래량 vs 하락 거래량 (McClellan 지표) | 음수(하락 우세) | 양수(상승 우세) |
| 4 | **Put and Call Options** | CBOE 풋/콜 비율 (5일 평균) | 비율 > 1 (풋 多) | 비율 < 1 (콜 多) |
| 5 | **Junk Bond Demand** | 하이일드채 스프레드 vs 투자등급채 스프레드 | 스프레드 확대 | 스프레드 축소 |
| 6 | **Market Volatility** | VIX vs 50일 이동평균 | VIX 급등 | VIX 안정 |
| 7 | **Safe Haven Demand** | 주식 vs 미국채 20일 수익률 차이 | 채권 선호 | 주식 선호 |

**정규화 방법**: 각 지표를 해당 평균 대비 편차로 환산 후 0~100 스케일 적용. 7개 동일 가중치 평균.

**점수 구간**
- 0~24: Extreme Fear / 25~44: Fear / 45~54: Neutral / 55~74: Greed / 75~100: Extreme Greed

**UI 특징**
- 반원형 게이지 (메인)
- 현재값 + 어제/1주일 전/1달 전/1년 전 비교 스냅샷
- 7개 세부 지표 각각 개별 게이지 + 값 표시
- 업데이트 주기: 장중 5분마다

---

### 2. Alternative.me Crypto Fear & Greed Index (암호화폐)

**URL**: https://alternative.me/crypto/fear-and-greed-index/
**API**: `https://api.alternative.me/fng/` (무료, 상업 이용 가능 — 출처 표기 필요)

**지수 구성 — 6개 지표**

| # | 지표명 | 가중치 | 설명 |
|---|--------|-------|------|
| 1 | Volatility (변동성) | 25% | 현재 변동성 vs 30/90일 평균 비교 |
| 2 | Market Momentum/Volume | 25% | 거래량 + 모멘텀 (과도 강세 측정) |
| 3 | Social Media | 15% | 트위터 해시태그 게시물 + 상호작용률 |
| 4 | Surveys | 15% | 주간 설문 (현재 일시 중단) |
| 5 | Dominance | 10% | 비트코인 시장점유율 변화 |
| 6 | Trends | 10% | 구글 트렌드 검색량 |

**API 파라미터**
```
GET https://api.alternative.me/fng/?limit=30&format=json&date_format=kr
```
- `limit`: 반환 결과 수 (1=현재값만, 0=전체)
- `format`: json | csv
- `date_format`: us | cn | kr | world

**현재 프로젝트와의 관계**: `server/api/fear-greed/current.get.ts`가 이 API를 이미 사용 중

---

### 3. feargreed.co.kr — 한국 KOSPI/미국 비교 서비스

**URL**: https://feargreed.co.kr/

**지수 구성 — KOSPI 맞춤 7개 지표 (가중치 비균등)**

| # | 지표명 | 가중치 | 데이터 소스 |
|---|--------|-------|------------|
| 1 | VKOSPI (한국 변동성 지수) | **30%** | 네이버 금융 |
| 2 | KOSPI 등락률 (모멘텀) | 25% | 한국투자증권 Open API |
| 3 | 주가 강도 (KOSPI+KOSDAQ 평균) | 15% | 한국투자증권 Open API |
| 4 | KOSPI 추세 (방향성) | 15% | 한국투자증권 Open API |
| 5 | KOSDAQ 등락률 | 10% | 한국투자증권 Open API |
| 6 | 안전자산 수요 (역방향) | 5% | 자체 계산 |

**계산 공식**
```
최종점수 = VKOSPI×0.30 + 모멘텀×0.25 + 주가강도×0.15 + 추세×0.15 + KOSDAQ×0.10 + 안전자산×0.05
정규화   = clip((x - min) / (max - min) × 100, 0, 100)  # 기준기간: 125거래일
```

**UI 특징**
- 미국(S&P 500)과 한국(KOSPI) 게이지를 나란히 표시
- **디커플링 지표**: 두 지수의 격차(점수 차이)를 강조 표시 → 투자 기회/리스크 신호
- 30일 히스토리 선 그래프 (미국·한국 동시 표시)
- 호버 툴팁: 특정 날짜의 점수 + 시황 코멘트
- 구간별 투자 전략 가이드 (예: "분할 매수 검토")
- 일별 시황 코멘트 + 네이버 블로그 링크
- 업데이트: 장중 1시간마다

---

### 4. fearandgreed.kr — AI 기반 KOSPI/KOSDAQ 심리 분석

**URL**: https://fearandgreed.kr/

**특징: CNN 방식 대신 독자적 AI 지표 체계**

| 지표 그룹 | 세부 지표 | 특이사항 |
|-----------|-----------|---------|
| 실시간 시황 | 긍정도(%) | 전체 시장 심리 요약 |
| 카오스 지수 | 금리공포 / 환율공포 / 전쟁공포 | 거시 리스크 요인 분리 |
| 증시 분위기 | 트렌드 / 노이즈 / 상관계수 | 시장 방향성 + 노이즈 구분 |

**UI 특징**
- KOSPI / KOSDAQ 토글 전환
- 프로그레스 바 형식 시각화 (게이지 대신)
- 추세 방향 화살표 + 이모지
- 60초 자동 새로고침
- Live Indicator (20분 이내 업데이트 시 표시)
- 카카오톡/네이버/트위터 공유

---

### 5. INDEXerGO — 거시경제 종합 플랫폼

**URL**: https://www.indexergo.com/

**포지셔닝**: "거시경제를 보는 눈" — 단순 공포탐욕지수가 아닌 수백 개 거시지표 DB

**제공 지표 카테고리**
- 국가지표 (한국 경제·금융 핵심 지표)
- 미국지표 (미국 경제·금융 핵심 지표)
- 부동산 (전국 시장 핵심 지표)
- 공포탐욕지수 (`idxDetail=24501`) — CNN 기준 0~100점

**핵심 차별화 기능**
| 기능 | 설명 |
|------|------|
| **비교차트** | 여러 지표를 동일Y축/이중Y축/다중Y축으로 오버레이 비교 |
| **지수화** | 특정 시점을 100으로 설정해 상대 상승률 비교 |
| **고점 대비** | 기간 내 고점 vs 현재 증감률 즉시 확인 |
| **MY 등록** | 자주 보는 지표 조합 저장 및 재사용 |
| **AI 분석** | ChatGPT 연동 자동 시사점 생성 |
| **수식 편집기** | 사용자 정의 지표 생성 (기존 지표 조합) |

**시리즈 페이지 구조**
- 개별 지표마다 고유 ID (`idxDetail`)
- 빈도 선택: 일간(`frq=D`), 월간 등
- 확인 일자 + 현재값 헤더 표시

---

### 6. feargreedmeter.com — 주식+암호화폐 통합

**URL**: https://feargreedmeter.com/

**UI 구성 섹션**

| 섹션 | 내용 |
|------|------|
| 메인 지수 게이지 | 현재값 + 어제/1주/1달 비교 스냅샷 |
| 주요 지수 실시간 | Dow Jones, S&P 500, NASDAQ 가격 + 등락률 |
| Crypto 지수 | BTC, ETH, DOGE 가격 |
| **Sentiment Poll** | 사용자 투표 (Bearish/Bullish) |
| **Trending Stocks** | 커뮤니티 언급 빈도 상위 종목 |
| **경제 캘린더** | 고용·GDP·CPI·Fed 회의 일정 |
| **Sector Performance** | 섹터별 등락률 (기술/헬스케어/금융 등) |
| **Congressional Trading** | 의원 내부자 거래 추적 |
| Stock Discussion | 커뮤니티 코멘트 |

**부가 기능**: iOS/Android 앱, 클래식 레이아웃 옵션

---

### 비교 요약표

| 서비스 | 마켓 | 지표 수 | 업데이트 | 특징 |
|--------|------|---------|---------|------|
| CNN F&G | 미국 주식 | 7개 균등 | 5분 | 원조, 세부 지표 개별 게이지 |
| Alternative.me | 암호화폐 | 6개 비균등 | 매일 | 무료 API 제공, 이미 연동 중 |
| feargreed.co.kr | 미국+한국 | 6개 비균등 | 1시간 | 디커플링 비교, 시황 코멘트 |
| fearandgreed.kr | 한국(KOSPI/KOSDAQ) | AI 독자 체계 | 60초 | 금리·환율·전쟁 리스크 분리 |
| INDEXerGO | 거시경제 전반 | 수백 개 | 일간 | 비교차트, AI 분석, MY 저장 |
| feargreedmeter.com | 미국+암호화폐 | 7개 균등 | 5분 | 경제캘린더, 의원거래, 커뮤니티 |

---

### 우리 대시보드 도입 방향 (결정 필요 항목)

> 아래는 조사 결과를 토대로 도출한 옵션입니다. 각 항목에서 방향을 결정해야 합니다.

#### A. 마켓 커버리지 결정

| 옵션 | 구현 난이도 | 차별화 |
|------|-----------|-------|
| A1. 미국 단일 (S&P 500) | 낮음 | 없음 (CNN과 동일) |
| **A2. 미국 + 한국 비교** | 중간 | 한국 투자자 대상 차별화 ✅ |
| A3. 미국 + 한국 + 암호화폐 | 높음 | 풀 커버리지 |

**권장**: A2 — `preview.vue`에서 이미 S&P 500 / KOSPI / KOSDAQ 3개 마켓을 준비해 두었으므로 자연스러운 확장

#### B. 한국 지수 계산 방식 결정

| 옵션 | 설명 |
|------|------|
| B1. feargreed.co.kr 방식 채택 | VKOSPI 30% + 모멘텀 25% + … (6개 지표) |
| B2. CNN 방식 그대로 KOSPI에 적용 | 7개 동일 가중치, 데이터 출처만 한국 |
| B3. 서버에서 계산 안 하고 외부 API 사용 | feargreed.co.kr 또는 다른 서비스 스크래핑 (법적 검토 필요) |

**권장**: B1 또는 B2 — 서버 사이드에서 직접 계산하는 것이 가장 안전하고 확장성 있음

#### C. 세부 지표 표시 방식

| 옵션 | 레퍼런스 |
|------|---------|
| C1. 메인 게이지만 표시 | Alternative.me |
| C2. 메인 게이지 + 어제/1주/1달 스냅샷 | CNN, feargreedmeter.com |
| **C3. 메인 게이지 + 세부 지표 개별 표시** | CNN (권장) ✅ |
| C4. 디커플링 격차 강조 | feargreed.co.kr |

#### D. 추가 콘텐츠 섹션 우선순위

| 섹션 | 데이터 출처 가능성 | 우선순위 |
|------|------------------|---------|
| 30일 히스토리 차트 | alternative.me API | ⭐⭐⭐ 필수 |
| 미국/한국 비교 게이지 | 자체 계산 | ⭐⭐⭐ 필수 |
| 뉴스 피드 | RSS (연합뉴스/Reuters/Bloomberg) | ⭐⭐ 선택 |
| 키워드 랭킹 | 네이버 데이터랩 API / 구글 트렌드 | ⭐⭐ 선택 |
| 경제 캘린더 | 자체 입력 또는 외부 API | ⭐ 나중에 |
| 커뮤니티/투표 | 자체 구현 | ⭐ 나중에 |

#### E. 데이터 API 전략

→ 상세 내용은 **[TODO_api.md](./TODO_api.md)** 참조

---

## 퍼블리싱 Phase 개요

| Phase | 주제 | 주요 산출물 | 상태 |
|-------|------|------------|------|
| **Phase 0** | UI 프로토타입 | `pages/preview.vue` (mock 데이터 기반 전체 레이아웃 검증) | ✅ 완료 |
| **Phase 1** | 도메인 컴포넌트 구현 | `GaugeChart`, `IndexCard`, `TrendChart`, `HistoryTable`, `MarketSummaryCard`, `NewsList`, `KeywordRanking`, `CommunityVoteCard`, `MarketComparisonChart`, `ZoneDistributionChart` | ✅ 완료 |
| **Phase 2** | 대시보드 + 인덱스 + 뉴스 페이지 구성 | `pages/dashboard.vue`, `pages/indices/index.vue`, `pages/indices/[market].vue`, `pages/news.vue` | 🔶 mock 데이터 기반 구현됨 (API 미연동) |
| **Phase 3** | 품질 검증 및 배포 준비 | 반응형·다크모드 확인, lint/build 통과 | 🔶 코드 품질·배포 준비 완료, UI 런타임 확인 필요 |

---

## Phase 0 — UI 프로토타입 ✅ 완료

> `app/pages/preview.vue`를 mock 데이터로 전체 레이아웃을 검증한 단계.
> 실제 API 연동 없이 컴포넌트 조합 및 UX 흐름을 확인.

### preview.vue 구조 (참조)

```
/preview
├── ① MarketSummaryCard × 3  (S&P 500 / KOSPI / KOSDAQ, 스파크라인 포함)
├── ② 선택된 마켓 상세
│   ├── FearGreedGaugeChart   (반원형 게이지)
│   ├── FearGreedIndexCard    (현재값 + 분류 배지 + 업데이트 시간)
│   ├── FearGreedTrendChart   (30일 선 그래프)
│   └── FearGreedHistoryTable (최근 7행)
└── ③ NewsList + KeywordRanking (xl: 2/3 + 1/3 그리드)
```

### Mock 데이터 현황

| 항목 | 내용 |
|------|------|
| 마켓 | S&P 500 (72, Greed), KOSPI (48, Neutral), KOSDAQ (35, Fear) |
| 기준 타임스탬프 | `BASE = 1775001600` (2026-04-01) |
| 히스토리 | 마켓별 30일치 하드코딩 배열 |
| 뉴스 | 8건 mock (Bloomberg, 한국경제, Reuters 등) |
| 키워드 | 10위 (금리, 연준, 반도체 … 채권) |

### 선택된 마켓 상태

- `selectedId: Ref<string>` — 기본값 `'sp500'`
- `selectedMarket: ComputedRef<Market>` — `selectedId` 기준 파생

---

## Phase 1 — 도메인 컴포넌트 구현 ✅ 완료

> 10개 컴포넌트 모두 구현 완료. 각 컴포넌트는 props만으로 동작하며 데이터 페칭 로직을 포함하지 않는다.

### 컴포넌트 디렉토리 구조 (실제)

```
app/components/
├── fear-greed/
│   ├── FearGreedGaugeChart.vue      ✅
│   ├── FearGreedIndexCard.vue       ✅
│   ├── FearGreedTrendChart.vue      ✅
│   └── FearGreedHistoryTable.vue    ✅
├── market/
│   ├── MarketSummaryCard.vue        ✅
│   ├── MarketComparisonChart.vue    ✅
│   └── ZoneDistributionChart.vue    ✅  (fear-greed/ 계획에서 market/으로 배치)
├── community/
│   └── CommunityVoteCard.vue        ✅  (market/ 계획에서 community/으로 분리)
└── news/
    ├── NewsList.vue                 ✅
    └── KeywordRanking.vue           ✅
```

### 체크리스트

**FearGreedGaugeChart.vue**
- [x] 반원형 게이지 SVG 구현 (0–100 값 → 각도 변환)
- [x] 구간별 색상 적용: 빨강(극도공포) → 주황(공포) → 노랑(중립) → 연두(탐욕) → 초록(극도탐욕)
- [x] 중앙에 현재 수치 + 분류 텍스트 표시
- [x] props: `value: number` (0–100)

**FearGreedIndexCard.vue**
- [x] 현재 지수값, 분류 배지, 마지막 업데이트 시간 표시
- [x] 로딩 상태 처리 (BaseSpinner)
- [x] props: `reading: FearGreedReading | null`, `loading: boolean`

**FearGreedTrendChart.vue**
- [x] 30일 선 그래프 (x축: 날짜, y축: 0–100)
- [x] 그라디언트 영역 채우기 적용
- [x] 로딩 상태 처리
- [x] props: `history: FearGreedReading[]`, `loading?: boolean`
- [x] SVG 기반 자체 구현 (외부 라이브러리 없음)

**FearGreedHistoryTable.vue**
- [x] 날짜 / 지수값 / 분류 컬럼 테이블
- [x] `limit` prop으로 표시 행 수 제한 (기본 10)
- [x] 분류별 색상 배지 적용
- [x] props: `history: FearGreedReading[]`, `limit?: number`

**MarketSummaryCard.vue**
- [x] 마켓명, 현재값, 분류, 스파크라인(10개 포인트 미니 SVG 차트) 표시
- [x] 활성 마켓 하이라이트 (`active` prop → border-primary-500)
- [x] 클릭 시 `@select` 이벤트 emit
- [x] `/indices/:id` 상세보기 링크 내장
- [x] props: `id`, `name`, `value`, `classification`, `sparkline`, `active?`
- [x] emits: `select(id: string)`

**NewsList.vue**
- [x] 뉴스 제목, 출처, 경과 시간 목록 렌더링
- [x] 마켓 태그 배지 표시 (sp500 / kospi / kosdaq / global)
- [x] 제목 클릭 시 `url` 링크 이동 (새 탭)
- [x] 마켓 필터 탭 내장 (전체 / S&P500 / KOSPI / KOSDAQ)
- [x] 전체보기 → `/news` 링크
- [x] props: `items: NewsItem[]`
- [x] `NewsItem` 타입 `app/types/news.ts`에 추가 및 배럴 export

**KeywordRanking.vue**
- [x] 순위 / 키워드 / 검색량 / 트렌드(▲▼–) 표시
- [x] `limit` prop으로 표시 행 수 제한
- [x] props: `keywords: KeywordItem[]`, `limit?: number`
- [x] `KeywordItem` 타입 `app/types/news.ts`에 추가 및 배럴 export

**CommunityVoteCard.vue** (`community/` 폴더)
- [x] Bearish / Bullish 투표 버튼 UI
- [x] 투표 집계 퍼센트 + 진행 바 표시
- [x] localStorage 기반 1일 투표 제한 (중복 방지)
- [x] 비로그인: 투표 전/후 분기 표시
- [x] 로그인: 커뮤니티 지수(bullishPct 기반) + 분류 배지 표시
- [x] props: `marketId: string`
- [x] mock 데이터 내장 (API 연동 전까지)

**MarketComparisonChart.vue** (`market/` 폴더)
- [x] 3개 마켓 히스토리 멀티 라인 SVG 차트
- [x] 활성 마켓 라인 강조 (stroke-width 2.5 / 비활성 opacity 0.3)
- [x] 마켓별 고유 색상 (부모에서 주입)
- [x] 활성 마켓 마지막 포인트 dot 표시
- [x] props: `markets: MarketLine[]`, `activeId?: string`

**ZoneDistributionChart.vue** (`market/` 폴더)
- [x] 히스토리에서 5구간별 빈도 집계
- [x] 스택 바 (상단) + 구간별 개별 진행 바 (하단)
- [x] 구간별 색상 (FearGreedGaugeChart 동일 팔레트)
- [x] 가장 많이 체류한 구간 요약 표시
- [x] props: `history: FearGreedReading[]`

### 완료 기준

- [x] 10개 컴포넌트 모두 `pages/dashboard.vue` + `pages/indices/[market].vue`에서 mock 데이터로 정상 렌더링
- [x] `app/types/news.ts`에 `NewsItem`, `KeywordItem` 공통 타입 추가
- [x] `npm run type-check` 오류 0개 확인

---

## Phase 2 — 대시보드 + 인덱스 + 뉴스 페이지 구성

> Phase 1 컴포넌트를 조합해 각 페이지를 완성하고 실제 API와 연동한다.
> 현재 4개 페이지 모두 mock 데이터 기반으로 구현 완료됨 — API 연동만 남은 상태.

---

### `pages/dashboard.vue` — 🔶 mock 구현됨, API 미연동

**현재 구현된 레이아웃**
```
① MarketSummaryCard × 3  (sm:3열, 마켓 선택 가능)
② FearGreedGaugeChart + CommunityVoteCard  (md:2열)
   MarketComparisonChart  (full width, 3개 마켓 히스토리 비교)
③ NewsList (xl:2/3) + KeywordRanking (xl:1/3)
```

> `FearGreedIndexCard`, `FearGreedTrendChart`, `FearGreedHistoryTable`은 대시보드에서 제외됨.
> 세부 분석은 `/indices/:id` 상세 페이지에서 담당.

**체크리스트**
- [x] `definePageMeta({ layout: 'dashboard' })` — 비로그인 접근 허용 (auth 미들웨어 제거)
- [ ] `GET /api/markets` 연동 → MarketSummaryCard mock 데이터 교체
- [ ] `GET /api/markets/comparison` 연동 → MarketComparisonChart mock 데이터 교체
- [ ] `GET /api/votes/:marketId` + `POST /api/votes` 연동 → CommunityVoteCard mock 데이터 교체
- [ ] `GET /api/news` 연동 → NewsList mock 데이터 교체
- [ ] `GET /api/keywords` 연동 → KeywordRanking mock 데이터 교체
- [ ] 에러 상태 배너 처리 (API 호출 실패 시)
- [ ] 새로고침 버튼 연결

---

### `pages/indices/index.vue` — 🔶 mock 구현됨, API 미연동

마켓 목록 카드 3개 (sp500 / kospi / kosdaq). 각 카드 클릭 시 `/indices/:id` 이동.

**체크리스트**
- [ ] `GET /api/markets` 연동 → 마켓 목록 + 현재값 + 분류 + sparkline mock 교체

---

### `pages/indices/[market].vue` — 🔶 mock 구현됨, API 미연동

특정 마켓 상세 페이지. 날짜 선택기 + 게이지 + 세부지표 + 30일 추이 포함.

**현재 구현된 레이아웃**
```
날짜 선택기  (히스토리 내 특정 날짜 선택 → 게이지 값 반영)
① FearGreedGaugeChart + CommunityVoteCard  (md:2열)
② 세부 지표 그리드  (sm:2열, xl:3열) — SubIndicator 카드
③ ZoneDistributionChart  (구간 분포)
   FearGreedTrendChart  (30일 선 그래프)
```

**체크리스트**
- [ ] `GET /api/markets/:id` 연동 → 현재값·분류·스냅샷·세부지표 mock 교체
- [ ] `GET /api/markets/:id/history` 연동 → 히스토리 mock 교체 (날짜 선택기 + ZoneDistributionChart + TrendChart)
- [ ] `GET /api/votes/:marketId` + `POST /api/votes` 연동 → CommunityVoteCard mock 교체
- [ ] 존재하지 않는 마켓 ID 접근 시 `/indices` 리다이렉트 처리 (현재 구현됨)

---

### `pages/news.vue` — 🔶 mock 구현됨, API 미연동

독립 뉴스 페이지. 검색창 + 마켓 필터 탭 + 뉴스 목록 (현재 16건 mock).

**체크리스트**
- [ ] `GET /api/news?market=&limit=&offset=&q=` 연동 → 뉴스 목록 mock 교체
- [ ] 검색(`q` 파라미터) 서버 사이드 처리로 전환 (현재 클라이언트 사이드 필터링)
- [ ] 페이지네이션 UI 추가 (`metadata.total` 기준)

---

### 공통 체크리스트

**API 연동**
→ 엔드포인트 명세 및 구현 우선순위는 **[TODO_api.md](./TODO_api.md)** 참조

**네비게이션**
- [x] `AppHeader.vue` 상단 메뉴에 `/dashboard`, `/indices`, `/news`, `/about` 항목 포함
- [x] `AppSidebar.vue` 및 좌측 사이드바 구조 제거 — 전체 상단 메뉴 구조로 통일

### 완료 기준

- 4개 페이지 모두 실데이터 렌더링 확인

---

## Phase 3 — 품질 검증 및 배포 준비

> 코드 품질 도구 통과, UI 완성도 확인, 프로덕션 빌드 검증까지 완료한다.

### 체크리스트

**코드 품질**
- [x] `npm run type-check` 통과 (오류 0개)
- [x] `npm run lint` 통과
- [x] `npm run format:check` 통과

**UI 완성도**
- [ ] 모바일(1열) → 태블릿(2열) → 데스크톱(3열) 반응형 그리드 확인
- [ ] 라이트모드 / 다크모드 전환 시 모든 컴포넌트 색상 정상 적용
- [ ] 로딩 중 스켈레톤/스피너 표시 확인
- [ ] API 오류 시 토스트 알림 표시 확인

**런타임 확인**

| 확인 항목 | 방법 | 기대 결과 |
|-----------|------|-----------|
| 프리뷰 렌더링 | `http://localhost:3000/preview` | 3개 마켓 카드 + 상세 + 뉴스 + 키워드 정상 표시 |
| 대시보드 렌더링 | `http://localhost:3000/dashboard` | 게이지 + 카드 + 차트 + 테이블 표시 |
| SSR 정상 작동 | 페이지 소스 확인 | 서버에서 렌더링된 HTML 포함 |
| API 프록시 | `GET /api/fear-greed/current` | 지수 JSON 반환 |
| 인증 가드 | 비로그인 → 투표 버튼 클릭 | 로그인 안내 표시 (리다이렉트 없음) |

**배포 준비**
- [x] `npm run build` 빌드 오류 없음
- [x] `.env.example` 생성 및 최신 상태 확인
- [ ] `doc/error-fix.md` 발생 이슈 정리

### 완료 기준

- `npm run build` 성공
- 위 런타임 확인 항목 전체 통과
- `doc/error-fix.md`에 Phase 1–3 중 발생한 이슈 기록 완료
