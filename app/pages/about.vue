<script setup lang="ts">
definePageMeta({
  layout: "default",
});
</script>

<template>
  <div class="max-w-2xl mx-auto space-y-6">
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white">소개</h1>

    <BaseCard>
      <h2 class="font-semibold text-gray-900 dark:text-white mb-3">
        Fear & Greed Index란?
      </h2>
      <p class="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
        Fear & Greed Index는 암호화폐 시장의 현재 심리 상태를 0-100 사이의
        숫자로 표현한 지표입니다. 낮은 숫자는 시장이 극도의 공포(Extreme Fear)
        상태에 있음을 나타내고, 높은 숫자는 극도의 탐욕(Extreme Greed) 상태를
        나타냅니다.
      </p>
    </BaseCard>

    <BaseCard>
      <h2 class="font-semibold text-gray-900 dark:text-white mb-3">
        지표 산출 기준
      </h2>
      <ul class="space-y-2 text-sm text-gray-600 dark:text-gray-300">
        <li>
          • <strong>변동성(Volatility)</strong>: 현재 변동성 vs 평균 변동성 비교
        </li>
        <li>
          • <strong>시장 모멘텀/거래량</strong>: 현재 거래량 vs 평균 거래량
        </li>
        <li>• <strong>소셜 미디어</strong>: 긍정/부정 언급 비율</li>
        <li>• <strong>설문조사</strong>: 주간 시장 심리 설문</li>
        <li>• <strong>비트코인 도미넌스</strong>: BTC 시장 점유율</li>
        <li>• <strong>Google Trends</strong>: 암호화폐 관련 검색량</li>
      </ul>
    </BaseCard>

    <BaseCard>
      <h2 class="font-semibold text-gray-900 dark:text-white mb-3">
        데이터 출처
      </h2>
      <p class="text-sm text-gray-600 dark:text-gray-300">
        데이터는
        <a
          href="https://alternative.me/crypto/fear-and-greed-index/"
          target="_blank"
          rel="noopener noreferrer"
          class="text-primary-600 dark:text-primary-400 hover:underline"
        >
          Alternative.me
        </a>
        에서 제공합니다.
      </p>
    </BaseCard>
  </div>
</template>
