import { type DatabaseClient } from '../../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { type Migration } from '../../../../../../libs/database/types/migration.js';

export class M8CreateBorrowingTableMigration implements Migration {
  public readonly name = 'M8CreateBorrowingTableMigration';

  private readonly borrowingsTableName = 'borrowings';

  public async up(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.createTable(this.borrowingsTableName, (table) => {
      table.text('id').primary();

      table.text('userBookId').notNullable();

      table.text('borrower').notNullable();

      table.timestamp('startedAt').notNullable();

      table.timestamp('endedAt').nullable();

      table.foreign('userBookId').references('id').inTable('userBooks').onDelete('CASCADE');
    });
  }

  public async down(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.dropTable(this.borrowingsTableName);
  }
}
