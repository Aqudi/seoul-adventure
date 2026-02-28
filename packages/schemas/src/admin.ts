import { Type, Static } from '@sinclair/typebox';
import { PlaceDtoSchema, CourseDtoSchema, QuestDtoSchema, CoursePlaceDtoSchema } from './entities.js';

// ─── Request ──────────────────────────────────────────────────────────────────

export const CreatePlaceBodySchema = Type.Object({
  name: Type.String({ minLength: 1 }),
  lat: Type.Number({ minimum: -90, maximum: 90 }),
  lng: Type.Number({ minimum: -180, maximum: 180 }),
  landmarkNames: Type.Array(Type.String()),
  facts: Type.Optional(Type.Record(Type.String(), Type.Unknown())),
});
export type CreatePlaceBody = Static<typeof CreatePlaceBodySchema>;

export const GenerateCourseBodySchema = Type.Object({
  weekKey: Type.String({ pattern: '^\\d{4}-W\\d{2}$' }),
  placeIds: Type.Array(Type.String(), { minItems: 1 }),
});
export type GenerateCourseBody = Static<typeof GenerateCourseBodySchema>;

export const UpdateCourseStatusBodySchema = Type.Object({
  isActive: Type.Boolean(),
});
export type UpdateCourseStatusBody = Static<typeof UpdateCourseStatusBodySchema>;

export const AdminCourseParamsSchema = Type.Object({
  id: Type.String(),
});
export type AdminCourseParams = Static<typeof AdminCourseParamsSchema>;

// ─── Response ─────────────────────────────────────────────────────────────────

export const PlaceListResponseSchema = Type.Array(PlaceDtoSchema);
export type PlaceListResponse = Static<typeof PlaceListResponseSchema>;

export const GeneratedCourseResponseSchema = Type.Object({
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
export type GeneratedCourseResponse = Static<typeof GeneratedCourseResponseSchema>;
