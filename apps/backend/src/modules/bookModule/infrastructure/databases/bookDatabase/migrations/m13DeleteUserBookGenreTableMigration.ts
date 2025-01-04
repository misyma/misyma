import { type DatabaseClient } from '../../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { type Migration } from '../../../../../../libs/database/types/migration.js';

export class M13DeleteUserBookGenreTableMigration implements Migration {
  public readonly name = 'M13DeleteUserBookGenreTableMigration';

  private readonly tableName = 'userBookGenres';

  public async up(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.alterTable('userBooks', (table) => {
      table.text('genreId').notNullable();

      table.foreign('genreId').references('id').inTable('genres').onDelete('CASCADE');
    });

    await databaseClient.schema.dropTable(this.tableName);
  }

  public async down(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.alterTable('userBooks', (table) => {
      table.dropColumn('genreId');
    });

    await databaseClient.schema.createTable(this.tableName, (table) => {
      table.text('userBookId').notNullable();

      table.text('genreId').notNullable();

      table.foreign('userBookId').references('id').inTable('userBooks').onDelete('CASCADE');

      table.foreign('genreId').references('id').inTable('genres').onDelete('CASCADE');

      table.unique(['userBookId', 'genreId']);
    });
  }
}
