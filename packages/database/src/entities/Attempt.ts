import { Entity, PrimaryKey, Property, Enum, Index, ManyToOne, OneToMany, Collection, OptionalProps } from '@mikro-orm/core';
import { v4 as uuid } from 'uuid';
import { User } from './User.js';
import { Course } from './Course.js';
import type { QuestState } from './QuestState.js';

export enum AttemptStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ABANDONED = 'ABANDONED',
}

@Entity()
export class Attempt {
  [OptionalProps]?: 'status' | 'startAt' | 'endAt' | 'clearTimeMs' | 'questStates';

  @PrimaryKey()
  id: string = uuid();

  @ManyToOne(() => User)
  user!: User;

  @Index()
  @ManyToOne(() => Course)
  course!: Course;

  @Enum(() => AttemptStatus)
  status: AttemptStatus = AttemptStatus.IN_PROGRESS;

  @Property({ type: 'datetime' })
  startAt: Date = new Date();

  @Property({ type: 'datetime', nullable: true })
  endAt?: Date;

  @Index()
  @Property({ type: 'integer', nullable: true })
  clearTimeMs?: number;

  @OneToMany('QuestState', 'attempt')
  questStates = new Collection<QuestState>(this);
}
