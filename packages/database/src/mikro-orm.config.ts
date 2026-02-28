import { defineConfig } from "@mikro-orm/postgresql";
import { Migrator } from "@mikro-orm/migrations";
import { User } from "./entities/User.js";
import { Place } from "./entities/Place.js";
import { Course } from "./entities/Course.js";
import { CoursePlace } from "./entities/CoursePlace.js";
import { Quest } from "./entities/Quest.js";
import { Attempt } from "./entities/Attempt.js";
import { QuestState } from "./entities/QuestState.js";

export default defineConfig({
  clientUrl:
    process.env.DATABASE_URL ??
    "postgresql://postgres:postgres@localhost:5432/seoul_adventure",
  entities: [User, Place, Course, CoursePlace, Quest, Attempt, QuestState],
  migrations: {
    path: "./src/migrations",
  },
  extensions: [Migrator],
  debug: process.env.NODE_ENV === "development",
});
