import { ConfigProvider } from '../core/configProvider.js';
import { type SqliteDatabaseClient } from '../core/database/sqliteDatabaseClient/sqliteDatabaseClient.js';
import { SqliteDatabaseClientFactory } from '../core/database/sqliteDatabaseClient/sqliteDatabaseClientFactory.js';
import { coreSymbols } from '../core/symbols.js';
import { type DependencyInjectionContainer } from '../libs/dependencyInjection/dependencyInjectionContainer.js';
import { DependencyInjectionContainerFactory } from '../libs/dependencyInjection/dependencyInjectionContainerFactory.js';
import { type DependencyInjectionModule } from '../libs/dependencyInjection/dependencyInjectionModule.js';
import { HttpServiceFactory } from '../libs/httpService/factories/httpServiceFactory/httpServiceFactory.js';
import { type HttpService } from '../libs/httpService/services/httpService/httpService.js';
import { LoggerServiceFactory } from '../libs/logger/factories/loggerServiceFactory/loggerServiceFactory.js';
import { type LoggerService } from '../libs/logger/services/loggerService/loggerService.js';
import { type UuidService } from '../libs/uuid/services/uuidService/uuidService.js';
import { UuidServiceImpl } from '../libs/uuid/services/uuidService/uuidServiceImpl.js';
import { AuthModule } from '../modules/authModule/authModule.js';
import { BookModule } from '../modules/bookModule/bookModule.js';
import { UserModule } from '../modules/userModule/userModule.js';

export class TestContainer {
  public static createContainer(): DependencyInjectionContainer {
    const configProvider = new ConfigProvider();

    const databasePath = configProvider.getSqliteDatabasePath();

    const loggerLevel = configProvider.getLoggerLevel();

    const modules: DependencyInjectionModule[] = [new UserModule(), new AuthModule(), new BookModule()];

    const container = DependencyInjectionContainerFactory.create({ modules });

    container.bind<LoggerService>(coreSymbols.loggerService, () => LoggerServiceFactory.create({ loggerLevel }));

    container.bind<HttpService>(coreSymbols.httpService, () => HttpServiceFactory.create());

    container.bind<UuidService>(coreSymbols.uuidService, () => new UuidServiceImpl());

    container.bind<ConfigProvider>(coreSymbols.configProvider, () => configProvider);

    if (!TestContainer.dbClient) {
      TestContainer.dbClient = SqliteDatabaseClientFactory.create({ databasePath });
    }

    container.bind<SqliteDatabaseClient>(
      coreSymbols.sqliteDatabaseClient,
      () => TestContainer.dbClient as SqliteDatabaseClient,
    );

    return container;
  }

  private static dbClient: SqliteDatabaseClient | null = null;
}
