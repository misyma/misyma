import { type Migration } from '../../../../../libs/database/types/migration.js';
import { type MigrationSource } from '../../../../../libs/database/types/migrationSource.js';

import { M1CreateBookshelfTableMigration } from './migrations/m1CreateBookshelfTableMigration.js';
import { M2AddImageUrlToBookshelfTableMigration } from './migrations/m2AddImageUrlToBookshelfTableMigration.js';

export class BookshelfDatabaseMigrationSource implements MigrationSource {
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
