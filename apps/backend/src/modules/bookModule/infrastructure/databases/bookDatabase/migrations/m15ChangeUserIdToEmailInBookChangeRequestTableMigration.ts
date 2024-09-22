import { type DatabaseClient } from '../../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { type Migration } from '../../../../../../libs/database/types/migration.js';

export class M15ChangeUserIdToEmailInBookChangeRequestTableMigration implements Migration {
  public readonly name = 'M15ChangeUserIdToEmailInBookChangeRequestTableMigration';

  public async up(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.alterTable('booksChangeRequests', (table) => {
      table.dropForeign('userId');

      table.dropColumn('userId');

      table.text('userEmail').notNullable();
    });
  }

  public async down(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.alterTable('booksChangeRequests', (table) => {
      table.dropColumn('userEmail');

      table.text('userId').notNullable();

      table.foreign('userId').references('id').inTable('users').onDelete('CASCADE');
    });
  }
}
