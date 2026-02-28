import {
  StartAttemptBody,
  AttemptResponse,
  CompleteAnswerQuestBody,
  CompleteGpsQuestBody,
  QuestStateResponse
} from "@seoul-advanture/schemas";
import { apiClient } from "./client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

function getToken() {
  return typeof window !== "undefined" ? localStorage.getItem("auth-token") : null;
}

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

/**
 * 퀘스트 완료 (사진형) - multipart/form-data
 * 텍스트 필드(exifLat, exifLng)를 파일보다 먼저 추가해야 서버에서 파싱 가능
 */
export async function completePhotoQuest(
  attemptId: string,
  questId: string,
  blob: Blob,
  location?: { lat: number; lng: number },
): Promise<QuestStateResponse> {
  const formData = new FormData();
  if (location) {
    formData.append("exifLat", String(location.lat));
    formData.append("exifLng", String(location.lng));
  }
  formData.append("file", blob, "photo.jpg");

  const token = getToken();
  const response = await fetch(
    `${API_BASE_URL}/attempts/${attemptId}/quests/${questId}/complete`,
    {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API Error: ${response.status}`);
  }
  return response.json();
}
