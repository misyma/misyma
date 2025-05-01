import { type DatabaseClient } from '../../../types/databaseClient.js';
import { type Migration } from '../../../types/migration.js';

export class M8CreateCollectionsTableMigration implements Migration {
  public readonly name = 'M8CreateCollectionsTableMigration';

  private readonly tableName = 'collections';

  public async up(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary();
      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
      table.text('name').notNullable().unique();
      table.timestamp('created_at').notNullable().defaultTo(databaseClient.raw('CURRENT_TIMESTAMP'));

      table.unique(['name', 'user_id']);
    });
  }

  public async down(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.dropTable(this.tableName);
  }
}
