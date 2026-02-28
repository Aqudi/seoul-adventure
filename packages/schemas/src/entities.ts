/**
 * API DTO 스키마 - 데이터베이스 엔티티의 공개용 표현
 * answer 같은 민감한 필드는 제외됨
 */
import { Type, Static } from '@sinclair/typebox';

// ─── Enums ────────────────────────────────────────────────────────────────────

export const DifficultySchema = Type.Union([
  Type.Literal('EASY'),
  Type.Literal('MEDIUM'),
  Type.Literal('HARD'),
]);
export type Difficulty = Static<typeof DifficultySchema>;

export const QuestTypeSchema = Type.Union([
  Type.Literal('PHOTO'),
  Type.Literal('ANSWER'),
  Type.Literal('GPS_TIME'),
]);
export type QuestType = Static<typeof QuestTypeSchema>;

export const AttemptStatusSchema = Type.Union([
  Type.Literal('IN_PROGRESS'),
  Type.Literal('COMPLETED'),
  Type.Literal('ABANDONED'),
]);
export type AttemptStatus = Static<typeof AttemptStatusSchema>;

export const QuestStatusSchema = Type.Union([
  Type.Literal('PENDING'),
  Type.Literal('COMPLETED'),
]);
export type QuestStatus = Static<typeof QuestStatusSchema>;

// ─── DTOs ─────────────────────────────────────────────────────────────────────

export const UserDtoSchema = Type.Object({
  id: Type.String(),
  nickname: Type.String(),
  createdAt: Type.String({ format: 'date-time' }),
});
export type UserDto = Static<typeof UserDtoSchema>;

export const PlaceDtoSchema = Type.Object({
  id: Type.String(),
  name: Type.String(),
  lat: Type.Number(),
  lng: Type.Number(),
  landmarkNames: Type.Array(Type.String()),
  imageUrl: Type.Optional(Type.String()),
  facts: Type.Optional(Type.Record(Type.String(), Type.Unknown())),
});
export type PlaceDto = Static<typeof PlaceDtoSchema>;

/** 퀘스트 공개 DTO - answer 필드 제외 */
export const QuestDtoSchema = Type.Object({
  id: Type.String(),
  order: Type.Number(),
  type: QuestTypeSchema,
  narrativeText: Type.String(),
  instruction: Type.String(),
  mapHint: Type.String(),
  gpsRadiusM: Type.Optional(Type.Number()),
  timeLimitSec: Type.Optional(Type.Number()),
  place: Type.Optional(PlaceDtoSchema),
});
export type QuestDto = Static<typeof QuestDtoSchema>;

export const CourseDtoSchema = Type.Object({
  id: Type.String(),
  title: Type.String(),
  theme: Type.String(),
  weekKey: Type.String(),
  estimatedDuration: Type.Number(),
  difficulty: DifficultySchema,
  prologue: Type.String(),
  epilogue: Type.String(),
  isActive: Type.Boolean(),
  createdAt: Type.String({ format: 'date-time' }),
});
export type CourseDto = Static<typeof CourseDtoSchema>;

export const QuestStateDtoSchema = Type.Object({
  id: Type.String(),
  status: QuestStatusSchema,
  completedAt: Type.Optional(Type.String({ format: 'date-time' })),
  photoUrl: Type.Optional(Type.String()),
  quest: QuestDtoSchema,
});
export type QuestStateDto = Static<typeof QuestStateDtoSchema>;

export const AttemptDtoSchema = Type.Object({
  id: Type.String(),
  status: AttemptStatusSchema,
  startAt: Type.String({ format: 'date-time' }),
  endAt: Type.Optional(Type.String({ format: 'date-time' })),
  clearTimeMs: Type.Optional(Type.Number()),
});
export type AttemptDto = Static<typeof AttemptDtoSchema>;

/** CoursePlace 조인 테이블 DTO - 코스 내 장소 순서 포함 */
export const CoursePlaceDtoSchema = Type.Object({
  order: Type.Number(),
  place: PlaceDtoSchema,
});
export type CoursePlaceDto = Static<typeof CoursePlaceDtoSchema>;
