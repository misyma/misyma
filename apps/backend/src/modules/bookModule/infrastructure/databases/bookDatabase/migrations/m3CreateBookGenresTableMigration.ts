import { type DatabaseClient } from '../../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { type Migration } from '../../../../../../libs/database/types/migration.js';

export class M3CreateBookGenresTableMigration implements Migration {
  public readonly name = 'M3CreateBookGenresTableMigration';

  private readonly tableName = 'bookGenres';

  public async up(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.createTable(this.tableName, (table) => {
      table.text('id').primary();

      table.text('bookId').notNullable();

      table.text('genreId').notNullable();

      table.foreign('bookId').references('id').inTable('books').onDelete('CASCADE');

      table.foreign('genreId').references('id').inTable('genres').onDelete('CASCADE');
    });
  }

  public async down(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.dropTable(this.tableName);
  }
}
