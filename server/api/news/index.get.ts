import type { NewsApiItem } from "../../../shared/types/index";

// TODO: DB 연동 후 news 테이블 조회로 교체
// SELECT id, title, source, market_code AS market, url, published_at
// FROM news
// WHERE (market_code = ? OR ? IS NULL)
//   AND (title LIKE '%?%' OR source LIKE '%?%' OR ? IS NULL)
// ORDER BY published_at DESC
// LIMIT ? OFFSET ?

const MOCK_NEWS: NewsApiItem[] = [
  {
    id: 1,
    title: '연준, 기준금리 동결 결정…"추가 데이터 확인 후 인하 검토"',
    source: "Bloomberg",
    publishedAt: "2026-04-08T07:00:00Z",
    market: "sp500",
    url: "#",
  },
  {
    id: 2,
    title: "코스피, 외국인 순매수 5거래일 연속…2,680선 돌파",
    source: "한국경제",
    publishedAt: "2026-04-08T06:00:00Z",
    market: "kospi",
    url: "#",
  },
  {
    id: 3,
    title: "나스닥 기술주 강세…빅테크 1분기 실적 기대감 상승",
    source: "Reuters",
    publishedAt: "2026-04-08T05:00:00Z",
    market: "sp500",
    url: "#",
  },
  {
    id: 4,
    title: "코스닥 바이오 섹터, 임상 3상 발표 앞두고 동반 강세",
    source: "매일경제",
    publishedAt: "2026-04-08T04:00:00Z",
    market: "kosdaq",
    url: "#",
  },
  {
    id: 5,
    title: "달러 인덱스 3주 만에 최저…신흥국 통화 강세 전환",
    source: "WSJ",
    publishedAt: "2026-04-08T03:00:00Z",
    market: "global",
    url: "#",
  },
  {
    id: 6,
    title: "삼성전자, 반도체 신규 라인 투자 확대…코스피 상승 견인",
    source: "한국경제",
    publishedAt: "2026-04-08T02:00:00Z",
    market: "kospi",
    url: "#",
  },
  {
    id: 7,
    title: "S&P 500, 사상 최고치 1% 이내 근접…투자 심리 빠르게 회복",
    source: "CNBC",
    publishedAt: "2026-04-08T01:00:00Z",
    market: "sp500",
    url: "#",
  },
  {
    id: 8,
    title: "코스닥 150 지수 정기 변경…편입 종목 12개 교체",
    source: "연합뉴스",
    publishedAt: "2026-04-07T23:00:00Z",
    market: "kosdaq",
    url: "#",
  },
  {
    id: 9,
    title: 'Fed 파월 의장 "인플레이션 목표 2% 복귀에 인내심 필요"',
    source: "Reuters",
    publishedAt: "2026-04-07T21:00:00Z",
    market: "sp500",
    url: "#",
  },
  {
    id: 10,
    title: "코스피 외국인 1조 순매수…환율 1,340원대 안착",
    source: "연합인포맥스",
    publishedAt: "2026-04-07T20:00:00Z",
    market: "kospi",
    url: "#",
  },
  {
    id: 11,
    title: "미국 CPI 예상치 하회…S&P 500 선물 1.2% 급등",
    source: "Bloomberg",
    publishedAt: "2026-04-07T19:00:00Z",
    market: "sp500",
    url: "#",
  },
  {
    id: 12,
    title: "코스닥 바이오 강세 지속…셀트리온 52주 신고가",
    source: "머니투데이",
    publishedAt: "2026-04-07T18:00:00Z",
    market: "kosdaq",
    url: "#",
  },
  {
    id: 13,
    title: "국제유가, OPEC+ 감산 연장 합의 기대에 2% 상승",
    source: "WSJ",
    publishedAt: "2026-04-07T17:00:00Z",
    market: "global",
    url: "#",
  },
  {
    id: 14,
    title: "중국 경기 부양책 발표…MSCI 신흥시장 지수 반등",
    source: "Financial Times",
    publishedAt: "2026-04-07T15:00:00Z",
    market: "global",
    url: "#",
  },
  {
    id: 15,
    title: "한국 수출 5개월 연속 증가…반도체 호조 견인",
    source: "산업통상자원부",
    publishedAt: "2026-04-07T09:00:00Z",
    market: "kospi",
    url: "#",
  },
  {
    id: 16,
    title: "애플, 아이폰 AI 기능 강화 발표…나스닥 2% 상승",
    source: "CNBC",
    publishedAt: "2026-04-07T08:00:00Z",
    market: "sp500",
    url: "#",
  },
];

const VALID_MARKETS = new Set(["sp500", "kospi", "kosdaq", "global"]);

export default defineEventHandler((event) => {
  const query = getQuery(event);
  const market = (query["market"] as string | undefined) ?? "";
  const limit = Number(query["limit"] ?? 20);
  const offset = Number(query["offset"] ?? 0);
  const q = ((query["q"] as string | undefined) ?? "").trim().toLowerCase();

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

  let result = MOCK_NEWS;

  if (market) {
    result = result.filter((n) => n.market === market);
  }
  if (q) {
    result = result.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.source.toLowerCase().includes(q),
    );
  }

  const total = result.length;
  const data = result.slice(offset, offset + limit);

  return {
    data,
    metadata: { total, limit, offset },
  };
});
