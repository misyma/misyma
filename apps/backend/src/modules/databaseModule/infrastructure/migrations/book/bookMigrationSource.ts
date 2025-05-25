import type { Migration } from '../../../types/migration.js';
import type { MigrationSource } from '../../../types/migrationSource.js';

import { M1CreateAuthorsTableMigration } from './m1CreateAuthorsTableMigration.js';
import { M2CreateCategoriesTableMigration } from './m2CreateCategoriesTableMigration.js';
import { M3CreateBooksTableMigration } from './m3CreateBooksTableMigration.js';
import { M4CreateUsersBooksTableMigration } from './m4CreateUsersBooksTableMigration.js';
import { M5CreateBooksReadingsTableMigration } from './m5CreateBooksReadingsTableMigration.js';
import { M6CreateQuotesTableMigration } from './m6CreateQuotesTableMigration.js';
import { M7CreateBorrowingsTableMigration } from './m7CreateBorrowingsTableMigration.js';
import { M8CreateCollectionsTableMigration } from './m8CreateCollectionsMigration.js';
import { M9CreateUsersBooksCollectionsTableMigration } from './m9CreateUsersBooksCollectionsTableMigration.js';
import { M10CreateBooksChangeRequestsTableMigration } from './m10CreateBooksChangeRequestsTableMigration.js';
import { M11AddIndexToQuotesTableMigration } from './m11AddIndexToQuotesTableMigration.js';

export class BookMigrationSource implements MigrationSource {
  public async getMigrations(): Promise<Migration[]> {
    return [
      new M1CreateAuthorsTableMigration(),
      new M2CreateCategoriesTableMigration(),
      new M3CreateBooksTableMigration(),
      new M4CreateUsersBooksTableMigration(),
      new M5CreateBooksReadingsTableMigration(),
      new M6CreateQuotesTableMigration(),
      new M7CreateBorrowingsTableMigration(),
      new M8CreateCollectionsTableMigration(),
      new M9CreateUsersBooksCollectionsTableMigration(),
      new M10CreateBooksChangeRequestsTableMigration(),
      new M11AddIndexToQuotesTableMigration(),
    ];
  }

  public getMigrationName(migration: Migration): string {
    return migration.name;
  }

  public async getMigration(migration: Migration): Promise<Migration> {
    return migration;
  }

  public getMigrationTableName(): string {
    return 'book_migrations';
  }
}
