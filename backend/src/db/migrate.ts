import { AppDataSource } from './data-source';

export async function migrate(): Promise<void> {
  await AppDataSource.runMigrations();
}
