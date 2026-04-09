<script setup lang="ts">
import { formatTimestamp } from "~/utils/formatters";

definePageMeta({
  layout: "default",
});

const { fetchHistory } = useFearGreedIndex();

const { data, pending, error, refresh } = fetchHistory(30);

const historyData = computed(() => data.value?.data ?? []);
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          히스토리
        </h1>
        <p class="text-gray-500 dark:text-gray-400 text-sm mt-1">
          최근 30일 Fear & Greed 지수
        </p>
      </div>
      <BaseButton
        variant="secondary"
        size="sm"
        :loading="pending"
        @click="refresh"
      >
        새로고침
      </BaseButton>
    </div>

    <!-- 로딩 -->
    <div v-if="pending" class="flex justify-center py-16">
      <BaseSpinner size="lg" />
    </div>

    <!-- 에러 -->
    <div
      v-else-if="error"
      class="text-center py-16 text-red-600 dark:text-red-400"
    >
      데이터를 불러오는데 실패했습니다.
    </div>

    <!-- 테이블 -->
    <BaseCard v-else padding="none">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-gray-200 dark:border-gray-700">
              <th
                class="text-left px-6 py-3 font-medium text-gray-500 dark:text-gray-400"
              >
                날짜
              </th>
              <th
                class="text-right px-6 py-3 font-medium text-gray-500 dark:text-gray-400"
              >
                지수
              </th>
              <th
                class="text-left px-6 py-3 font-medium text-gray-500 dark:text-gray-400"
              >
                분류
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in historyData"
              :key="item.timestamp"
              class="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <td class="px-6 py-3 text-gray-600 dark:text-gray-300">
                {{ formatTimestamp(item.timestamp) }}
              </td>
              <td
                class="px-6 py-3 text-right font-bold text-gray-900 dark:text-white"
              >
                {{ item.value }}
              </td>
              <td class="px-6 py-3">
                <span
                  :class="[
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    item.value <= 20 &&
                      'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200',
                    item.value > 20 &&
                      item.value <= 40 &&
                      'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200',
                    item.value > 40 &&
                      item.value <= 60 &&
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200',
                    item.value > 60 &&
                      item.value <= 80 &&
                      'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200',
                    item.value > 80 &&
                      'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',
                  ]"
                >
                  {{ item.value_classification }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>

        <div
          v-if="historyData.length === 0"
          class="py-16 text-center text-gray-400"
        >
          데이터가 없습니다.
        </div>
      </div>
    </BaseCard>
  </div>
</template>
