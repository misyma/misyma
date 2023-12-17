import { ApplicationHttpController } from './api/httpControllers/applicationHttpController/applicationHttpController.js';
import { ConfigProvider } from './configProvider.js';
import { type SqliteDatabaseClient } from './database/sqliteDatabaseClient/sqliteDatabaseClient.js';
import { SqliteDatabaseClientFactory } from './database/sqliteDatabaseClient/sqliteDatabaseClientFactory.js';
import { HttpServer } from './httpServer/httpServer.js';
import { coreSymbols, symbols } from './symbols.js';
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
import { BookDatabaseManager } from '../modules/bookModule/infrastructure/databases/bookDatabase/bookDatabaseManager.js';
import { UserDatabaseManager } from '../modules/userModule/infrastructure/databases/userDatabase/userDatabaseManager.js';
import { UserModule } from '../modules/userModule/userModule.js';

export class Application {
  private static async setupDatabase(container: DependencyInjectionContainer): Promise<void> {
    const databaseManagers = [UserDatabaseManager, BookDatabaseManager];

    for await (const databaseManager of databaseManagers) {
      await databaseManager.bootstrapDatabase(container);
    }

    const sqliteDatabaseClient = container.get<SqliteDatabaseClient>(coreSymbols.sqliteDatabaseClient);

    await sqliteDatabaseClient.raw('PRAGMA journal_mode = WAL');
  }

  public static createContainer(): DependencyInjectionContainer {
    const configProvider = new ConfigProvider();

    const databasePath = configProvider.getSqliteDatabasePath();

    const logLevel = configProvider.getLogLevel();

    const prettifyLogs = configProvider.getLoggerPrettifyLogs();

    const modules: DependencyInjectionModule[] = [new UserModule(), new AuthModule(), new BookModule()];

    const container = DependencyInjectionContainerFactory.create({ modules });

    container.bind<LoggerService>(symbols.loggerService, () =>
      LoggerServiceFactory.create({
        logLevel,
        prettifyLogs,
      }),
    );

    container.bind<HttpService>(symbols.httpService, () => HttpServiceFactory.create());

    container.bind<UuidService>(symbols.uuidService, () => new UuidServiceImpl());

    container.bind<ConfigProvider>(symbols.configProvider, () => configProvider);

    container.bind<SqliteDatabaseClient>(symbols.sqliteDatabaseClient, () =>
      SqliteDatabaseClientFactory.create({ databasePath }),
    );

    container.bind<ApplicationHttpController>(
      symbols.applicationHttpController,
      () => new ApplicationHttpController(container.get<SqliteDatabaseClient>(coreSymbols.sqliteDatabaseClient)),
    );

    return container;
  }

  public static async start(): Promise<void> {
    const container = Application.createContainer();

    const loggerService = container.get<LoggerService>(coreSymbols.loggerService);

    await this.setupDatabase(container);

    loggerService.info({
      message: 'Migrations ran.',
      context: {
        source: Application.name,
      },
    });

    const server = new HttpServer(container);

    await server.start();

    loggerService.log({
      message: `Application started.`,
      context: {
        source: Application.name,
      },
    });
  }
}
