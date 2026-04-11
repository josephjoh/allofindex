<script setup lang="ts">
import type { FearGreedClassification, FearGreedReading } from "~/types";

definePageMeta({ layout: "default" });

const route = useRoute();
const marketId = route.params.market as string;

interface SubIndicator {
  name: string;
  nameKo: string;
  value: number;
  description: string;
}

interface MarketConfig {
  id: string;
  name: string;
  nameKo: string;
  description: string;
  currentValue: number;
  currentClassification: FearGreedClassification;
  indicators: SubIndicator[];
  history: FearGreedReading[];
}

// ── API 페치 ─────────────────────────────────────────────────
const { data: marketRes, error } = await useFetch(`/api/markets/${marketId}`);

if (error.value) {
  await navigateTo("/indices");
}

const market = computed<MarketConfig | null>(() => {
  const res = marketRes.value as any;
  if (!res?.data) return null;
  const d = res.data;
  return {
    id: d.id,
    name: d.name,
    nameKo: d.nameKo,
    description: d.description,
    currentValue: d.currentValue,
    currentClassification: d.currentClassification,
    indicators: d.indicators ?? [],
    history: (d.history ?? []).map((h: any) => ({
      value: h.value,
      value_classification: h.value_classification,
      timestamp: h.timestamp,
    })),
  };
});

if (!market.value) {
  await navigateTo("/indices");
}

useHead(() => ({
  title: market.value
    ? `${market.value.name} 공포탐욕지수 — All of Index`
    : "All of Index",
}));

// ── 날짜 선택 ─────────────────────────────────────────────────
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

const selectedDate = ref(maxDate.value);

watch(
  () => route.params.market,
  () => {
    selectedDate.value = maxDate.value;
  },
);

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
