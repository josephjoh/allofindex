import type {
  FearGreedClassification,
  HistoryEntry,
  MarketDetail,
  MarketSummary,
  SubIndicator,
} from "../../shared/types/index";

// ── 마켓 코드 허용 목록 ────────────────────────────────────────
export const VALID_MARKET_IDS = ["sp500", "kospi", "kosdaq"] as const;
export type MarketId = (typeof VALID_MARKET_IDS)[number];

export function isValidMarketId(id: string): id is MarketId {
  return VALID_MARKET_IDS.includes(id as MarketId);
}

// ── Gap 1: market 테이블에 없는 FE 표시용 메타 ────────────────
// TODO: market 테이블에 name_ko, region, description 컬럼 추가 후 DB 조회로 교체
const MARKET_META: Record<
  MarketId,
  { nameKo: string; region: string; description: string }
> = {
  sp500: {
    nameKo: "미국 주식",
    region: "미국",
    description:
      "S&P 500 기반 7개 지표의 동일 가중치 평균. NYSE 시황, VIX, 풋/콜 비율 등을 반영합니다.",
  },
  kospi: {
    nameKo: "한국 주식 (코스피)",
    region: "한국",
    description:
      "VKOSPI, KOSPI 모멘텀, 주가 강도 등 6개 지표를 가중 평균해 산출합니다.",
  },
  kosdaq: {
    nameKo: "한국 주식 (코스닥)",
    region: "한국",
    description:
      "KOSDAQ 전용 변동성·모멘텀·강도 지표를 바탕으로 코스닥 심리를 수치화합니다.",
  },
};

// ── market_indicators 초기 데이터 (indicator 설명 포함) ────────
// TODO: market_indicators 테이블 JOIN 후 DB 조회로 교체
const INDICATORS: Record<MarketId, SubIndicator[]> = {
  sp500: [
    {
      name: "Stock Price Momentum",
      nameKo: "주가 모멘텀",
      value: 74,
      description:
        "S&P 500이 125일 이동평균 대비 얼마나 위에 있는지를 측정합니다. 지수가 MA 위에 있으면 탐욕 신호입니다.",
    },
    {
      name: "Stock Price Strength",
      nameKo: "주가 강도",
      value: 78,
      description:
        "NYSE 52주 신고가 종목 수 대비 신저가 종목 수 비율입니다. 신고가가 많을수록 탐욕입니다.",
    },
    {
      name: "Stock Price Breadth",
      nameKo: "주가 폭",
      value: 63,
      description:
        "NYSE 상승 거래량 대비 하락 거래량을 측정하는 McClellan 지표입니다.",
    },
    {
      name: "Put & Call Options",
      nameKo: "풋/콜 비율",
      value: 68,
      description:
        "CBOE 풋/콜 옵션 비율 5일 평균입니다. 비율이 낮을수록(콜 多) 탐욕 신호입니다.",
    },
    {
      name: "Junk Bond Demand",
      nameKo: "정크본드 수요",
      value: 72,
      description:
        "하이일드채와 투자등급채 간 스프레드입니다. 스프레드가 좁을수록 위험 선호(탐욕)를 의미합니다.",
    },
    {
      name: "Market Volatility",
      nameKo: "시장 변동성",
      value: 66,
      description:
        "VIX 공포지수와 50일 이동평균을 비교합니다. VIX가 낮을수록 탐욕입니다.",
    },
    {
      name: "Safe Haven Demand",
      nameKo: "안전자산 수요",
      value: 80,
      description:
        "주식과 미국채 20일 수익률 차이입니다. 주식 수익률이 높을수록 탐욕 신호입니다.",
    },
  ],
  kospi: [
    {
      name: "VKOSPI",
      nameKo: "VKOSPI (변동성)",
      value: 50,
      description:
        "한국 변동성 지수(VKOSPI)와 30/90일 이동평균을 비교합니다. 가중치 30%. 낮을수록 탐욕입니다.",
    },
    {
      name: "KOSPI Momentum",
      nameKo: "KOSPI 모멘텀",
      value: 48,
      description:
        "KOSPI가 125일 이동평균 대비 위치를 측정합니다. 가중치 25%.",
    },
    {
      name: "Stock Price Strength",
      nameKo: "주가 강도",
      value: 52,
      description: "KOSPI+KOSDAQ 52주 신고가/신저가 비율입니다. 가중치 15%.",
    },
    {
      name: "KOSPI Trend",
      nameKo: "KOSPI 추세",
      value: 45,
      description:
        "KOSPI 방향성 지표로 단기 모멘텀의 지속성을 측정합니다. 가중치 15%.",
    },
    {
      name: "KOSDAQ Rate",
      nameKo: "KOSDAQ 등락률",
      value: 42,
      description:
        "KOSDAQ 상대 등락률입니다. 코스닥이 강세이면 전체 시장 탐욕 신호. 가중치 10%.",
    },
    {
      name: "Safe Haven Demand",
      nameKo: "안전자산 수요",
      value: 55,
      description:
        "채권 대비 주식 선호도를 측정합니다. 주식 선호 시 탐욕 신호. 가중치 5%.",
    },
  ],
  kosdaq: [
    {
      name: "KOSDAQ Volatility",
      nameKo: "코스닥 변동성",
      value: 32,
      description:
        "코스닥 일간 변동성과 30/90일 평균을 비교합니다. 변동성이 높을수록 공포 신호입니다.",
    },
    {
      name: "KOSDAQ Momentum",
      nameKo: "코스닥 모멘텀",
      value: 35,
      description:
        "KOSDAQ이 125일 이동평균 대비 위치를 측정합니다. 현재 이동평균 아래에 위치합니다.",
    },
    {
      name: "Bio/Tech Strength",
      nameKo: "바이오/기술 강도",
      value: 38,
      description:
        "KOSDAQ 주도 섹터(바이오·IT)의 52주 신고가/신저가 비율입니다.",
    },
    {
      name: "Small Cap Breadth",
      nameKo: "소형주 폭",
      value: 30,
      description: "코스닥 소형주 상승 종목 수 대비 하락 종목 수 비율입니다.",
    },
    {
      name: "KOSDAQ Trend",
      nameKo: "코스닥 추세",
      value: 33,
      description:
        "코스닥 단기 방향성 지표입니다. 하락 추세가 지속될 경우 공포 신호입니다.",
    },
    {
      name: "Retail Sentiment",
      nameKo: "개인 투자 심리",
      value: 40,
      description:
        "개인 투자자 순매수/순매도 추이로 소매 투자 심리를 측정합니다.",
    },
  ],
};

// ── mock 히스토리 생성 헬퍼 ────────────────────────────────────
function classifyValue(v: number): FearGreedClassification {
  if (v <= 24) return "Extreme Fear";
  if (v <= 44) return "Fear";
  if (v <= 54) return "Neutral";
  if (v <= 74) return "Greed";
  return "Extreme Greed";
}

function makeMockHistory(scores: number[], baseTs: number): HistoryEntry[] {
  return scores.map((v, i) => ({
    value: v,
    value_classification: classifyValue(v),
    timestamp: String(baseTs - (scores.length - 1 - i) * 86400),
  }));
}

// ── mock 히스토리 데이터 ───────────────────────────────────────
// TODO: market_history 테이블 조회로 교체
const BASE_TS = 1775001600;

const MOCK_HISTORY: Record<MarketId, number[]> = {
  sp500: [
    45, 48, 52, 50, 55, 58, 54, 57, 60, 62, 65, 63, 67, 65, 68, 70, 66, 69,
    71, 68, 72, 70, 74, 71, 68, 65, 68, 70, 71, 72,
  ],
  kospi: [
    35, 38, 40, 37, 42, 44, 41, 45, 43, 47, 48, 46, 50, 48, 52, 49, 46, 50,
    48, 51, 53, 50, 47, 49, 52, 50, 48, 51, 49, 48,
  ],
  kosdaq: [
    58, 55, 52, 56, 50, 48, 52, 46, 44, 48, 42, 45, 40, 43, 38, 42, 38, 36,
    40, 37, 35, 38, 34, 36, 33, 35, 37, 34, 36, 35,
  ],
};

const MOCK_CURRENT: Record<
  MarketId,
  { value: number; time_until_update: string }
> = {
  sp500: { value: 72, time_until_update: "14 hours" },
  kospi: { value: 48, time_until_update: "6 hours" },
  kosdaq: { value: 35, time_until_update: "6 hours" },
};

// ── 공개 함수 ─────────────────────────────────────────────────

export function buildMarketSummary(
  id: MarketId,
  historyLimit = 30,
): MarketSummary {
  const meta = MARKET_META[id];
  const current = MOCK_CURRENT[id];
  const allHistory = makeMockHistory(MOCK_HISTORY[id], BASE_TS);
  const history = allHistory.slice(-historyLimit);
  const sparkline = allHistory.slice(-10).map((h) => h.value);

  return {
    id,
    name: id === "sp500" ? "S&P 500" : id.toUpperCase(),
    nameKo: meta.nameKo,
    region: meta.region,
    description: meta.description,
    value: current.value,
    value_classification: classifyValue(current.value),
    sparkline,
    history,
    timestamp: String(BASE_TS),
    time_until_update: current.time_until_update,
  };
}

export function buildMarketDetail(
  id: MarketId,
  historyLimit = 30,
): MarketDetail {
  const meta = MARKET_META[id];
  const current = MOCK_CURRENT[id];
  const allHistory = makeMockHistory(MOCK_HISTORY[id], BASE_TS);
  const history = allHistory.slice(-historyLimit);

  return {
    id,
    name: id === "sp500" ? "S&P 500" : id.toUpperCase(),
    nameKo: meta.nameKo,
    description: meta.description,
    currentValue: current.value,
    currentClassification: classifyValue(current.value),
    indicators: INDICATORS[id],
    history,
  };
}
