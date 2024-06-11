import { type DatabaseClient } from '../../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { type Migration } from '../../../../../../libs/database/types/migration.js';

export class M11CreateBookChangeRequestTableMigration implements Migration {
  public readonly name = 'M11CreateBookChangeRequestTableMigration';

  public async up(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.createTable('booksChangeRequests', (table) => {
      table.text('id');

      table.text('title');

      table.text('isbn');

      table.text('publisher');

      table.integer('releaseYear');

      table.text('language');

      table.text('translator');

      table.text('format');

      table.integer('pages');

      table.text('imageUrl');

      table.text('bookId').notNullable();

      table.text('userId').notNullable();

      table.foreign('bookId').references('id').inTable('books').onDelete('CASCADE');

      table.foreign('userId').references('id').inTable('users').onDelete('CASCADE');

      table.primary(['id']);

      table.unique(['userId', 'bookId']);
    });
  }

  public async down(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.dropTable('booksChangeRequests');
  }
}
