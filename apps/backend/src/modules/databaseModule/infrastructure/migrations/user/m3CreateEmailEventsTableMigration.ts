import { type DatabaseClient } from '../../../types/databaseClient.js';
import { type Migration } from '../../../types/migration.js';

export class M3CreateEmailEventsTableMigration implements Migration {
  public readonly name = 'M3CreateEmailEventsTableMigration';

  private readonly tableName = 'email_events';

  public async up(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary();
      table.text('payload').notNullable();
      table.text('status').notNullable();
      table.text('event_name').notNullable();
      table.dateTime('created_at').notNullable();
    });
  }

  public async down(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.dropTable(this.tableName);
  }
}
