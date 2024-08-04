import { type DatabaseClient } from '../../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { type Migration } from '../../../../../../libs/database/types/migration.js';

export class M12AddAuthorsToBookChangeRequestTableMigration implements Migration {
  public readonly name = 'M12AddAuthorsToBookChangeRequestTableMigration';

  public async up(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.alterTable('booksChangeRequests', (table) => {
      table.text('authorIds');
    });
  }

  public async down(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.alterTable('booksChangeRequests', (table) => {
      table.dropColumn('authorIds');
    });
  }
}
