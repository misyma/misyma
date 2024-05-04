import { M1CreateAuthorTableMigration } from './migrations/m1CreateAuthorTableMigration.js';
import { M2CreateBookTableMigration } from './migrations/m2CreateBookTableMigration.js';
import { M3CreateGenresTableMigration } from './migrations/m3CreateGenresMigration.js';
import { M4CreateUserBookTableMigration } from './migrations/m4CreateUserBookTableMigration.js';
import { M5CreateUserBookGenresTableMigration } from './migrations/m5CreateUserBookGenresTableMigration.js';
import { M6CreateBookReadingTableMigration } from './migrations/m6CreateBookReadingTableMigration.js';
import { M7CreateQuoteTableMigration } from './migrations/m7CreateQuoteTableMigration.js';
import { type Migration } from '../../../../../libs/database/types/migration.js';
import { type MigrationSource } from '../../../../../libs/database/types/migrationSource.js';

export class BookDatabaseMigrationSource implements MigrationSource {
  public async getMigrations(): Promise<Migration[]> {
    return [
      new M1CreateAuthorTableMigration(),
      new M2CreateBookTableMigration(),
      new M3CreateGenresTableMigration(),
      new M4CreateUserBookTableMigration(),
      new M5CreateUserBookGenresTableMigration(),
      new M6CreateBookReadingTableMigration(),
      new M7CreateQuoteTableMigration(),
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
