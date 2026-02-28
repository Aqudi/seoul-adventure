import { SignJWT } from "jose";
import type { FastifyReply } from "fastify";
import type { UserResponse } from "../entities/index.js";

const COOKIE_NAME = process.env.COOKIE_SESSION_NAME ?? "x_sa_t";
const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret-change-in-production";
const COOKIE_MAX_AGE_DAYS = 7;

export function getSessionCookieName(): string {
    return COOKIE_NAME;
}

export async function createLoginToken(user: UserResponse): Promise<string> {
    const secret = new TextEncoder().encode(JWT_SECRET);
    return new SignJWT({
        id: user.id,
        nickname: user.nickname,
    })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(`${COOKIE_MAX_AGE_DAYS}d`)
        .sign(secret);
}

export function setLoginCookie(reply: FastifyReply, token: string): void {
    reply.setCookie(COOKIE_NAME, token, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: COOKIE_MAX_AGE_DAYS * 24 * 60 * 60,
    });
}
