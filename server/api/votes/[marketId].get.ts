import { getVoteSummary } from "../../utils/votes-store";
import { isValidMarketId } from "../../utils/market-config";

export default defineEventHandler((event) => {
  const marketId = getRouterParam(event, "marketId") ?? "";

  if (!isValidMarketId(marketId)) {
    throw createError({
      statusCode: 404,
      statusMessage: `알 수 없는 마켓 ID: ${marketId}`,
    });
  }

  // TODO: DB 연동 후 아래 mock을 교체
  // SELECT bearish, bullish, total FROM votes_daily_summary
  // WHERE market_id = (SELECT id FROM market WHERE market_code = ?)
  //   AND vote_date = CURRENT_DATE
  const data = getVoteSummary(marketId);

  return { data };
});
