export interface NewsItem {
  id: number;
  title: string;
  source: string;
  publishedAt: string; // ISO 8601
  market: "sp500" | "kospi" | "kosdaq" | "global";
  url: string;
}

export interface KeywordItem {
  rank: number;
  keyword: string;
  count: number;
  trend: "up" | "down" | "same";
}
