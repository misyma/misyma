import knex from 'knex';

import { type DatabaseClient } from '../../clients/databaseClient/databaseClient.js';
import { type DatabaseClientConfig } from '../../clients/databaseClient/databaseClientConfig.js';

export class DatabaseClientFactory {
  public static create(config: DatabaseClientConfig): DatabaseClient {
    const { clientType, host, port, user, password, databaseName, minPoolConnections, maxPoolConnections } = config;

    return knex({
      client: clientType,
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
    });
  }
}
