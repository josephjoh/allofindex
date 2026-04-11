export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const query = getQuery(event);
  const historyLimit = Number(query["historyLimit"] ?? 30);

  if (!Number.isInteger(historyLimit) || historyLimit < 1 || historyLimit > 365) {
    throw createError({
      statusCode: 400,
      statusMessage: "historyLimit 파라미터는 1~365 사이의 정수여야 합니다.",
    });
  }

  try {
    return await $fetch(`${config.springApiBase}/api/markets`, {
      query: { historyLimit },
    });
  } catch {
    throw createError({
      statusCode: 502,
      statusMessage: "마켓 데이터를 불러올 수 없습니다.",
      data: { code: "UPSTREAM_ERROR" },
    });
  }
});
