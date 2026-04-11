const VALID_MARKET_IDS = ["sp500", "kospi", "kosdaq"];

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const marketId = getRouterParam(event, "marketId") ?? "";

  if (!VALID_MARKET_IDS.includes(marketId)) {
    throw createError({
      statusCode: 404,
      statusMessage: `알 수 없는 마켓 ID: ${marketId}`,
    });
  }

  try {
    return await $fetch(`${config.springApiBase}/api/votes/${marketId}`);
  } catch {
    throw createError({
      statusCode: 502,
      statusMessage: "투표 데이터를 불러올 수 없습니다.",
      data: { code: "UPSTREAM_ERROR" },
    });
  }
});
