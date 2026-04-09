import type { VoteSummary } from "../../shared/types/index";
import { isValidMarketId, VALID_MARKET_IDS } from "./market-config";

// ── 인메모리 투표 저장소 ───────────────────────────────────────
// TODO: DB 연동 후 votes / votes_daily_summary 테이블로 교체
// - 집계: votes_daily_summary (market_id, vote_date, bearish, bullish)
// - 중복 방지: votes UNIQUE (user_id, market_id, vote_date)

interface DailyTally {
  bearish: number;
  bullish: number;
}

// key: "marketId:YYYY-MM-DD"
const tallyStore = new Map<string, DailyTally>();

// key: "userId:marketId:YYYY-MM-DD"
const voteRecords = new Set<string>();

// 초기 mock 집계 데이터
const INITIAL_TALLY: Record<string, DailyTally> = {
  sp500: { bearish: 312, bullish: 748 },
  kospi: { bearish: 524, bullish: 461 },
  kosdaq: { bearish: 687, bullish: 290 },
};

export function todayDateStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function tallyKey(marketId: string, date: string): string {
  return `${marketId}:${date}`;
}

function getTally(marketId: string, date: string): DailyTally {
  const key = tallyKey(marketId, date);
  if (!tallyStore.has(key)) {
    // 오늘 첫 접근이면 mock 초기값 세팅
    const init = INITIAL_TALLY[marketId] ?? { bearish: 0, bullish: 0 };
    tallyStore.set(key, { ...init });
  }
  return tallyStore.get(key)!;
}

export function getVoteSummary(marketId: string): VoteSummary {
  const date = todayDateStr();
  const tally = getTally(marketId, date);
  const total = tally.bearish + tally.bullish;
  const bearishPct = total ? Math.round((tally.bearish / total) * 100) : 50;

  return {
    marketId,
    date,
    bearish: tally.bearish,
    bullish: tally.bullish,
    total,
    bearishPct,
    bullishPct: 100 - bearishPct,
  };
}

export function castVote(
  userId: string,
  marketId: string,
  choice: "bearish" | "bullish",
): VoteSummary {
  if (!isValidMarketId(marketId)) {
    throw new Error("INVALID_MARKET");
  }

  const date = todayDateStr();
  const voteKey = `${userId}:${marketId}:${date}`;

  if (voteRecords.has(voteKey)) {
    throw new Error("DUPLICATE_VOTE");
  }

  voteRecords.add(voteKey);
  const tally = getTally(marketId, date);
  tally[choice]++;

  return getVoteSummary(marketId);
}

export function hasVotedToday(userId: string, marketId: string): boolean {
  return voteRecords.has(`${userId}:${marketId}:${todayDateStr()}`);
}

