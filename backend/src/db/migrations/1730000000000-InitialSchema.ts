import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1730000000000 implements MigrationInterface {
  name = 'InitialSchema1730000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name varchar(100) NOT NULL,
        email varchar(255) NOT NULL UNIQUE,
        password_hash varchar(255) NOT NULL,
        role varchar(255) NOT NULL CONSTRAINT users_role_check CHECK (role IN ('admin', 'member')),
        created_at timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS leads (
        id SERIAL PRIMARY KEY,
        name varchar(100) NOT NULL,
        email varchar(255) NOT NULL,
        company varchar(100) NOT NULL,
        website varchar(255),
        status varchar(255) NOT NULL DEFAULT 'new'
          CONSTRAINT leads_status_check CHECK (status IN ('new', 'contacted', 'qualified', 'lost')),
        owner_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id SERIAL PRIMARY KEY,
        user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token_hash varchar(64) NOT NULL UNIQUE,
        expires_at timestamptz NOT NULL,
        revoked_at timestamptz,
        created_at timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query('CREATE INDEX IF NOT EXISTS leads_owner_id_index ON leads (owner_id)');
    await queryRunner.query('CREATE INDEX IF NOT EXISTS refresh_tokens_user_id_index ON refresh_tokens (user_id)');
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS refresh_tokens');
    await queryRunner.query('DROP TABLE IF EXISTS leads');
    await queryRunner.query('DROP TABLE IF EXISTS users');
  }
}
