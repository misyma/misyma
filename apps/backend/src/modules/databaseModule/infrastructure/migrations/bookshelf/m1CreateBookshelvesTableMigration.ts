import { type DatabaseClient } from '../../../types/databaseClient.js';
import { type Migration } from '../../../types/migration.js';

export class M1CreateBookshelvesTableMigration implements Migration {
  public readonly name = 'M1CreateBookshelvesTableMigration';

  private readonly tableName = 'bookshelves';

  public async up(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary();
      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
      table.text('name').notNullable();
      table.text('type').notNullable();
      table.text('image_url');
      table.timestamp('created_at').notNullable();

      table.unique(['user_id', 'name']);
    });
  }

  public async down(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.dropTable(this.tableName);
  }
}
