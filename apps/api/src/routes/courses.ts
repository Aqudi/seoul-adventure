import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Course, Quest, QuestType, Difficulty } from '@seoul-advanture/database';
import {
  CourseParamsSchema,
  ErrorSchema,
} from '@seoul-advanture/schemas';
import { generateScenario } from '../services/gemini.js';

function currentWeekKey(): string {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const week = Math.ceil(((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${String(week).padStart(2, '0')}`;
}

export const courseRoutes: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.get('/courses', { schema: { tags: ['courses'], summary: '코스 목록 조회' } }, async (request) => {
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

  fastify.post('/courses/generate', {
    schema: {
      tags: ['courses'],
      summary: 'Gemini AI로 랜드마크 기반 코스 생성',
      body: {
        type: 'object',
        required: ['landmark'],
        properties: {
          landmark: { type: 'string', minLength: 1 },
        },
      },
    },
  }, async (request: any, reply) => {
    const { landmark } = request.body as { landmark: string };
    const em = request.em;

    let scenarioData;
    try {
      scenarioData = await generateScenario(landmark);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gemini API 호출 실패';
      return reply.code(502).send({ error: message });
    }

    const course = em.create(Course, {
      title: scenarioData.game_title,
      theme: scenarioData.landmark,
      weekKey: currentWeekKey(),
      estimatedDuration: 60,
      difficulty: Difficulty.MEDIUM,
      prologue: scenarioData.prologue,
      epilogue: scenarioData.epilogue,
    });

    for (const q of scenarioData.quests) {
      // Gemini의 PASSWORD 타입을 Quest의 ANSWER 타입으로 매핑
      const questType = q.type === 'PHOTO' ? QuestType.PHOTO : QuestType.ANSWER;

      em.create(Quest, {
        course,
        order: q.step,
        type: questType,
        narrativeText: q.scenario_text,
        instruction: q.question ?? q.location_name,
        mapHint: q.fact_info,
        answer: q.answer ?? null,
        gpsLatOverride: q.latitude,
        gpsLngOverride: q.longitude,
      });
    }

    await em.flush();
    await em.populate(course, ['quests']);

    const quests = course.quests.getItems().map((q: Quest) => {
      const { answer: _answer, ...safe } = q as any;
      return safe;
    });

    return reply.code(201).send({ ...course, quests } as any);
  });
};
