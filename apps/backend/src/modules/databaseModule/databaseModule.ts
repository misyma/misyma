import knex from 'knex';

import { type Config } from '../../core/config.js';
import { coreSymbols } from '../../core/symbols.js';
import { type DependencyInjectionContainer } from '../../libs/dependencyInjection/dependencyInjectionContainer.js';
import { type DependencyInjectionModule } from '../../libs/dependencyInjection/dependencyInjectionModule.js';

import { DatabaseManager } from './infrastructure/databaseManager.js';
import { symbols } from './symbols.js';
import { type DatabaseClient } from './types/databaseClient.js';

export class DatabaseModule implements DependencyInjectionModule {
  public declareBindings(container: DependencyInjectionContainer): void {
    container.bind<DatabaseClient>(symbols.databaseClient, () => {
      const config = container.get<Config>(coreSymbols.config);

      return knex({
        client: 'pg',
        connection: {
          host: config.database.host,
          port: config.database.port,
          user: config.database.username,
          password: config.database.password,
          database: config.database.name,
        },
        pool: {
          min: 1,
          max: 10,
        },
        useNullAsDefault: true,
      });
    });

    container.bind<DatabaseManager>(
      symbols.databaseManager,
      () => new DatabaseManager(container.get<DatabaseClient>(symbols.databaseClient)),
    );
  }
}
