import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import bcrypt from "bcrypt";
import { User, toUserResponse } from "../entities/index.js";
import { createLoginToken, setLoginCookie } from "../lib/auth-cookie.js";

const SALT_ROUNDS = 10;

interface RegisterBody {
    nickname: string;
    password: string;
}

export async function userRoutes(fastify: FastifyInstance) {
    fastify.post<{
        Body: RegisterBody;
    }>("/users/register", async (request: FastifyRequest<{ Body: RegisterBody }>, reply: FastifyReply) => {
        const orm = fastify.orm;
        const em = orm.em.fork();

        const { nickname, password } = request.body ?? {};

        if (!nickname || typeof nickname !== "string" || !nickname.trim()) {
            return reply.status(400).send({
                success: false,
                error: "nickname is required and must be a non-empty string",
            });
        }
        if (!password || typeof password !== "string") {
            return reply.status(400).send({
                success: false,
                error: "password is required",
            });
        }

        const trimmedNickname = nickname.trim();

        const existing = await em.findOne(User, { nickname: trimmedNickname });

        if (existing) {
            const passwordMatches = await bcrypt.compare(password, existing.password);
            if (passwordMatches) {
                const userResponse = toUserResponse(existing);
                const token = await createLoginToken(userResponse);
                setLoginCookie(reply, token);
                return reply.status(200).send({
                    success: true,
                    user: userResponse,
                    message: "기존 사용자 정보를 반환합니다.",
                });
            }
            return reply.status(400).send({
                success: false,
                error: "이미 사용 중인 닉네임입니다. 비밀번호가 일치하지 않습니다.",
            });
        }

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const user = em.create(User, {
            nickname: trimmedNickname,
            password: hashedPassword,
        });
        await em.flush();

        const userResponse = toUserResponse(user);
        const token = await createLoginToken(userResponse);
        setLoginCookie(reply, token);
        return reply.status(201).send({
            success: true,
            user: userResponse,
            message: "새 사용자가 등록되었습니다.",
        });
    });
}
