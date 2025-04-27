import { type DatabaseClient } from '../../../types/databaseClient.js';
import { type Migration } from '../../../types/migration.js';

export class M6CreateBookReadingTableMigration implements Migration {
  public readonly name = 'M6CreateBookReadingTableMigration';

  private readonly bookReadingsTableName = 'bookReadings';

  public async up(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.createTable(this.bookReadingsTableName, (table) => {
      table.text('id').primary();

      table.text('userBookId').notNullable();

      table.integer('rating').notNullable();

      table.text('comment');

      table.timestamp('startedAt').notNullable();

      table.timestamp('endedAt').notNullable();

      table.foreign('userBookId').references('id').inTable('userBooks').onDelete('CASCADE');
    });
  }

  public async down(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.dropTable(this.bookReadingsTableName);
  }
}
