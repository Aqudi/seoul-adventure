import {
  Entity,
  PrimaryKey,
  Property,
  Enum,
  ManyToOne,
  OptionalProps,
} from "@mikro-orm/core";
import { v4 as uuid } from "uuid";
import { Scenario } from "./Scenario.js";

export enum ScenarioQuestType {
  PHOTO = "PHOTO",
  PASSWORD = "PASSWORD",
}

@Entity()
export class ScenarioQuest {
  [OptionalProps]?: "question" | "answer";

  @PrimaryKey()
  id: string = uuid();

  @ManyToOne(() => Scenario)
  scenario!: Scenario;

  @Property({ type: "integer" })
  step!: number;

  @Enum(() => ScenarioQuestType)
  type!: ScenarioQuestType;

  @Property({ type: "string" })
  title!: string;

  @Property({ type: "string" })
  locationName!: string;

  @Property({ type: "float" })
  latitude!: number;

  @Property({ type: "float" })
  longitude!: number;

  @Property({ type: "text" })
  scenarioText!: string;

  @Property({ type: "text", nullable: true })
  question?: string;

  @Property({ type: "string", nullable: true })
  answer?: string;

  @Property({ type: "text" })
  factInfo!: string;

  @Property({ type: "text" })
  successMsg!: string;

  @Property({ type: "text" })
  failureMsg!: string;
}
