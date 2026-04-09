<script setup lang="ts">
import type { FearGreedReading, FearGreedClassification } from "~/types";

definePageMeta({ layout: "default" });

// ── 타입 ─────────────────────────────────────────────────────
interface Market {
  id: string;
  name: string;
  value: number;
  classification: FearGreedClassification;
  sparkline: number[];
  reading: FearGreedReading;
  history: FearGreedReading[];
}

const BASE = 1775001600;

// ── Mock 데이터: 3개 마켓 ─────────────────────────────────────
const markets: Market[] = [
  {
    id: "sp500",
    name: "S&P 500",
    value: 72,
    classification: "Greed",
    sparkline: [45, 52, 58, 54, 60, 63, 67, 65, 70, 72],
    reading: {
      value: 72,
      value_classification: "Greed",
      timestamp: String(BASE),
      time_until_update: "14 hours",
    },
    history: makeMockHistory(
      [
        45, 48, 52, 50, 55, 58, 54, 57, 60, 62, 65, 63, 67, 65, 68, 70, 66, 69,
        71, 68, 72, 70, 74, 71, 68, 65, 68, 70, 71, 72,
      ],
      BASE,
    ),
  },
  {
    id: "kospi",
    name: "KOSPI",
    value: 48,
    classification: "Neutral",
    sparkline: [38, 42, 40, 44, 46, 43, 47, 45, 49, 48],
    reading: {
      value: 48,
      value_classification: "Neutral",
      timestamp: String(BASE),
      time_until_update: "6 hours",
    },
    history: makeMockHistory(
      [
        35, 38, 40, 37, 42, 44, 41, 45, 43, 47, 48, 46, 50, 48, 52, 49, 46, 50,
        48, 51, 53, 50, 47, 49, 52, 50, 48, 51, 49, 48,
      ],
      BASE,
    ),
  },
  {
    id: "kosdaq",
    name: "KOSDAQ",
    value: 35,
    classification: "Fear",
    sparkline: [55, 50, 46, 48, 42, 40, 38, 37, 36, 35],
    reading: {
      value: 35,
      value_classification: "Fear",
      timestamp: String(BASE),
      time_until_update: "6 hours",
    },
    history: makeMockHistory(
      [
        58, 55, 52, 56, 50, 48, 52, 46, 44, 48, 42, 45, 40, 43, 38, 42, 38, 36,
        40, 37, 35, 38, 34, 36, 33, 35, 37, 34, 36, 35,
      ],
      BASE,
    ),
  },
];

// ── 선택된 마켓 ───────────────────────────────────────────────
const selectedId = ref("sp500");
const selectedMarket = computed(
  () => markets.find((m) => m.id === selectedId.value)!,
);

// ── 비교 차트용 마켓 라인 ─────────────────────────────────────
const MARKET_COLORS: Record<string, string> = {
  sp500: "#3b82f6",
  kospi: "#8b5cf6",
  kosdaq: "#ec4899",
};
const comparisonMarkets = computed(() =>
  markets.map((m) => ({
    id: m.id,
    name: m.name,
    history: m.history,
    color: MARKET_COLORS[m.id] ?? "#6b7280",
  })),
);

// ── Mock 뉴스 ─────────────────────────────────────────────────
const mockNews = [
  {
    id: 1,
    title: '연준, 기준금리 동결 결정…"추가 데이터 확인 후 인하 검토"',
    source: "Bloomberg",
    time: "2시간 전",
    market: "sp500" as const,
    url: "#",
  },
  {
    id: 2,
    title: "코스피, 외국인 순매수 5거래일 연속…2,680선 돌파",
    source: "한국경제",
    time: "3시간 전",
    market: "kospi" as const,
    url: "#",
  },
  {
    id: 3,
    title: "나스닥 기술주 강세…빅테크 1분기 실적 기대감 상승",
    source: "Reuters",
    time: "4시간 전",
    market: "sp500" as const,
    url: "#",
  },
  {
    id: 4,
    title: "코스닥 바이오 섹터, 임상 3상 발표 앞두고 동반 강세",
    source: "매일경제",
    time: "5시간 전",
    market: "kosdaq" as const,
    url: "#",
  },
  {
    id: 5,
    title: "달러 인덱스 3주 만에 최저…신흥국 통화 강세 전환",
    source: "WSJ",
    time: "6시간 전",
    market: "global" as const,
    url: "#",
  },
  {
    id: 6,
    title: "삼성전자, 반도체 신규 라인 투자 확대…코스피 상승 견인",
    source: "한국경제",
    time: "7시간 전",
    market: "kospi" as const,
    url: "#",
  },
  {
    id: 7,
    title: "S&P 500, 사상 최고치 1% 이내 근접…투자 심리 빠르게 회복",
    source: "CNBC",
    time: "8시간 전",
    market: "sp500" as const,
    url: "#",
  },
  {
    id: 8,
    title: "코스닥 150 지수 정기 변경…편입 종목 12개 교체",
    source: "연합뉴스",
    time: "10시간 전",
    market: "kosdaq" as const,
    url: "#",
  },
];

// ── Mock 키워드 ───────────────────────────────────────────────
const mockKeywords = [
  { rank: 1, keyword: "금리", count: 12450, trend: "up" as const },
  { rank: 2, keyword: "연준(Fed)", count: 9832, trend: "up" as const },
  { rank: 3, keyword: "반도체", count: 8210, trend: "down" as const },
  { rank: 4, keyword: "인플레이션", count: 7650, trend: "same" as const },
  { rank: 5, keyword: "달러", count: 6430, trend: "up" as const },
  { rank: 6, keyword: "빅테크", count: 5890, trend: "down" as const },
  { rank: 7, keyword: "FOMC", count: 4320, trend: "up" as const },
  { rank: 8, keyword: "유가", count: 3780, trend: "same" as const },
  { rank: 9, keyword: "경기침체", count: 3210, trend: "down" as const },
  { rank: 10, keyword: "채권", count: 2650, trend: "same" as const },
];
</script>

<template>
  <div class="space-y-8">
    <!-- ① 마켓 요약 카드 3개 -->
    <section>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MarketSummaryCard
          v-for="m in markets"
          :id="m.id"
          :key="m.id"
          :name="m.name"
          :value="m.value"
          :classification="m.classification"
          :sparkline="m.sparkline"
          :active="selectedId === m.id"
          @select="selectedId = $event"
        />
      </div>
    </section>

    <!-- ② 선택된 마켓 상세 -->
    <section>
      <div class="mb-4 flex items-baseline justify-between">
        <h2 class="text-xl font-bold text-gray-900 dark:text-white">
          {{ selectedMarket.name }}
        </h2>
        <span class="text-xs text-gray-400 dark:text-gray-500">
          기준일:
          {{
            new Date(BASE * 1000).toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          }}
        </span>
      </div>

      <!-- 게이지 + 커뮤니티 투표 -->
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
        <FearGreedGaugeChart :value="selectedMarket.value" />
        <CommunityVoteCard :market-id="selectedMarket.id" />
      </div>

      <!-- 마켓 비교 트렌드 -->
      <div class="mt-6">
        <MarketComparisonChart
          :markets="comparisonMarkets"
          :active-id="selectedMarket.id"
        />
      </div>
    </section>

    <!-- ③ 뉴스 + 키워드 -->
    <section>
      <div class="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div class="xl:col-span-2">
          <NewsList :items="mockNews" />
        </div>
        <div>
          <KeywordRanking :keywords="mockKeywords" :limit="10" />
        </div>
      </div>
    </section>
  </div>
</template>
