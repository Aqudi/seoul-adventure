# ---- Base ----
FROM node:20-alpine AS base
RUN corepack enable pnpm

# ---- Builder: install all deps and compile ----
FROM base AS builder
WORKDIR /app

# Copy workspace manifests for layer caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/database/package.json ./packages/database/
COPY packages/schemas/package.json ./packages/schemas/
COPY packages/typescript-config/package.json ./packages/typescript-config/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY packages/prettier-config/package.json ./packages/prettier-config/

RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/api ./apps/api
COPY packages/database ./packages/database
COPY packages/schemas ./packages/schemas
COPY packages/typescript-config ./packages/typescript-config

# Build workspace packages in dependency order, then the API
RUN pnpm --filter @seoul-advanture/database build && \
    pnpm --filter @seoul-advanture/schemas build && \
    pnpm --filter api build

# Produce a self-contained production deployment bundle
RUN pnpm --filter api deploy --prod /app/deploy

# ---- Runner: minimal production image ----
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 fastify

COPY --from=builder --chown=fastify:nodejs /app/deploy .

USER fastify

EXPOSE 8080

CMD ["node", "dist/index.js"]
