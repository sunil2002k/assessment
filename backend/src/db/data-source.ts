import "reflect-metadata";
import { DataSource } from "typeorm";
import { config } from "../config";
import { InitialSchema1730000000000 } from "./migrations/1730000000000-InitialSchema";
import { Lead } from "./entities/Lead";
import { RefreshToken } from "./entities/RefreshToken";
import { User } from "./entities/User";

export const AppDataSource = new DataSource({
  type: "postgres",
  url: config.databaseUrl,
  entities: [User, Lead, RefreshToken],
  migrations: [InitialSchema1730000000000],
  migrationsTableName: "typeorm_migrations",
  synchronize: false,
  migrationsRun: false,
});

export async function initializeDatabase(): Promise<void> {
  if (!AppDataSource.isInitialized) await AppDataSource.initialize();
}

export async function closeDatabase(): Promise<void> {
  if (AppDataSource.isInitialized) await AppDataSource.destroy();
}
