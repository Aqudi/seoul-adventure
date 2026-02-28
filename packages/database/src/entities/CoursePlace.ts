import { Entity, ManyToOne, Property, OptionalProps } from "@mikro-orm/core";
import { Course } from "./Course.js";
import { Place } from "./Place.js";

@Entity()
export class CoursePlace {
  @ManyToOne(() => Course, { primary: true })
  course!: Course;

  @ManyToOne(() => Place, { primary: true })
  place!: Place;

  @Property()
  order!: number;
}
