import { type DatabaseClient } from '../../../types/databaseClient.js';
import { type Migration } from '../../../types/migration.js';

export class M4CreateUsersBooksTableMigration implements Migration {
  public readonly name = 'M4CreateUsersBooksTableMigration';

  private readonly tableName = 'users_books';

  public async up(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary();
      table.uuid('book_id').notNullable().references('id').inTable('books').onDelete('CASCADE');
      table.uuid('bookshelf_id').notNullable().references('id').inTable('bookshelves').onDelete('CASCADE');
      table.text('status').notNullable();
      table.text('image_url');
      table.boolean('is_favorite').notNullable();
      table.timestamp('created_at').notNullable();

      table.index(['status']);
    });
  }

  public async down(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.dropTable(this.tableName);
  }
}
