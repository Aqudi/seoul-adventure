import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Attempt, AttemptStatus } from '@seoul-advanture/database';
import {
  LeaderboardParamsSchema,
  MyRankQuerySchema,
} from '@seoul-advanture/schemas';

export const leaderboardRoutes: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.get('/leaderboard/:courseId', {
    schema: { tags: ['leaderboard'], summary: '리더보드 조회', params: LeaderboardParamsSchema },
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

  fastify.get(
    '/leaderboard/:courseId/my-rank',
    {
      onRequest: [fastify.authenticate],
      schema: { tags: ['leaderboard'], summary: '내 순위 조회', security: [{ bearerAuth: [] }], params: LeaderboardParamsSchema, querystring: MyRankQuerySchema },
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
};
