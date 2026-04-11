<script setup lang="ts">
import type { FearGreedClassification } from "~/types";

definePageMeta({ layout: "default" });

useHead({ title: "인덱스 — All of Index" });

interface Market {
  id: string;
  name: string;
  nameKo: string;
  value: number;
  classification: FearGreedClassification;
  sparkline: number[];
  description: string;
  region: string;
}

const { data: marketsRes } = await useFetch("/api/markets");

const markets = computed<Market[]>(() => {
  const res = marketsRes.value as any;
  if (!res?.data) return [];
  return res.data.map((m: any): Market => ({
    id: m.id,
    name: m.name,
    nameKo: m.nameKo,
    value: m.value,
    classification: m.value_classification,
    sparkline: m.sparkline ?? [],
    description: m.description,
    region: m.region,
  }));
});

const scoreZones = [
  { range: "0–20", label: "Extreme Fear", color: "#dc2626" },
  { range: "21–40", label: "Fear", color: "#ea580c" },
  { range: "41–60", label: "Neutral", color: "#ca8a04" },
  { range: "61–80", label: "Greed", color: "#16a34a" },
  { range: "81–100", label: "Extreme Greed", color: "#15803d" },
];
</script>

<template>
  <div class="space-y-8">
    <!-- 페이지 헤더 -->
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">인덱스</h1>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        주요 시장별 공포탐욕지수 상세 분석
      </p>
    </div>

    <!-- 마켓 카드 그리드 -->
    <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
      <NuxtLink
        v-for="m in markets"
        :key="m.id"
        :to="`/indices/${m.id}`"
        class="group block rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 transition-all hover:border-primary-400 hover:shadow-lg dark:hover:border-primary-600"
      >
        <!-- 지역 배지 + 마켓명 -->
        <div class="flex items-start justify-between mb-4">
          <div>
            <p
              class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1"
            >
              {{ m.region }}
            </p>
            <h2
              class="text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors"
            >
              {{ m.name }}
            </h2>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              {{ m.nameKo }}
            </p>
          </div>
          <span
            :class="[
              'rounded-full px-2.5 py-1 text-xs font-medium',
              getBadgeClass(m.value),
            ]"
          >
            {{ m.classification }}
          </span>
        </div>

        <!-- 게이지 바 + 값 -->
        <div class="mb-4">
          <div class="flex items-end gap-2 mb-2">
            <span
              class="text-4xl font-bold tabular-nums text-gray-900 dark:text-white"
            >
              {{ m.value }}
            </span>
            <span class="text-sm text-gray-400 mb-1">/ 100</span>
          </div>
          <div
            class="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden"
          >
            <div
              class="h-full rounded-full transition-all duration-500"
              :style="{
                width: `${m.value}%`,
                backgroundColor: getGaugeHexColor(m.value),
              }"
            />
          </div>
        </div>

        <!-- 설명 -->
        <p
          class="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2"
        >
          {{ m.description }}
        </p>

        <!-- CTA -->
        <div class="mt-4 flex justify-end">
          <span
            class="text-xs font-medium text-primary-500 group-hover:text-primary-600 dark:text-primary-400 transition-colors"
          >
            상세 분석 보기 →
          </span>
        </div>
      </NuxtLink>
    </div>

    <!-- 안내 섹션 -->
    <BaseCard>
      <h3 class="text-base font-semibold text-gray-700 dark:text-gray-300 mb-3">
        공포탐욕지수란?
      </h3>
      <p class="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
        공포탐욕지수(Fear & Greed Index)는 시장 참여자들의 심리를 0~100 사이의
        단일 수치로 표현합니다. 0에 가까울수록 극도의 공포(매수 기회), 100에
        가까울수록 극도의 탐욕(과열 경계)을 의미합니다. 각 시장의 변동성,
        모멘텀, 거래 강도 등 여러 지표를 가중 평균해 산출합니다.
      </p>
      <div class="mt-4 grid grid-cols-5 gap-2">
        <div v-for="seg in scoreZones" :key="seg.range" class="text-center">
          <div
            class="h-1.5 rounded-full mb-1.5"
            :style="{ backgroundColor: seg.color }"
          />
          <p class="text-xs font-medium text-gray-700 dark:text-gray-300">
            {{ seg.label }}
          </p>
          <p class="text-xs text-gray-400">{{ seg.range }}</p>
        </div>
      </div>
    </BaseCard>
  </div>
</template>
