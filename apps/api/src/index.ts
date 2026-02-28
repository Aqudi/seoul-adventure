import "reflect-metadata";
import Fastify from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import type { FastifyInstance } from "fastify";
import { initDb, getOrm, closeDb } from "./db/index.js";
import { userRoutes } from "./routes/users.js";

declare module "fastify" {
    interface FastifyInstance {
        orm: Awaited<ReturnType<typeof initDb>>;
    }
}

const fastify = Fastify({ logger: true });

async function buildServer() {
    const orm = await initDb();
    fastify.decorate("orm", orm);

    await fastify.register(cookie, {
        secret: process.env.COOKIE_SECRET ?? process.env.JWT_SECRET ?? "dev-cookie-secret",
    });

    await fastify.register(cors, {
        origin: "*", // Adjust for production
        credentials: true,
    });

    fastify.get("/health", async () => {
        return { status: "ok", message: "Seoul Advanture API is running" };
    });

    fastify.get("/db", async (request, reply) => {
        const orm = getOrm();
        if (!orm) {
            return reply.status(503).send({ status: "error", message: "Database not initialized" });
        }
        const em = orm.em.fork();
        const isConnected = await em.getConnection().isConnected();
        return {
            status: "ok",
            database: isConnected ? "connected" : "disconnected",
        };
    });

    await fastify.register(userRoutes);

    fastify.addHook("onClose", async (instance: FastifyInstance) => {
        await closeDb();
    });

    return fastify;
}

const start = async () => {
    try {
        const server = await buildServer();
        await server.listen({ port: 3001, host: "0.0.0.0" });
        console.log(`Server listening on port 3001`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
