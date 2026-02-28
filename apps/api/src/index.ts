import Fastify from 'fastify';
import cors from '@fastify/cors';

const fastify = Fastify({ logger: true });

async function buildServer() {
  await fastify.register(cors, {
    origin: '*', // Adjust for production
  });

  fastify.get('/health', async () => {
    return { status: 'ok', message: 'Seoul Advanture API is running' };
  });

  return fastify;
}

const start = async () => {
  try {
    const server = await buildServer();
    await server.listen({ port: 3001, host: '0.0.0.0' });
    console.log(`Server listening on port 3001`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
