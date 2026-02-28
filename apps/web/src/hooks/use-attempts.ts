"use client";

import { useState, useEffect } from "react";
import {
  startAttempt,
  getAttempt,
  completeAnswerQuest,
  completeGpsQuest,
  completePhotoQuest,
  finishAttempt,
} from "@/lib/api/attempts";
import {
  AttemptResponse,
  StartAttemptBody,
  CompleteAnswerQuestBody,
  CompleteGpsQuestBody,
} from "@seoul-advanture/schemas";

export function useAttempt(id?: string) {
  const [data, setData] = useState<AttemptResponse | null>(null);
  const [isLoading, setIsLoading] = useState(!!id);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (typeof id !== "string") return;
    async function load() {
      setIsLoading(true);
      try {
        const res = await getAttempt(id as string);
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

  /** ANSWER 퀘스트 완료 */
  const handleVerifyAnswer = async (questId: string, body: CompleteAnswerQuestBody) => {
    if (!data) return null;
    const res = await completeAnswerQuest(data.id, questId, body);
    return res;
  };

  /** GPS_TIME 퀘스트 완료 */
  const handleVerifyGps = async (questId: string, body: CompleteGpsQuestBody) => {
    if (!data) return null;
    const res = await completeGpsQuest(data.id, questId, body);
    return res;
  };

  /** PHOTO 퀘스트 완료 - blob + 선택적 GPS 좌표 */
  const handleVerifyPhoto = async (
    questId: string,
    blob: Blob,
    location?: { lat: number; lng: number },
  ) => {
    if (!data) return null;
    const res = await completePhotoQuest(data.id, questId, blob, location);
    return res;
  };

  const handleFinish = async () => {
    if (!data) return null;
    const res = await finishAttempt(data.id);
    setData(res);
    return res;
  };

  return { data, isLoading, error, handleStart, handleVerifyAnswer, handleVerifyGps, handleVerifyPhoto, handleFinish };
}
