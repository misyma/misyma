import { BookDatabaseMigrationSource } from './bookDatabaseMigrationSource.js';
import { type SqliteDatabaseClient } from '../../../../../core/database/sqliteDatabaseClient/sqliteDatabaseClient.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { type DependencyInjectionContainer } from '../../../../../libs/dependencyInjection/dependencyInjectionContainer.js';

export class BookDatabaseManager {
  public static async bootstrapDatabase(container: DependencyInjectionContainer): Promise<void> {
    const databaseClient = container.get<SqliteDatabaseClient>(coreSymbols.sqliteDatabaseClient);

    const migrationSource = new BookDatabaseMigrationSource();

    await databaseClient.migrate.latest({
      migrationSource,
      tableName: migrationSource.getMigrationTableName(),
    });
  }

  public static async teardownDatabase(container: DependencyInjectionContainer): Promise<void> {
    const databaseClient = container.get<SqliteDatabaseClient>(coreSymbols.sqliteDatabaseClient);

    const migrationSource = new BookDatabaseMigrationSource();

    await databaseClient.migrate.rollback({
      migrationSource,
      tableName: migrationSource.getMigrationTableName(),
    });
  }
}
