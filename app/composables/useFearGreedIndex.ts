import type {
  FearGreedApiResponse,
  FearGreedReading,
} from "~/types/fear-greed";
import { API_ENDPOINTS } from "~/utils/constants";

/**
 * useFearGreedIndex — SSR-safe Fear & Greed 지수 데이터 composable
 *
 * useFetch를 사용하여 서버 렌더링 시 자동 데이터 패칭 및 클라이언트 하이드레이션을 지원합니다.
 */
export const useFearGreedIndex = () => {
  /**
   * 현재 지수 — SSR-safe, 자동 중복 제거, key로 캐시됨
   */
  const {
    data: currentData,
    pending: currentPending,
    error: currentError,
    refresh: refreshCurrent,
  } = useFetch<FearGreedApiResponse>(API_ENDPOINTS.FEAR_GREED_CURRENT, {
    ...useFetchOptions<FearGreedApiResponse>(),
    key: "fear-greed-current",
  });

  const currentReading = computed<FearGreedReading | null>(
    () => currentData.value?.data?.[0] ?? null,
  );

  /**
   * 히스토리 데이터 — lazy 로딩 (페이지 컴포넌트에서 명시적 호출)
   */
  const fetchHistory = (limit = 30) =>
    useFetch<FearGreedApiResponse>(API_ENDPOINTS.FEAR_GREED_HISTORY, {
      ...useFetchOptions<FearGreedApiResponse>(),
      key: `fear-greed-history-${limit}`,
      params: { limit },
      lazy: true,
    });

  return {
    currentReading,
    currentPending,
    currentError,
    refreshCurrent,
    fetchHistory,
  };
};
