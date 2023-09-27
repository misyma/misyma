import { type PostgresDatabaseClient } from './postgresDatabaseClient.js';
import { type PostgresDatabaseClientConfig } from './postgresDatabaseClientConfig.js';
import { DatabaseClientFactory } from '../../../libs/database/factories/databaseClientFactory/databaseClientFactory.js';
import { DatabaseClientType } from '../../../libs/database/types/databaseClientType.js';

export class PostgresDatabaseClientFactory {
  public static create(config: PostgresDatabaseClientConfig): PostgresDatabaseClient {
    const { databaseHost, databaseName, databaseUser, databasePassword } = config;

    return DatabaseClientFactory.create({
      clientType: DatabaseClientType.postgres,
      host: databaseHost,
      port: 5432,
      databaseName,
      user: databaseUser,
      password: databasePassword,
      minPoolConnections: 1,
      maxPoolConnections: 10,
    });
  }
}
