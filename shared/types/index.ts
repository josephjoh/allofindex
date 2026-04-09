// app/ 와 server/ 양쪽에서 공유하는 타입
// Nuxt 4에서 server/ 는 별도 TS 컨텍스트를 가지므로 이 파일로 브릿지
export type {
  FearGreedReading,
  FearGreedApiResponse,
  FearGreedClassification,
  FearGreedHistoryEntry,
} from "../../app/types/fear-greed";

export type { ApiResponse, ApiError } from "../../app/types/api";

// ── 마켓 ───────────────────────────────────────────────────────

export interface HistoryEntry {
  value: number;
  value_classification: FearGreedClassification;
  timestamp: string; // Unix epoch 문자열
}

export interface MarketSummary {
  id: string;
  name: string;
  nameKo: string;
  region: string;
  description: string;
  value: number;
  value_classification: FearGreedClassification;
  sparkline: number[];
  history: HistoryEntry[];
  timestamp: string;
  time_until_update?: string;
}

export interface SubIndicator {
  name: string;
  nameKo: string;
  value: number;
  description: string;
}

export interface MarketDetail {
  id: string;
  name: string;
  nameKo: string;
  description: string;
  currentValue: number;
  currentClassification: FearGreedClassification;
  indicators: SubIndicator[];
  history: HistoryEntry[];
}

// ── 투표 ───────────────────────────────────────────────────────

export interface VoteSummary {
  marketId: string;
  date: string; // YYYY-MM-DD
  bearish: number;
  bullish: number;
  total: number;
  bearishPct: number;
  bullishPct: number;
}

export interface VoteRequest {
  marketId: string;
  choice: "bearish" | "bullish";
}

// ── 뉴스 ───────────────────────────────────────────────────────

export interface NewsApiItem {
  id: number;
  title: string;
  source: string;
  publishedAt: string; // ISO 8601
  market: "sp500" | "kospi" | "kosdaq" | "global";
  url: string;
}

// ── 키워드 ─────────────────────────────────────────────────────

export interface KeywordApiItem {
  rank: number;
  keyword: string;
  count: number;
  trend: "up" | "down" | "same";
}

// ── 인증 ───────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  roles: string[];
}

export interface AuthTokens {
  accessToken: string;
  expiresIn: number;
}

export interface LoginResponse {
  user: AuthUser;
  tokens: AuthTokens;
}
