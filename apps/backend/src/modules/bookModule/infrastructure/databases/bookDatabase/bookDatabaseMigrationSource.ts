import { M1CreateBookTableMigration } from './migrations/m1CreateBookTableMigration.js';
import { type Migration } from '../../../../../libs/database/types/migration.js';
import { type MigrationSource } from '../../../../../libs/database/types/migrationSource.js';
import { M1CreateAuthorTableMigration } from '../../../../authorModule/infrastructure/databases/migrations/m1CreateAuthorTableMigration.js';

export class BookDatabaseMigrationSource implements MigrationSource {
  public async getMigrations(): Promise<Migration[]> {
    return [new M1CreateAuthorTableMigration(), new M1CreateBookTableMigration()];
  }

  public getMigrationName(migration: Migration): string {
    return migration.name;
  }

  public async getMigration(migration: Migration): Promise<Migration> {
    return migration;
  }

  public getMigrationTableName(): string {
    return 'bookDatabaseMigrations';
  }
}
