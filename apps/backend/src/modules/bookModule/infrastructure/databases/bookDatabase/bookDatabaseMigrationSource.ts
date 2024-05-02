import { M1CreateAuthorTableMigration } from './migrations/m1CreateAuthorTableMigration.js';
import { M2CreateBookTableMigration } from './migrations/m2CreateBookTableMigration.js';
import { M3CreateGenresTableMigration } from './migrations/m3CreateGenresMigration.js';
import { M4CreateUserBookGenresTableMigration } from './migrations/m4CreateUserBookGenresTableMigration.js';
import { M5CreateUserBookTableMigration } from './migrations/m5CreateUserBookTableMigration.js';
import { type Migration } from '../../../../../libs/database/types/migration.js';
import { type MigrationSource } from '../../../../../libs/database/types/migrationSource.js';

export class BookDatabaseMigrationSource implements MigrationSource {
  public async getMigrations(): Promise<Migration[]> {
    return [
      new M1CreateAuthorTableMigration(),
      new M2CreateBookTableMigration(),
      new M3CreateGenresTableMigration(),
      new M5CreateUserBookTableMigration(),
      new M4CreateUserBookGenresTableMigration(),
    ];
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
