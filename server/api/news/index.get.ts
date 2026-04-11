const VALID_MARKETS = new Set(["sp500", "kospi", "kosdaq", "global"]);

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const query = getQuery(event);
  const market = (query["market"] as string | undefined) ?? "";
  const limit = Number(query["limit"] ?? 20);
  const offset = Number(query["offset"] ?? 0);
  const q = (query["q"] as string | undefined) ?? "";

  if (market && !VALID_MARKETS.has(market)) {
    throw createError({
      statusCode: 400,
      statusMessage: "market은 sp500, kospi, kosdaq, global 중 하나여야 합니다.",
    });
  }
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw createError({
      statusCode: 400,
      statusMessage: "limit 파라미터는 1~100 사이의 정수여야 합니다.",
    });
  }
  if (!Number.isInteger(offset) || offset < 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "offset 파라미터는 0 이상의 정수여야 합니다.",
    });
  }

  try {
    return await $fetch(`${config.springApiBase}/api/news`, {
      query: { market: market || undefined, limit, offset, q: q || undefined },
    });
  } catch {
    throw createError({
      statusCode: 502,
      statusMessage: "뉴스 데이터를 불러올 수 없습니다.",
      data: { code: "UPSTREAM_ERROR" },
    });
  }
});
