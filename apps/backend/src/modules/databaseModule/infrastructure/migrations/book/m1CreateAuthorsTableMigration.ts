import { type DatabaseClient } from '../../../types/databaseClient.js';
import { type Migration } from '../../../types/migration.js';

export class M1CreateAuthorsTableMigration implements Migration {
  public readonly name = 'M1CreateAuthorsTableMigration';

  private readonly tableName = 'authors';

  public async up(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary();
      table.text('name').notNullable().unique();
      table.boolean('is_approved').notNullable();
    });

    await databaseClient.raw('CREATE EXTENSION IF NOT EXISTS pg_trgm;');

    await databaseClient.raw('CREATE INDEX authors_name_gin_index ON authors USING gin (name gin_trgm_ops);');
  }

  public async down(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.dropTable(this.tableName);
  }
}
