import { type DatabaseClient } from '../../../types/databaseClient.js';
import { type Migration } from '../../../types/migration.js';

export class M2AddImageUrlToBookshelfTableMigration implements Migration {
  public readonly name = 'M2AddImageUrlToBookshelfTableMigration';

  private readonly bookshelvesTableName = 'bookshelves';

  public async up(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.alterTable(this.bookshelvesTableName, (table) => {
      table.text('imageUrl');
    });
  }

  public async down(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.alterTable(this.bookshelvesTableName, (table) => {
      table.dropColumn('imageUrl');
    });
  }
}
