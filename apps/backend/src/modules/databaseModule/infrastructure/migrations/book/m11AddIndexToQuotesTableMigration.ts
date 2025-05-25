import { type DatabaseClient } from '../../../types/databaseClient.js';
import { type Migration } from '../../../types/migration.js';

export class M11AddIndexToQuotesTableMigration implements Migration {
  public readonly name = 'M11AddIndexToQuotesTableMigration';

  public async up(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.raw('CREATE EXTENSION IF NOT EXISTS pg_trgm;');

    await databaseClient.raw('CREATE INDEX quotes_content_gin_index ON quotes USING gin (content gin_trgm_ops);');
  }

  public async down(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.raw('DROP INDEX IF EXISTS quotes_content_gin_index;');

    await databaseClient.raw('DROP EXTENSION IF EXISTS pg_trgm;');
  }
}
