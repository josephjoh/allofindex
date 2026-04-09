export const APP_NAME = "Fear & Greed Index";
export const APP_VERSION = "0.1.0";

export const FEAR_GREED_THRESHOLDS = {
  EXTREME_FEAR: 20,
  FEAR: 40,
  NEUTRAL: 60,
  GREED: 80,
} as const;

export const CACHE_TTL_MS = {
  CURRENT_INDEX: 5 * 60 * 1000, // 5분
  HISTORY: 30 * 60 * 1000, // 30분
} as const;

export const API_ENDPOINTS = {
  FEAR_GREED_CURRENT: "/api/fear-greed/current",
  FEAR_GREED_HISTORY: "/api/fear-greed/history",
  HEALTH: "/api/health",
} as const;
