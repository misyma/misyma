import { type DatabaseClient } from '../../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { type Migration } from '../../../../../../libs/database/types/migration.js';

export class M16AddChangedFieldsToBookChangeRequestTableMigration implements Migration {
  public readonly name = 'M16AddChangedFieldsToBookChangeRequestTableMigration';

  public async up(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.alterTable('booksChangeRequests', (table) => {
      table.text('changedFields').notNullable();
    });
  }

  public async down(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.alterTable('booksChangeRequests', (table) => {
      table.dropColumn('changedFields');
    });
  }
}
