import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Place, Course } from '@seoul-advanture/database';
import {
  CreatePlaceBodySchema,
  GenerateCourseBodySchema,
  UpdateCourseStatusBodySchema,
  AdminCourseParamsSchema,
  ErrorSchema,
} from '@seoul-advanture/schemas';

const ADMIN_KEY = process.env.ADMIN_KEY ?? 'admin-secret';
const checkAdmin = (request: any, reply: any) => {
  if (request.headers['x-admin-key'] !== ADMIN_KEY) {
    reply.code(401).send({ error: '어드민 키가 올바르지 않습니다.' });
    return false;
  }
  return true;
};

export const adminRoutes: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.get('/admin/places', { schema: { tags: ['admin'], summary: '장소 목록 조회', security: [{ adminKey: [] }] } }, async (request, reply) => {
    if (!checkAdmin(request, reply)) return;
    return request.em.find(Place, {}, { orderBy: { name: 'ASC' } });
  });

  fastify.post('/admin/places', {
    schema: { tags: ['admin'], summary: '장소 생성', security: [{ adminKey: [] }], body: CreatePlaceBodySchema, response: { 401: ErrorSchema } },
  }, async (request, reply) => {
    if (!checkAdmin(request, reply)) return;
    const place = request.em.create(Place, request.body as any);
    await request.em.persistAndFlush(place);
    return place as any;
  });

  fastify.post(
    '/admin/courses/generate',
    { schema: { tags: ['admin'], summary: '코스 생성', security: [{ adminKey: [] }], body: GenerateCourseBodySchema } },
    async (_request, _reply) => {
      // if (!checkAdmin(request, reply)) return;
      // const { weekKey, placeIds } = request.body;
      // const em = request.em;

      // const places = await em.find(Place, { id: { $in: placeIds } });
      // const ordered = placeIds.map((id) => places.find((p) => p.id === id)!).filter(Boolean);

      // const generated = await generateCourse(
      //   ordered.map((p) => ({
      //     name: p.name,
      //     lat: p.lat,
      //     lng: p.lng,
      //     landmarkNames: p.landmarkNames,
      //     facts: p.facts as Record<string, unknown>,
      //   })),
      // );

      // const course = em.create(Course, {
      //   title: generated.title,
      //   theme: generated.theme,
      //   weekKey,
      //   estimatedDuration: generated.estimatedDuration,
      //   difficulty: generated.difficulty as Difficulty,
      //   prologue: generated.prologue,
      //   epilogue: generated.epilogue,
      //   isActive: false,
      // });
      // em.persist(course);

      // for (let i = 0; i < ordered.length; i++) {
      //   em.persist(em.create(CoursePlace, { course, place: ordered[i], order: i + 1 }));
      // }

      // for (const q of generated.quests) {
      //   em.persist(
      //     em.create(Quest, {
      //       course,
      //       place: ordered[q.placeIndex],
      //       order: q.order,
      //       type: q.type as any,
      //       narrativeText: q.narrativeText,
      //       instruction: q.instruction,
      //       mapHint: q.mapHint,
      //       answer: q.answer ?? undefined,
      //       gpsLatOverride: undefined,
      //       gpsLngOverride: undefined,
      //       gpsRadiusM: q.gpsRadiusM ?? undefined,
      //       timeLimitSec: q.timeLimitSec ?? undefined,
      //     }),
      //   );
      // }

      // await em.flush();
      // return em.findOneOrFail(
      //   Course,
      //   { id: course.id },
      //   { populate: ['quests', 'places', 'places.place'] },
      // );
      throw Error("Not implemented");
    },
  );

  fastify.patch(
    '/admin/courses/:id/status',
    { schema: { tags: ['admin'], summary: '코스 상태 변경', security: [{ adminKey: [] }], params: AdminCourseParamsSchema, body: UpdateCourseStatusBodySchema, response: { 401: ErrorSchema } } },
    async (request, reply) => {
      if (!checkAdmin(request, reply)) return;
      const course = await request.em.findOneOrFail(Course, { id: request.params.id });
      course.isActive = request.body.isActive!;
      await request.em.flush();
      return course as any;
    },
  );
};
