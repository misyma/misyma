import { type DatabaseClient } from '../../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { type Migration } from '../../../../../../libs/database/types/migration.js';

export class M15AddIndexesToUserBookTableMigration implements Migration {
  public readonly name = 'M15AddIndexesToUserBookTableMigration';

  public async up(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.alterTable('userBooks', (table) => {
      table.index(['status']);

      table.index(['isFavorite']);
    });
  }

  public async down(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.alterTable('userBooks', (table) => {
      table.dropIndex(['status']);

      table.dropIndex(['isFavorite']);
    });
  }
}
