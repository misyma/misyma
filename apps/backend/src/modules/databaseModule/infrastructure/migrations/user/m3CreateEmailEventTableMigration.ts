import { type DatabaseClient } from '../../../types/databaseClient.js';
import { type Migration } from '../../../types/migration.js';

export class M3CreateEmailEventTableMigration implements Migration {
  public readonly name = 'M3CreateEmailEventTableMigration';

  private readonly tableName = 'emailEvents';

  public async up(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.createTable(this.tableName, (table) => {
      table.text('id').primary();

      table.text('payload').notNullable();

      table.text('status').notNullable();

      table.text('eventName').notNullable();

      table.dateTime('createdAt').notNullable();
    });
  }

  public async down(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.dropTable(this.tableName);
  }
}
