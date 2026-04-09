import type { FearGreedApiResponse } from "../../../shared/types/index";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const query = getQuery(event);
  const limit = Number(query["limit"] ?? 30);

  // limit 파라미터 유효성 검사
  if (!Number.isInteger(limit) || limit < 1 || limit > 365) {
    throw createError({
      statusCode: 400,
      statusMessage: "limit 파라미터는 1~365 사이의 정수여야 합니다.",
    });
  }

  try {
    const data = await $fetch<FearGreedApiResponse>(config.apiBaseUrl, {
      params: { limit, format: "json" },
      headers: config.apiSecret
        ? { Authorization: `Bearer ${config.apiSecret}` }
        : {},
    });

    return data;
  } catch {
    throw createError({
      statusCode: 502,
      statusMessage: "외부 API에 연결할 수 없습니다.",
    });
  }
});
