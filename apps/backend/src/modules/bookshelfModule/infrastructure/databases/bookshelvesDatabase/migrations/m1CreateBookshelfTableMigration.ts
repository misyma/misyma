import { type DatabaseClient } from '../../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { type Migration } from '../../../../../../libs/database/types/migration.js';

export class M1CreateBookshelfTableMigration implements Migration {
  public readonly name = 'M1CreateBookshelfTableMigration';

  private readonly bookshelvesTableName = 'bookshelves';

  private readonly columns = {
    id: 'id',
    name: 'name',
    userId: 'userId',
    address: 'address',
    imageUrl: 'imageUrl',
  } as const;

  public async up(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.createTable(this.bookshelvesTableName, (table) => {
      table.text(this.columns.id).primary();

      table.text(this.columns.name).notNullable();

      table.text(this.columns.userId).notNullable();

      table.text(this.columns.address).nullable();

      table.text(this.columns.imageUrl).nullable();

      table.foreign(this.columns.userId).references('id').inTable('users').onDelete('CASCADE');

      table.unique([this.columns.userId, this.columns.name]);
    });
  }

  public async down(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.dropTable(this.bookshelvesTableName);
  }
}
