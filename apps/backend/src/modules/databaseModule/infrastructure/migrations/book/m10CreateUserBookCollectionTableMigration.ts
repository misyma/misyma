import { type DatabaseClient } from '../../../types/databaseClient.js';
import { type Migration } from '../../../types/migration.js';

export class M10CreateUserBookCollectionTableMigration implements Migration {
  public readonly name = 'M10CreateUserBookCollectionTableMigration';

  private readonly tableName = 'userBookCollections';

  public async up(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.createTable(this.tableName, (table) => {
      table.text('userBookId').notNullable();

      table.text('collectionId').notNullable();

      table.foreign('userBookId').references('id').inTable('userBooks').onDelete('CASCADE');

      table.foreign('collectionId').references('id').inTable('collections').onDelete('CASCADE');

      table.unique(['userBookId', 'collectionId']);
    });
  }

  public async down(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.dropTable(this.tableName);
  }
}
