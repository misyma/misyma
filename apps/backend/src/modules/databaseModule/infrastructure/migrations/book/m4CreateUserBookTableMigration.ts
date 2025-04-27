import { type DatabaseClient } from '../../../types/databaseClient.js';
import { type Migration } from '../../../types/migration.js';

export class M4CreateUserBookTableMigration implements Migration {
  public readonly name = 'M4CreateUserBookTableMigration';

  public async up(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.createTable('userBooks', (table) => {
      table.text('id');

      table.text('imageUrl');

      table.text('status').notNullable();

      table.boolean('isFavorite').notNullable();

      table.text('bookId').notNullable();

      table.text('bookshelfId').notNullable();

      table.timestamp('createdAt').notNullable();

      table.primary(['id']);

      table.foreign('bookId').references('id').inTable('books').onDelete('CASCADE');

      table.foreign('bookshelfId').references('id').inTable('bookshelves').onDelete('CASCADE');
    });
  }

  public async down(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.dropTable('userBooks');
  }
}
