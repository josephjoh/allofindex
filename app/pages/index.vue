<script setup lang="ts">
definePageMeta({
  layout: "default",
});

const { currentReading, currentPending, currentError, refreshCurrent } =
  useFearGreedIndex();

const fearGreedStore = useFearGreedStore();

// 서버에서 가져온 데이터를 스토어에 동기화
watch(currentReading, (reading) => {
  if (reading) fearGreedStore.setCurrentReading(reading);
});
</script>

<template>
  <div class="space-y-8">
    <!-- 히어로 섹션 -->
    <section class="text-center py-12">
      <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-2">
        Fear & Greed Index
      </h1>
      <p class="text-gray-500 dark:text-gray-400">
        실시간 암호화폐 시장 심리 지표
      </p>
    </section>

    <!-- 로딩 상태 -->
    <div v-if="currentPending" class="flex justify-center py-16">
      <BaseSpinner size="lg" />
    </div>

    <!-- 에러 상태 -->
    <div
      v-else-if="currentError"
      class="flex flex-col items-center gap-4 py-16"
    >
      <p class="text-red-600 dark:text-red-400">
        데이터를 불러오는데 실패했습니다.
      </p>
      <BaseButton variant="secondary" @click="refreshCurrent"
        >다시 시도</BaseButton
      >
    </div>

    <!-- 데이터 표시 -->
    <template v-else-if="currentReading">
      <!-- 현재 지수 카드 -->
      <BaseCard class="max-w-md mx-auto text-center">
        <div class="py-8">
          <!-- 점수 -->
          <div
            :class="[
              'text-8xl font-black mb-2',
              fearGreedStore.classificationColor,
            ]"
          >
            {{ currentReading.value }}
          </div>

          <!-- 분류 -->
          <div
            :class="[
              'text-2xl font-bold mb-4',
              fearGreedStore.classificationColor,
            ]"
          >
            {{ currentReading.value_classification }}
          </div>

          <!-- 업데이트 정보 -->
          <p class="text-sm text-gray-500 dark:text-gray-400">
            다음 업데이트:
            {{ currentReading.time_until_update ?? "알 수 없음" }}
          </p>
        </div>
      </BaseCard>

      <!-- 분류 기준 안내 -->
      <BaseCard class="max-w-md mx-auto">
        <h2 class="font-semibold text-gray-900 dark:text-white mb-4">
          지수 분류 기준
        </h2>
        <ul class="space-y-2 text-sm">
          <li class="flex justify-between">
            <span class="text-fear-extreme font-medium">Extreme Fear</span>
            <span class="text-gray-500">0 – 20</span>
          </li>
          <li class="flex justify-between">
            <span class="text-fear font-medium">Fear</span>
            <span class="text-gray-500">21 – 40</span>
          </li>
          <li class="flex justify-between">
            <span class="text-neutral font-medium">Neutral</span>
            <span class="text-gray-500">41 – 60</span>
          </li>
          <li class="flex justify-between">
            <span class="text-greed font-medium">Greed</span>
            <span class="text-gray-500">61 – 80</span>
          </li>
          <li class="flex justify-between">
            <span class="text-greed-extreme font-medium">Extreme Greed</span>
            <span class="text-gray-500">81 – 100</span>
          </li>
        </ul>
      </BaseCard>
    </template>
  </div>
</template>
