import { BookDatabaseMigrationSource } from './bookDatabaseMigrationSource.js';
import { Application } from '../../../../../core/application.js';
import { type SqliteDatabaseClient } from '../../../../../core/database/sqliteDatabaseClient/sqliteDatabaseClient.js';
import { coreSymbols } from '../../../../../core/symbols.js';

export class BookDatabaseManager {
  public static async booststrapDatabase(): Promise<void> {
    const container = Application.createContainer();

    const databaseClient = container.get<SqliteDatabaseClient>(coreSymbols.sqliteDatabaseClient);

    const migrationSource = new BookDatabaseMigrationSource();

    await databaseClient.migrate.latest({
      migrationSource,
      tableName: migrationSource.getMigrationTableName(),
    });

    await databaseClient.destroy();
  }

  public static async teardownDatabase(): Promise<void> {
    const container = Application.createContainer();

    const databaseClient = container.get<SqliteDatabaseClient>(coreSymbols.sqliteDatabaseClient);

    const migrationSource = new BookDatabaseMigrationSource();

    await databaseClient.migrate.rollback({
      migrationSource,
      tableName: migrationSource.getMigrationTableName(),
    });

    await databaseClient.destroy();
  }
}
