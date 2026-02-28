import { MikroORM } from "@mikro-orm/postgresql";
import config from "../src/mikro-orm.config.js";

const [, , command, ...args] = process.argv;

const orm = await MikroORM.init(config);

try {
  switch (command) {
    case "push": {
      await orm.schema.updateSchema({ safe: true });
      console.log("Schema synced!");
      break;
    }
    case "migrate:up": {
      await orm.migrator.up();
      console.log("Migrations applied!");
      break;
    }
    case "migrate:create": {
      const name = args[0];
      const blank = args.includes("--blank");
      const initial = args.includes("--initial");
      const result = await orm.migrator.createMigration(undefined, blank, initial, name);
      console.log(`Migration created: ${result.fileName}`);
      break;
    }
    case "schema:fresh": {
      await orm.schema.dropSchema();
      await orm.schema.createSchema();
      console.log("Schema recreated!");
      break;
    }
    default: {
      console.error(`Unknown command: ${command}`);
      console.error("Available: push, migrate:up, migrate:create [name] [--blank] [--initial], schema:fresh");
      process.exit(1);
    }
  }
} finally {
  await orm.close();
}
