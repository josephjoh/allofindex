<script setup lang="ts">
const props = defineProps<{
  value: number;
}>();

// ── SVG 좌표계 ────────────────────────────────────────────────
const cx = 160;
const cy = 148;
const outerR = 120;
const innerR = 80;
const tickR = outerR + 10;
const labelR = outerR + 28;

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

// value 0 → 180°(left), value 100 → 0°(right)  [수학 각도 기준]
function valueToAngle(v: number) {
  return 180 - v * 1.8;
}

function polar(angleDeg: number, r: number) {
  const rad = toRad(angleDeg);
  return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) };
}

function arcPath(v1: number, v2: number, iR: number, oR: number) {
  const a1 = valueToAngle(v1);
  const a2 = valueToAngle(v2);
  const o1 = polar(a1, oR);
  const o2 = polar(a2, oR);
  const i1 = polar(a1, iR);
  const i2 = polar(a2, iR);
  const large = Math.abs(a1 - a2) > 180 ? 1 : 0;
  return (
    `M ${o1.x.toFixed(2)} ${o1.y.toFixed(2)} ` +
    `A ${oR} ${oR} 0 ${large} 0 ${o2.x.toFixed(2)} ${o2.y.toFixed(2)} ` +
    `L ${i2.x.toFixed(2)} ${i2.y.toFixed(2)} ` +
    `A ${iR} ${iR} 0 ${large} 1 ${i1.x.toFixed(2)} ${i1.y.toFixed(2)} Z`
  );
}

const segments = [
  { v1: 0, v2: 25, color: "#c0392b", lines: ["Extreme", "Fear"] },
  { v1: 25, v2: 45, color: "#e67e22", lines: ["Fear"] },
  { v1: 45, v2: 55, color: "#f1c40f", lines: ["Neutral"] },
  { v1: 55, v2: 75, color: "#27ae60", lines: ["Greed"] },
  { v1: 75, v2: 100, color: "#1a7a3c", lines: ["Extreme", "Greed"] },
];

const tickValues = [0, 25, 45, 55, 75, 100];

const segmentLabels = computed(() =>
  segments.map((seg) => {
    const mid = (seg.v1 + seg.v2) / 2;
    const ang = valueToAngle(mid);
    const pos = polar(ang, labelR);
    return { ...seg, pos, ang };
  }),
);

// ── 바늘 ─────────────────────────────────────────────────────
const needleAngle = computed(() => valueToAngle(props.value));
const needleTip = computed(() => polar(needleAngle.value, outerR - 8));
const needleBack = computed(() => polar(needleAngle.value + 180, 14));

// ── 분류 텍스트 ───────────────────────────────────────────────
const classificationLabel = computed(() => {
  if (props.value <= 24) return "Extreme Fear";
  if (props.value <= 44) return "Fear";
  if (props.value <= 54) return "Neutral";
  if (props.value <= 74) return "Greed";
  return "Extreme Greed";
});

const classColor = computed(() => {
  if (props.value <= 24) return "#c0392b";
  if (props.value <= 44) return "#e67e22";
  if (props.value <= 54) return "#d4ac0d";
  if (props.value <= 74) return "#27ae60";
  return "#1a7a3c";
});
</script>

<template>
  <BaseCard>
    <div class="flex flex-col items-center">
      <!-- 제목 -->
      <p
        class="text-xs font-semibold tracking-widest uppercase text-gray-400 dark:text-gray-500 mb-1"
      >
        Fear &amp; Greed Index
      </p>

      <!-- SVG 게이지 -->
      <svg
        viewBox="0 0 320 200"
        class="w-full max-w-sm"
        aria-label="`Fear & Greed Gauge: ${value}`"
      >
        <!-- 배경 트랙 (연한 회색) -->
        <path
          :d="arcPath(0, 100, innerR - 2, outerR + 2)"
          class="fill-gray-100 dark:fill-gray-800"
        />

        <!-- 5색 구간 -->
        <path
          v-for="seg in segments"
          :key="seg.v1"
          :d="arcPath(seg.v1, seg.v2, innerR, outerR)"
          :fill="seg.color"
        />

        <!-- 구간 경계 눈금 -->
        <g v-for="tv in tickValues" :key="`tick-${tv}`">
          <line
            :x1="polar(valueToAngle(tv), outerR - 1).x"
            :y1="polar(valueToAngle(tv), outerR - 1).y"
            :x2="polar(valueToAngle(tv), tickR).x"
            :y2="polar(valueToAngle(tv), tickR).y"
            class="stroke-white dark:stroke-gray-900"
            stroke-width="2.5"
          />
        </g>

        <!-- 구간 레이블 (2줄 지원) -->
        <g v-for="lbl in segmentLabels" :key="`lbl-${lbl.v1}`">
          <text
            v-if="lbl.lines.length === 1"
            :x="lbl.pos.x.toFixed(2)"
            :y="lbl.pos.y.toFixed(2)"
            text-anchor="middle"
            dominant-baseline="middle"
            font-size="7.5"
            font-weight="600"
            class="fill-gray-600 dark:fill-gray-400"
          >
            {{ lbl.lines[0] }}
          </text>
          <g v-else>
            <text
              :x="lbl.pos.x.toFixed(2)"
              :y="(lbl.pos.y - 5).toFixed(2)"
              text-anchor="middle"
              dominant-baseline="middle"
              font-size="7.5"
              font-weight="600"
              class="fill-gray-600 dark:fill-gray-400"
            >
              {{ lbl.lines[0] }}
            </text>
            <text
              :x="lbl.pos.x.toFixed(2)"
              :y="(lbl.pos.y + 5).toFixed(2)"
              text-anchor="middle"
              dominant-baseline="middle"
              font-size="7.5"
              font-weight="600"
              class="fill-gray-600 dark:fill-gray-400"
            >
              {{ lbl.lines[1] }}
            </text>
          </g>
        </g>

        <!-- 구간 경계 숫자 (0, 100) -->
        <text
          :x="polar(valueToAngle(0), tickR + 8).x"
          :y="polar(valueToAngle(0), tickR + 8).y"
          text-anchor="middle"
          dominant-baseline="middle"
          font-size="8"
          class="fill-gray-400 dark:fill-gray-500"
        >
          0
        </text>
        <text
          :x="polar(valueToAngle(100), tickR + 8).x"
          :y="polar(valueToAngle(100), tickR + 8).y"
          text-anchor="middle"
          dominant-baseline="middle"
          font-size="8"
          class="fill-gray-400 dark:fill-gray-500"
        >
          100
        </text>

        <!-- 바늘 -->
        <line
          :x1="needleBack.x.toFixed(2)"
          :y1="needleBack.y.toFixed(2)"
          :x2="needleTip.x.toFixed(2)"
          :y2="needleTip.y.toFixed(2)"
          class="stroke-gray-900 dark:stroke-white"
          stroke-width="3"
          stroke-linecap="round"
        />
        <!-- 바늘 중심 원 -->
        <circle :cx="cx" :cy="cy" r="9" class="fill-gray-900 dark:fill-white" />
        <circle :cx="cx" :cy="cy" r="5" class="fill-white dark:fill-gray-900" />

        <!-- 중앙 대형 수치 -->
        <text
          :x="cx"
          :y="cy + 30"
          text-anchor="middle"
          font-size="36"
          font-weight="800"
          :fill="classColor"
        >
          {{ value }}
        </text>

        <!-- 분류 레이블 -->
        <text
          :x="cx"
          :y="cy + 52"
          text-anchor="middle"
          font-size="10"
          font-weight="700"
          letter-spacing="1"
          :fill="classColor"
        >
          {{ classificationLabel.toUpperCase() }}
        </text>
      </svg>
    </div>
  </BaseCard>
</template>
