import "reflect-metadata";
import { initDb, closeDb } from "../db/index.js";

async function main() {
    const orm = await initDb();
    const generator = orm.getSchemaGenerator();
    await generator.createSchema();
    console.log("Schema created successfully.");
    await closeDb();
    process.exit(0);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
