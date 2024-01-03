import { type SqliteDatabaseClient } from '../../../../../../core/database/sqliteDatabaseClient/sqliteDatabaseClient.js';
import { type Migration } from '../../../../../../libs/database/types/migration.js';

export class M1CreateEmailEventTableMigration implements Migration {
  public readonly name = 'M1CreateEmailEventTableMigration';

  private readonly tableName = 'emailEvent';

  private readonly tableColumns = {
    id: 'id',
    email: 'email',
    firstName: 'firstName',
    lastName: 'lastName',
    eventName: 'eventName',
    status: 'status',
    createdAt: 'createdAt',
  };

  public async up(databaseClient: SqliteDatabaseClient): Promise<void> {
    await databaseClient.schema.createTable(this.tableName, (table) => {
      table.text(this.tableColumns.id).primary();

      table.text(this.tableColumns.email).notNullable();

      table.text(this.tableColumns.firstName).notNullable();

      table.text(this.tableColumns.lastName).notNullable();

      table.text(this.tableColumns.eventName).notNullable();

      table.text(this.tableColumns.status).notNullable();

      table.dateTime(this.tableColumns.createdAt).notNullable();
    });
  }

  public async down(databaseClient: SqliteDatabaseClient): Promise<void> {
    await databaseClient.schema.dropTable(this.tableName);
  }
}
