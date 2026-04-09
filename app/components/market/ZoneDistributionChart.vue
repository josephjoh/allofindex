<script setup lang="ts">
import type { FearGreedReading } from "~/types";

const props = defineProps<{
  history: FearGreedReading[];
}>();

interface Zone {
  label: string;
  labelKo: string;
  min: number;
  max: number;
  color: string;
  bgClass: string;
  textClass: string;
}

const ZONES: Zone[] = [
  {
    label: "Extreme Greed",
    labelKo: "극도의 탐욕",
    min: 81,
    max: 100,
    color: "#15803d",
    bgClass: "bg-emerald-500",
    textClass: "text-emerald-700 dark:text-emerald-400",
  },
  {
    label: "Greed",
    labelKo: "탐욕",
    min: 61,
    max: 80,
    color: "#16a34a",
    bgClass: "bg-green-500",
    textClass: "text-green-700 dark:text-green-400",
  },
  {
    label: "Neutral",
    labelKo: "중립",
    min: 41,
    max: 60,
    color: "#ca8a04",
    bgClass: "bg-yellow-500",
    textClass: "text-yellow-700 dark:text-yellow-400",
  },
  {
    label: "Fear",
    labelKo: "공포",
    min: 21,
    max: 40,
    color: "#ea580c",
    bgClass: "bg-orange-500",
    textClass: "text-orange-700 dark:text-orange-400",
  },
  {
    label: "Extreme Fear",
    labelKo: "극도의 공포",
    min: 0,
    max: 20,
    color: "#dc2626",
    bgClass: "bg-red-500",
    textClass: "text-red-700 dark:text-red-400",
  },
];

const total = computed(() => props.history.length);

const distribution = computed(() =>
  ZONES.map((zone) => {
    const days = props.history.filter(
      (r) => r.value >= zone.min && r.value <= zone.max,
    ).length;
    const pct = total.value ? Math.round((days / total.value) * 100) : 0;
    return { ...zone, days, pct };
  }),
);

// 가장 많이 체류한 구간
const dominantZone = computed(() =>
  distribution.value.reduce((a, b) => (a.days >= b.days ? a : b)),
);
</script>

<template>
  <BaseCard>
    <h2 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">
      구간별 분포
    </h2>
    <p class="text-xs text-gray-400 dark:text-gray-500 mb-4">
      최근 {{ total }}일 체류 현황
    </p>

    <!-- 스택 바 -->
    <div class="flex h-3 rounded-full overflow-hidden mb-5 gap-px">
      <div
        v-for="zone in distribution"
        :key="zone.label"
        :class="[zone.bgClass, 'transition-all duration-700']"
        :style="{ width: `${zone.pct}%` }"
      />
    </div>

    <!-- 구간별 행 -->
    <div class="space-y-3">
      <div
        v-for="zone in distribution"
        :key="zone.label"
        class="flex items-center gap-3"
      >
        <!-- 색상 도트 -->
        <span
          class="shrink-0 w-2.5 h-2.5 rounded-full"
          :style="{ backgroundColor: zone.color }"
        />

        <!-- 구간명 -->
        <div class="flex-1 min-w-0">
          <div class="flex items-baseline justify-between gap-1 mb-1">
            <span
              class="text-xs font-medium text-gray-700 dark:text-gray-300 truncate"
            >
              {{ zone.labelKo }}
            </span>
            <span
              class="shrink-0 text-xs tabular-nums text-gray-400 dark:text-gray-500"
            >
              {{ zone.days }}일
            </span>
          </div>
          <div
            class="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden"
          >
            <div
              :class="[
                zone.bgClass,
                'h-full rounded-full transition-all duration-700',
              ]"
              :style="{ width: `${zone.pct}%` }"
            />
          </div>
        </div>

        <!-- % -->
        <span
          class="shrink-0 w-8 text-right text-xs font-semibold tabular-nums"
          :class="zone.textClass"
        >
          {{ zone.pct }}%
        </span>
      </div>
    </div>

    <!-- 요약 -->
    <div
      class="mt-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 px-3 py-2.5 text-center"
    >
      <p class="text-xs text-gray-400 dark:text-gray-500">
        주로
        <span class="font-semibold" :style="{ color: dominantZone.color }">
          {{ dominantZone.labelKo }}
        </span>
        구간에 머물렀습니다
        <span class="text-gray-300 dark:text-gray-600 mx-1">·</span>
        <span class="tabular-nums">{{ dominantZone.pct }}%</span>
      </p>
    </div>
  </BaseCard>
</template>
