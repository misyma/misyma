import { type DatabaseClient } from '../../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { type Migration } from '../../../../../../libs/database/types/migration.js';

export class M1CreateBookshelfTableMigration implements Migration {
  public readonly name = 'M1CreateBookshelfTableMigration';

  private readonly bookshelvesTableName = 'bookshelves';

  public async up(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.createTable(this.bookshelvesTableName, (table) => {
      table.text('id').primary();

      table.text('name').notNullable();

      table.text('userId').notNullable();

      table.text('type').notNullable();

      table.foreign('userId').references('id').inTable('users').onDelete('CASCADE');

      table.unique(['userId', 'name']);
    });
  }

  public async down(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.dropTable(this.bookshelvesTableName);
  }
}
