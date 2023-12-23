import { type DatabaseClient } from '../../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { type Migration } from '../../../../../../libs/database/types/migration.js';

export class M2CreateUserTokensTableMigration implements Migration {
  public name = 'M2CreateUserTokensTableMigration';

  private readonly tableName = 'userTokens';

  private readonly columns = {
    id: 'id',
    userId: 'userId',
    refreshToken: 'refreshToken',
    resetPasswordToken: 'resetPasswordToken',
  } as const;

  public async up(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.createTable(this.tableName, (table) => {
      table.text(this.columns.id).notNullable();

      table.text(this.columns.userId).notNullable();

      table.text(this.columns.refreshToken).notNullable();

      table.text(this.columns.resetPasswordToken).nullable();

      table.primary([this.columns.id]);

      table.foreign(this.columns.userId).references('id').inTable('users').onDelete('CASCADE');
    });
  }

  public async down(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.dropTable(this.tableName);
  }
}
