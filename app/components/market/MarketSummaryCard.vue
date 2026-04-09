<script setup lang="ts">
import type { FearGreedClassification } from "~/types";

interface Props {
  id: string;
  name: string;
  value: number;
  classification: FearGreedClassification;
  sparkline: number[];
  active?: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{ select: [id: string] }>();

const W = 80;
const H = 28;

const sparklinePoints = computed(() => {
  const data = props.sparkline;
  if (data.length < 2) return "";
  let min = data[0] ?? 0;
  let max = data[0] ?? 0;
  for (let i = 1; i < data.length; i++) {
    const v = data[i] ?? 0;
    if (v < min) min = v;
    if (v > max) max = v;
  }
  const range = max - min || 1;
  return data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * W;
      const y = H - ((v - min) / range) * (H - 6) - 3;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
});

const strokeColor = computed(() => {
  if (props.value <= 20) return "#dc2626";
  if (props.value <= 40) return "#ea580c";
  if (props.value <= 60) return "#ca8a04";
  if (props.value <= 80) return "#16a34a";
  return "#15803d";
});

const badgeClass = computed(() => {
  if (props.value <= 20)
    return "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300";
  if (props.value <= 40)
    return "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300";
  if (props.value <= 60)
    return "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300";
  if (props.value <= 80)
    return "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300";
  return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300";
});
</script>

<template>
  <div
    :class="[
      'w-full text-left rounded-xl border-2 p-4 transition-all duration-200 cursor-pointer',
      'bg-white dark:bg-gray-900',
      active
        ? 'border-primary-500 shadow-lg shadow-primary-100 dark:shadow-primary-950/30'
        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md',
    ]"
    role="button"
    tabindex="0"
    @click="emit('select', id)"
    @keydown.enter.space.prevent="emit('select', id)"
  >
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <p
          class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1"
        >
          {{ name }}
        </p>
        <p
          class="text-3xl font-bold tabular-nums text-gray-900 dark:text-white leading-none"
        >
          {{ value }}
        </p>
        <span
          :class="[
            'mt-2 inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
            badgeClass,
          ]"
        >
          {{ classification }}
        </span>
      </div>

      <!-- 스파크라인 -->
      <svg
        :viewBox="`0 0 ${W} ${H}`"
        class="w-20 h-7 shrink-0 mt-1"
        aria-hidden="true"
      >
        <polyline
          :points="sparklinePoints"
          fill="none"
          :stroke="strokeColor"
          stroke-width="2"
          stroke-linejoin="round"
          stroke-linecap="round"
        />
      </svg>
    </div>

    <!-- 상세보기 링크 -->
    <div
      class="mt-3 pt-2 border-t border-gray-100 dark:border-gray-700/50 flex justify-end"
    >
      <NuxtLink
        :to="`/indices/${id}`"
        class="text-xs text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
        @click.stop
      >
        상세보기 →
      </NuxtLink>
    </div>
  </div>
</template>
