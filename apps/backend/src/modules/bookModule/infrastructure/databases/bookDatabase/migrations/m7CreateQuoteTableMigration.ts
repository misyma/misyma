import { type DatabaseClient } from '../../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { type Migration } from '../../../../../../libs/database/types/migration.js';

export class M7CreateQuoteTableMigration implements Migration {
  public readonly name = 'M7CreateQuoteTableMigration';

  private readonly quotesTableName = 'quotes';

  public async up(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.createTable(this.quotesTableName, (table) => {
      table.text('id').primary();

      table.text('userBookId').notNullable();

      table.text('content').notNullable();

      table.timestamp('createdAt').notNullable();

      table.boolean('isFavorite').notNullable();

      table.foreign('userBookId').references('id').inTable('userBooks').onDelete('CASCADE');
    });
  }

  public async down(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.dropTable(this.quotesTableName);
  }
}
