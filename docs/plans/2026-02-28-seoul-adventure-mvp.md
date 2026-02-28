# 서울 역사 탐험 MVP Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 사용자가 서울 장소를 이동하며 퀘스트(사진 인증/정답 입력/GPS 체크)를 수행하고, 클리어 타임을 리더보드에 기록하는 야외 미션 게임 MVP 구현

**Architecture:** Fastify REST API + MikroORM(PostgreSQL) 백엔드, Next.js 16 App Router 프론트엔드, JWT 인증. 퀘스트 상태는 서버에서 관리하며 클라이언트는 단순 UI 레이어 역할.

**Tech Stack:** pnpm monorepo / Turborepo, Fastify 5 + MikroORM + PostgreSQL + JWT, Next.js 16 + React 19 + Tailwind CSS 4 + Radix UI, OpenAI SDK(AI 코스 생성), html-to-image(공유 이미지)

---

## 현재 상태

- `apps/api`: Fastify 기본 세팅 (health check만 존재, 포트 3001)
- `apps/web`: Next.js 16 기본 세팅 (빈 페이지, shadcn UI 컴포넌트 일부 존재)
- DB 없음, 인증 없음, 게임 로직 없음

---

## Phase 1: 데이터베이스 & API 기반

### Task 2: 엔티티 정의 (MikroORM 데코레이터)

**Files:**

- Create: `packages/database/src/entities/User.ts`
- Create: `packages/database/src/entities/Place.ts`
- Create: `packages/database/src/entities/Course.ts`
- Create: `packages/database/src/entities/CoursePlace.ts`
- Create: `packages/database/src/entities/Quest.ts`
- Create: `packages/database/src/entities/Attempt.ts`
- Create: `packages/database/src/entities/QuestState.ts`
- Create: `packages/database/src/entities/index.ts`

**Step 1: User 엔티티 (`packages/database/src/entities/User.ts`)**

```typescript
import {
  Entity,
  PrimaryKey,
  Property,
  OneToMany,
  Collection,
} from "@mikro-orm/core";
import { v4 as uuid } from "uuid";
import type { Attempt } from "./Attempt.js";

@Entity()
export class User {
  @PrimaryKey()
  id: string = uuid();

  @Property({ unique: true })
  nickname!: string;

  @Property()
  password!: string; // bcrypt hashed

  @Property()
  createdAt: Date = new Date();

  @OneToMany("Attempt", "user")
  attempts = new Collection<Attempt>(this);
}
```

**Step 2: Place 엔티티 (`packages/database/src/entities/Place.ts`)**

```typescript
import {
  Entity,
  PrimaryKey,
  Property,
  OneToMany,
  Collection,
} from "@mikro-orm/core";
import { v4 as uuid } from "uuid";
import type { CoursePlace } from "./CoursePlace.js";
import type { Quest } from "./Quest.js";

@Entity()
export class Place {
  @PrimaryKey()
  id: string = uuid();

  @Property()
  name!: string;

  @Property({ type: "double" })
  lat!: number;

  @Property({ type: "double" })
  lng!: number;

  @Property({ type: "array" })
  landmarkNames: string[] = [];

  @Property({ nullable: true })
  imageUrl?: string;

  @Property({ type: "json", nullable: true })
  facts?: Record<string, unknown>;

  @OneToMany("CoursePlace", "place")
  courseRoutes = new Collection<CoursePlace>(this);

  @OneToMany("Quest", "place")
  quests = new Collection<Quest>(this);
}
```

**Step 3: Course 엔티티 (`packages/database/src/entities/Course.ts`)**

```typescript
import {
  Entity,
  PrimaryKey,
  Property,
  Enum,
  Index,
  OneToMany,
  Collection,
} from "@mikro-orm/core";
import { v4 as uuid } from "uuid";
import type { CoursePlace } from "./CoursePlace.js";
import type { Quest } from "./Quest.js";
import type { Attempt } from "./Attempt.js";

export enum Difficulty {
  EASY = "EASY",
  MEDIUM = "MEDIUM",
  HARD = "HARD",
}

@Entity()
export class Course {
  @PrimaryKey()
  id: string = uuid();

  @Property()
  title!: string;

  @Property()
  theme!: string;

  @Index() // "이번 주 코스" 쿼리에 사용
  @Property()
  weekKey!: string; // e.g. "2026-W09"

  @Property()
  estimatedDuration!: number; // minutes

  @Enum(() => Difficulty)
  difficulty: Difficulty = Difficulty.MEDIUM;

  @Property({ type: "text" })
  prologue!: string;

  @Property({ type: "text" })
  epilogue!: string;

  @Property()
  isActive: boolean = true;

  @Property()
  createdAt: Date = new Date();

  @OneToMany("CoursePlace", "course")
  places = new Collection<CoursePlace>(this);

  @OneToMany("Quest", "course")
  quests = new Collection<Quest>(this);

  @OneToMany("Attempt", "course")
  attempts = new Collection<Attempt>(this);
}
```

**Step 4: CoursePlace 엔티티 (`packages/database/src/entities/CoursePlace.ts`)**

```typescript
import { Entity, ManyToOne, Property } from "@mikro-orm/core";
import { Course } from "./Course.js";
import { Place } from "./Place.js";

// 복합 PK: (course, place) — 같은 코스에 동일 장소 중복 삽입 방지
@Entity()
export class CoursePlace {
  @ManyToOne(() => Course, { primary: true })
  course!: Course;

  @ManyToOne(() => Place, { primary: true })
  place!: Place;

  @Property()
  order!: number;
}
```

**Step 5: Quest 엔티티 (`packages/database/src/entities/Quest.ts`)**

```typescript
import {
  Entity,
  PrimaryKey,
  Property,
  Enum,
  ManyToOne,
  OneToMany,
  Collection,
} from "@mikro-orm/core";
import { v4 as uuid } from "uuid";
import { Course } from "./Course.js";
import { Place } from "./Place.js";
import type { QuestState } from "./QuestState.js";

export enum QuestType {
  PHOTO = "PHOTO",
  ANSWER = "ANSWER",
  GPS_TIME = "GPS_TIME",
}

@Entity()
export class Quest {
  @PrimaryKey()
  id: string = uuid();

  @ManyToOne(() => Course)
  course!: Course;

  // GPS_TIME 퀘스트는 반드시 place가 있어야 함 (좌표는 place.lat/lng 사용)
  @ManyToOne(() => Place, { nullable: true })
  place?: Place;

  @Property()
  order!: number;

  @Enum(() => QuestType)
  type!: QuestType;

  @Property({ type: "text" })
  narrativeText!: string; // 조선왕실톡 대사

  @Property({ type: "text" })
  instruction!: string; // 유저에게 보이는 미션 설명

  @Property({ type: "text" })
  mapHint!: string; // 다음 장소 이동 안내 문구

  @Property({ nullable: true })
  answer?: string; // ANSWER 타입용

  // GPS 좌표는 place.lat/lng를 기본으로 사용.
  // 특정 지점(정문이 아닌 조형물 앞 등)이 필요할 때만 아래 필드로 오버라이드.
  @Property({ type: "double", nullable: true })
  gpsLatOverride?: number;

  @Property({ type: "double", nullable: true })
  gpsLngOverride?: number;

  @Property({ nullable: true })
  gpsRadiusM?: number;

  @Property({ nullable: true })
  timeLimitSec?: number;

  @OneToMany("QuestState", "quest")
  questStates = new Collection<QuestState>(this);
}
```

**Step 6: Attempt 엔티티 (`packages/database/src/entities/Attempt.ts`)**

```typescript
import {
  Entity,
  PrimaryKey,
  Property,
  Enum,
  Index,
  ManyToOne,
  OneToMany,
  Collection,
} from "@mikro-orm/core";
import { v4 as uuid } from "uuid";
import { User } from "./User.js";
import { Course } from "./Course.js";
import type { QuestState } from "./QuestState.js";

export enum AttemptStatus {
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  ABANDONED = "ABANDONED",
}

@Entity()
export class Attempt {
  @PrimaryKey()
  id: string = uuid();

  @ManyToOne(() => User)
  user!: User;

  @Index() // 리더보드: courseId + clearTimeMs 정렬
  @ManyToOne(() => Course)
  course!: Course;

  @Enum(() => AttemptStatus)
  status: AttemptStatus = AttemptStatus.IN_PROGRESS;

  @Property()
  startAt: Date = new Date();

  @Property({ nullable: true })
  endAt?: Date;

  @Index() // 리더보드 정렬용
  @Property({ nullable: true })
  clearTimeMs?: number;

  @OneToMany("QuestState", "attempt")
  questStates = new Collection<QuestState>(this);
}
```

**Step 7: QuestState 엔티티 (`packages/database/src/entities/QuestState.ts`)**

```typescript
import {
  Entity,
  PrimaryKey,
  Property,
  Enum,
  ManyToOne,
  Unique,
} from "@mikro-orm/core";
import { v4 as uuid } from "uuid";
import { Attempt } from "./Attempt.js";
import { Quest } from "./Quest.js";

// FAILED 제거: MVP에서 오답/실패는 HTTP 에러로 처리하고 PENDING 유지
export enum QuestStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
}

@Entity()
@Unique({ properties: ["attempt", "quest"] })
export class QuestState {
  @PrimaryKey()
  id: string = uuid();

  @ManyToOne(() => Attempt)
  attempt!: Attempt;

  @ManyToOne(() => Quest)
  quest!: Quest;

  @Enum(() => QuestStatus)
  status: QuestStatus = QuestStatus.PENDING;

  @Property({ nullable: true })
  completedAt?: Date;

  @Property({ nullable: true })
  photoUrl?: string;
}
```

**Step 8: 엔티티 barrel export (`packages/database/src/entities/index.ts`)**

```typescript
export { User } from "./User.js";
export { Place } from "./Place.js";
export { Course, Difficulty } from "./Course.js";
export { CoursePlace } from "./CoursePlace.js";
export { Quest, QuestType } from "./Quest.js";
export { Attempt, AttemptStatus } from "./Attempt.js";
export { QuestState, QuestStatus } from "./QuestState.js";
```

**Step 9: uuid 패키지 추가**

```bash
cd packages/database && pnpm add uuid && pnpm add -D @types/uuid
```

**Step 10: Commit**

```bash
git add packages/database/src/entities/
git commit -m "feat: add MikroORM entity classes (User/Place/Course/Quest/Attempt)"
```

---

### Task 3: 시드 데이터 (세빛섬 테마 샘플 코스)

**Files:**

- Create: `packages/database/src/seed.ts`

**Step 1: seed.ts 생성**

```typescript
import { getOrm } from "./index.js";
import {
  User,
  Place,
  Course,
  CoursePlace,
  Quest,
  QuestType,
  Difficulty,
} from "./entities/index.js";
import bcrypt from "bcryptjs";

async function main() {
  const orm = await getOrm();
  const em = orm.em.fork();

  // 테스트 유저
  let user = await em.findOne(User, { nickname: "testuser" });
  if (!user) {
    user = em.create(User, {
      nickname: "testuser",
      password: await bcrypt.hash("password123", 10),
    });
    em.persist(user);
  }

  // 장소
  let place1 = await em.findOne(Place, { name: "세빛섬" });
  if (!place1) {
    place1 = em.create(Place, {
      name: "세빛섬",
      lat: 37.5116,
      lng: 127.0594,
      landmarkNames: ["세빛섬", "가빛섬", "채빛섬", "솔빛섬"],
      facts: { builtYear: 2011, islandCount: 3 },
    });
    em.persist(place1);
  }

  let place2 = await em.findOne(Place, { name: "반포한강공원" });
  if (!place2) {
    place2 = em.create(Place, {
      name: "반포한강공원",
      lat: 37.5126,
      lng: 126.9972,
      landmarkNames: ["달빛무지개분수", "반포대교"],
      facts: { fountainLength: 1140 },
    });
    em.persist(place2);
  }

  await em.flush();

  // 코스
  let course = await em.findOne(Course, { weekKey: "2026-W09" });
  if (!course) {
    course = em.create(Course, {
      title: "세빛섬의 비밀",
      theme: "한강 야경 탐험",
      weekKey: "2026-W09",
      estimatedDuration: 90,
      difficulty: Difficulty.MEDIUM,
      prologue:
        "이보게 탐험가! 한강에 떠 있는 세 개의 빛나는 섬에 비밀이 숨겨져 있다 하오. 그대가 모든 단서를 모아 진실을 밝혀주시오!",
      epilogue:
        "훌륭하오! 모든 단서를 모아냈군요. 이제 그대는 한강의 비밀을 아는 단 한 명의 탐험가가 되었소. 명예 탐험단으로 임명하오!",
    });
    em.persist(course);
    await em.flush();

    // 코스-장소 연결
    em.persist(em.create(CoursePlace, { course, place: place1, order: 1 }));
    em.persist(em.create(CoursePlace, { course, place: place2, order: 2 }));

    // 퀘스트
    em.persist(
      em.create(Quest, {
        course,
        place: place1,
        order: 1,
        type: QuestType.PHOTO,
        narrativeText:
          '이보게 사관! 세빛섬 앞에서 "출발 둥둥 세빛섬!" 을 외치며 인증샷을 올려보시오!',
        instruction:
          '"출발 둥둥 세빛섬!" 을 외치는 모습을 사진으로 찍어 올리세요.',
        mapHint:
          "다음 목적지: 반포한강공원 달빛무지개분수 방향으로 이동하시오 (도보 약 15분)",
      }),
    );

    em.persist(
      em.create(Quest, {
        course,
        place: place1,
        order: 2,
        type: QuestType.ANSWER,
        narrativeText: "세빛섬이 만들어진 해를 아시오? 정답을 맞춰보시오!",
        instruction: "세빛섬이 완공된 연도를 입력하세요.",
        mapHint: "정답을 맞혔다면 반포한강공원으로 출발하시오!",
        answer: "2011",
      }),
    );

    em.persist(
      em.create(Quest, {
        course,
        place: place2, // GPS 좌표는 place2.lat/lng(37.5126, 126.9972) 자동 사용
        order: 3,
        type: QuestType.GPS_TIME,
        narrativeText:
          "반포한강공원 달빛무지개분수 근처로 5분 안에 이동하시오!",
        instruction:
          "반포한강공원 달빛무지개분수 위치로 이동하세요. 반경 200m 안에 들어와야 합니다.",
        mapHint: "위치 인증이 완료되면 마지막 퀘스트가 활성화됩니다.",
        gpsRadiusM: 200,
        timeLimitSec: 300,
      }),
    );

    em.persist(
      em.create(Quest, {
        course,
        place: place2,
        order: 4,
        type: QuestType.PHOTO,
        narrativeText:
          "달빛무지개분수 앞에서 가장 멋진 포즈로 인증샷을 찍어오시오!",
        instruction: "달빛무지개분수가 보이게 인증샷을 찍으세요.",
        mapHint: "마지막 인증입니다. 완료하면 엔딩이 기다리고 있소!",
      }),
    );

    await em.flush();
  }

  console.log("✅ Seed complete");
  await orm.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

**Step 2: bcryptjs 설치**

```bash
cd packages/database && pnpm add bcryptjs && pnpm add -D @types/bcryptjs
```

**Step 3: DB 스키마 생성 후 시드 실행**

```bash
# PostgreSQL 실행 확인 (Docker 권장)
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=seoul_adventure postgres:16

# 스키마 생성 (개발 초기 - 전체 재생성)
cd packages/database && pnpm db:schema:fresh

# 시드 실행
pnpm db:seed
```

Expected output: `✅ Seed complete`

**Step 4: Commit**

```bash
git add packages/database/src/seed.ts
git commit -m "feat: add MikroORM seed data for 세빛섬 theme course"
```

---

### Task 4: API에 MikroORM 연결 + 플러그인 세팅

**Files:**

- Modify: `apps/api/package.json` (의존성 추가)
- Create: `apps/api/.env`
- Create: `apps/api/src/plugins/orm.ts`
- Modify: `apps/api/src/index.ts`

**Step 1: API에 패키지 추가**

```bash
cd apps/api && pnpm add @seoul-advanture/database @fastify/jwt @fastify/multipart @fastify/static bcryptjs fastify-plugin
pnpm add -D @types/bcryptjs
```

**Step 2: apps/api/.env 생성**

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/seoul_adventure"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
ADMIN_KEY="admin-secret"
NODE_ENV="development"
```

**Step 3: ORM Fastify 플러그인 생성 (`apps/api/src/plugins/orm.ts`)**

MikroORM은 요청마다 EntityManager를 fork 해서 써야 합니다 (Unit of Work 격리).

```typescript
import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";
import { getOrm } from "@seoul-advanture/database";
import type { EntityManager } from "@mikro-orm/postgresql";

declare module "fastify" {
  interface FastifyRequest {
    em: EntityManager;
  }
}

export default fp(async (fastify: FastifyInstance) => {
  const orm = await getOrm();

  // 요청마다 em.fork() → 요청 단위 Unit of Work 보장
  fastify.addHook("onRequest", async (request) => {
    request.em = orm.em.fork();
  });

  fastify.addHook("onClose", async () => {
    await orm.close();
  });
});
```

**Step 4: JWT 플러그인 생성 (`apps/api/src/plugins/jwt.ts`)**

```typescript
import fp from "fastify-plugin";
import jwt from "@fastify/jwt";
import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (
      request: FastifyRequest,
      reply: FastifyReply,
    ) => Promise<void>;
  }
}

export default fp(async (fastify: FastifyInstance) => {
  fastify.register(jwt, {
    secret: process.env.JWT_SECRET ?? "fallback-secret",
  });

  fastify.decorate(
    "authenticate",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        reply.send(err);
      }
    },
  );
});
```

**Step 5: index.ts 개편**

```typescript
import Fastify from "fastify";
import cors from "@fastify/cors";
import ormPlugin from "./plugins/orm.js";
import jwtPlugin from "./plugins/jwt.js";

export async function buildServer() {
  const fastify = Fastify({ logger: true });

  await fastify.register(cors, { origin: "*" });
  await fastify.register(ormPlugin);
  await fastify.register(jwtPlugin);

  fastify.get("/health", async () => ({ status: "ok" }));

  return fastify;
}

if (process.env.NODE_ENV !== "test") {
  const start = async () => {
    const server = await buildServer();
    await server.listen({ port: 3001, host: "0.0.0.0" });
  };
  start().catch(console.error);
}
```

**Step 6: 서버 실행 확인**

```bash
cd apps/api && pnpm dev
# Expected: Server listening on port 3001 (MikroORM 연결 로그 포함)
```

**Step 7: Commit**

```bash
git commit -am "feat: wire MikroORM and JWT plugins to Fastify"
```

---

### Task 5: 인증 API (회원가입 / 로그인)

**Files:**

- Create: `apps/api/src/routes/auth.ts`
- Modify: `apps/api/src/index.ts`

**Step 1: auth.ts 생성**

```typescript
import type { FastifyInstance } from "fastify";
import { User } from "@seoul-advanture/database";
import bcrypt from "bcryptjs";

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post<{ Body: { nickname: string; password: string } }>(
    "/auth/register",
    {
      schema: {
        body: {
          type: "object",
          required: ["nickname", "password"],
          properties: {
            nickname: { type: "string", minLength: 2, maxLength: 20 },
            password: { type: "string", minLength: 6 },
          },
        },
      },
      handler: async (request, reply) => {
        const { nickname, password } = request.body;
        const em = request.em;

        const exists = await em.findOne(User, { nickname });
        if (exists) {
          return reply
            .code(409)
            .send({ error: "이미 사용 중인 닉네임입니다." });
        }

        const user = em.create(User, {
          nickname,
          password: await bcrypt.hash(password, 10),
        });
        await em.persistAndFlush(user);

        const token = fastify.jwt.sign({
          userId: user.id,
          nickname: user.nickname,
        });
        return { token, user: { id: user.id, nickname: user.nickname } };
      },
    },
  );

  fastify.post<{ Body: { nickname: string; password: string } }>(
    "/auth/login",
    {
      schema: {
        body: {
          type: "object",
          required: ["nickname", "password"],
          properties: {
            nickname: { type: "string" },
            password: { type: "string" },
          },
        },
      },
      handler: async (request, reply) => {
        const { nickname, password } = request.body;
        const em = request.em;

        const user = await em.findOne(User, { nickname });
        if (!user || !(await bcrypt.compare(password, user.password))) {
          return reply
            .code(401)
            .send({ error: "닉네임 또는 비밀번호가 올바르지 않습니다." });
        }

        const token = fastify.jwt.sign({
          userId: user.id,
          nickname: user.nickname,
        });
        return { token, user: { id: user.id, nickname: user.nickname } };
      },
    },
  );
}
```

**Step 2: index.ts에 라우트 등록**

```typescript
import { authRoutes } from "./routes/auth.js";
await fastify.register(authRoutes);
```

**Step 3: 동작 확인**

```bash
# 회원가입
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nickname":"탐험가1","password":"pass123"}'
# Expected: { "token": "eyJ...", "user": { "id": "...", "nickname": "탐험가1" } }

# 로그인
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"nickname":"탐험가1","password":"pass123"}'
# Expected: { "token": "eyJ...", ... }
```

**Step 4: Commit**

```bash
git commit -am "feat: add register/login auth endpoints with JWT"
```

---

### Task 6: 코스 & 퀘스트 조회 API

**Files:**

- Create: `apps/api/src/routes/courses.ts`

**Step 1: courses.ts 생성**

```typescript
import type { FastifyInstance } from "fastify";
import { Course, Quest } from "@seoul-advanture/database";

export async function courseRoutes(fastify: FastifyInstance) {
  // 활성 코스 목록
  fastify.get("/courses", async (request) => {
    const em = request.em;
    return em.find(
      Course,
      { isActive: true },
      {
        populate: ["places", "places.place"],
        orderBy: { weekKey: "DESC" },
      },
    );
  });

  // 코스 상세 (정답 제외한 퀘스트 포함)
  fastify.get<{ Params: { id: string } }>(
    "/courses/:id",
    async (request, reply) => {
      const em = request.em;

      const course = await em.findOne(
        Course,
        { id: request.params.id },
        { populate: ["places", "places.place", "quests"] },
      );

      if (!course)
        return reply.code(404).send({ error: "코스를 찾을 수 없습니다." });

      // 정답 필드 제거 후 반환
      const quests = course.quests.getItems().map((q) => {
        const { answer: _answer, ...safe } = q as any;
        return safe;
      });

      return { ...course, quests };
    },
  );
}
```

**Step 2: index.ts에 등록**

```typescript
import { courseRoutes } from "./routes/courses.js";
await fastify.register(courseRoutes);
```

**Step 3: Commit**

```bash
git commit -am "feat: add course list and detail API"
```

---

### Task 7: 퀘스트 진행 API (시도 시작 / 퀘스트 완료 / 코스 완료)

**Files:**

- Create: `apps/api/src/routes/attempts.ts`
- Create: `apps/api/src/lib/uploadDir.ts`
- Create: `apps/api/src/lib/geo.ts`

**Step 1: 업로드 디렉토리 유틸 (`apps/api/src/lib/uploadDir.ts`)**

```typescript
import { mkdir } from "fs/promises";
import { join } from "path";

export const UPLOAD_DIR = join(process.cwd(), "uploads");

export async function ensureUploadDir() {
  await mkdir(UPLOAD_DIR, { recursive: true });
}
```

**Step 2: Haversine 거리 계산 (`apps/api/src/lib/geo.ts`)**

```typescript
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371000; // 지구 반경 (미터)
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
```

**Step 3: @fastify/multipart + @fastify/static 설치**

```bash
cd apps/api && pnpm add @fastify/multipart @fastify/static
```

**Step 4: attempts.ts 생성**

```typescript
import type { FastifyInstance } from "fastify";
import {
  Attempt,
  AttemptStatus,
  Quest,
  QuestState,
  QuestStatus,
  User,
  Course,
} from "@seoul-advanture/database";
import { writeFile } from "fs/promises";
import { join, extname } from "path";
import { randomUUID } from "crypto";
import { UPLOAD_DIR } from "../lib/uploadDir.js";
import { haversineDistance } from "../lib/geo.js";

export async function attemptRoutes(fastify: FastifyInstance) {
  // 게임 시작
  fastify.post<{ Body: { courseId: string } }>(
    "/attempts",
    { onRequest: [fastify.authenticate] },
    async (request) => {
      const { userId } = request.user as { userId: string };
      const { courseId } = request.body;
      const em = request.em;

      const user = await em.findOneOrFail(User, { id: userId });
      const course = await em.findOneOrFail(
        Course,
        { id: courseId },
        { populate: ["quests"] },
      );

      const attempt = em.create(Attempt, { user, course });
      em.persist(attempt);

      // 모든 퀘스트에 대해 PENDING 상태 생성
      for (const quest of course.quests.getItems()) {
        em.persist(em.create(QuestState, { attempt, quest }));
      }

      await em.flush();
      return em.findOneOrFail(
        Attempt,
        { id: attempt.id },
        { populate: ["questStates", "questStates.quest"] },
      );
    },
  );

  // 내 시도 상태 조회
  fastify.get<{ Params: { attemptId: string } }>(
    "/attempts/:attemptId",
    { onRequest: [fastify.authenticate] },
    async (request, reply) => {
      const { userId } = request.user as { userId: string };
      const em = request.em;

      const attempt = await em.findOne(
        Attempt,
        { id: request.params.attemptId, user: { id: userId } },
        { populate: ["questStates", "questStates.quest", "course"] },
      );
      if (!attempt) return reply.code(404).send({ error: "찾을 수 없습니다." });

      // 퀘스트 순서대로 정렬
      const sortedStates = attempt.questStates
        .getItems()
        .sort((a, b) => a.quest.order - b.quest.order);
      return { ...attempt, questStates: sortedStates };
    },
  );

  // 퀘스트 완료 처리
  fastify.post<{ Params: { attemptId: string; questId: string } }>(
    "/attempts/:attemptId/quests/:questId/complete",
    { onRequest: [fastify.authenticate] },
    async (request, reply) => {
      const { attemptId, questId } = request.params;
      const { userId } = request.user as { userId: string };
      const em = request.em;

      const attempt = await em.findOne(Attempt, {
        id: attemptId,
        user: { id: userId },
      });
      if (!attempt) return reply.code(403).send({ error: "권한이 없습니다." });

      const quest = await em.findOneOrFail(Quest, { id: questId });
      const questState = await em.findOneOrFail(QuestState, { attempt, quest });

      if (questState.status === QuestStatus.COMPLETED) {
        return reply.code(400).send({ error: "이미 완료된 퀘스트입니다." });
      }

      const isMultipart =
        request.headers["content-type"]?.includes("multipart");

      if (quest.type === "PHOTO") {
        if (!isMultipart)
          return reply.code(400).send({ error: "사진을 업로드해야 합니다." });
        const data = await (request as any).file();
        const ext = extname(data.filename) || ".jpg";
        const filename = `${randomUUID()}${ext}`;
        await writeFile(join(UPLOAD_DIR, filename), await data.toBuffer());
        questState.photoUrl = `/uploads/${filename}`;
      }

      if (quest.type === "ANSWER") {
        const body = isMultipart
          ? Object.fromEntries(await (request as any).fields())
          : (request.body as any);
        const submitted = String(body.answer ?? "")
          .trim()
          .toLowerCase();
        const correct = String(quest.answer ?? "")
          .trim()
          .toLowerCase();
        if (submitted !== correct) {
          return reply
            .code(422)
            .send({ error: "정답이 아닙니다. 다시 시도해보세요!" });
        }
      }

      if (quest.type === "GPS_TIME") {
        const body = request.body as { lat: number; lng: number };
        // gpsLatOverride가 있으면 사용, 없으면 place.lat/lng 사용 (중복 저장 방지)
        await em.populate(quest, ["place"]);
        const targetLat = quest.gpsLatOverride ?? quest.place?.lat;
        const targetLng = quest.gpsLngOverride ?? quest.place?.lng;
        if (targetLat == null || targetLng == null) {
          return reply
            .code(500)
            .send({ error: "GPS 퀘스트에 장소 정보가 없습니다." });
        }
        const dist = haversineDistance(
          body.lat,
          body.lng,
          targetLat,
          targetLng,
        );
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

  // 코스 완료
  fastify.post<{ Params: { attemptId: string } }>(
    "/attempts/:attemptId/finish",
    { onRequest: [fastify.authenticate] },
    async (request, reply) => {
      const { attemptId } = request.params;
      const { userId } = request.user as { userId: string };
      const em = request.em;

      const attempt = await em.findOne(
        Attempt,
        { id: attemptId, user: { id: userId } },
        { populate: ["questStates"] },
      );
      if (!attempt) return reply.code(403).send({ error: "권한이 없습니다." });

      const allDone = attempt.questStates
        .getItems()
        .every((s) => s.status === QuestStatus.COMPLETED);
      if (!allDone)
        return reply
          .code(400)
          .send({ error: "아직 완료되지 않은 퀘스트가 있습니다." });

      attempt.endAt = new Date();
      attempt.clearTimeMs = attempt.endAt.getTime() - attempt.startAt.getTime();
      attempt.status = AttemptStatus.COMPLETED;
      await em.flush();

      return attempt;
    },
  );
}
```

**Step 5: index.ts에 등록**

```typescript
import multipart from "@fastify/multipart";
import staticPlugin from "@fastify/static";
import { ensureUploadDir, UPLOAD_DIR } from "./lib/uploadDir.js";
import { attemptRoutes } from "./routes/attempts.js";

await ensureUploadDir();
await fastify.register(multipart, { limits: { fileSize: 10 * 1024 * 1024 } });
await fastify.register(staticPlugin, { root: UPLOAD_DIR, prefix: "/uploads/" });
await fastify.register(attemptRoutes);
```

**Step 6: Commit**

```bash
git commit -am "feat: add attempt/quest completion API with MikroORM"
```

---

### Task 8: 리더보드 API

**Files:**

- Create: `apps/api/src/routes/leaderboard.ts`

**Step 1: leaderboard.ts 생성**

```typescript
import type { FastifyInstance } from "fastify";
import { Attempt, AttemptStatus } from "@seoul-advanture/database";

export async function leaderboardRoutes(fastify: FastifyInstance) {
  // 코스별 리더보드 (상위 50)
  fastify.get<{ Params: { courseId: string } }>(
    "/leaderboard/:courseId",
    async (request) => {
      const em = request.em;

      const attempts = await em.find(
        Attempt,
        {
          course: { id: request.params.courseId },
          status: AttemptStatus.COMPLETED,
        },
        {
          populate: ["user"],
          orderBy: { clearTimeMs: "ASC" },
          limit: 50,
        },
      );

      return attempts.map((a, i) => ({
        rank: i + 1,
        nickname: a.user.nickname,
        clearTimeMs: a.clearTimeMs,
        clearedAt: a.endAt,
      }));
    },
  );

  // 내 순위 조회
  fastify.get<{
    Params: { courseId: string };
    Querystring: { attemptId: string };
  }>(
    "/leaderboard/:courseId/my-rank",
    { onRequest: [fastify.authenticate] },
    async (request) => {
      const { courseId } = request.params;
      const { attemptId } = request.query;
      const em = request.em;

      const myAttempt = await em.findOne(Attempt, { id: attemptId });
      if (myAttempt?.status !== AttemptStatus.COMPLETED) return { rank: null };

      const betterCount = await em.count(Attempt, {
        course: { id: courseId },
        status: AttemptStatus.COMPLETED,
        clearTimeMs: { $lt: myAttempt.clearTimeMs! },
      });

      return { rank: betterCount + 1, clearTimeMs: myAttempt.clearTimeMs };
    },
  );
}
```

**Step 2: index.ts에 등록**

```typescript
import { leaderboardRoutes } from "./routes/leaderboard.js";
await fastify.register(leaderboardRoutes);
```

**Step 3: Commit**

```bash
git commit -am "feat: add leaderboard API"
```

---

## Phase 2: Web 프론트엔드

---

### Task 9: API 클라이언트 & 인증 컨텍스트

**Files:**

- Create: `apps/web/src/lib/api.ts`
- Create: `apps/web/src/lib/types.ts`
- Create: `apps/web/src/contexts/AuthContext.tsx`

**Step 1: API 기본 클라이언트 (`apps/web/src/lib/api.ts`)**

```typescript
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers as Record<string, string>),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new ApiError(res.status, err.error ?? "오류가 발생했습니다.");
  }
  return res.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  postForm: async <T>(path: string, formData: FormData): Promise<T> => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      body: formData,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new ApiError(res.status, err.error ?? "오류가 발생했습니다.");
    }
    return res.json();
  },
};
```

**Step 2: 타입 정의 (`apps/web/src/lib/types.ts`)**

```typescript
export type Difficulty = "EASY" | "MEDIUM" | "HARD";
export type QuestType = "PHOTO" | "ANSWER" | "GPS_TIME";
export type QuestStatus = "PENDING" | "COMPLETED";

export interface Place {
  id: string;
  name: string;
  lat: number;
  lng: number;
  landmarkNames: string[];
  imageUrl?: string;
}
export interface Course {
  id: string;
  title: string;
  theme: string;
  weekKey: string;
  estimatedDuration: number;
  difficulty: Difficulty;
  prologue: string;
  epilogue: string;
  places: { order: number; place: Place }[];
  quests?: Quest[];
}
export interface Quest {
  id: string;
  order: number;
  type: QuestType;
  narrativeText: string;
  instruction: string;
  mapHint: string;
  gpsLat?: number;
  gpsLng?: number;
  gpsRadiusM?: number;
  timeLimitSec?: number;
}
export interface QuestState {
  id: string;
  questId: string;
  status: QuestStatus;
  photoUrl?: string;
  completedAt?: string;
  quest: Quest;
}
export interface Attempt {
  id: string;
  courseId: string;
  startAt: string;
  endAt?: string;
  clearTimeMs?: number;
  course: Course;
  questStates: QuestState[];
}
```

**Step 3: 인증 컨텍스트 (`apps/web/src/contexts/AuthContext.tsx`)**

```typescript
'use client';
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { api } from '@/lib/api';

interface User { id: string; nickname: string }
interface AuthCtx {
  user: User | null;
  login: (nickname: string, password: string) => Promise<void>;
  register: (nickname: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const save = (token: string, user: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
  };

  const login = async (nickname: string, password: string) => {
    const res = await api.post<{ token: string; user: User }>('/auth/login', { nickname, password });
    save(res.token, res.user);
  };

  const register = async (nickname: string, password: string) => {
    const res = await api.post<{ token: string; user: User }>('/auth/register', { nickname, password });
    save(res.token, res.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, login, register, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
```

**Step 4: layout.tsx에 AuthProvider 추가**

`apps/web/src/app/layout.tsx`의 `<body>` 안을 `<AuthProvider>`로 감싸기.

**Step 5: Commit**

```bash
git commit -am "feat: add API client, types, and AuthContext"
```

## Phase 2-b: 지도 연동

---

### Task 17: Kakao Maps 퀘스트 지도 보기

> Kakao Maps는 npm 패키지가 없고 Script 태그로 로드합니다.

**Files:**

- Modify: `apps/web/src/app/layout.tsx` (Script 태그 추가)
- Create: `apps/web/src/components/KakaoMap.tsx`
- Modify: `apps/web/src/app/play/[attemptId]/page.tsx` (지도 보기 버튼 연결)

**Step 1: Kakao Maps API 키 준비**

[Kakao Developers](https://developers.kakao.com) 에서 앱 생성 후 JavaScript 키 발급.

```env
# apps/web/.env.local 에 추가
NEXT_PUBLIC_KAKAO_MAP_KEY="your-kakao-javascript-key"
```

**Step 2: layout.tsx에 Kakao Maps 스크립트 추가**

```typescript
// apps/web/src/app/layout.tsx
import Script from 'next/script';

// <body> 안, AuthProvider 밖에 추가
<Script
  src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&autoload=false`}
  strategy="beforeInteractive"
/>
```

**Step 3: KakaoMap 컴포넌트 생성 (`apps/web/src/components/KakaoMap.tsx`)**

```typescript
'use client';
import { useEffect, useRef } from 'react';

interface Marker {
  lat: number;
  lng: number;
  label: string;     // 지도 위 핀 라벨 (장소명)
  isCurrent?: boolean; // 현재 진행 중 퀘스트 장소
}

interface Props {
  center: { lat: number; lng: number };
  markers: Marker[];
  radiusM?: number; // GPS_TIME 퀘스트 반경 표시용
}

declare global {
  interface Window { kakao: any }
}

export function KakaoMap({ center, markers, radiusM }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.kakao) return;

    window.kakao.maps.load(() => {
      const map = new window.kakao.maps.Map(containerRef.current, {
        center: new window.kakao.maps.LatLng(center.lat, center.lng),
        level: 4,
      });

      markers.forEach((m) => {
        const position = new window.kakao.maps.LatLng(m.lat, m.lng);

        const marker = new window.kakao.maps.Marker({ map, position });

        // 라벨 오버레이
        const overlay = new window.kakao.maps.CustomOverlay({
          position,
          content: `<div style="background:${m.isCurrent ? '#b45309' : '#374151'};color:white;padding:2px 8px;border-radius:12px;font-size:12px;font-weight:600;white-space:nowrap">${m.label}</div>`,
          yAnchor: 2.4,
        });
        overlay.setMap(map);

        // GPS_TIME 퀘스트 반경 표시
        if (m.isCurrent && radiusM) {
          new window.kakao.maps.Circle({
            map,
            center: position,
            radius: radiusM,
            strokeWeight: 2,
            strokeColor: '#b45309',
            strokeOpacity: 0.8,
            fillColor: '#fef3c7',
            fillOpacity: 0.3,
          });
        }
      });
    });
  }, [center, markers, radiusM]);

  return <div ref={containerRef} className="h-full w-full rounded-xl" />;
}
```

**Step 4: 퀘스트 메인 화면 지도 모달 연결**

`apps/web/src/app/play/[attemptId]/page.tsx` 에서 `showMap` 상태가 true일 때
텍스트 힌트 대신 KakaoMap 컴포넌트를 렌더링하도록 교체:

```typescript
// 기존 showMap 블록 교체
import { KakaoMap } from '@/components/KakaoMap';

// attempt.course.places 에서 마커 데이터 생성
const mapMarkers = attempt.course.places.map((p) => ({
  lat: p.place.lat,
  lng: p.place.lng,
  label: p.place.name,
  isCurrent: p.place.id === currentQuest?.placeId,
}));

const currentPlace = attempt.course.places.find(
  (p) => p.place.id === currentQuest?.placeId
)?.place;

// JSX 안 showMap 조건부 렌더링
{showMap && currentPlace && (
  <div className="mt-4 overflow-hidden rounded-xl" style={{ height: 260 }}>
    <KakaoMap
      center={{ lat: currentPlace.lat, lng: currentPlace.lng }}
      markers={mapMarkers}
      radiusM={currentQuest?.type === 'GPS_TIME' ? (currentQuest.gpsRadiusM ?? 200) : undefined}
    />
  </div>
)}
{showMap && (
  <p className="mt-2 text-xs text-amber-700">🗺 {currentQuest?.mapHint}</p>
)}
```

**Step 5: types.ts에 placeId 추가**

```typescript
// apps/web/src/lib/types.ts - Quest 타입에 추가
export interface Quest {
  // 기존 필드 ...
  placeId?: string; // 지도 마커 하이라이트용
}
```

**Step 6: 동작 확인**

```
1. 퀘스트 진행 화면에서 "지도 보기" 버튼 클릭
2. 지도에 코스 장소 마커 표시 확인
3. 현재 진행 중인 퀘스트 장소는 amber 색상으로 강조
4. GPS_TIME 퀘스트이면 반경 원이 표시됨
```

**Step 7: Commit**

```bash
git commit -am "feat: add Kakao Maps quest map view"
```

---

## Phase 3: AI 코스 생성 (운영 도구)

---

### Task 16: OpenAI 연동 + 어드민 API

**Files:**

- Create: `apps/api/src/services/aiCourseGenerator.ts`
- Create: `apps/api/src/routes/admin.ts`

**Step 1: OpenAI 설치**

```bash
cd apps/api && pnpm add openai
```

**Step 2: .env에 키 추가**

```env
OPENAI_API_KEY="sk-..."
```

**Step 3: AI 코스 생성 서비스 (`apps/api/src/services/aiCourseGenerator.ts`)**

```typescript
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface PlaceInput {
  name: string;
  lat: number;
  lng: number;
  landmarkNames: string[];
  facts?: Record<string, unknown>;
}

export interface GeneratedCourse {
  title: string;
  theme: string;
  estimatedDuration: number;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  prologue: string;
  epilogue: string;
  quests: Array<{
    placeIndex: number;
    order: number;
    type: "PHOTO" | "ANSWER" | "GPS_TIME";
    narrativeText: string;
    instruction: string;
    mapHint: string;
    answer?: string | null;
    gpsRadiusM?: number | null;
    timeLimitSec?: number | null;
  }>;
}

export async function generateCourse(
  places: PlaceInput[],
): Promise<GeneratedCourse> {
  const placeList = places
    .map(
      (p, i) =>
        `장소${i + 1}: ${p.name}\n  랜드마크: ${p.landmarkNames.join(", ")}\n  팩트: ${JSON.stringify(p.facts ?? {})}`,
    )
    .join("\n\n");

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: `당신은 서울 야외 방탈출 게임의 시나리오 작가입니다. 아래 장소들로 탐험 코스를 만들어주세요.

장소 목록:
${placeList}

요구사항:
- 총 3~4개 퀘스트 (장소당 1~2개)
- PHOTO/ANSWER/GPS_TIME 유형을 섞어서 사용
- 조선 시대 왕실 사관 말투로 대사 작성 (예: "이보게!", "~하시오")

JSON 형식으로만 응답:
{
  "title": "코스 제목",
  "theme": "테마",
  "estimatedDuration": 90,
  "difficulty": "MEDIUM",
  "prologue": "프롤로그",
  "epilogue": "에필로그",
  "quests": [
    {
      "placeIndex": 0, "order": 1, "type": "PHOTO",
      "narrativeText": "대사", "instruction": "미션 설명",
      "mapHint": "다음 장소 안내",
      "answer": null, "gpsRadiusM": null, "timeLimitSec": null
    }
  ]
}`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.8,
  });

  return JSON.parse(response.choices[0]!.message.content!) as GeneratedCourse;
}
```

**Step 4: 어드민 라우트 (`apps/api/src/routes/admin.ts`)**

```typescript
import type { FastifyInstance } from "fastify";
import {
  Place,
  Course,
  CoursePlace,
  Quest,
  Difficulty,
} from "@seoul-advanture/database";
import { generateCourse } from "../services/aiCourseGenerator.js";

const ADMIN_KEY = process.env.ADMIN_KEY ?? "admin-secret";
const checkAdmin = (request: any, reply: any) => {
  if (request.headers["x-admin-key"] !== ADMIN_KEY) {
    reply.code(401).send({ error: "어드민 키가 올바르지 않습니다." });
    return false;
  }
  return true;
};

export async function adminRoutes(fastify: FastifyInstance) {
  // 장소 목록
  fastify.get("/admin/places", async (request, reply) => {
    if (!checkAdmin(request, reply)) return;
    return request.em.find(Place, {}, { orderBy: { name: "ASC" } });
  });

  // 장소 추가
  fastify.post<{
    Body: {
      name: string;
      lat: number;
      lng: number;
      landmarkNames: string[];
      facts?: Record<string, unknown>;
    };
  }>("/admin/places", async (request, reply) => {
    if (!checkAdmin(request, reply)) return;
    const place = request.em.create(Place, request.body);
    await request.em.persistAndFlush(place);
    return place;
  });

  // AI 코스 생성
  fastify.post<{ Body: { weekKey: string; placeIds: string[] } }>(
    "/admin/courses/generate",
    async (request, reply) => {
      if (!checkAdmin(request, reply)) return;
      const { weekKey, placeIds } = request.body;
      const em = request.em;

      const places = await em.find(Place, { id: { $in: placeIds } });
      const ordered = placeIds
        .map((id) => places.find((p) => p.id === id)!)
        .filter(Boolean);

      const generated = await generateCourse(
        ordered.map((p) => ({
          name: p.name,
          lat: p.lat,
          lng: p.lng,
          landmarkNames: p.landmarkNames,
          facts: p.facts as Record<string, unknown>,
        })),
      );

      const course = em.create(Course, {
        title: generated.title,
        theme: generated.theme,
        weekKey,
        estimatedDuration: generated.estimatedDuration,
        difficulty: generated.difficulty as Difficulty,
        prologue: generated.prologue,
        epilogue: generated.epilogue,
        isActive: false, // 검수 후 활성화
      });
      em.persist(course);

      for (let i = 0; i < ordered.length; i++) {
        em.persist(
          em.create(CoursePlace, { course, place: ordered[i], order: i + 1 }),
        );
      }

      for (const q of generated.quests) {
        em.persist(
          em.create(Quest, {
            course,
            place: ordered[q.placeIndex],
            order: q.order,
            type: q.type as any,
            narrativeText: q.narrativeText,
            instruction: q.instruction,
            mapHint: q.mapHint,
            answer: q.answer ?? undefined,
            gpsLat: ordered[q.placeIndex]?.lat,
            gpsLng: ordered[q.placeIndex]?.lng,
            gpsRadiusM: q.gpsRadiusM ?? undefined,
            timeLimitSec: q.timeLimitSec ?? undefined,
          }),
        );
      }

      await em.flush();
      return em.findOneOrFail(
        Course,
        { id: course.id },
        { populate: ["quests", "places", "places.place"] },
      );
    },
  );

  // 코스 활성화/비활성화
  fastify.patch<{ Params: { id: string }; Body: { isActive: boolean } }>(
    "/admin/courses/:id/status",
    async (request, reply) => {
      if (!checkAdmin(request, reply)) return;
      const course = await request.em.findOneOrFail(Course, {
        id: request.params.id,
      });
      course.isActive = request.body.isActive;
      await request.em.flush();
      return course;
    },
  );
}
```

**Step 5: index.ts에 등록**

```typescript
import { adminRoutes } from "./routes/admin.js";
await fastify.register(adminRoutes);
```

**Step 6: Commit**

```bash
git commit -am "feat: add AI course generation with OpenAI and admin routes"
```

### DB 초기화 순서

```bash
# 1. PostgreSQL 실행
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=seoul_adventure postgres:16

# 2. 스키마 생성 (개발 초기)
cd packages/database && pnpm db:schema:fresh

# 3. 시드 실행
pnpm db:seed
```

---

## 체크리스트: MVP 완성 기준

### API

- [ ] `POST /auth/register` - 닉네임+패스워드 회원가입
- [ ] `POST /auth/login` - 로그인 + JWT
- [ ] `GET /courses` - 활성 코스 목록
- [ ] `GET /courses/:id` - 코스 상세 (정답 제외)
- [ ] `POST /attempts` - 게임 시작
- [ ] `GET /attempts/:attemptId` - 시도 상태
- [ ] `POST /attempts/:attemptId/quests/:questId/complete` - 퀘스트 완료
- [ ] `POST /attempts/:attemptId/finish` - 코스 완료
- [ ] `GET /leaderboard/:courseId` - 리더보드
- [ ] `GET /leaderboard/:courseId/my-rank` - 내 순위
- [ ] `POST /admin/places` - 장소 등록
- [ ] `POST /admin/courses/generate` - AI 코스 생성
- [ ] `PATCH /admin/courses/:id/status` - 코스 활성화

### Web

- [ ] `/login` - 로그인
- [ ] `/register` - 회원가입
- [ ] `/courses` - 코스 목록
- [ ] `/courses/:id` - 코스 상세 + 프롤로그
- [ ] 퀘스트 진행 화면 지도 보기 (Kakao Maps)
- [ ] `/play/:attemptId` - 퀘스트 진행
- [ ] `/play/:attemptId/quest/:questId` - 퀘스트 인증
- [ ] `/result/:attemptId` - 결과 + 공유
- [ ] `/leaderboard/:courseId` - 리더보드
