import { type DatabaseClient } from '../../../types/databaseClient.js';
import { type Migration } from '../../../types/migration.js';

export class M9CreateUsersBooksCollectionsTableMigration implements Migration {
  public readonly name = 'M9CreateUsersBooksCollectionsTableMigration';

  private readonly tableName = 'users_books_collections';

  public async up(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.createTable(this.tableName, (table) => {
      table.uuid('user_book_id').notNullable().references('id').inTable('users_books').onDelete('CASCADE');
      table.uuid('collection_id').notNullable().references('id').inTable('collections').onDelete('CASCADE');

      table.primary(['user_book_id', 'collection_id']);
    });
  }

  public async down(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.dropTable(this.tableName);
  }
}
