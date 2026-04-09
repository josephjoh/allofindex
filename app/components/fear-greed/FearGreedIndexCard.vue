<script setup lang="ts">
import type { FearGreedReading } from "~/types";
import { formatTimestamp, getClassificationColor } from "~/utils/formatters";

defineProps<{
  reading: FearGreedReading | null;
  loading: boolean;
}>();

function badgeBg(classification: FearGreedReading["value_classification"]) {
  const map = {
    "Extreme Fear": "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200",
    Fear: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200",
    Neutral:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200",
    Greed: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200",
    "Extreme Greed":
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
  };
  return map[classification] ?? "bg-gray-100 text-gray-800";
}
</script>

<template>
  <BaseCard>
    <h2 class="mb-4 text-lg font-semibold text-gray-700 dark:text-gray-300">
      현재 지수
    </h2>

    <!-- 로딩 -->
    <div v-if="loading" class="flex items-center justify-center py-8">
      <BaseSpinner size="lg" />
    </div>

    <!-- 데이터 없음 -->
    <div
      v-else-if="!reading"
      class="py-8 text-center text-gray-400 dark:text-gray-500"
    >
      데이터 없음
    </div>

    <!-- 지수 카드 내용 -->
    <div v-else class="flex flex-col gap-4">
      <!-- 값 + 분류 배지 -->
      <div class="flex items-end gap-3">
        <span
          :class="[
            'text-6xl font-bold tabular-nums',
            getClassificationColor(reading.value_classification),
          ]"
        >
          {{ reading.value }}
        </span>
        <span class="mb-1 text-2xl font-medium text-gray-400 dark:text-gray-500"
          >/ 100</span
        >
      </div>

      <span
        :class="[
          'inline-flex w-fit items-center rounded-full px-3 py-1 text-sm font-medium',
          badgeBg(reading.value_classification),
        ]"
      >
        {{ reading.value_classification }}
      </span>

      <!-- 메타 정보 -->
      <dl class="mt-2 space-y-1 text-sm text-gray-500 dark:text-gray-400">
        <div class="flex justify-between">
          <dt>기준 시간</dt>
          <dd class="font-medium text-gray-700 dark:text-gray-300">
            {{ formatTimestamp(reading.timestamp) }}
          </dd>
        </div>
        <div v-if="reading.time_until_update" class="flex justify-between">
          <dt>다음 업데이트</dt>
          <dd class="font-medium text-gray-700 dark:text-gray-300">
            {{ reading.time_until_update }}
          </dd>
        </div>
      </dl>
    </div>
  </BaseCard>
</template>
