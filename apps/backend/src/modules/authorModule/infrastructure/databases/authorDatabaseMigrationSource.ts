import { M1CreateAuthorTableMigration } from './migrations/m1CreateAuthorTableMigration.js';
import { type Migration } from '../../../../libs/database/types/migration.js';
import { type MigrationSource } from '../../../../libs/database/types/migrationSource.js';

export class AuthorDatabaseMigrationSource implements MigrationSource {
  public async getMigrations(): Promise<Migration[]> {
    return [new M1CreateAuthorTableMigration()];
  }

  public getMigrationName(migration: Migration): string {
    return migration.name;
  }

  public async getMigration(migration: Migration): Promise<Migration> {
    return migration;
  }

  public getMigrationTableName(): string {
    return 'authorDatabaseMigrations';
  }
}
