import { type DatabaseClient } from '../../../types/databaseClient.js';
import { type Migration } from '../../../types/migration.js';

export class M2CreateCategoriesTableMigration implements Migration {
  public readonly name = 'M2CreateCategoriesTableMigration';

  private readonly tableName = 'categories';

  public async up(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary();
      table.text('name').unique().notNullable();
    });
  }

  public async down(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.dropTable(this.tableName);
  }
}
