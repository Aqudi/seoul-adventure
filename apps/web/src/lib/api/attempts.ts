import { 
  StartAttemptBody, 
  AttemptResponse, 
  CompleteAnswerQuestBody, 
  CompleteGpsQuestBody, 
  QuestStateResponse 
} from "@seoul-advanture/schemas";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

/**
 * 탐험 시작 API
 */
export async function startAttempt(body: StartAttemptBody): Promise<AttemptResponse> {
  return {
    id: "att_1",
    status: "IN_PROGRESS",
    startAt: new Date().toISOString(),
    questStates: []
  };
}

/**
 * 현재 진행 중인 시도 조회 API
 */
export async function getAttempt(id: string): Promise<AttemptResponse> {
  return {
    id,
    status: "IN_PROGRESS",
    startAt: new Date().toISOString(),
    clearTimeMs: 1663000,
    questStates: [],
    course: {
      id: "c1",
      title: "한양 도성 북문 코스",
      theme: "조선 왕실의 권위",
      weekKey: "2024-W09",
      estimatedDuration: 48,
      difficulty: "MEDIUM",
      prologue: "...",
      epilogue: "모든 단서를 모았군! 그대는 오늘부로 명예 사관이오. 다음 주, 세종대왕의 비밀 편지가 그대를 기다리오.",
      isActive: true,
      createdAt: new Date().toISOString()
    }
  };
}

/**
 * 퀘스트 완료 (정답형)
 */
export async function completeAnswerQuest(attemptId: string, questId: string, body: CompleteAnswerQuestBody): Promise<QuestStateResponse> {
  return {
    id: "qs_1",
    status: "COMPLETED",
    completedAt: new Date().toISOString(),
    quest: { id: questId, order: 1, type: "ANSWER", narrativeText: "...", instruction: "...", mapHint: "..." }
  };
}

/**
 * 퀘스트 완료 (GPS형)
 */
export async function completeGpsQuest(attemptId: string, questId: string, body: CompleteGpsQuestBody): Promise<QuestStateResponse> {
  return {
    id: "qs_1",
    status: "COMPLETED",
    completedAt: new Date().toISOString(),
    quest: { id: questId, order: 1, type: "GPS_TIME", narrativeText: "...", instruction: "...", mapHint: "..." }
  };
}
