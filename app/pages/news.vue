<script setup lang="ts">
import type { NewsItem } from "~/types";

definePageMeta({ layout: "default" });

useHead({ title: "뉴스 — All of Index" });

const allNews: NewsItem[] = [
  {
    id: 1,
    title: '연준, 기준금리 동결 결정…"추가 데이터 확인 후 인하 검토"',
    source: "Bloomberg",
    time: "2시간 전",
    market: "sp500",
    url: "#",
  },
  {
    id: 2,
    title: "코스피, 외국인 순매수 5거래일 연속…2,680선 돌파",
    source: "한국경제",
    time: "3시간 전",
    market: "kospi",
    url: "#",
  },
  {
    id: 3,
    title: "나스닥 기술주 강세…빅테크 1분기 실적 기대감 상승",
    source: "Reuters",
    time: "4시간 전",
    market: "sp500",
    url: "#",
  },
  {
    id: 4,
    title: "코스닥 바이오 섹터, 임상 3상 발표 앞두고 동반 강세",
    source: "매일경제",
    time: "5시간 전",
    market: "kosdaq",
    url: "#",
  },
  {
    id: 5,
    title: "달러 인덱스 3주 만에 최저…신흥국 통화 강세 전환",
    source: "WSJ",
    time: "6시간 전",
    market: "global",
    url: "#",
  },
  {
    id: 6,
    title: "삼성전자, 반도체 신규 라인 투자 확대…코스피 상승 견인",
    source: "한국경제",
    time: "7시간 전",
    market: "kospi",
    url: "#",
  },
  {
    id: 7,
    title: "S&P 500, 사상 최고치 1% 이내 근접…투자 심리 빠르게 회복",
    source: "CNBC",
    time: "8시간 전",
    market: "sp500",
    url: "#",
  },
  {
    id: 8,
    title: "코스닥 150 지수 정기 변경…편입 종목 12개 교체",
    source: "연합뉴스",
    time: "10시간 전",
    market: "kosdaq",
    url: "#",
  },
  {
    id: 9,
    title: 'Fed 파월 의장 "인플레이션 목표 2% 복귀에 인내심 필요"',
    source: "Reuters",
    time: "12시간 전",
    market: "sp500",
    url: "#",
  },
  {
    id: 10,
    title: "코스피 외국인 1조 순매수…환율 1,340원대 안착",
    source: "연합인포맥스",
    time: "13시간 전",
    market: "kospi",
    url: "#",
  },
  {
    id: 11,
    title: "미국 CPI 예상치 하회…S&P 500 선물 1.2% 급등",
    source: "Bloomberg",
    time: "14시간 전",
    market: "sp500",
    url: "#",
  },
  {
    id: 12,
    title: "코스닥 바이오 강세 지속…셀트리온 52주 신고가",
    source: "머니투데이",
    time: "15시간 전",
    market: "kosdaq",
    url: "#",
  },
  {
    id: 13,
    title: "국제유가, OPEC+ 감산 연장 합의 기대에 2% 상승",
    source: "WSJ",
    time: "16시간 전",
    market: "global",
    url: "#",
  },
  {
    id: 14,
    title: "중국 경기 부양책 발표…MSCI 신흥시장 지수 반등",
    source: "Financial Times",
    time: "18시간 전",
    market: "global",
    url: "#",
  },
  {
    id: 15,
    title: "한국 수출 5개월 연속 증가…반도체 호조 견인",
    source: "산업통상자원부",
    time: "1일 전",
    market: "kospi",
    url: "#",
  },
  {
    id: 16,
    title: "애플, 아이폰 AI 기능 강화 발표…나스닥 2% 상승",
    source: "CNBC",
    time: "1일 전",
    market: "sp500",
    url: "#",
  },
];

// 검색용 lowercase 인덱스 — 데이터가 정적이므로 한 번만 계산
const searchIndex = new Map(
  allNews.map((n) => [
    n.id,
    { t: n.title.toLowerCase(), s: n.source.toLowerCase() },
  ]),
);

const searchQuery = ref("");
const activeFilter = ref("all");

const filters = [
  { value: "all", label: "전체" },
  { value: "sp500", label: "S&P 500" },
  { value: "kospi", label: "KOSPI" },
  { value: "kosdaq", label: "KOSDAQ" },
  { value: "global", label: "글로벌" },
];

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

const filtered = computed(() => {
  let result = allNews;
  if (activeFilter.value !== "all") {
    result = result.filter((n) => n.market === activeFilter.value);
  }
  const q = searchQuery.value.trim().toLowerCase();
  if (q) {
    result = result.filter((n) => {
      const idx = searchIndex.get(n.id)!;
      return idx.t.includes(q) || idx.s.includes(q);
    });
  }
  return result;
});

function clearSearch() {
  searchQuery.value = "";
}
</script>

<template>
  <div class="space-y-6">
    <!-- 페이지 헤더 -->
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">뉴스</h1>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        주요 시장 뉴스를 시장별로 확인하세요
      </p>
    </div>

    <!-- 검색 + 필터 -->
    <BaseCard padding="none">
      <div class="px-4 pt-4 pb-0">
        <!-- 검색창 -->
        <div class="relative mb-4">
          <div
            class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"
          >
            <svg
              class="h-4 w-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="뉴스 제목 또는 출처 검색..."
            class="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 py-2.5 pl-9 pr-9 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-colors"
          />
          <button
            v-if="searchQuery"
            class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            @click="clearSearch"
          >
            <svg
              class="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <!-- 마켓 필터 탭 -->
        <div
          class="flex gap-0 border-b border-gray-200 dark:border-gray-700 -mx-4 px-4"
        >
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

      <!-- 결과 수 -->
      <div
        class="px-4 py-2 text-xs text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-gray-800"
      >
        {{ filtered.length }}건
        <span v-if="searchQuery">— "{{ searchQuery }}" 검색 결과</span>
      </div>

      <!-- 뉴스 목록 -->
      <div v-if="!filtered.length" class="py-16 text-center">
        <p class="text-sm text-gray-400 dark:text-gray-500">
          검색 결과가 없습니다
        </p>
        <button
          class="mt-2 text-xs text-primary-500 hover:text-primary-600 transition-colors"
          @click="clearSearch"
        >
          검색 초기화
        </button>
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
            class="block px-4 py-3.5"
          >
            <div class="flex items-start justify-between gap-3">
              <p
                class="text-sm text-gray-800 dark:text-gray-200 leading-snug flex-1"
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
              <span
                class="text-xs font-medium text-gray-500 dark:text-gray-400"
                >{{ item.source }}</span
              >
              <span class="text-gray-200 dark:text-gray-700">·</span>
              <span class="text-xs text-gray-400 dark:text-gray-500">{{
                item.time
              }}</span>
            </div>
          </a>
        </li>
      </ul>
    </BaseCard>
  </div>
</template>
