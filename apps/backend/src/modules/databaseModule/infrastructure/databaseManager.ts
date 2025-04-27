import { type DatabaseClient } from '../types/databaseClient.js';

import { BookMigrationSource } from './migrations/book/bookMigrationSource.js';
import { BookshelfMigrationSource } from './migrations/bookshelf/bookshelfMigrationSource.js';
import { UserMigrationSource } from './migrations/user/userMigrationSource.js';

export class DatabaseManager {
  private readonly databaseClient: DatabaseClient;

  public constructor(databaseClient: DatabaseClient) {
    this.databaseClient = databaseClient;
  }

  public async setupDatabase(): Promise<void> {
    const migrationSources = [new UserMigrationSource(), new BookshelfMigrationSource(), new BookMigrationSource()];

    for (const migrationSource of migrationSources) {
      await this.databaseClient.migrate.latest({
        migrationSource,
        tableName: migrationSource.getMigrationTableName(),
      });
    }
  }

  public async teardownDatabase(): Promise<void> {
    const migrationSources = [new UserMigrationSource(), new BookshelfMigrationSource(), new BookMigrationSource()];

    for (const migrationSource of migrationSources) {
      await this.databaseClient.migrate.rollback({
        migrationSource,
        tableName: migrationSource.getMigrationTableName(),
      });
    }
  }
}
