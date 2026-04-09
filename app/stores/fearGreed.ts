import type {
  FearGreedReading,
  FearGreedHistoryEntry,
} from "~/types/fear-greed";
import { getClassificationColor } from "~/utils/formatters";
import { CACHE_TTL_MS } from "~/utils/constants";

export const useFearGreedStore = defineStore("fearGreed", () => {
  // State
  const currentReading = ref<FearGreedReading | null>(null);
  const history = ref<FearGreedHistoryEntry[]>([]);
  const lastFetchedAt = ref<Date | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const hasData = computed(() => currentReading.value !== null);

  const isFresh = computed(() => {
    if (!lastFetchedAt.value) return false;
    return (
      Date.now() - lastFetchedAt.value.getTime() < CACHE_TTL_MS.CURRENT_INDEX
    );
  });

  const classificationColor = computed(() => {
    if (!currentReading.value) return "text-gray-400";
    return getClassificationColor(currentReading.value.value_classification);
  });

  const currentValue = computed(() => currentReading.value?.value ?? 0);

  // Actions
  const setCurrentReading = (reading: FearGreedReading) => {
    currentReading.value = reading;
    lastFetchedAt.value = new Date();
    error.value = null;
  };

  const setHistory = (entries: FearGreedHistoryEntry[]) => {
    history.value = entries;
  };

  const setError = (message: string) => {
    error.value = message;
  };

  const setLoading = (loading: boolean) => {
    isLoading.value = loading;
  };

  return {
    currentReading: readonly(currentReading),
    history: readonly(history),
    lastFetchedAt: readonly(lastFetchedAt),
    isLoading,
    error: readonly(error),
    hasData,
    isFresh,
    classificationColor,
    currentValue,
    setCurrentReading,
    setHistory,
    setError,
    setLoading,
  };
});
