import { M1CreateBookTableMigration } from './migrations/m1CreateBookTableMigration.js';
import { M2CreateGenresTableMigration } from './migrations/m2CreateGenresMigration.js';
import { M3CreateUserBookTableMigration } from './migrations/m3CreateUserBookTableMigration.js';
import { M4CreateUserBookGenresTableMigration } from './migrations/m4CreateUserBookGenresTableMigration.js';
import { type Migration } from '../../../../../libs/database/types/migration.js';
import { type MigrationSource } from '../../../../../libs/database/types/migrationSource.js';

export class BookDatabaseMigrationSource implements MigrationSource {
  public async getMigrations(): Promise<Migration[]> {
    return [
      new M1CreateBookTableMigration(),
      new M2CreateGenresTableMigration(),
      new M3CreateUserBookTableMigration(),
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
