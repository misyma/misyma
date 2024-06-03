import { type DatabaseClient } from '../../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { type Migration } from '../../../../../../libs/database/types/migration.js';

export class M9CreateCollectionTableMigration implements Migration {
  public readonly name = 'M9CreateCollectionTableMigration';

  private readonly tableName = 'collections';

  public async up(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.createTable(this.tableName, (table) => {
      table.text('id').primary();

      table.text('name').unique().notNullable();

      table.text('userId').notNullable();

      table.foreign('userId').references('id').inTable('users').onDelete('CASCADE');

      table.unique(['name', 'userId']);
    });
  }

  public async down(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.dropTable(this.tableName);
  }
}
