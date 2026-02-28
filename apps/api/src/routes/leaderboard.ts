import type { FastifyInstance } from 'fastify';
import { Attempt, AttemptStatus } from '@seoul-advanture/database';
import {
  LeaderboardParamsSchema,
  MyRankQuerySchema,
  type LeaderboardParams,
  type MyRankQuery,
} from '@seoul-advanture/schemas';

export async function leaderboardRoutes(fastify: FastifyInstance) {
  fastify.get<{ Params: LeaderboardParams }>('/leaderboard/:courseId', {
    schema: { params: LeaderboardParamsSchema },
  }, async (request) => {
    const em = request.em;

    const attempts = await em.find(
      Attempt,
      { course: { id: request.params.courseId }, status: AttemptStatus.COMPLETED },
      {
        populate: ['user'],
        orderBy: { clearTimeMs: 'ASC' },
        limit: 50,
      },
    );

    return attempts.map((a, i) => ({
      rank: i + 1,
      nickname: a.user.nickname,
      clearTimeMs: a.clearTimeMs,
      clearedAt: a.endAt,
    }));
  });

  fastify.get<{ Params: LeaderboardParams; Querystring: MyRankQuery }>(
    '/leaderboard/:courseId/my-rank',
    {
      onRequest: [fastify.authenticate],
      schema: { params: LeaderboardParamsSchema, querystring: MyRankQuerySchema },
    },
    async (request) => {
    const { courseId } = request.params;
    const { attemptId } = request.query;
    const em = request.em;

    const myAttempt = await em.findOne(Attempt, { id: attemptId });
    if (myAttempt?.status !== AttemptStatus.COMPLETED) return { rank: null };

    const betterCount = await em.count(Attempt, {
      course: { id: courseId },
      status: AttemptStatus.COMPLETED,
      clearTimeMs: { $lt: myAttempt.clearTimeMs! },
    });

    return { rank: betterCount + 1, clearTimeMs: myAttempt.clearTimeMs };
    },
  );
}
