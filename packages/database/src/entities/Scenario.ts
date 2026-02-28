import {
  Entity,
  PrimaryKey,
  Property,
  OneToMany,
  Collection,
  OptionalProps,
} from "@mikro-orm/core";
import { v4 as uuid } from "uuid";
import type { ScenarioQuest } from "./ScenarioQuest.js";

@Entity()
export class Scenario {
  [OptionalProps]?: "createdAt" | "quests";

  @PrimaryKey()
  id: string = uuid();

  @Property({ type: "string" })
  landmark!: string;

  @Property({ type: "string" })
  gameTitle!: string;

  @Property({ type: "text" })
  prologue!: string;

  @Property({ type: "text" })
  epilogue!: string;

  @Property({ type: "datetime" })
  createdAt: Date = new Date();

  @OneToMany("ScenarioQuest", "scenario")
  quests = new Collection<ScenarioQuest>(this);
}
