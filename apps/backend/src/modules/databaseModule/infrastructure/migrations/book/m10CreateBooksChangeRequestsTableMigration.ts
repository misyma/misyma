import { type DatabaseClient } from '../../../types/databaseClient.js';
import { type Migration } from '../../../types/migration.js';

export class M10CreateBooksChangeRequestsTableMigration implements Migration {
  public readonly name = 'M10CreateBooksChangeRequestsTableMigration';

  private readonly tableName = 'books_change_requests';

  public async up(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary();
      table.uuid('book_id').notNullable().references('id').inTable('books').onDelete('CASCADE');
      table.text('user_email').notNullable().references('email').inTable('users').onDelete('CASCADE');
      table.text('changed_fields').notNullable();
      table.text('title');
      table.text('isbn');
      table.text('publisher');
      table.integer('release_year');
      table.text('language');
      table.text('translator');
      table.text('format');
      table.integer('pages');
      table.text('image_url');
      table.text('author_ids');
      table.timestamp('created_at').notNullable();
    });
  }

  public async down(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.dropTable(this.tableName);
  }
}
