import type { Migration } from '../../../types/migration.js';
import type { MigrationSource } from '../../../types/migrationSource.js';

import { M1CreateBookshelvesTableMigration } from './m1CreateBookshelvesTableMigration.js';

export class BookshelfMigrationSource implements MigrationSource {
  public async getMigrations(): Promise<Migration[]> {
    return [new M1CreateBookshelvesTableMigration()];
  }

  public getMigrationName(migration: Migration): string {
    return migration.name;
  }

  public async getMigration(migration: Migration): Promise<Migration> {
    return migration;
  }

  public getMigrationTableName(): string {
    return 'bookshelf_migrations';
  }
}
