import {
  Entity,
  PrimaryKey,
  Property,
  OneToMany,
  Collection,
  OptionalProps,
} from "@mikro-orm/core";
import { v4 as uuid } from "uuid";
import type { Attempt } from "./Attempt.js";

@Entity()
export class User {
  [OptionalProps]?: "createdAt" | "attempts";

  @PrimaryKey()
  id: string = uuid();

  @Property({ unique: true, type: 'string' })
  nickname!: string;

  @Property({ type: 'string' })
  password!: string; // bcrypt hashed

  @Property({ type: 'datetime' })
  createdAt: Date = new Date();

  @OneToMany("Attempt", "user")
  attempts = new Collection<Attempt>(this);
}
