import type { FastifyInstance } from 'fastify';
import { Course } from '@seoul-advanture/database';
import {
  CourseParamsSchema,
  CourseListResponseSchema,
  type CourseParams,
} from '@seoul-advanture/schemas';

export async function courseRoutes(fastify: FastifyInstance) {
  fastify.get('/courses', { schema: { response: { 200: CourseListResponseSchema } } }, async (request) => {
    const em = request.em;
    return em.find(
      Course,
      { isActive: true },
      {
        populate: ['places', 'places.place'],
        orderBy: { weekKey: 'DESC' },
      },
    );
  });

  fastify.get<{ Params: CourseParams }>('/courses/:id', {
    schema: { params: CourseParamsSchema },
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

    return { ...course, quests };
  });
}
