<script setup lang="ts">
import type { KeywordItem } from "~/types";

const props = defineProps<{
  keywords: KeywordItem[];
  limit?: number;
}>();

const visible = computed<KeywordItem[]>(() =>
  props.keywords.slice(0, props.limit ?? props.keywords.length),
);
</script>

<template>
  <BaseCard padding="none">
    <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-gray-700 dark:text-gray-300">
          키워드 Top {{ visible.length }}
        </h2>
        <NuxtLink
          to="/news"
          class="text-xs text-primary-500 hover:text-primary-600 dark:text-primary-400 transition-colors"
        >
          전체보기 →
        </NuxtLink>
      </div>
    </div>

    <ul>
      <li
        v-for="kw in visible"
        :key="kw.rank"
        class="flex items-center gap-3 px-4 py-2.5 border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
      >
        <!-- 순위 -->
        <span
          :class="[
            'w-5 text-center text-xs font-bold shrink-0 tabular-nums',
            kw.rank <= 3
              ? 'text-primary-600 dark:text-primary-400'
              : 'text-gray-400 dark:text-gray-500',
          ]"
        >
          {{ kw.rank }}
        </span>

        <!-- 키워드 -->
        <span
          class="flex-1 text-sm font-medium text-gray-800 dark:text-gray-200 truncate"
        >
          {{ kw.keyword }}
        </span>

        <!-- 빈도 + 트렌드 -->
        <div class="flex items-center gap-1 shrink-0">
          <span class="text-xs text-gray-400 dark:text-gray-500 tabular-nums">
            {{ kw.count.toLocaleString() }}
          </span>
          <span v-if="kw.trend === 'up'" class="text-xs text-red-500 font-bold"
            >▲</span
          >
          <span
            v-else-if="kw.trend === 'down'"
            class="text-xs text-blue-500 font-bold"
            >▼</span
          >
          <span v-else class="text-xs text-gray-300 dark:text-gray-600">–</span>
        </div>
      </li>
    </ul>
  </BaseCard>
</template>
