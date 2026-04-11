import type {
  FearGreedClassification,
  FearGreedReading,
} from "~/types/fear-greed";

/**
 * Unix timestamp 문자열을 로케일 날짜 문자열로 변환
 */
export const formatTimestamp = (unixStr: string, locale = "ko-KR"): string => {
  const ms = parseInt(unixStr, 10) * 1000;
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(ms));
};

/**
 * 0-100 점수를 분류 레이블로 변환
 */
export const classifyScore = (value: number): FearGreedClassification => {
  if (value <= 20) return "Extreme Fear";
  if (value <= 40) return "Fear";
  if (value <= 60) return "Neutral";
  if (value <= 80) return "Greed";
  return "Extreme Greed";
};

/**
 * mock 히스토리 데이터 생성: 숫자 배열 → FearGreedReading[]
 */
export const makeMockHistory = (
  values: number[],
  baseTs: number,
): FearGreedReading[] =>
  values.map((v, i) => ({
    value: v,
    value_classification: classifyScore(v),
    timestamp: String(baseTs - (values.length - 1 - i) * 86400),
  }));

/**
 * 숫자를 퍼센트 문자열로 변환
 */
export const formatPercent = (value: number, decimals = 1): string =>
  `${value.toFixed(decimals)}%`;

/**
 * 숫자에 천 단위 구분자 적용
 */
export const formatNumber = (value: number, locale = "ko-KR"): string =>
  new Intl.NumberFormat(locale).format(value);

/**
 * 0-100 점수를 게이지 hex 색상으로 변환 (SVG inline style용)
 */
export const getGaugeHexColor = (value: number): string => {
  if (value <= 20) return "#dc2626";
  if (value <= 40) return "#ea580c";
  if (value <= 60) return "#ca8a04";
  if (value <= 80) return "#16a34a";
  return "#15803d";
};

/**
 * 0-100 점수를 분류 배지 Tailwind 클래스로 변환
 */
export const getBadgeClass = (value: number): string => {
  if (value <= 20)
    return "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300";
  if (value <= 40)
    return "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300";
  if (value <= 60)
    return "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300";
  if (value <= 80)
    return "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300";
  return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300";
};

/**
 * ISO 8601 날짜 문자열을 "N분 전 / N시간 전 / N일 전" 상대 시간으로 변환
 */
export const formatRelativeTime = (iso: string): string => {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  return `${days}일 전`;
};

/**
 * Fear & Greed 분류에 따른 Tailwind 색상 클래스 반환
 */
export const getClassificationColor = (
  classification: FearGreedClassification,
): string => {
  const map: Record<FearGreedClassification, string> = {
    "Extreme Fear": "text-fear-extreme",
    Fear: "text-fear",
    Neutral: "text-neutral",
    Greed: "text-greed",
    "Extreme Greed": "text-greed-extreme",
  };
  return map[classification] ?? "text-gray-400";
};
