const VALID_MARKET_IDS = ["sp500", "kospi", "kosdaq"];

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const id = getRouterParam(event, "id") ?? "";
  const query = getQuery(event);
  const limit = Number(query["limit"] ?? 30);

  if (!VALID_MARKET_IDS.includes(id)) {
    throw createError({
      statusCode: 404,
      statusMessage: `알 수 없는 마켓 ID: ${id}`,
    });
  }

  if (!Number.isInteger(limit) || limit < 1 || limit > 365) {
    throw createError({
      statusCode: 400,
      statusMessage: "limit 파라미터는 1~365 사이의 정수여야 합니다.",
    });
  }

  try {
    return await $fetch(`${config.springApiBase}/api/markets/${id}`, {
      query: { limit },
    });
  } catch {
    throw createError({
      statusCode: 502,
      statusMessage: "마켓 상세 데이터를 불러올 수 없습니다.",
      data: { code: "UPSTREAM_ERROR" },
    });
  }
});
