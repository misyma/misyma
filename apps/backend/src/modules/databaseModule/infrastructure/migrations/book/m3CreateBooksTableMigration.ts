import { type DatabaseClient } from '../../../types/databaseClient.js';
import { type Migration } from '../../../types/migration.js';

export class M3CreateBooksTableMigration implements Migration {
  public readonly name = 'M3CreateBooksTableMigration';

  private readonly tableName = 'books';

  public async up(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary();
      table.uuid('category_id').notNullable().references('id').inTable('categories').onDelete('CASCADE');
      table.text('title').notNullable();
      table.text('isbn');
      table.text('publisher');
      table.integer('release_year').notNullable();
      table.text('language').notNullable();
      table.text('translator');
      table.text('format');
      table.integer('pages');
      table.boolean('is_approved').notNullable();
      table.text('image_url');

      table.index(['title']);
      table.index(['isbn']);
      table.index(['release_year']);
      table.index(['language']);
      table.index(['format']);
    });

    await databaseClient.raw('CREATE EXTENSION IF NOT EXISTS pg_trgm;');

    await databaseClient.raw('CREATE INDEX books_title_gin_index ON books USING gin (title gin_trgm_ops);');

    await databaseClient.schema.createTable('books_authors', (table) => {
      table.uuid('book_id').notNullable().references('id').inTable('books').onDelete('CASCADE');
      table.uuid('author_id').notNullable().references('id').inTable('authors').onDelete('CASCADE');
      table.primary(['book_id', 'author_id']);
    });
  }

  public async down(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.dropTable('books_authors');

    await databaseClient.schema.dropTable(this.tableName);

    await databaseClient.raw('DROP EXTENSION IF EXISTS pg_trgm;');
  }
}
