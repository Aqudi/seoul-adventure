import { PrimaryKey, Property } from "@mikro-orm/core";

export abstract class BaseEntity {
    @PrimaryKey({ type: "uuid", defaultRaw: "gen_random_uuid()" })
    id!: string;

    @Property({ type: "date", onCreate: () => new Date() })
    createdAt: Date = new Date();

    @Property({ type: "date", onUpdate: () => new Date(), onCreate: () => new Date() })
    updatedAt: Date = new Date();
}
