import { type Migration } from '../../../types/migration.js';
import { type MigrationSource } from '../../../types/migrationSource.js';

import { M1CreateUsersTableMigration } from './m1CreateUsersTableMigration.js';
import { M2CreateBlacklistTokensTableMigration } from './m2CreateBlacklistTokensTableMigration.js';
import { M3CreateEmailEventsTableMigration } from './m3CreateEmailEventsTableMigration.js';

export class UserMigrationSource implements MigrationSource {
  public async getMigrations(): Promise<Migration[]> {
    return [
      new M1CreateUsersTableMigration(),
      new M2CreateBlacklistTokensTableMigration(),
      new M3CreateEmailEventsTableMigration(),
    ];
  }

  public getMigrationName(migration: Migration): string {
    return migration.name;
  }

  public async getMigration(migration: Migration): Promise<Migration> {
    return migration;
  }

  public getMigrationTableName(): string {
    return 'user_migrations';
  }
}
