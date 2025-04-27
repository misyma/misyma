import { type DatabaseClient } from '../../../types/databaseClient.js';
import { type Migration } from '../../../types/migration.js';

export class M5CreateUserBookGenreTableMigration implements Migration {
  public readonly name = 'M5CreateUserBookGenreTableMigration';

  private readonly tableName = 'userBookGenres';

  public async up(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.createTable(this.tableName, (table) => {
      table.text('userBookId').notNullable();

      table.text('genreId').notNullable();

      table.foreign('userBookId').references('id').inTable('userBooks').onDelete('CASCADE');

      table.foreign('genreId').references('id').inTable('genres').onDelete('CASCADE');

      table.unique(['userBookId', 'genreId']);
    });
  }

  public async down(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.dropTable(this.tableName);
  }
}
