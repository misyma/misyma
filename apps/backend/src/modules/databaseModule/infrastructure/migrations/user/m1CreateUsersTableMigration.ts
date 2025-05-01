import { type DatabaseClient } from '../../../types/databaseClient.js';
import { type Migration } from '../../../types/migration.js';

export class M1CreateUsersTableMigration implements Migration {
  public readonly name = 'M1CreateUsersTableMigration';

  private readonly tableName = 'users';

  public async up(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary();
      table.text('email').notNullable().unique();
      table.text('password').notNullable();
      table.text('name').notNullable();
      table.boolean('is_email_verified').notNullable();
      table.text('role').notNullable();
    });
  }

  public async down(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.dropTable(this.tableName);
  }
}
