import type { VoteRequest } from "../../../shared/types/index";

const VALID_MARKET_IDS = ["sp500", "kospi", "kosdaq"];

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  const authToken = getCookie(event, "auth_token");
  if (!authToken) {
    throw createError({
      statusCode: 401,
      statusMessage: "로그인이 필요합니다.",
    });
  }

  const body = await readBody<VoteRequest>(event);

  if (!body?.marketId || !VALID_MARKET_IDS.includes(body.marketId)) {
    throw createError({
      statusCode: 400,
      statusMessage: "유효하지 않은 marketId입니다.",
    });
  }

  if (body.choice !== "bearish" && body.choice !== "bullish") {
    throw createError({
      statusCode: 400,
      statusMessage: "choice는 'bearish' 또는 'bullish'여야 합니다.",
    });
  }

  try {
    const data = await $fetch(`${config.springApiBase}/api/votes`, {
      method: "POST",
      body,
      headers: { Authorization: `Bearer ${authToken}` },
    });
    setResponseStatus(event, 201);
    return data;
  } catch (err: unknown) {
    const statusCode = (err as { statusCode?: number })?.statusCode;
    if (statusCode === 409) {
      throw createError({
        statusCode: 409,
        statusMessage: "오늘 이미 투표하셨습니다. 자정 이후 다시 투표할 수 있습니다.",
        data: { code: "DUPLICATE_VOTE" },
      });
    }
    throw createError({
      statusCode: 502,
      statusMessage: "투표 처리 중 오류가 발생했습니다.",
      data: { code: "UPSTREAM_ERROR" },
    });
  }
});
