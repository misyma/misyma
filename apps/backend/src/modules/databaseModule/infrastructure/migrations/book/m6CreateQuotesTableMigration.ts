import { type DatabaseClient } from '../../../types/databaseClient.js';
import { type Migration } from '../../../types/migration.js';

export class M6CreateQuotesTableMigration implements Migration {
  public readonly name = 'M6CreateQuotesTableMigration';

  private readonly tableName = 'quotes';

  public async up(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary();
      table.uuid('user_book_id').notNullable().references('id').inTable('users_books').onDelete('CASCADE');
      table.text('page');
      table.text('content').notNullable();
      table.boolean('is_favorite').notNullable();
      table.timestamp('created_at').notNullable();
    });
  }

  public async down(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.dropTable(this.tableName);
  }
}
