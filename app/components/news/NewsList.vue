<script setup lang="ts">
import type { NewsItem } from "~/types";

const props = defineProps<{
  items: NewsItem[];
}>();

const filters = [
  { value: "all", label: "전체" },
  { value: "sp500", label: "S&P500" },
  { value: "kospi", label: "KOSPI" },
  { value: "kosdaq", label: "KOSDAQ" },
];

const activeFilter = ref("all");

const filtered = computed(() =>
  activeFilter.value === "all"
    ? props.items
    : props.items.filter((n) => n.market === activeFilter.value),
);

const marketLabel: Record<string, string> = {
  sp500: "S&P500",
  kospi: "KOSPI",
  kosdaq: "KOSDAQ",
  global: "글로벌",
};

const marketBadge: Record<string, string> = {
  sp500: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  kospi:
    "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
  kosdaq: "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300",
  global: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};
</script>

<template>
  <BaseCard padding="none">
    <!-- 헤더 + 필터 탭 -->
    <div class="px-4 pt-4 border-b border-gray-200 dark:border-gray-700">
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-lg font-semibold text-gray-700 dark:text-gray-300">
          주요 뉴스
        </h2>
        <NuxtLink
          to="/news"
          class="text-xs text-primary-500 hover:text-primary-600 dark:text-primary-400 transition-colors"
        >
          전체보기 →
        </NuxtLink>
      </div>
      <div class="flex gap-0">
        <button
          v-for="f in filters"
          :key="f.value"
          :class="[
            'px-3 py-2 text-xs font-medium border-b-2 -mb-px transition-colors',
            activeFilter === f.value
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300',
          ]"
          @click="activeFilter = f.value"
        >
          {{ f.label }}
        </button>
      </div>
    </div>

    <!-- 뉴스 목록 -->
    <div
      v-if="!filtered.length"
      class="py-10 text-center text-sm text-gray-400 dark:text-gray-500"
    >
      뉴스가 없습니다
    </div>
    <ul v-else>
      <li
        v-for="item in filtered"
        :key="item.id"
        class="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
      >
        <a
          :href="item.url"
          target="_blank"
          rel="noopener"
          class="block px-4 py-3"
        >
          <div class="flex items-start justify-between gap-3">
            <p
              class="text-sm text-gray-800 dark:text-gray-200 leading-snug line-clamp-2 flex-1"
            >
              {{ item.title }}
            </p>
            <span
              :class="[
                'shrink-0 inline-flex rounded-full px-2 py-0.5 text-xs font-medium mt-0.5',
                marketBadge[item.market],
              ]"
            >
              {{ marketLabel[item.market] }}
            </span>
          </div>
          <div class="flex items-center gap-2 mt-1.5">
            <span class="text-xs text-gray-400 dark:text-gray-500">{{
              item.source
            }}</span>
            <span class="text-xs text-gray-200 dark:text-gray-700">·</span>
            <span class="text-xs text-gray-400 dark:text-gray-500">{{
              formatRelativeTime(item.publishedAt)
            }}</span>
          </div>
        </a>
      </li>
    </ul>
  </BaseCard>
</template>
