import { closeDatabase, initializeDatabase } from "./data-source";
import { migrate } from "./migrate";
import { seed } from "./seed";

(async () => {
  await initializeDatabase();
  await migrate();
  await seed();
  await closeDatabase();
  console.log("Database migrated and seeded");
})().catch((err) => {
  console.error("DB init failed:", err);
  process.exit(1);
});
