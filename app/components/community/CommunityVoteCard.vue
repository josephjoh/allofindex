<script setup lang="ts">
const props = defineProps<{ marketId: string }>();

const authStore = useAuthStore();

// ── 모의 커뮤니티 집계 (실제 API 연동 전 mock) ────────────────
const BASE_TOTALS: Record<string, { bearish: number; bullish: number }> = {
  sp500: { bearish: 312, bullish: 748 },
  kospi: { bearish: 524, bullish: 461 },
  kosdaq: { bearish: 687, bullish: 290 },
};

// 투표 후 +1 반영을 위한 로컬 오프셋
const localOffset = reactive({ bearish: 0, bullish: 0 });

const base = computed(
  () => BASE_TOTALS[props.marketId] ?? { bearish: 0, bullish: 0 },
);
const totals = computed(() => ({
  bearish: base.value.bearish + localOffset.bearish,
  bullish: base.value.bullish + localOffset.bullish,
}));
const totalVotes = computed(() => totals.value.bearish + totals.value.bullish);
const bearishPct = computed(() =>
  totalVotes.value
    ? Math.round((totals.value.bearish / totalVotes.value) * 100)
    : 50,
);
const bullishPct = computed(() => 100 - bearishPct.value);

// 커뮤니티 점수 (Bullish % 기반)
const communityScore = computed(() => bullishPct.value);
const communityClassification = computed(() =>
  classifyScore(communityScore.value),
);

// ── 투표 상태 (localStorage, 1일 제한) ───────────────────────
const STORAGE_KEY = computed(() => `vote_${props.marketId}`);

interface VoteRecord {
  vote: "bearish" | "bullish";
  date: string; // YYYY-MM-DD
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

const myVote = ref<"bearish" | "bullish" | null>(null);

onMounted(() => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY.value);
    if (!raw) return;
    const rec: VoteRecord = JSON.parse(raw);
    if (rec.date === todayStr()) myVote.value = rec.vote;
    else localStorage.removeItem(STORAGE_KEY.value);
  } catch {
    // ignore
  }
});

// marketId 바뀌면 투표 상태 재확인
watch(
  () => props.marketId,
  (newId: string) => {
    myVote.value = null;
    localOffset.bearish = 0;
    localOffset.bullish = 0;
    try {
      const raw = localStorage.getItem(`vote_${newId}`);
      if (!raw) return;
      const rec: VoteRecord = JSON.parse(raw);
      if (rec.date === todayStr()) myVote.value = rec.vote;
    } catch {
      // ignore
    }
  },
);

function castVote(choice: "bearish" | "bullish") {
  if (!authStore.isAuthenticated || myVote.value) return;
  myVote.value = choice;
  localOffset[choice]++;
  const rec: VoteRecord = { vote: choice, date: todayStr() };
  localStorage.setItem(STORAGE_KEY.value, JSON.stringify(rec));
  // 실제 API 연동 시: await $fetch('/api/votes', { method: 'POST', body: { marketId, choice } })
}
</script>

<template>
  <BaseCard>
    <!-- 헤더 -->
    <div class="flex items-center justify-between mb-5">
      <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">
        {{ authStore.isAuthenticated ? "커뮤니티 지수" : "사용자 투표" }}
      </h3>
      <span class="text-xs text-gray-400 dark:text-gray-500">
        {{ totalVotes.toLocaleString() }}명 참여
      </span>
    </div>

    <!-- 로그인 사용자: 커뮤니티 지수 표시 -->
    <template v-if="authStore.isAuthenticated">
      <div class="flex flex-col items-center mb-6">
        <p
          class="text-5xl font-bold tabular-nums mb-1"
          :style="{ color: getGaugeHexColor(communityScore) }"
        >
          {{ communityScore }}
        </p>
        <span
          :class="[
            'mt-1 rounded-full px-3 py-0.5 text-sm font-medium',
            getBadgeClass(communityScore),
          ]"
        >
          {{ communityClassification }}
        </span>
      </div>
    </template>

    <!-- 로그인: 투표 전 버튼 표시 -->
    <template v-else-if="!myVote">
      <p class="text-xs text-gray-400 dark:text-gray-500 text-center mb-4">
        오늘의 시장 방향을 예측해보세요
      </p>
      <div class="grid grid-cols-2 gap-3 mb-5">
        <button
          class="flex flex-col items-center gap-1.5 rounded-xl border-2 border-orange-200 dark:border-orange-900/60 bg-orange-50 dark:bg-orange-950/30 py-4 text-orange-600 dark:text-orange-400 hover:border-orange-400 dark:hover:border-orange-600 hover:bg-orange-100 dark:hover:bg-orange-950/60 transition-all"
          @click="castVote('bearish')"
        >
          <svg
            class="w-6 h-6"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 20l-8-8h5V4h6v8h5z" />
          </svg>
          <span class="text-sm font-semibold">Bearish</span>
          <span class="text-xs opacity-70">하락 전망</span>
        </button>
        <button
          class="flex flex-col items-center gap-1.5 rounded-xl border-2 border-green-200 dark:border-green-900/60 bg-green-50 dark:bg-green-950/30 py-4 text-green-600 dark:text-green-400 hover:border-green-400 dark:hover:border-green-600 hover:bg-green-100 dark:hover:bg-green-950/60 transition-all"
          @click="castVote('bullish')"
        >
          <svg
            class="w-6 h-6"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 4l8 8h-5v8H9v-8H4z" />
          </svg>
          <span class="text-sm font-semibold">Bullish</span>
          <span class="text-xs opacity-70">상승 전망</span>
        </button>
      </div>
    </template>

    <!-- 로그인: 투표 완료 후 결과 표시 -->
    <template v-else>
      <div class="flex items-center justify-center gap-2 mb-4">
        <span
          class="text-xs font-medium"
          :class="
            myVote === 'bullish'
              ? 'text-green-600 dark:text-green-400'
              : 'text-orange-600 dark:text-orange-400'
          "
        >
          {{ myVote === "bullish" ? "상승(Bullish)" : "하락(Bearish)" }}에
          투표하셨습니다
        </span>
      </div>
    </template>

    <!-- 로그인: 투표 결과 바 -->
    <template v-if="authStore.isAuthenticated">
      <div class="space-y-2">
        <!-- Bearish 바 -->
        <div>
          <div class="flex justify-between text-xs mb-1">
            <span class="font-medium text-orange-600 dark:text-orange-400"
              >Bearish (하락)</span
            >
            <span class="tabular-nums text-gray-500 dark:text-gray-400"
              >{{ bearishPct }}%</span
            >
          </div>
          <div
            class="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden"
          >
            <div
              class="h-full rounded-full bg-orange-400 dark:bg-orange-500 transition-all duration-700"
              :style="{ width: `${bearishPct}%` }"
            />
          </div>
        </div>
        <!-- Bullish 바 -->
        <div>
          <div class="flex justify-between text-xs mb-1">
            <span class="font-medium text-green-600 dark:text-green-400"
              >Bullish (상승)</span
            >
            <span class="tabular-nums text-gray-500 dark:text-gray-400"
              >{{ bullishPct }}%</span
            >
          </div>
          <div
            class="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden"
          >
            <div
              class="h-full rounded-full bg-green-500 dark:bg-green-600 transition-all duration-700"
              :style="{ width: `${bullishPct}%` }"
            />
          </div>
        </div>
      </div>

      <p class="mt-3 text-center text-xs text-gray-400 dark:text-gray-500">
        오늘 자정에 초기화됩니다
      </p>
    </template>

    <!-- 비로그인: 로그인 유도 -->
    <template v-if="!authStore.isAuthenticated">
      <div
        class="mt-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 px-4 py-3 text-center"
      >
        <p class="text-xs text-gray-400 dark:text-gray-500">
          <NuxtLink
            to="/auth/login"
            class="text-primary-500 hover:text-primary-600 dark:text-primary-400 font-medium transition-colors"
          >
            로그인
          </NuxtLink>
          하면 투표 및 커뮤니티 지수를 확인할 수 있어요
        </p>
      </div>
    </template>
  </BaseCard>
</template>
