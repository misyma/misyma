import { type DatabaseClient } from '../../../types/databaseClient.js';
import { type Migration } from '../../../types/migration.js';

export class M5CreateBooksReadingsTableMigration implements Migration {
  public readonly name = 'M5CreateBooksReadingsTableMigration';

  private readonly tableName = 'books_readings';

  public async up(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary();
      table.uuid('user_book_id').notNullable().references('id').inTable('users_books').onDelete('CASCADE');
      table.integer('rating').notNullable();
      table.text('comment');
      table.timestamp('started_at').notNullable();
      table.timestamp('ended_at').notNullable();

      table.index(['rating']);
      table.index(['startedAt']);
      table.index(['endedAt']);
    });
  }

  public async down(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.dropTable(this.tableName);
  }
}
