import {
  Entity,
  PrimaryKey,
  Property,
  Enum,
  Index,
  OneToMany,
  Collection,
  OptionalProps,
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
  [OptionalProps]?:
    | "difficulty"
    | "isActive"
    | "createdAt"
    | "places"
    | "quests"
    | "attempts";

  @PrimaryKey()
  id: string = uuid();

  @Property({ type: 'string' })
  title!: string;

  @Property({ type: 'string' })
  theme!: string;

  @Index()
  @Property({ type: 'string' })
  weekKey!: string;

  @Property({ type: 'integer' })
  estimatedDuration!: number;

  @Enum(() => Difficulty)
  difficulty: Difficulty = Difficulty.MEDIUM;

  @Property({ type: "text" })
  prologue!: string;

  @Property({ type: "text" })
  epilogue!: string;

  @Property({ type: 'boolean' })
  isActive: boolean = true;

  @Property({ type: 'datetime' })
  createdAt: Date = new Date();

  @OneToMany("CoursePlace", "course")
  places = new Collection<CoursePlace>(this);

  @OneToMany("Quest", "course")
  quests = new Collection<Quest>(this);

  @OneToMany("Attempt", "course")
  attempts = new Collection<Attempt>(this);
}
