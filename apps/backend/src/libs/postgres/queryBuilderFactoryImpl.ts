import * as knex from 'knex';

import { type QueryBuilder } from './queryBuilder.js';
import { type QueryBuilderConfig } from './queryBuilderConfig.js';
import { type QueryBuilderFactory } from './queryBuilderFactory.js';

export class QueryBuilderFactoryImpl implements QueryBuilderFactory {
  public create(config: QueryBuilderConfig): QueryBuilder {
    const { databaseHost, databaseName, databaseUser, databasePassword } = config;

    const postgresPort = 5432;

    return knex.knex({
      client: 'pg',
      connection: {
        host: databaseHost,
        port: postgresPort,
        user: databaseUser,
        password: databasePassword,
        database: databaseName,
      },
      pool: {
        min: 1,
        max: 10,
      },
    });
  }
}
