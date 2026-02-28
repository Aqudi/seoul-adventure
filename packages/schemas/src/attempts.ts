import { Type, Static } from '@sinclair/typebox';
import {
  AttemptDtoSchema,
  QuestStateDtoSchema,
  CourseDtoSchema,
  CoursePlaceDtoSchema,
} from './entities.js';

// ─── Request ──────────────────────────────────────────────────────────────────

export const StartAttemptBodySchema = Type.Object({
  courseId: Type.String(),
});
export type StartAttemptBody = Static<typeof StartAttemptBodySchema>;

/** ANSWER 퀘스트 완료 요청 */
export const CompleteAnswerQuestBodySchema = Type.Object({
  answer: Type.String(),
});
export type CompleteAnswerQuestBody = Static<typeof CompleteAnswerQuestBodySchema>;

/** GPS_TIME 퀘스트 완료 요청 */
export const CompleteGpsQuestBodySchema = Type.Object({
  lat: Type.Number({ minimum: -90, maximum: 90 }),
  lng: Type.Number({ minimum: -180, maximum: 180 }),
});
export type CompleteGpsQuestBody = Static<typeof CompleteGpsQuestBodySchema>;

// ─── Params ───────────────────────────────────────────────────────────────────

export const AttemptParamsSchema = Type.Object({
  attemptId: Type.String(),
});
export type AttemptParams = Static<typeof AttemptParamsSchema>;

export const QuestCompleteParamsSchema = Type.Object({
  attemptId: Type.String(),
  questId: Type.String(),
});
export type QuestCompleteParams = Static<typeof QuestCompleteParamsSchema>;

// ─── Response ─────────────────────────────────────────────────────────────────

export const AttemptResponseSchema = Type.Object({
  id: Type.String(),
  status: AttemptDtoSchema.properties.status,
  startAt: Type.String({ format: 'date-time' }),
  endAt: Type.Optional(Type.String({ format: 'date-time' })),
  clearTimeMs: Type.Optional(Type.Number()),
  questStates: Type.Array(QuestStateDtoSchema),
  course: Type.Optional(
    Type.Object({
      id: Type.String(),
      title: Type.String(),
      theme: Type.String(),
      weekKey: Type.String(),
      estimatedDuration: Type.Number(),
      difficulty: CourseDtoSchema.properties.difficulty,
      prologue: Type.String(),
      epilogue: Type.String(),
      isActive: Type.Boolean(),
      createdAt: Type.String({ format: 'date-time' }),
      places: Type.Optional(Type.Array(CoursePlaceDtoSchema)),
    }),
  ),
});
export type AttemptResponse = Static<typeof AttemptResponseSchema>;

export const QuestStateResponseSchema = QuestStateDtoSchema;
export type QuestStateResponse = Static<typeof QuestStateResponseSchema>;
