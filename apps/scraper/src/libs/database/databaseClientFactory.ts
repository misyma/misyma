import knex from 'knex';

import { type DatabaseClient } from './databaseClient.js';
import { type DatabaseClientConfig } from './databaseClientConfig.js';

export class DatabaseClientFactory {
  public static create(config: DatabaseClientConfig): DatabaseClient {
    const {
      host,
      port,
      user,
      password,
      databaseName,
      minPoolConnections,
      maxPoolConnections,
      isAsyncStackTracesEnabled,
      useNullAsDefault,
    } = config;

    return knex({
      client: 'pg',
      connection: {
        host,
        port,
        user,
        password,
        database: databaseName,
      },
      pool: {
        min: minPoolConnections,
        max: maxPoolConnections,
      },
      asyncStackTraces: isAsyncStackTracesEnabled ?? false,
      useNullAsDefault: useNullAsDefault ?? false,
    });
  }
}
