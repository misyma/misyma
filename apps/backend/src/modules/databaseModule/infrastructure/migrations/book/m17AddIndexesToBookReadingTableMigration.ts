import { type DatabaseClient } from '../../../types/databaseClient.js';
import { type Migration } from '../../../types/migration.js';

export class M17AddIndexesToBookReadingTableMigration implements Migration {
  public readonly name = 'M17AddIndexesToBookReadingTableMigration';

  public async up(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.alterTable('bookReadings', (table) => {
      table.index(['rating']);

      table.index(['startedAt']);

      table.index(['endedAt']);
    });
  }

  public async down(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.alterTable('bookReadings', (table) => {
      table.dropIndex(['rating']);

      table.dropIndex(['startedAt']);

      table.dropIndex(['endedAt']);
    });
  }
}
