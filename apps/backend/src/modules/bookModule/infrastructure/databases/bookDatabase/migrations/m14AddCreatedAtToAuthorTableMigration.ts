import { type DatabaseClient } from '../../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { type Migration } from '../../../../../../libs/database/types/migration.js';

export class M14AddCreatedAtToAuthorTableMigration implements Migration {
  public readonly name = 'M14AddCreatedAtToAuthorTableMigration';

  public async up(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.alterTable('authors', (table) => {
      table.dateTime('createdAt').defaultTo(databaseClient.fn.now()).notNullable();
    });
  }

  public async down(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.alterTable('authors', (table) => {
      table.dropColumn('createdAt');
    });
  }
}
