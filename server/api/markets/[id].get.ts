import {
  buildMarketDetail,
  isValidMarketId,
} from "../../utils/market-config";

export default defineEventHandler((event) => {
  const id = getRouterParam(event, "id") ?? "";
  const query = getQuery(event);
  const limit = Number(query["limit"] ?? 30);

  if (!isValidMarketId(id)) {
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

  // TODO: DB 연동 후 아래 mock을 교체
  // 1. SELECT * FROM market WHERE market_code = id
  // 2. SELECT * FROM market_indicators WHERE market_id = ? ORDER BY sort_order
  // 3. SELECT score, grade, trade_date FROM market_history
  //    WHERE market_id = ? AND trade_date >= CURRENT_DATE - INTERVAL limit DAY
  //    ORDER BY trade_date DESC
  const data = buildMarketDetail(id, limit);

  return {
    data,
    metadata: { market: id, limit, count: data.history.length },
  };
});
