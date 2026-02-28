import type { FastifyInstance } from 'fastify';
import { User } from '@seoul-advanture/database';
import bcrypt from 'bcryptjs';
import {
  RegisterBodySchema,
  LoginBodySchema,
  AuthResponseSchema,
  type RegisterBody,
  type LoginBody,
} from '@seoul-advanture/schemas';

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post<{ Body: RegisterBody }>('/auth/register', {
    schema: {
      body: RegisterBodySchema,
      response: { 201: AuthResponseSchema, 200: AuthResponseSchema },
    },
    handler: async (request, reply) => {
      const { nickname, password } = request.body;
      const em = request.em;

      const exists = await em.findOne(User, { nickname });
      if (exists) {
        return reply.code(409).send({ error: '이미 사용 중인 닉네임입니다.' });
      }

      const user = em.create(User, {
        nickname,
        password: await bcrypt.hash(password, 10),
      });
      await em.persistAndFlush(user);

      const token = fastify.jwt.sign({ userId: user.id, nickname: user.nickname });
      return { token, user: { id: user.id, nickname: user.nickname } };
    },
  });

  fastify.post<{ Body: LoginBody }>('/auth/login', {
    schema: {
      body: LoginBodySchema,
      response: { 200: AuthResponseSchema },
    },
    handler: async (request, reply) => {
      const { nickname, password } = request.body;
      const em = request.em;

      const user = await em.findOne(User, { nickname });
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return reply.code(401).send({ error: '닉네임 또는 비밀번호가 올바르지 않습니다.' });
      }

      const token = fastify.jwt.sign({ userId: user.id, nickname: user.nickname });
      return { token, user: { id: user.id, nickname: user.nickname } };
    },
  });
}
