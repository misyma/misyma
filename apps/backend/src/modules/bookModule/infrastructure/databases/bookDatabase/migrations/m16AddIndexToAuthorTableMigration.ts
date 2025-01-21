import { type DatabaseClient } from '../../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { type Migration } from '../../../../../../libs/database/types/migration.js';

export class M16AddIndexToAuthorTableMigration implements Migration {
  public readonly name = 'M16AddIndexToAuthorTableMigration';

  public async up(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.raw('CREATE EXTENSION IF NOT EXISTS pg_trgm;');

    await databaseClient.raw('CREATE INDEX authors_name_gin_index ON authors USING gin (name gin_trgm_ops);');
  }

  public async down(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.raw('DROP EXTENSION IF EXISTS pg_trgm;');

    await databaseClient.raw('DROP INDEX IF EXISTS authors_name_gin_index;');
  }
}
