<script setup lang="ts">
import type { FearGreedClassification, FearGreedReading, NewsItem, KeywordItem } from "~/types";

definePageMeta({ layout: "dashboard" });

interface Market {
  id: string;
  name: string;
  value: number;
  classification: FearGreedClassification;
  sparkline: number[];
  reading: FearGreedReading;
  history: FearGreedReading[];
}

const MARKET_COLORS: Record<string, string> = {
  sp500: "#3b82f6",
  kospi: "#8b5cf6",
  kosdaq: "#ec4899",
};

// ── API 페치 (병렬) ───────────────────────────────────────────
const [{ data: marketsRes }, { data: newsRes }, { data: keywordsRes }] =
  await Promise.all([
    useFetch("/api/markets"),
    useFetch("/api/news", { query: { limit: 8 } }),
    useFetch("/api/keywords"),
  ]);

// ── 마켓 데이터 매핑 ─────────────────────────────────────────
const markets = computed<Market[]>(() => {
  const res = marketsRes.value as any;
  if (!res?.data) return [];
  return res.data.map((m: any): Market => ({
    id: m.id,
    name: m.name,
    value: m.value,
    classification: m.value_classification,
    sparkline: m.sparkline ?? [],
    reading: {
      value: m.value,
      value_classification: m.value_classification,
      timestamp: m.timestamp,
      time_until_update: m.time_until_update,
    },
    history: (m.history ?? []).map((h: any) => ({
      value: h.value,
      value_classification: h.value_classification,
      timestamp: h.timestamp,
    })),
  }));
});

// ── 뉴스 데이터 매핑 ─────────────────────────────────────────
const newsItems = computed<NewsItem[]>(() => {
  const res = newsRes.value as any;
  return res?.data ?? [];
});

// ── 키워드 데이터 매핑 ───────────────────────────────────────
const keywords = computed<KeywordItem[]>(() => {
  const res = keywordsRes.value as any;
  return res?.data ?? [];
});

// ── 선택된 마켓 ───────────────────────────────────────────────
const selectedId = ref("sp500");
const selectedMarket = computed(
  () => markets.value.find((m) => m.id === selectedId.value) ?? markets.value[0],
);

// ── 비교 차트용 마켓 라인 ─────────────────────────────────────
const comparisonMarkets = computed(() =>
  markets.value.map((m) => ({
    id: m.id,
    name: m.name,
    history: m.history,
    color: MARKET_COLORS[m.id] ?? "#6b7280",
  })),
);
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
    <section v-if="selectedMarket">
      <div class="mb-4 flex items-baseline justify-between">
        <h2 class="text-xl font-bold text-gray-900 dark:text-white">
          {{ selectedMarket.name }}
        </h2>
        <span class="text-xs text-gray-400 dark:text-gray-500">
          기준일:
          {{
            new Date(
              parseInt(selectedMarket.reading.timestamp) * 1000,
            ).toLocaleDateString("ko-KR", {
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
          <NewsList :items="newsItems" />
        </div>
        <div>
          <KeywordRanking :keywords="keywords" :limit="10" />
        </div>
      </div>
    </section>
  </div>
</template>
