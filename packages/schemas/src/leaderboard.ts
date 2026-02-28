import { Type, Static } from '@sinclair/typebox';

// ─── Params & Query ───────────────────────────────────────────────────────────

export const LeaderboardParamsSchema = Type.Object({
  courseId: Type.String(),
});
export type LeaderboardParams = Static<typeof LeaderboardParamsSchema>;

export const MyRankQuerySchema = Type.Object({
  attemptId: Type.String(),
});
export type MyRankQuery = Static<typeof MyRankQuerySchema>;

// ─── Response ─────────────────────────────────────────────────────────────────

export const LeaderboardEntrySchema = Type.Object({
  rank: Type.Number(),
  nickname: Type.String(),
  clearTimeMs: Type.Union([Type.Number(), Type.Null()]),
  clearedAt: Type.Union([Type.String({ format: 'date-time' }), Type.Null()]),
});
export type LeaderboardEntry = Static<typeof LeaderboardEntrySchema>;

export const LeaderboardResponseSchema = Type.Array(LeaderboardEntrySchema);
export type LeaderboardResponse = Static<typeof LeaderboardResponseSchema>;

export const MyRankResponseSchema = Type.Object({
  rank: Type.Union([Type.Number(), Type.Null()]),
  clearTimeMs: Type.Optional(Type.Union([Type.Number(), Type.Null()])),
});
export type MyRankResponse = Static<typeof MyRankResponseSchema>;
