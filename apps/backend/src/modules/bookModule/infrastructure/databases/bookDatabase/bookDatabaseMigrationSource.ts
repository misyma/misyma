import { M10CreateUserBookCollectionTableMigration } from './migrations/m10CreateUserBookCollectionTableMigration.js';
import { M11CreateBookChangeRequestTableMigration } from './migrations/m11CreateBookChangeRequestTableMigration.js';
import { M1CreateAuthorTableMigration } from './migrations/m1CreateAuthorTableMigration.js';
import { M2CreateBookTableMigration } from './migrations/m2CreateBookTableMigration.js';
import { M3CreateGenreTableMigration } from './migrations/m3CreateGenreMigration.js';
import { M4CreateUserBookTableMigration } from './migrations/m4CreateUserBookTableMigration.js';
import { M5CreateUserBookGenreTableMigration } from './migrations/m5CreateUserBookGenreTableMigration.js';
import { M6CreateBookReadingTableMigration } from './migrations/m6CreateBookReadingTableMigration.js';
import { M7CreateQuoteTableMigration } from './migrations/m7CreateQuoteTableMigration.js';
import { M8CreateBorrowingTableMigration } from './migrations/m8CreateBorrowingTableMigration.js';
import { M9CreateCollectionTableMigration } from './migrations/m9CreateCollectionMigration.js';
import { type Migration } from '../../../../../libs/database/types/migration.js';
import { type MigrationSource } from '../../../../../libs/database/types/migrationSource.js';

export class BookDatabaseMigrationSource implements MigrationSource {
  public async getMigrations(): Promise<Migration[]> {
    return [
      new M1CreateAuthorTableMigration(),
      new M2CreateBookTableMigration(),
      new M3CreateGenreTableMigration(),
      new M4CreateUserBookTableMigration(),
      new M5CreateUserBookGenreTableMigration(),
      new M6CreateBookReadingTableMigration(),
      new M7CreateQuoteTableMigration(),
      new M8CreateBorrowingTableMigration(),
      new M9CreateCollectionTableMigration(),
      new M10CreateUserBookCollectionTableMigration(),
      new M11CreateBookChangeRequestTableMigration(),
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
