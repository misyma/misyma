import { type DatabaseClient } from '../../../types/databaseClient.js';
import { type Migration } from '../../../types/migration.js';

export class M7CreateBorrowingsTableMigration implements Migration {
  public readonly name = 'M7CreateBorrowingsTableMigration';

  private readonly tableName = 'borrowings';

  public async up(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary();
      table.uuid('user_book_id').notNullable().references('id').inTable('users_books').onDelete('CASCADE');
      table.text('borrower').notNullable();
      table.timestamp('started_at').notNullable();
      table.timestamp('ended_at').nullable();
    });
  }

  public async down(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.dropTable(this.tableName);
  }
}
