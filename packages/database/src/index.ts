import { MikroORM } from "@mikro-orm/postgresql";
import config from "./mikro-orm.config.js";

let orm: MikroORM;

export async function getOrm(): Promise<MikroORM> {
  if (!orm) {
    orm = await MikroORM.init(config);
  }
  return orm;
}

// 엔티티 re-export
export { User } from "./entities/User.js";
export { Place } from "./entities/Place.js";
export { Course, Difficulty } from "./entities/Course.js";
export { CoursePlace } from "./entities/CoursePlace.js";
export { Quest, QuestType } from "./entities/Quest.js";
export { Attempt, AttemptStatus } from "./entities/Attempt.js";
export { QuestState, QuestStatus } from "./entities/QuestState.js";
export { MikroORM } from "@mikro-orm/postgresql";
export type { EntityManager } from "@mikro-orm/postgresql";
