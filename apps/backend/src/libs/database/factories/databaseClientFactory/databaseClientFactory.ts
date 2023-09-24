/* eslint-disable import/no-named-as-default */

import knex from 'knex';

import { type DatabaseClient } from '../../clients/databaseClient/databaseClient.js';
import { type DatabaseClientConfig } from '../../clients/databaseClient/databaseClientConfig.js';

export class DatabaseClientFactory {
  public create(config: DatabaseClientConfig): DatabaseClient {
    const { clientType, host, port, user, password, databaseName, minPoolConnections, maxPoolConnections } = config;

    const knexConstructor = typeof knex === 'function' ? knex : knex.default;

    return knexConstructor({
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
