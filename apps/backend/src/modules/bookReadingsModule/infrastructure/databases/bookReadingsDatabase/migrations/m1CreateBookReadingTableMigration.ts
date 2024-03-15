import { type DatabaseClient } from '../../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { type Migration } from '../../../../../../libs/database/types/migration.js';

export class M1CreateBookReadingTableMigration implements Migration {
  public readonly name = 'M1CreateBookReadingTableMigration';

  private readonly bookReadingsTableName = 'bookReadings';

  private readonly columns = {
    id: 'id',
    userBookId: 'userBookId',
    rating: 'rating',
    comment: 'comment',
    startedAt: 'startedAt',
    endedAt: 'endedAt',
  } as const;

  public async up(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.createTable(this.bookReadingsTableName, (table) => {
      table.text(this.columns.id).primary();

      table.text(this.columns.userBookId).notNullable();

      table.integer(this.columns.rating).notNullable();

      table.text(this.columns.comment).notNullable();

      table.timestamp(this.columns.startedAt).notNullable();

      table.timestamp(this.columns.endedAt).nullable();

      table.foreign(this.columns.userBookId).references('id').inTable('userBooks').onDelete('CASCADE');
    });
  }

  public async down(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.dropTable(this.bookReadingsTableName);
  }
}
