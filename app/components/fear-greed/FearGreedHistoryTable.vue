<script setup lang="ts">
import type { FearGreedReading } from "~/types";
import { formatTimestamp } from "~/utils/formatters";

const props = defineProps<{
  history: FearGreedReading[];
  limit?: number;
}>();

const rows = computed(() => {
  const limit = props.limit ?? 10;
  return [...props.history]
    .sort((a, b) => parseInt(b.timestamp) - parseInt(a.timestamp))
    .slice(0, limit);
});

function badgeClass(value: number) {
  if (value <= 20)
    return "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200";
  if (value <= 40)
    return "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200";
  if (value <= 60)
    return "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200";
  if (value <= 80)
    return "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200";
  return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200";
}
</script>

<template>
  <BaseCard padding="none">
    <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
      <h2 class="text-lg font-semibold text-gray-700 dark:text-gray-300">
        최근 기록
      </h2>
    </div>

    <div
      v-if="!history.length"
      class="py-12 text-center text-gray-400 dark:text-gray-500"
    >
      데이터 없음
    </div>

    <div v-else class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-gray-200 dark:border-gray-700">
            <th
              class="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400"
            >
              날짜
            </th>
            <th
              class="px-4 py-3 text-right font-medium text-gray-500 dark:text-gray-400"
            >
              지수
            </th>
            <th
              class="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400"
            >
              분류
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in rows"
            :key="item.timestamp"
            class="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
          >
            <td class="px-4 py-3 text-gray-600 dark:text-gray-300">
              {{ formatTimestamp(item.timestamp) }}
            </td>
            <td
              class="px-4 py-3 text-right font-bold text-gray-900 dark:text-white"
            >
              {{ item.value }}
            </td>
            <td class="px-4 py-3">
              <span
                :class="[
                  'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                  badgeClass(item.value),
                ]"
              >
                {{ item.value_classification }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </BaseCard>
</template>
