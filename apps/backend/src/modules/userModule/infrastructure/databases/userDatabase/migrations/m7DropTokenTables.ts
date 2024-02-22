import { type DatabaseClient } from '../../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { type Migration } from '../../../../../../libs/database/types/migration.js';

export class M7DropTokenTablesMigration implements Migration {
  public name = 'M7DropTokenTablesMigration';

  private readonly columns = {
    id: 'id',
    userId: 'userId',
    token: 'token',
    expiresAt: 'expiresAt',
  } as const;

  public async up(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.dropTable('refreshTokens');

    await databaseClient.schema.dropTable('resetPasswordTokens');

    await databaseClient.schema.dropTable('emailVerificationTokens');
  }

  public async down(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.createTable('refreshTokens', (table) => {
      table.text(this.columns.id).notNullable();

      table.text(this.columns.userId).notNullable();

      table.text(this.columns.token).notNullable();

      table.timestamp(this.columns.expiresAt).notNullable();

      table.primary([this.columns.id]);

      table.unique([this.columns.token]);

      table.foreign(this.columns.userId).references('id').inTable('users').onDelete('CASCADE');
    });

    await databaseClient.schema.createTable('resetPasswordTokens', (table) => {
      table.text(this.columns.id).notNullable();

      table.text(this.columns.userId).notNullable();

      table.text(this.columns.token).notNullable();

      table.timestamp(this.columns.expiresAt).notNullable();

      table.primary([this.columns.id]);

      table.unique([this.columns.userId]);

      table.foreign(this.columns.userId).references('id').inTable('users').onDelete('CASCADE');
    });

    await databaseClient.schema.createTable('emailVerificationTokens', (table) => {
      table.text(this.columns.id).notNullable();

      table.text(this.columns.userId).notNullable();

      table.text(this.columns.token).notNullable();

      table.timestamp(this.columns.expiresAt).notNullable();

      table.primary([this.columns.id]);

      table.unique([this.columns.userId]);

      table.foreign(this.columns.userId).references('id').inTable('users').onDelete('CASCADE');
    });
  }
}
