import { Entity, PrimaryKey, Property, Enum, ManyToOne, OneToMany, Collection, OptionalProps } from '@mikro-orm/core';
import { v4 as uuid } from 'uuid';
import { Course } from './Course.js';
import { Place } from './Place.js';
import type { QuestState } from './QuestState.js';

export enum QuestType {
  PHOTO = 'PHOTO',
  ANSWER = 'ANSWER',
  GPS_TIME = 'GPS_TIME',
}

@Entity()
export class Quest {
  [OptionalProps]?: 'answer' | 'gpsLatOverride' | 'gpsLngOverride' | 'gpsRadiusM' | 'timeLimitSec' | 'place' | 'questStates';

  @PrimaryKey()
  id: string = uuid();

  @ManyToOne(() => Course)
  course!: Course;

  @ManyToOne(() => Place, { nullable: true })
  place?: Place;

  @Property()
  order!: number;

  @Enum(() => QuestType)
  type!: QuestType;

  @Property({ type: 'text' })
  narrativeText!: string;

  @Property({ type: 'text' })
  instruction!: string;

  @Property({ type: 'text' })
  mapHint!: string;

  @Property({ nullable: true })
  answer?: string;

  @Property({ type: 'double', nullable: true })
  gpsLatOverride?: number;

  @Property({ type: 'double', nullable: true })
  gpsLngOverride?: number;

  @Property({ nullable: true })
  gpsRadiusM?: number;

  @Property({ nullable: true })
  timeLimitSec?: number;

  @OneToMany('QuestState', 'quest')
  questStates = new Collection<QuestState>(this);
}
