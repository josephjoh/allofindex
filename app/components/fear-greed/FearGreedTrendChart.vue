<script setup lang="ts">
import type { FearGreedReading } from "~/types";
import { formatTimestamp } from "~/utils/formatters";

const props = defineProps<{
  history: FearGreedReading[];
  loading?: boolean;
}>();

const W = 600;
const H = 200;
const PAD = { top: 16, right: 16, bottom: 36, left: 36 };

const chartW = W - PAD.left - PAD.right;
const chartH = H - PAD.top - PAD.bottom;

// 시간 역순 정렬 (오래된 것 → 최신 것)
const sorted = computed(() =>
  [...props.history].sort(
    (a, b) => parseInt(a.timestamp) - parseInt(b.timestamp),
  ),
);

function scaleX(i: number, total: number) {
  if (total <= 1) return PAD.left;
  return PAD.left + (i / (total - 1)) * chartW;
}

function scaleY(value: number) {
  return PAD.top + chartH - (value / 100) * chartH;
}

const polylinePoints = computed(() => {
  const pts = sorted.value;
  if (!pts.length) return "";
  return pts
    .map((p, i) => `${scaleX(i, pts.length)},${scaleY(p.value)}`)
    .join(" ");
});

// Y 축 그리드 (0, 25, 50, 75, 100)
const yTicks = [0, 25, 50, 75, 100];

// X 축 레이블: 균등 배치 최대 5개
const xLabels = computed(() => {
  const pts = sorted.value;
  if (!pts.length) return [];
  const step = Math.max(1, Math.floor(pts.length / 5));
  return pts
    .filter((_, i) => i % step === 0 || i === pts.length - 1)
    .map((p) => ({
      x: scaleX(pts.indexOf(p), pts.length),
      label: formatTimestamp(p.timestamp, "en-US").replace(/,\s*\d{4}$/, ""),
    }));
});
</script>

<template>
  <BaseCard>
    <h2 class="mb-4 text-lg font-semibold text-gray-700 dark:text-gray-300">
      지수 흐름
    </h2>

    <!-- 로딩 -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <BaseSpinner size="lg" />
    </div>

    <!-- 데이터 없음 -->
    <div
      v-else-if="!history.length"
      class="py-12 text-center text-gray-400 dark:text-gray-500"
    >
      데이터 없음
    </div>

    <!-- 차트 -->
    <div v-else class="overflow-x-auto">
      <svg
        :viewBox="`0 0 ${W} ${H}`"
        class="w-full"
        :aria-label="`Fear & Greed 30일 트렌드 차트`"
      >
        <!-- Y 축 그리드 -->
        <g>
          <line
            v-for="tick in yTicks"
            :key="tick"
            :x1="PAD.left"
            :y1="scaleY(tick)"
            :x2="W - PAD.right"
            :y2="scaleY(tick)"
            stroke="currentColor"
            stroke-width="0.5"
            class="text-gray-200 dark:text-gray-700"
          />
          <text
            v-for="tick in yTicks"
            :key="`lbl-${tick}`"
            :x="PAD.left - 6"
            :y="scaleY(tick) + 4"
            font-size="10"
            text-anchor="end"
            class="fill-gray-400 dark:fill-gray-500"
          >
            {{ tick }}
          </text>
        </g>

        <!-- 영역 채우기 -->
        <defs>
          <linearGradient id="trend-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.3" />
            <stop offset="100%" stop-color="#3b82f6" stop-opacity="0.02" />
          </linearGradient>
        </defs>
        <polygon
          v-if="sorted.length"
          :points="`${scaleX(0, sorted.length)},${scaleY(0)} ${polylinePoints} ${scaleX(sorted.length - 1, sorted.length)},${scaleY(0)}`"
          fill="url(#trend-gradient)"
        />

        <!-- 선 -->
        <polyline
          :points="polylinePoints"
          fill="none"
          stroke="#3b82f6"
          stroke-width="2"
          stroke-linejoin="round"
          stroke-linecap="round"
        />

        <!-- X 축 레이블 -->
        <g>
          <text
            v-for="lbl in xLabels"
            :key="lbl.x"
            :x="lbl.x"
            :y="H - 6"
            font-size="9"
            text-anchor="middle"
            class="fill-gray-400 dark:fill-gray-500"
          >
            {{ lbl.label }}
          </text>
        </g>
      </svg>
    </div>
  </BaseCard>
</template>
