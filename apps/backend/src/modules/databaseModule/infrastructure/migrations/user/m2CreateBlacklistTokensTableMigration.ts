import { type DatabaseClient } from '../../../types/databaseClient.js';
import { type Migration } from '../../../types/migration.js';

export class M2CreateBlacklistTokensTableMigration implements Migration {
  public readonly name = 'M2CreateBlacklistTokensTableMigration';

  private readonly tableName = 'blacklist_tokens';

  public async up(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.createTable(this.tableName, (table) => {
      table.uuid('id').notNullable().primary();
      table.text('token').notNullable().unique();
      table.timestamp('expires_at').notNullable();
    });
  }

  public async down(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.dropTable(this.tableName);
  }
}
