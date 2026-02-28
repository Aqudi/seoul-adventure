import type { FastifyInstance } from 'fastify';
import {
  Attempt,
  AttemptStatus,
  Quest,
  QuestState,
  QuestStatus,
  User,
  Course,
} from '@seoul-advanture/database';
import {
  StartAttemptBodySchema,
  AttemptParamsSchema,
  QuestCompleteParamsSchema,
  type StartAttemptBody,
  type AttemptParams,
  type QuestCompleteParams,
  type CompleteGpsQuestBody,
} from '@seoul-advanture/schemas';
import { writeFile } from 'fs/promises';
import { join, extname } from 'path';
import { randomUUID } from 'crypto';
import { UPLOAD_DIR } from '../lib/uploadDir.js';
import { haversineDistance } from '../lib/geo.js';

export async function attemptRoutes(fastify: FastifyInstance) {
  fastify.post<{ Body: StartAttemptBody }>(
    '/attempts',
    { onRequest: [fastify.authenticate], schema: { body: StartAttemptBodySchema } },
    async (request) => {
      const { userId } = request.user as { userId: string };
      const { courseId } = request.body;
      const em = request.em;

      const user = await em.findOneOrFail(User, { id: userId });
      const course = await em.findOneOrFail(Course, { id: courseId }, { populate: ['quests'] });

      const attempt = em.create(Attempt, { user, course });
      em.persist(attempt);

      for (const quest of course.quests.getItems()) {
        em.persist(em.create(QuestState, { attempt, quest }));
      }

      await em.flush();
      return em.findOneOrFail(
        Attempt,
        { id: attempt.id },
        { populate: ['questStates', 'questStates.quest'] },
      );
    },
  );

  fastify.get<{ Params: AttemptParams }>(
    '/attempts/:attemptId',
    { onRequest: [fastify.authenticate], schema: { params: AttemptParamsSchema } },
    async (request, reply) => {
      const { userId } = request.user as { userId: string };
      const em = request.em;

      const attempt = await em.findOne(
        Attempt,
        { id: request.params.attemptId, user: { id: userId } },
        {
          populate: [
            'questStates',
            'questStates.quest',
            'course',
            'course.places',
            'course.places.place',
          ],
        },
      );
      if (!attempt) return reply.code(404).send({ error: '찾을 수 없습니다.' });

      const sortedStates = attempt.questStates
        .getItems()
        .sort((a, b) => a.quest.order - b.quest.order);
      return { ...attempt, questStates: sortedStates };
    },
  );

  fastify.post<{ Params: QuestCompleteParams }>(
    '/attempts/:attemptId/quests/:questId/complete',
    { onRequest: [fastify.authenticate], schema: { params: QuestCompleteParamsSchema } },
    async (request, reply) => {
      const { attemptId, questId } = request.params;
      const { userId } = request.user as { userId: string };
      const em = request.em;

      const attempt = await em.findOne(Attempt, { id: attemptId, user: { id: userId } });
      if (!attempt) return reply.code(403).send({ error: '권한이 없습니다.' });

      const quest = await em.findOneOrFail(Quest, { id: questId });
      const questState = await em.findOneOrFail(QuestState, { attempt, quest });

      if (questState.status === QuestStatus.COMPLETED) {
        return reply.code(400).send({ error: '이미 완료된 퀘스트입니다.' });
      }

      const isMultipart = request.headers['content-type']?.includes('multipart');

      if (quest.type === 'PHOTO') {
        if (!isMultipart) return reply.code(400).send({ error: '사진을 업로드해야 합니다.' });
        const data = await (request as any).file();
        const ext = extname(data.filename) || '.jpg';
        const filename = `${randomUUID()}${ext}`;
        await writeFile(join(UPLOAD_DIR, filename), await data.toBuffer());
        questState.photoUrl = `/uploads/${filename}`;
      }

      if (quest.type === 'ANSWER') {
        const body = isMultipart
          ? Object.fromEntries(await (request as any).fields())
          : (request.body as any);
        const submitted = String(body.answer ?? '')
          .trim()
          .toLowerCase();
        const correct = String(quest.answer ?? '')
          .trim()
          .toLowerCase();
        if (submitted !== correct) {
          return reply.code(422).send({ error: '정답이 아닙니다. 다시 시도해보세요!' });
        }
      }

      if (quest.type === 'GPS_TIME') {
        const body = request.body as CompleteGpsQuestBody;
        await em.populate(quest, ['place']);
        const targetLat = quest.gpsLatOverride ?? quest.place?.lat;
        const targetLng = quest.gpsLngOverride ?? quest.place?.lng;
        if (targetLat == null || targetLng == null) {
          return reply.code(500).send({ error: 'GPS 퀘스트에 장소 정보가 없습니다.' });
        }
        const dist = haversineDistance(body.lat, body.lng, targetLat, targetLng);
        if (dist > (quest.gpsRadiusM ?? 200)) {
          return reply.code(422).send({
            error: `아직 목적지에 도착하지 않았습니다. (현재 거리: ${Math.round(dist)}m)`,
          });
        }
      }

      questState.status = QuestStatus.COMPLETED;
      questState.completedAt = new Date();
      await em.flush();

      return questState;
    },
  );

  fastify.post<{ Params: AttemptParams }>(
    '/attempts/:attemptId/finish',
    { onRequest: [fastify.authenticate], schema: { params: AttemptParamsSchema } },
    async (request, reply) => {
      const { attemptId } = request.params;
      const { userId } = request.user as { userId: string };
      const em = request.em;

      const attempt = await em.findOne(
        Attempt,
        { id: attemptId, user: { id: userId } },
        { populate: ['questStates'] },
      );
      if (!attempt) return reply.code(403).send({ error: '권한이 없습니다.' });

      const allDone = attempt.questStates
        .getItems()
        .every((s) => s.status === QuestStatus.COMPLETED);
      if (!allDone) return reply.code(400).send({ error: '아직 완료되지 않은 퀘스트가 있습니다.' });

      attempt.endAt = new Date();
      attempt.clearTimeMs = attempt.endAt.getTime() - attempt.startAt.getTime();
      attempt.status = AttemptStatus.COMPLETED;
      await em.flush();

      return attempt;
    },
  );
}
