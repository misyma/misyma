import { type Migration } from '../../../types/migration.js';
import { type MigrationSource } from '../../../types/migrationSource.js';

import { M1CreateUserTableMigration } from './m1CreateUserTableMigration.js';
import { M2CreateBlacklistTokenTableMigration } from './m2CreateBlacklistTokenTableMigration.js';
import { M3CreateEmailEventTableMigration } from './m3CreateEmailEventTableMigration.js';

export class UserMigrationSource implements MigrationSource {
  public async getMigrations(): Promise<Migration[]> {
    return [
      new M1CreateUserTableMigration(),
      new M2CreateBlacklistTokenTableMigration(),
      new M3CreateEmailEventTableMigration(),
    ];
  }

  public getMigrationName(migration: Migration): string {
    return migration.name;
  }

  public async getMigration(migration: Migration): Promise<Migration> {
    return migration;
  }

  public getMigrationTableName(): string {
    return 'userDatabaseMigrations';
  }
}
