import { type DatabaseClient } from '../../../types/databaseClient.js';
import { type Migration } from '../../../types/migration.js';

export class M12SetReleaseYearAsRequiredInBookTableMigration implements Migration {
  public readonly name = 'M12SetReleaseYearAsRequiredInBookTableMigration';

  public async up(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.alterTable('books', (table) => {
      table.integer('releaseYear').notNullable().alter();
    });
  }

  public async down(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.alterTable('books', (table) => {
      table.integer('releaseYear').nullable().alter();
    });
  }
}
