import { LeaderboardResponse, MyRankResponse } from "@seoul-advanture/schemas";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function getLeaderboard(courseId?: string): Promise<LeaderboardResponse> {
  return [
    { rank: 1, nickname: "궁궐러너", clearTimeMs: 1424000, clearedAt: "2024-02-28T09:00:00Z" },
    { rank: 2, nickname: "사관김", clearTimeMs: 1451000, clearedAt: "2024-02-28T10:00:00Z" },
    { rank: 3, nickname: "한양탐정", clearTimeMs: 1509000, clearedAt: "2024-02-28T11:00:00Z" },
  ];
}

export async function getMyRank(attemptId: string): Promise<MyRankResponse> {
  return {
    rank: 14,
    clearTimeMs: 1663000
  };
}
