export type FearGreedClassification =
  | "Extreme Fear"
  | "Fear"
  | "Neutral"
  | "Greed"
  | "Extreme Greed";

export interface FearGreedReading {
  value: number; // 0-100
  value_classification: FearGreedClassification;
  timestamp: string; // Unix epoch 문자열
  time_until_update?: string; // "23 hours"
}

export interface FearGreedHistoryEntry extends FearGreedReading {
  date: string; // 사람이 읽을 수 있는 날짜: "March 31, 2026"
}

export interface FearGreedApiResponse {
  name: string;
  data: FearGreedReading[];
  metadata: {
    error: string | null;
  };
}
