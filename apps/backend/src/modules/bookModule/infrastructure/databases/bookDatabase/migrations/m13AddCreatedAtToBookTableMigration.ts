import { type DatabaseClient } from '../../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { type Migration } from '../../../../../../libs/database/types/migration.js';

export class M13AddCreatedAtToBookTableMigration implements Migration {
  public readonly name = 'M13AddCreatedAtToBookTableMigration';

  public async up(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.alterTable('books', (table) => {
      table.dateTime('createdAt').defaultTo(databaseClient.fn.now()).notNullable();
    });
  }

  public async down(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.alterTable('books', (table) => {
      table.dropColumn('createdAt');
    });
  }
}
