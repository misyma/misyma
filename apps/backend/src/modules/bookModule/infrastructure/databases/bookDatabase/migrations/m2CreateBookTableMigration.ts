import { type DatabaseClient } from '../../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { type Migration } from '../../../../../../libs/database/types/migration.js';

export class M2CreateBookTableMigration implements Migration {
  public readonly name = 'M2CreateBookTableMigration';

  public async up(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.createTable('books', (table) => {
      table.text('id');

      table.text('title').notNullable();

      table.integer('releaseYear').notNullable();

      table.text('authorId').notNullable();

      table.primary(['id']);

      table.foreign('authorId').references('id').inTable('authors').onDelete('CASCADE');

      table.unique(['title', 'authorId']);
    });
  }

  public async down(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.dropTable('books');
  }
}
