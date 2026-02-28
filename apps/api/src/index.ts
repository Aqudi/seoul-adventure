import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import staticPlugin from '@fastify/static';
import ormPlugin from './plugins/orm.js';
import jwtPlugin from './plugins/jwt.js';
import { authRoutes } from './routes/auth.js';
import { courseRoutes } from './routes/courses.js';
import { attemptRoutes } from './routes/attempts.js';
import { leaderboardRoutes } from './routes/leaderboard.js';
import { adminRoutes } from './routes/admin.js';
import { ensureUploadDir, UPLOAD_DIR } from './lib/uploadDir.js';

export async function buildServer() {
  const fastify = Fastify({ logger: true });

  await fastify.register(cors, { origin: '*' });
  await fastify.register(ormPlugin);
  await fastify.register(jwtPlugin);

  await ensureUploadDir();
  await fastify.register(multipart, { limits: { fileSize: 10 * 1024 * 1024 } });
  await fastify.register(staticPlugin, { root: UPLOAD_DIR, prefix: '/uploads/' });

  fastify.get('/health', async () => ({ status: 'ok' }));

  await fastify.register(authRoutes);
  await fastify.register(courseRoutes);
  await fastify.register(attemptRoutes);
  await fastify.register(leaderboardRoutes);
  await fastify.register(adminRoutes);

  return fastify;
}

if (process.env.NODE_ENV !== 'test') {
  const start = async () => {
    const server = await buildServer();
    await server.listen({ port: 3001, host: '0.0.0.0' });
  };
  start().catch(console.error);
}
