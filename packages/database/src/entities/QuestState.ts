import {
  Entity,
  PrimaryKey,
  Property,
  Enum,
  ManyToOne,
  Unique,
  OptionalProps,
} from "@mikro-orm/core";
import { v4 as uuid } from "uuid";
import { Attempt } from "./Attempt.js";
import { Quest } from "./Quest.js";

export enum QuestStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
}

@Entity()
@Unique({ properties: ["attempt", "quest"] })
export class QuestState {
  [OptionalProps]?: "status" | "completedAt" | "photoUrl";

  @PrimaryKey()
  id: string = uuid();

  @ManyToOne(() => Attempt)
  attempt!: Attempt;

  @ManyToOne(() => Quest)
  quest!: Quest;

  @Enum(() => QuestStatus)
  status: QuestStatus = QuestStatus.PENDING;

  @Property({ type: 'datetime', nullable: true })
  completedAt?: Date;

  @Property({ type: 'string', nullable: true })
  photoUrl?: string;
}
