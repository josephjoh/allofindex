import type { KeywordApiItem } from "../../../shared/types/index";

// TODO: DB 연동 후 keywords 테이블 조회로 교체
// SELECT rank, keyword, count, trend
// FROM keywords
// WHERE snapshot_date = (SELECT MAX(snapshot_date) FROM keywords WHERE source = ?)
//   AND source = ?
// ORDER BY rank
// LIMIT ?

const MOCK_KEYWORDS: Record<string, KeywordApiItem[]> = {
  naver: [
    { rank: 1, keyword: "금리", count: 12450, trend: "up" },
    { rank: 2, keyword: "연준(Fed)", count: 9832, trend: "up" },
    { rank: 3, keyword: "반도체", count: 8210, trend: "down" },
    { rank: 4, keyword: "인플레이션", count: 7650, trend: "same" },
    { rank: 5, keyword: "달러", count: 6430, trend: "up" },
    { rank: 6, keyword: "빅테크", count: 5890, trend: "down" },
    { rank: 7, keyword: "FOMC", count: 4320, trend: "up" },
    { rank: 8, keyword: "유가", count: 3780, trend: "same" },
    { rank: 9, keyword: "경기침체", count: 3210, trend: "down" },
    { rank: 10, keyword: "채권", count: 2650, trend: "same" },
    { rank: 11, keyword: "코스피", count: 2410, trend: "up" },
    { rank: 12, keyword: "삼성전자", count: 2180, trend: "same" },
    { rank: 13, keyword: "원달러환율", count: 1950, trend: "down" },
    { rank: 14, keyword: "외국인매수", count: 1720, trend: "up" },
    { rank: 15, keyword: "국고채", count: 1530, trend: "same" },
  ],
  google: [
    { rank: 1, keyword: "Federal Reserve", count: 98500, trend: "up" },
    { rank: 2, keyword: "S&P 500", count: 87200, trend: "up" },
    { rank: 3, keyword: "inflation", count: 74300, trend: "same" },
    { rank: 4, keyword: "interest rate", count: 65100, trend: "down" },
    { rank: 5, keyword: "NVIDIA", count: 58900, trend: "up" },
    { rank: 6, keyword: "recession", count: 47600, trend: "down" },
    { rank: 7, keyword: "oil price", count: 38400, trend: "same" },
    { rank: 8, keyword: "crypto", count: 32100, trend: "up" },
    { rank: 9, keyword: "USD", count: 28700, trend: "same" },
    { rank: 10, keyword: "treasury yield", count: 24300, trend: "down" },
  ],
};

const UPDATED_AT = "2026-04-08T06:00:00Z";

export default defineEventHandler((event) => {
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

  const all = MOCK_KEYWORDS[source] ?? [];
  const data = all.slice(0, limit);

  return {
    data,
    metadata: { updatedAt: UPDATED_AT, source },
  };
});
