import type { Migration } from '../../../types/migration.js';
import type { MigrationSource } from '../../../types/migrationSource.js';

import { M1CreateAuthorTableMigration } from './m1CreateAuthorTableMigration.js';
import { M2CreateGenreTableMigration } from './m2CreateGenreMigration.js';
import { M3CreateBookTableMigration } from './m3CreateBookTableMigration.js';
import { M4CreateUserBookTableMigration } from './m4CreateUserBookTableMigration.js';
import { M5CreateUserBookGenreTableMigration } from './m5CreateUserBookGenreTableMigration.js';
import { M6CreateBookReadingTableMigration } from './m6CreateBookReadingTableMigration.js';
import { M7CreateQuoteTableMigration } from './m7CreateQuoteTableMigration.js';
import { M8CreateBorrowingTableMigration } from './m8CreateBorrowingTableMigration.js';
import { M9CreateCollectionTableMigration } from './m9CreateCollectionMigration.js';
import { M10CreateUserBookCollectionTableMigration } from './m10CreateUserBookCollectionTableMigration.js';
import { M11CreateBookChangeRequestTableMigration } from './m11CreateBookChangeRequestTableMigration.js';
import { M12SetReleaseYearAsRequiredInBookTableMigration } from './m12SetReleaseYearAsRequiredInBookTableMigration.js';
import { M13DeleteUserBookGenreTableMigration } from './m13DeleteUserBookGenreTableMigration.js';
import { M14AddIndexesToBookTableMigration } from './m14AddIndexesToBookTableMigration.js';
import { M15AddIndexesToUserBookTableMigration } from './m15AddIndexesToUserBookTableMigration.js';
import { M16AddIndexToAuthorTableMigration } from './m16AddIndexToAuthorTableMigration.js';
import { M17AddIndexesToBookReadingTableMigration } from './m17AddIndexesToBookReadingTableMigration.js';

export class BookMigrationSource implements MigrationSource {
  public async getMigrations(): Promise<Migration[]> {
    return [
      new M1CreateAuthorTableMigration(),
      new M2CreateGenreTableMigration(),
      new M3CreateBookTableMigration(),
      new M4CreateUserBookTableMigration(),
      new M5CreateUserBookGenreTableMigration(),
      new M6CreateBookReadingTableMigration(),
      new M7CreateQuoteTableMigration(),
      new M8CreateBorrowingTableMigration(),
      new M9CreateCollectionTableMigration(),
      new M10CreateUserBookCollectionTableMigration(),
      new M11CreateBookChangeRequestTableMigration(),
      new M12SetReleaseYearAsRequiredInBookTableMigration(),
      new M13DeleteUserBookGenreTableMigration(),
      new M14AddIndexesToBookTableMigration(),
      new M15AddIndexesToUserBookTableMigration(),
      new M16AddIndexToAuthorTableMigration(),
      new M17AddIndexesToBookReadingTableMigration(),
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
