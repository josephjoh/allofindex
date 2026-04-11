export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const query = getQuery(event);
  const limit = Number(query["limit"] ?? 10);
  const source = (query["source"] as string | undefined) ?? "naver";

  if (!Number.isInteger(limit) || limit < 1 || limit > 30) {
    throw createError({
      statusCode: 400,
      statusMessage: "limit 파라미터는 1~30 사이의 정수여야 합니다.",
    });
  }
  if (source !== "naver" && source !== "google") {
    throw createError({
      statusCode: 400,
      statusMessage: "source는 'naver' 또는 'google'이어야 합니다.",
    });
  }

  try {
    return await $fetch(`${config.springApiBase}/api/keywords`, {
      query: { limit, source },
    });
  } catch {
    throw createError({
      statusCode: 502,
      statusMessage: "키워드 데이터를 불러올 수 없습니다.",
      data: { code: "UPSTREAM_ERROR" },
    });
  }
});
