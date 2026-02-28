# MikroORM 연동 가이드

API 앱에 MikroORM을 연결한 작업 내용을 정리한 문서입니다.

---

## 1. 추가된 패키지

| 패키지 | 용도 |
|--------|------|
| `@mikro-orm/core` | MikroORM 코어 |
| `@mikro-orm/postgresql` | PostgreSQL 드라이버 |
| `reflect-metadata` | 데코레이터 메타데이터 (엔티티 매핑용) |
| `tsx` (devDependencies) | ESM + TypeScript 실행 (기존 ts-node 대체) |

---

## 2. 디렉터리/파일 구조

```
apps/api/
├── src/
│   ├── db/
│   │   ├── config.ts           # DB 환경 변수 (DB_HOST, PORT, USER, PASSWORD, DB_NAME)
│   │   ├── mikro-orm.config.ts # MikroORM 설정 (엔티티 경로, 디버그 등)
│   │   └── index.ts            # initDb(), getOrm(), closeDb()
│   ├── entities/
│   │   ├── BaseEntity.ts       # id(uuid), createdAt, updatedAt
│   │   ├── User.entity.ts      # 예시 엔티티 (email, name)
│   │   └── index.ts            # 엔티티 re-export
│   └── index.ts                # reflect-metadata → initDb() → fastify.decorate('orm')
├── .env.example                # DB 환경 변수 예시
└── tsconfig.json               # experimentalDecorators, emitDecoratorMetadata 추가
```

---

## 3. 주요 변경 사항

### 3.1 `tsconfig.json`

- `experimentalDecorators: true`
- `emitDecoratorMetadata: true`  
  (tsx 사용 시 메타데이터 미발생 이슈 대비로, 엔티티에는 `@Property({ type: "string" })` 등 타입을 명시)

### 3.2 DB 설정 (`src/db/config.ts`)

환경 변수 기본값:

- `DB_HOST` → localhost  
- `DB_PORT` → 5432  
- `DB_USER` → postgres  
- `DB_PASSWORD` → postgres  
- `DB_NAME` → seoul_advanture  
- 개발 시 `debug: true` 로 SQL 로깅

### 3.3 Fastify 연동 (`src/index.ts`)

- 앱 기동 시 `initDb()` 호출 후 `fastify.decorate("orm", orm)` 로 ORM 인스턴스 등록
- 라우트에서 `request.server.orm.em` 으로 `EntityManager` 사용 가능
- 서버 종료 시 `onClose` 훅에서 `closeDb()` 호출
- **GET /db** 엔드포인트: DB 연결 여부 확인 (`{ database: "connected" }` 등)

### 3.4 엔티티

- **BaseEntity**: `id` (uuid), `createdAt`, `updatedAt` 공통 필드
- **User**: `email`, `name` (nullable) 예시 엔티티  
  tsx 사용을 고려해 `@Property({ type: "string" })` 등 타입 명시

### 3.5 dev 스크립트

- 기존: `node --watch --import ts-node/register/transpile-only src/index.ts`
- 변경: `tsx watch src/index.ts` (ESM + TypeScript 호환)

---

## 4. 환경 변수 (`.env.example`)

```env
# Database (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=seoul_advanture

# Optional
# NODE_ENV=development
```

프로젝트 루트 또는 `apps/api` 에 `.env` 를 만들고 위 값을 로컬 환경에 맞게 설정하면 됩니다.

---

## 5. npm 스크립트

| 스크립트 | 설명 |
|----------|------|
| `pnpm run dev` | `tsx watch` 로 API 서버 실행 |
| `pnpm run db:schema:create` | 엔티티 기준으로 테이블 생성 |
| `pnpm run db:schema:update` | 엔티티 변경 사항으로 스키마 업데이트 |

---

## 6. 사용 방법

### 6.1 PostgreSQL 실행

로컬에 PostgreSQL이 없다면 예시 (Docker):

```bash
docker run -d --name postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=seoul_advanture \
  -p 5432:5432 \
  postgres:16
```

### 6.2 .env 설정

`apps/api/.env` (또는 프로젝트에서 읽는 경로)에 DB 접속 정보 입력.

### 6.3 스키마 생성 후 서버 실행

```bash
cd apps/api
pnpm run db:schema:create   # 최초 1회 또는 엔티티 추가/변경 시
pnpm run dev
```

### 6.4 라우트에서 ORM 사용 예시

```ts
import { User } from "./entities/index.js";

fastify.get("/users", async (req, reply) => {
  const em = req.server.orm.em.fork();
  const users = await em.find(User, {});
  return users;
});

fastify.post("/users", async (req, reply) => {
  const em = req.server.orm.em.fork();
  const user = em.create(User, {
    email: req.body.email,
    name: req.body.name ?? null,
  });
  await em.flush();
  return user;
});
```

---

## 7. 참고

- MikroORM 6.x + PostgreSQL 기준입니다.
- 엔티티는 `src/entities/**/*.ts` 에 두고, 빌드 결과는 `dist/entities/**/*.js` 를 사용하도록 설정되어 있습니다.
- 로컬에 PostgreSQL이 없으면 기동 시 `ECONNREFUSED 127.0.0.1:5432` 가 발생합니다. Postgres 실행 후 `.env` 설정만 맞추면 정상 연결됩니다.
