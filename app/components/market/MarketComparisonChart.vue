<script setup lang="ts">
import type { FearGreedReading } from "~/types";

interface MarketLine {
  id: string;
  name: string;
  history: FearGreedReading[];
  color: string;
}

const props = defineProps<{
  markets: MarketLine[];
  activeId?: string;
}>();

const W = 600;
const H = 200;
const PAD = { top: 16, right: 16, bottom: 36, left: 36 };
const chartW = W - PAD.left - PAD.right;
const chartH = H - PAD.top - PAD.bottom;

const yTicks = [0, 25, 50, 75, 100];

function scaleY(value: number) {
  return PAD.top + chartH - (value / 100) * chartH;
}

// 각 마켓의 정렬된 히스토리
const sortedMarkets = computed(() =>
  props.markets.map((m) => ({
    ...m,
    sorted: [...m.history].sort(
      (a, b) => parseInt(a.timestamp) - parseInt(b.timestamp),
    ),
  })),
);

// 공통 포인트 수 (가장 짧은 것에 맞춤)
const pointCount = computed(() =>
  Math.min(...sortedMarkets.value.map((m) => m.sorted.length)),
);

function scaleX(i: number) {
  if (pointCount.value <= 1) return PAD.left;
  return PAD.left + (i / (pointCount.value - 1)) * chartW;
}

function polyline(sorted: FearGreedReading[]) {
  return sorted
    .slice(0, pointCount.value)
    .map((p, i) => `${scaleX(i)},${scaleY(p.value)}`)
    .join(" ");
}

// X축 레이블: 첫날·중간·마지막
const xLabels = computed(() => {
  const base = sortedMarkets.value[0]?.sorted ?? [];
  if (!base.length) return [];
  const n = Math.min(base.length, pointCount.value);
  const indices = [0, Math.floor(n / 2), n - 1];
  return [...new Set(indices)].map((i) => ({
    x: scaleX(i),
    label: new Date(
      parseInt(base[i]?.timestamp ?? "0") * 1000,
    ).toLocaleDateString("ko-KR", {
      month: "numeric",
      day: "numeric",
    }),
  }));
});

// 현재값 (히스토리의 마지막 포인트)
function lastValue(sorted: FearGreedReading[]) {
  return sorted[Math.min(sorted.length, pointCount.value) - 1]?.value ?? 0;
}
</script>

<template>
  <BaseCard>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold text-gray-700 dark:text-gray-300">
        마켓 비교 트렌드
      </h2>
      <!-- 범례 -->
      <div class="flex items-center gap-4">
        <div
          v-for="m in sortedMarkets"
          :key="m.id"
          class="flex items-center gap-1.5"
          :class="activeId && activeId !== m.id ? 'opacity-40' : ''"
        >
          <span
            class="inline-block w-3 h-0.5 rounded-full"
            :style="{ backgroundColor: m.color }"
          />
          <span class="text-xs text-gray-500 dark:text-gray-400">{{
            m.name
          }}</span>
          <span
            class="text-xs font-bold tabular-nums"
            :style="{ color: getGaugeHexColor(lastValue(m.sorted)) }"
          >
            {{ lastValue(m.sorted) }}
          </span>
        </div>
      </div>
    </div>

    <div class="overflow-x-auto">
      <svg
        :viewBox="`0 0 ${W} ${H}`"
        class="w-full"
        aria-label="마켓 비교 트렌드 차트"
      >
        <!-- Y 그리드 -->
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
            :key="`y-${tick}`"
            :x="PAD.left - 6"
            :y="scaleY(tick) + 4"
            font-size="10"
            text-anchor="end"
            class="fill-gray-400 dark:fill-gray-500"
          >
            {{ tick }}
          </text>
        </g>

        <!-- 각 마켓 라인 -->
        <polyline
          v-for="m in sortedMarkets"
          :key="m.id"
          :points="polyline(m.sorted)"
          fill="none"
          :stroke="m.color"
          :stroke-width="activeId === m.id ? 2.5 : 1.5"
          :stroke-opacity="activeId && activeId !== m.id ? 0.3 : 1"
          stroke-linejoin="round"
          stroke-linecap="round"
        />

        <!-- 활성 마켓 마지막 포인트 dot -->
        <circle
          v-for="m in sortedMarkets"
          :key="`dot-${m.id}`"
          :cx="scaleX(pointCount - 1)"
          :cy="scaleY(lastValue(m.sorted))"
          r="3"
          :fill="m.color"
          :fill-opacity="activeId && activeId !== m.id ? 0.3 : 1"
        />

        <!-- X 레이블 -->
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
      </svg>
    </div>
  </BaseCard>
</template>
