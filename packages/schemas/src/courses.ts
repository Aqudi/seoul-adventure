import { Type, Static } from '@sinclair/typebox';
import { CourseDtoSchema, QuestDtoSchema, CoursePlaceDtoSchema } from './entities.js';

// ─── Response ─────────────────────────────────────────────────────────────────

export const CourseListResponseSchema = Type.Array(
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
    places: Type.Array(CoursePlaceDtoSchema),
  }),
);
export type CourseListResponse = Static<typeof CourseListResponseSchema>;

export const CourseDetailResponseSchema = Type.Object({
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
  places: Type.Array(CoursePlaceDtoSchema),
  quests: Type.Array(QuestDtoSchema),
});
export type CourseDetailResponse = Static<typeof CourseDetailResponseSchema>;

// ─── Params ───────────────────────────────────────────────────────────────────

export const CourseParamsSchema = Type.Object({
  id: Type.String(),
});
export type CourseParams = Static<typeof CourseParamsSchema>;
