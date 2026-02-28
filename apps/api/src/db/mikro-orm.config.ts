import { defineConfig } from "@mikro-orm/postgresql";
import { config } from "./config.js";

export default defineConfig({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    dbName: config.db.database,
    entities: ["./dist/entities/**/*.js"],
    entitiesTs: ["./src/entities/**/*.ts"],
    debug: config.db.debug,
});
