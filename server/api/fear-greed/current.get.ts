import type { FearGreedApiResponse } from "../../../shared/types/index";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);

  try {
    const data = await $fetch<FearGreedApiResponse>(config.apiBaseUrl, {
      params: { limit: 1, format: "json" },
      headers: config.apiSecret
        ? { Authorization: `Bearer ${config.apiSecret}` }
        : {},
    });

    return data;
  } catch {
    throw createError({
      statusCode: 502,
      statusMessage: "Fear & Greed Index 데이터를 가져오는데 실패했습니다.",
    });
  }
});
