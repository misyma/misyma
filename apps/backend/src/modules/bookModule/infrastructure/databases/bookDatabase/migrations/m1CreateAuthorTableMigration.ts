import { type DatabaseClient } from '../../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { type Migration } from '../../../../../../libs/database/types/migration.js';

export class M1CreateAuthorTableMigration implements Migration {
  public readonly name = 'M1CreateAuthorTableMigration';

  public async up(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.createTable('authors', (table) => {
      table.text('id');

      table.text('name').notNullable();

      table.boolean('isApproved').notNullable();

      table.primary(['id']);

      table.unique(['name']);
    });
  }

  public async down(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.dropTable('authors');
  }
}
