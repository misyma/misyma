import { type DatabaseClient } from '../../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { type Migration } from '../../../../../../libs/database/types/migration.js';

export class M14AddIndexesToBookTableMigration implements Migration {
  public readonly name = 'M14AddIndexesToBookTableMigration';

  public async up(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.raw('CREATE EXTENSION IF NOT EXISTS pg_trgm;');

    await databaseClient.raw('CREATE INDEX books_title_gin_index ON books USING gin (title gin_trgm_ops);');

    await databaseClient.schema.alterTable('books', (table) => {
      table.dropIndex(['title']);

      table.index(['releaseYear']);

      table.index(['language']);

      table.index(['format']);
    });
  }

  public async down(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.raw('DROP EXTENSION IF EXISTS pg_trgm;');

    await databaseClient.raw('DROP INDEX IF EXISTS books_title_gin_index;');

    await databaseClient.schema.alterTable('books', (table) => {
      table.index(['title']);

      table.dropIndex(['releaseYear']);

      table.dropIndex(['language']);

      table.dropIndex(['format']);
    });
  }
}
