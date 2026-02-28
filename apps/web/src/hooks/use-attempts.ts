"use client";

import { useState, useEffect } from "react";
import {
  startAttempt,
  getAttempt,
  completeAnswerQuest,
  completeGpsQuest
} from "@/lib/api/attempts";
import {
  AttemptResponse,
  StartAttemptBody,
  CompleteAnswerQuestBody,
  CompleteGpsQuestBody
} from "@seoul-advanture/schemas";

export function useAttempt(id?: string) {
  const [data, setData] = useState<AttemptResponse | null>(null);
  const [isLoading, setIsLoading] = useState(!!id);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) return;
    async function load() {
      setIsLoading(true);
      try {
        const res = await getAttempt(id);
        setData(res);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [id]);

  const handleStart = async (body: StartAttemptBody) => {
    setIsLoading(true);
    try {
      const res = await startAttempt(body);
      setData(res);
      return res;
    } catch (err) {
      setError(err as Error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAnswer = async (questId: string, body: CompleteAnswerQuestBody) => {
    if (!data) return null;
    try {
      const res = await completeAnswerQuest(data.id, questId, body);
      return res;
    } catch (err) {
      setError(err as Error);
      return null;
    }
  };

  return { data, isLoading, error, handleStart, handleVerifyAnswer };
}
