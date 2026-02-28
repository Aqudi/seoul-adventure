import { LeaderboardResponse, MyRankResponse } from "@seoul-advanture/schemas";
import { apiClient } from "./client";

export async function getLeaderboard(courseId?: string): Promise<LeaderboardResponse> {
  const endpoint = courseId ? `/leaderboard/${courseId}` : "/leaderboard";
  return apiClient<LeaderboardResponse>(endpoint);
}

export async function getMyRank(attemptId: string): Promise<MyRankResponse> {
  return apiClient<MyRankResponse>("/leaderboard/my-rank", {
    params: { attemptId }
  });
}
