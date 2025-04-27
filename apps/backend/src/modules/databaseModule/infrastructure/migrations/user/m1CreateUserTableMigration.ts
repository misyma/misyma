import { type DatabaseClient } from '../../../types/databaseClient.js';
import { type Migration } from '../../../types/migration.js';

export class M1CreateUserTableMigration implements Migration {
  public readonly name = 'M1CreateUserTableMigration';

  public async up(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.createTable('users', (table) => {
      table.text('id');

      table.text('email').notNullable();

      table.text('password').notNullable();

      table.text('name').notNullable();

      table.boolean('isEmailVerified').notNullable();

      table.text('role').notNullable();

      table.primary(['id']);

      table.unique(['email']);
    });
  }

  public async down(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.dropTable('users');
  }
}
