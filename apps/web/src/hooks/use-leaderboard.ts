"use client";

import { useState, useEffect } from "react";
import { getLeaderboard, getMyRank } from "@/lib/api/leaderboard";
import { LeaderboardResponse, MyRankResponse } from "@seoul-advanture/schemas";

export function useLeaderboard(courseId?: string) {
  const [data, setData] = useState<LeaderboardResponse>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const res = await getLeaderboard(courseId);
        setData(res);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [courseId]);

  return { data, isLoading, error };
}

export function useMyRank(attemptId: string) {
  const [data, setData] = useState<MyRankResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!attemptId) return;
    async function load() {
      try {
        const res = await getMyRank(attemptId);
        setData(res);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [attemptId]);

  return { data, isLoading };
}
