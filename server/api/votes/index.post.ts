import type { VoteRequest } from "../../../shared/types/index";
import { castVote } from "../../utils/votes-store";
import { isValidMarketId } from "../../utils/market-config";

export default defineEventHandler(async (event) => {
  // 🔒 인증 확인
  // TODO: 실제 JWT 검증으로 교체
  // const token = getCookie(event, 'auth_token')
  // if (!token) throw createError({ statusCode: 401, ... })
  // const user = verifyJwt(token)
  const authToken = getCookie(event, "auth_token");
  if (!authToken) {
    throw createError({
      statusCode: 401,
      statusMessage: "로그인이 필요합니다.",
    });
  }

  // TODO: JWT에서 userId 추출 (현재는 토큰 값을 userId로 사용)
  const userId = authToken;

  const body = await readBody<VoteRequest>(event);

  if (!body?.marketId || !isValidMarketId(body.marketId)) {
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
    // TODO: DB 연동 후 아래 mock을 교체
    // 1. INSERT INTO votes (user_id, market_id, choice, vote_date) VALUES (...)
    //    ON CONFLICT → 409
    // 2. INSERT INTO votes_daily_summary ... ON CONFLICT DO UPDATE SET ...
    // 3. SELECT 집계 반환
    const data = castVote(userId, body.marketId, body.choice);

    setResponseStatus(event, 201);
    return { data };
  } catch (err) {
    if (err instanceof Error && err.message === "DUPLICATE_VOTE") {
      throw createError({
        statusCode: 409,
        statusMessage: "오늘 이미 투표하셨습니다. 자정 이후 다시 투표할 수 있습니다.",
        data: { code: "DUPLICATE_VOTE" },
      });
    }
    throw createError({ statusCode: 500, statusMessage: "투표 처리 중 오류가 발생했습니다." });
  }
});
