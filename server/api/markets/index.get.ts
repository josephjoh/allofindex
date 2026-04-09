import {
  buildMarketSummary,
  VALID_MARKET_IDS,
} from "../../utils/market-config";

export default defineEventHandler((event) => {
  const query = getQuery(event);
  const historyLimit = Number(query["historyLimit"] ?? 30);

  if (!Number.isInteger(historyLimit) || historyLimit < 1 || historyLimit > 365) {
    throw createError({
      statusCode: 400,
      statusMessage: "historyLimit 파라미터는 1~365 사이의 정수여야 합니다.",
    });
  }

  // TODO: DB 연동 후 아래 mock을 교체
  // SELECT m.*, mh.score, mh.grade, mh.trade_date
  // FROM market m
  // LEFT JOIN market_history mh ON mh.market_id = m.id
  // WHERE mh.trade_date >= CURRENT_DATE - INTERVAL historyLimit DAY
  // ORDER BY mh.trade_date DESC
  const data = VALID_MARKET_IDS.map((id) =>
    buildMarketSummary(id, historyLimit),
  );

  return {
    data,
    metadata: { historyLimit },
  };
});
