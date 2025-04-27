import type { Migration } from '../../../types/migration.js';
import type { MigrationSource } from '../../../types/migrationSource.js';

import { M1CreateBookshelfTableMigration } from './m1CreateBookshelfTableMigration.js';
import { M2AddImageUrlToBookshelfTableMigration } from './m2AddImageUrlToBookshelfTableMigration.js';

export class BookshelfMigrationSource implements MigrationSource {
  public async getMigrations(): Promise<Migration[]> {
    return [new M1CreateBookshelfTableMigration(), new M2AddImageUrlToBookshelfTableMigration()];
  }

  public getMigrationName(migration: Migration): string {
    return migration.name;
  }

  public async getMigration(migration: Migration): Promise<Migration> {
    return migration;
  }

  public getMigrationTableName(): string {
    return 'bookshelfDatabaseMigrations';
  }
}
