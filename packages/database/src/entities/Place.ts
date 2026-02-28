import {
  Entity,
  PrimaryKey,
  Property,
  OneToMany,
  Collection,
  OptionalProps,
} from "@mikro-orm/core";
import { v4 as uuid } from "uuid";
import type { CoursePlace } from "./CoursePlace.js";
import type { Quest } from "./Quest.js";

@Entity()
export class Place {
  [OptionalProps]?:
    | "landmarkNames"
    | "imageUrl"
    | "facts"
    | "courseRoutes"
    | "quests";

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
