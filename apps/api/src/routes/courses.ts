import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Course } from '@seoul-advanture/database';
import {
  CourseParamsSchema,
  CourseListResponseSchema,
  ErrorSchema,
} from '@seoul-advanture/schemas';

export const courseRoutes: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.get('/courses', { schema: { tags: ['courses'], summary: '코스 목록 조회', response: { 200: CourseListResponseSchema } } }, async (request) => {
    const em = request.em;
    return em.find(
      Course,
      { isActive: true },
      {
        populate: ['places', 'places.place'],
        orderBy: { weekKey: 'DESC' },
      },
    ) as any;
  });

  fastify.get('/courses/:id', {
    schema: { tags: ['courses'], summary: '코스 상세 조회', params: CourseParamsSchema, response: { 404: ErrorSchema } },
  }, async (request, reply) => {
    const em = request.em;

    const course = await em.findOne(
      Course,
      { id: request.params.id },
      { populate: ['places', 'places.place', 'quests'] },
    );

    if (!course) return reply.code(404).send({ error: '코스를 찾을 수 없습니다.' });

    const quests = course.quests.getItems().map((q) => {
      const { answer: _answer, ...safe } = q as any;
      return safe;
    });

    return { ...course, quests } as any;
  });
};
