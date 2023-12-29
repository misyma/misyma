import { type SqliteDatabaseClient } from '../../../../core/database/sqliteDatabaseClient/sqliteDatabaseClient.js';
import { DatabaseClientFactory } from '../../../database/factories/databaseClientFactory/databaseClientFactory.js';
import { DatabaseClientType } from '../../../database/types/databaseClientType.js';

export class SqliteCacheClientFactory {
  public static create(): SqliteDatabaseClient {
    return DatabaseClientFactory.create({
      clientType: DatabaseClientType.sqlite,
      // For the time being this will remain hardcoded without the possibility to declare a named, shareable in-memory db.
      // This is due to issues encountered with better-sqlite3 (or knex), whereas the 'file:memory:?cache=shared' syntax gets treated literally and causes a file to be created. This will be further investigated once needed or time allows it.
      // For more information about this particular quirk of Sqlite, please see here: https://www.sqlite.org/inmemorydb.html
      filePath: ':memory:',
      minPoolConnections: 1,
      maxPoolConnections: 1,
    });
  }
}
