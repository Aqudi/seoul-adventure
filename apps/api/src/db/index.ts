import { MikroORM } from "@mikro-orm/core";
import type { PostgreSqlDriver } from "@mikro-orm/postgresql";
import config from "./mikro-orm.config.js";

let orm: MikroORM<PostgreSqlDriver> | null = null;

export async function initDb(): Promise<MikroORM<PostgreSqlDriver>> {
    if (orm) return orm;
    orm = await MikroORM.init(config);
    return orm;
}

export function getOrm(): MikroORM<PostgreSqlDriver> | null {
    return orm;
}

export async function closeDb(): Promise<void> {
    if (orm) {
        await orm.close();
        orm = null;
    }
}
