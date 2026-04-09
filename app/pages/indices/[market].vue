<script setup lang="ts">
import type { FearGreedClassification, FearGreedReading } from "~/types";

definePageMeta({ layout: "default" });

const route = useRoute();

interface SubIndicator {
  name: string;
  nameKo: string;
  value: number;
  description: string;
}

interface Snapshot {
  label: string;
  value: number;
  classification: FearGreedClassification;
}

interface MarketConfig {
  id: string;
  name: string;
  nameKo: string;
  description: string;
  currentValue: number;
  currentClassification: FearGreedClassification;
  snapshots: Snapshot[];
  indicators: SubIndicator[];
  history: FearGreedReading[];
}

const BASE = 1775001600;

// ── 마켓별 데이터 ─────────────────────────────────────────────
const marketData: Record<string, MarketConfig> = {
  sp500: {
    id: "sp500",
    name: "S&P 500",
    nameKo: "미국 주식",
    description:
      "S&P 500 기반 7개 지표의 동일 가중치 평균으로 미국 증시 심리를 수치화합니다.",
    currentValue: 72,
    currentClassification: "Greed",
    snapshots: [
      { label: "어제", value: 70, classification: "Greed" },
      { label: "1주일 전", value: 65, classification: "Greed" },
      { label: "1달 전", value: 58, classification: "Greed" },
      { label: "1년 전", value: 44, classification: "Fear" },
    ],
    indicators: [
      {
        name: "Stock Price Momentum",
        nameKo: "주가 모멘텀",
        value: 74,
        description:
          "S&P 500이 125일 이동평균 대비 얼마나 위에 있는지를 측정합니다. 지수가 MA 위에 있으면 탐욕 신호입니다.",
      },
      {
        name: "Stock Price Strength",
        nameKo: "주가 강도",
        value: 78,
        description:
          "NYSE 52주 신고가 종목 수 대비 신저가 종목 수 비율입니다. 신고가가 많을수록 탐욕입니다.",
      },
      {
        name: "Stock Price Breadth",
        nameKo: "주가 폭",
        value: 63,
        description:
          "NYSE 상승 거래량 대비 하락 거래량을 측정하는 McClellan 지표입니다.",
      },
      {
        name: "Put & Call Options",
        nameKo: "풋/콜 비율",
        value: 68,
        description:
          "CBOE 풋/콜 옵션 비율 5일 평균입니다. 비율이 낮을수록(콜 多) 탐욕 신호입니다.",
      },
      {
        name: "Junk Bond Demand",
        nameKo: "정크본드 수요",
        value: 72,
        description:
          "하이일드채와 투자등급채 간 스프레드입니다. 스프레드가 좁을수록 위험 선호(탐욕)를 의미합니다.",
      },
      {
        name: "Market Volatility",
        nameKo: "시장 변동성",
        value: 66,
        description:
          "VIX 공포지수와 50일 이동평균을 비교합니다. VIX가 낮을수록 탐욕입니다.",
      },
      {
        name: "Safe Haven Demand",
        nameKo: "안전자산 수요",
        value: 80,
        description:
          "주식과 미국채 20일 수익률 차이입니다. 주식 수익률이 높을수록 탐욕 신호입니다.",
      },
    ],
    history: makeMockHistory(
      [
        45, 48, 52, 50, 55, 58, 54, 57, 60, 62, 65, 63, 67, 65, 68, 70, 66, 69,
        71, 68, 72, 70, 74, 71, 68, 65, 68, 70, 71, 72,
      ],
      BASE,
    ),
  },

  kospi: {
    id: "kospi",
    name: "KOSPI",
    nameKo: "코스피",
    description:
      "VKOSPI, 모멘텀, 주가 강도 등 6개 지표를 가중 평균해 한국 증시 심리를 수치화합니다.",
    currentValue: 48,
    currentClassification: "Neutral",
    snapshots: [
      { label: "어제", value: 51, classification: "Neutral" },
      { label: "1주일 전", value: 45, classification: "Fear" },
      { label: "1달 전", value: 38, classification: "Fear" },
      { label: "1년 전", value: 62, classification: "Greed" },
    ],
    indicators: [
      {
        name: "VKOSPI",
        nameKo: "VKOSPI (변동성)",
        value: 50,
        description:
          "한국 변동성 지수(VKOSPI)와 30/90일 이동평균을 비교합니다. 가중치 30%. 낮을수록 탐욕입니다.",
      },
      {
        name: "KOSPI Momentum",
        nameKo: "KOSPI 모멘텀",
        value: 48,
        description:
          "KOSPI가 125일 이동평균 대비 위치를 측정합니다. 가중치 25%.",
      },
      {
        name: "Stock Price Strength",
        nameKo: "주가 강도",
        value: 52,
        description: "KOSPI+KOSDAQ 52주 신고가/신저가 비율입니다. 가중치 15%.",
      },
      {
        name: "KOSPI Trend",
        nameKo: "KOSPI 추세",
        value: 45,
        description:
          "KOSPI 방향성 지표로 단기 모멘텀의 지속성을 측정합니다. 가중치 15%.",
      },
      {
        name: "KOSDAQ Rate",
        nameKo: "KOSDAQ 등락률",
        value: 42,
        description:
          "KOSDAQ 상대 등락률입니다. 코스닥이 강세이면 전체 시장 탐욕 신호. 가중치 10%.",
      },
      {
        name: "Safe Haven Demand",
        nameKo: "안전자산 수요",
        value: 55,
        description:
          "채권 대비 주식 선호도를 측정합니다. 주식 선호 시 탐욕 신호. 가중치 5%.",
      },
    ],
    history: makeMockHistory(
      [
        35, 38, 40, 37, 42, 44, 41, 45, 43, 47, 48, 46, 50, 48, 52, 49, 46, 50,
        48, 51, 53, 50, 47, 49, 52, 50, 48, 51, 49, 48,
      ],
      BASE,
    ),
  },

  kosdaq: {
    id: "kosdaq",
    name: "KOSDAQ",
    nameKo: "코스닥",
    description:
      "KOSDAQ 전용 변동성·모멘텀·강도 지표를 바탕으로 코스닥 시장 심리를 수치화합니다.",
    currentValue: 35,
    currentClassification: "Fear",
    snapshots: [
      { label: "어제", value: 37, classification: "Fear" },
      { label: "1주일 전", value: 42, classification: "Fear" },
      { label: "1달 전", value: 50, classification: "Neutral" },
      { label: "1년 전", value: 58, classification: "Greed" },
    ],
    indicators: [
      {
        name: "KOSDAQ Volatility",
        nameKo: "코스닥 변동성",
        value: 32,
        description:
          "코스닥 일간 변동성과 30/90일 평균을 비교합니다. 변동성이 높을수록 공포 신호입니다.",
      },
      {
        name: "KOSDAQ Momentum",
        nameKo: "코스닥 모멘텀",
        value: 35,
        description:
          "KOSDAQ이 125일 이동평균 대비 위치를 측정합니다. 현재 이동평균 아래에 위치합니다.",
      },
      {
        name: "Bio/Tech Strength",
        nameKo: "바이오/기술 강도",
        value: 38,
        description:
          "KOSDAQ 주도 섹터(바이오·IT)의 52주 신고가/신저가 비율입니다.",
      },
      {
        name: "Small Cap Breadth",
        nameKo: "소형주 폭",
        value: 30,
        description: "코스닥 소형주 상승 종목 수 대비 하락 종목 수 비율입니다.",
      },
      {
        name: "KOSDAQ Trend",
        nameKo: "코스닥 추세",
        value: 33,
        description:
          "코스닥 단기 방향성 지표입니다. 하락 추세가 지속될 경우 공포 신호입니다.",
      },
      {
        name: "Retail Sentiment",
        nameKo: "개인 투자 심리",
        value: 40,
        description:
          "개인 투자자 순매수/순매도 추이로 소매 투자 심리를 측정합니다.",
      },
    ],
    history: makeMockHistory(
      [
        58, 55, 52, 56, 50, 48, 52, 46, 44, 48, 42, 45, 40, 43, 38, 42, 38, 36,
        40, 37, 35, 38, 34, 36, 33, 35, 37, 34, 36, 35,
      ],
      BASE,
    ),
  },
};

// ── 현재 마켓 ─────────────────────────────────────────────────
const market = computed(() => marketData[route.params.market as string]);

if (!market.value) await navigateTo("/indices");

useHead(() => ({
  title: market.value
    ? `${market.value.name} 공포탐욕지수 — All of Index`
    : "All of Index",
}));

// ── 날짜 선택 ─────────────────────────────────────────────────
// history를 날짜 오름차순으로 정렬
const sortedHistory = computed(() =>
  market.value
    ? [...market.value.history].sort(
        (a, b) => parseInt(a.timestamp) - parseInt(b.timestamp),
      )
    : [],
);

function tsToDateStr(ts: string) {
  return new Date(parseInt(ts) * 1000).toISOString().slice(0, 10);
}

const minDate = computed(() =>
  sortedHistory.value.length
    ? tsToDateStr(sortedHistory.value[0]!.timestamp)
    : "",
);
const maxDate = computed(() =>
  sortedHistory.value.length
    ? tsToDateStr(
        sortedHistory.value[sortedHistory.value.length - 1]!.timestamp,
      )
    : "",
);

// 선택된 날짜 (기본: 최신)
const selectedDate = ref(maxDate.value);

// 마켓이 바뀌면 날짜 리셋
watch(
  () => route.params.market,
  () => {
    selectedDate.value = maxDate.value;
  },
);

// 선택 날짜에 가장 가까운 히스토리 항목
const selectedEntry = computed(() => {
  if (!sortedHistory.value.length) return null;
  const target = new Date(selectedDate.value).getTime() / 1000;
  return sortedHistory.value.reduce(
    (closest: FearGreedReading, cur: FearGreedReading) => {
      const curDiff = Math.abs(parseInt(cur.timestamp) - target);
      const bestDiff = Math.abs(parseInt(closest.timestamp) - target);
      return curDiff < bestDiff ? cur : closest;
    },
  );
});

const displayValue = computed(
  () => selectedEntry.value?.value ?? market.value?.currentValue ?? 0,
);
const displayClassification = computed(
  () =>
    selectedEntry.value?.value_classification ??
    market.value?.currentClassification ??
    "Neutral",
);
const displayDateLabel = computed(() =>
  selectedDate.value === maxDate.value ? "최신" : selectedDate.value,
);
</script>

<template>
  <div v-if="market" class="space-y-8">
    <!-- 브레드크럼 + 페이지 헤더 -->
    <div>
      <nav
        class="flex items-center gap-1.5 text-sm text-gray-400 dark:text-gray-500 mb-3"
      >
        <NuxtLink
          to="/indices"
          class="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
        >
          인덱스
        </NuxtLink>
        <span>›</span>
        <span class="text-gray-700 dark:text-gray-300 font-medium">{{
          market.name
        }}</span>
      </nav>
      <div class="flex items-start justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ market.name }} 공포탐욕지수
          </h1>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {{ market.description }}
          </p>
        </div>
        <span
          :class="[
            'rounded-full px-3 py-1 text-sm font-semibold',
            getBadgeClass(displayValue),
          ]"
        >
          {{ displayClassification }}
        </span>
      </div>
    </div>

    <!-- ① 날짜 선택기 -->
    <section>
      <div class="flex items-center gap-3">
        <label class="text-sm text-gray-500 dark:text-gray-400 shrink-0"
          >날짜 선택</label
        >
        <input
          v-model="selectedDate"
          type="date"
          :min="minDate"
          :max="maxDate"
          class="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-1.5 text-sm text-gray-800 dark:text-gray-200 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-colors"
        />
        <span class="text-xs text-gray-400 dark:text-gray-500">
          {{
            displayDateLabel === "최신" ? "최신 데이터" : `${selectedDate} 기준`
          }}
        </span>
        <button
          v-if="selectedDate !== maxDate"
          class="text-xs text-primary-500 hover:text-primary-600 dark:text-primary-400 transition-colors"
          @click="selectedDate = maxDate"
        >
          최신으로
        </button>
      </div>
    </section>

    <!-- ② 게이지 + 커뮤니티 투표 -->
    <section>
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
        <FearGreedGaugeChart :value="displayValue" />
        <CommunityVoteCard :market-id="market.id" />
      </div>
    </section>

    <!-- ③ 세부 지표 -->
    <section>
      <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-4">
        세부 지표
      </h2>
      <div
        class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 lg:grid-cols-2"
      >
        <BaseCard v-for="ind in market.indicators" :key="ind.name" padding="sm">
          <div class="flex items-start justify-between gap-3 mb-3">
            <div class="min-w-0">
              <p class="text-xs text-gray-400 dark:text-gray-500 font-medium">
                {{ ind.name }}
              </p>
              <p
                class="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-0.5"
              >
                {{ ind.nameKo }}
              </p>
            </div>
            <span
              class="shrink-0 text-2xl font-bold tabular-nums"
              :style="{ color: getGaugeHexColor(ind.value) }"
            >
              {{ ind.value }}
            </span>
          </div>
          <div
            class="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden mb-3"
          >
            <div
              class="h-full rounded-full transition-all duration-700"
              :style="{
                width: `${ind.value}%`,
                backgroundColor: getGaugeHexColor(ind.value),
              }"
            />
          </div>
          <p
            class="text-xs text-gray-400 dark:text-gray-500 leading-relaxed line-clamp-2"
          >
            {{ ind.description }}
          </p>
        </BaseCard>
      </div>
    </section>

    <!-- ④ 30일 추이 -->
    <section>
      <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-4">
        30일 추이
      </h2>
      <div class="space-y-6">
        <ZoneDistributionChart :history="market.history" />
        <FearGreedTrendChart :history="market.history" :loading="false" />
      </div>
    </section>
  </div>
</template>
