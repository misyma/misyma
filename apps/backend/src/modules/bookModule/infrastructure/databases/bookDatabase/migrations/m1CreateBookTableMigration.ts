import { type DatabaseClient } from '../../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { type Migration } from '../../../../../../libs/database/types/migration.js';

export class M1CreateBookTableMigration implements Migration {
  public readonly name = 'M1CreateBookTableMigration';

  public async up(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.createTable('books', (table) => {
      table.text('id');

      table.text('title').notNullable();

      table.text('isbn');

      table.text('publisher');

      table.integer('releaseYear');

      table.text('language').notNullable();

      table.text('translator');

      table.text('format').notNullable();

      table.integer('pages');

      table.boolean('isApproved').notNullable();

      table.text('imageUrl');

      table.primary(['id']);

      table.index(['title']);

      table.index(['isbn']);
    });

    await databaseClient.schema.createTable('booksAuthors', (table) => {
      table.text('bookId').notNullable();

      table.text('authorId').notNullable();

      table.foreign('bookId').references('id').inTable('books').onDelete('CASCADE');

      table.foreign('authorId').references('id').inTable('authors').onDelete('CASCADE');
    });
  }

  public async down(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.dropTable('booksAuthors');

    await databaseClient.schema.dropTable('books');
  }
}
