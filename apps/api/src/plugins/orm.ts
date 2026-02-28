import fp from 'fastify-plugin';
import type { FastifyInstance } from 'fastify';
import { getOrm } from '@seoul-advanture/database';
import type { EntityManager } from '@mikro-orm/postgresql';

declare module 'fastify' {
  interface FastifyRequest {
    em: EntityManager;
  }
}

export default fp(async (fastify: FastifyInstance) => {
  const orm = await getOrm();

  // 개발 모드에서 스키마 자동 동기화 (마이그레이션 없이 즉시 반영)
  if (process.env.NODE_ENV === 'development') {
    await orm.schema.updateSchema();
    fastify.log.info('✅ DB schema synced (dev mode)');
  }

  // 요청마다 em.fork() → 요청 단위 Unit of Work 보장
  fastify.addHook('onRequest', async (request) => {
    request.em = orm.em.fork();
  });

  fastify.addHook('onClose', async () => {
    await orm.close();
  });
});
