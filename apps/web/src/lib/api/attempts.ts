import { 
  StartAttemptBody, 
  AttemptResponse, 
  CompleteAnswerQuestBody, 
  CompleteGpsQuestBody, 
  QuestStateResponse 
} from "@seoul-advanture/schemas";
import { apiClient } from "./client";

/**
 * 탐험 시작 API
 */
export async function startAttempt(body: StartAttemptBody): Promise<AttemptResponse> {
  return apiClient<AttemptResponse>("/attempts", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/**
 * 현재 진행 중인 시도 조회 API
 */
export async function getAttempt(id: string): Promise<AttemptResponse> {
  return apiClient<AttemptResponse>(`/attempts/${id}`);
}

/**
 * 퀘스트 완료 (정답형)
 */
export async function completeAnswerQuest(attemptId: string, questId: string, body: CompleteAnswerQuestBody): Promise<QuestStateResponse> {
  return apiClient<QuestStateResponse>(`/attempts/${attemptId}/quests/${questId}/complete`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/**
 * 퀘스트 완료 (GPS형)
 */
export async function completeGpsQuest(attemptId: string, questId: string, body: CompleteGpsQuestBody): Promise<QuestStateResponse> {
  return apiClient<QuestStateResponse>(`/attempts/${attemptId}/quests/${questId}/complete`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}
