import { ApplicationHttpController } from './api/httpControllers/applicationHttpController/applicationHttpController.js';
import { ConfigProvider } from './configProvider.js';
import { type SqliteDatabaseClient } from './database/sqliteDatabaseClient/sqliteDatabaseClient.js';
import { SqliteDatabaseClientFactory } from './database/sqliteDatabaseClient/sqliteDatabaseClientFactory.js';
import { HttpServer } from './httpServer/httpServer.js';
import { QueueRouter } from './queueRouter/queueRouter.js';
import { coreSymbols, symbols } from './symbols.js';
import { type DependencyInjectionContainer } from '../libs/dependencyInjection/dependencyInjectionContainer.js';
import { DependencyInjectionContainerFactory } from '../libs/dependencyInjection/dependencyInjectionContainerFactory.js';
import { type DependencyInjectionModule } from '../libs/dependencyInjection/dependencyInjectionModule.js';
import { HttpServiceFactory } from '../libs/httpService/factories/httpServiceFactory/httpServiceFactory.js';
import { type HttpService } from '../libs/httpService/services/httpService/httpService.js';
import { LoggerServiceFactory } from '../libs/logger/factories/loggerServiceFactory/loggerServiceFactory.js';
import { type LoggerService } from '../libs/logger/services/loggerService/loggerService.js';
import { SendGridServiceFactory } from '../libs/sendGrid/factories/sendGridServiceFactory/sendGridServiceFactory.js';
import { type SendGridService } from '../libs/sendGrid/services/sendGridService/sendGridService.js';
import { type UuidService } from '../libs/uuid/services/uuidService/uuidService.js';
import { UuidServiceImpl } from '../libs/uuid/services/uuidService/uuidServiceImpl.js';
import { AuthModule } from '../modules/authModule/authModule.js';
import { AuthorModule } from '../modules/authorModule/authorModule.js';
import { AuthorDatabaseManager } from '../modules/authorModule/infrastructure/databases/authorDatabaseManager.js';
import { BookModule } from '../modules/bookModule/bookModule.js';
import { BookDatabaseManager } from '../modules/bookModule/infrastructure/databases/bookDatabase/bookDatabaseManager.js';
import { UserDatabaseManager } from '../modules/userModule/infrastructure/databases/userDatabase/userDatabaseManager.js';
import { UserEventsDatabaseManager } from '../modules/userModule/infrastructure/databases/userEventsDatabase/userEventsDatabaseManager.js';
import { UserModule } from '../modules/userModule/userModule.js';

export class Application {
  private static async setupDatabase(container: DependencyInjectionContainer): Promise<void> {
    const coreDatabaseManagers = [UserDatabaseManager, AuthorDatabaseManager, BookDatabaseManager];

    const eventsDatabaseManagers = [UserEventsDatabaseManager];

    for await (const databaseManager of coreDatabaseManagers) {
      await databaseManager.bootstrapDatabase(container);
    }

    for await (const databaseManager of eventsDatabaseManagers) {
      await databaseManager.bootstrapDatabase(container);
    }

    const sqliteDatabaseClient = container.get<SqliteDatabaseClient>(coreSymbols.sqliteDatabaseClient);

    const entityEventsDatabaseClient = container.get<SqliteDatabaseClient>(coreSymbols.entityEventsDatabaseClient);

    await sqliteDatabaseClient.raw('PRAGMA journal_mode = WAL');

    await entityEventsDatabaseClient.raw('PRAGMA journal_mode = WAL');
  }

  public static createContainer(): DependencyInjectionContainer {
    const configProvider = new ConfigProvider();

    const mainDatabasePath = configProvider.getSqliteDatabasePath();

    const queuesDatabasePath = configProvider.getQueuesDatabasePath();

    const logLevel = configProvider.getLogLevel();

    const prettifyLogs = configProvider.getLoggerPrettifyLogs();

    const sendGridApiKey = configProvider.getSendGridApiKey();

    const sendGridSenderEmail = configProvider.getSendGridSenderEmail();

    const modules: DependencyInjectionModule[] = [
      new UserModule(),
      new AuthModule(),
      new BookModule(),
      new AuthorModule(),
    ];

    const container = DependencyInjectionContainerFactory.create({ modules });

    container.bind<LoggerService>(symbols.loggerService, () =>
      LoggerServiceFactory.create({
        logLevel,
        prettifyLogs,
      }),
    );

    // TODO: add core module and define those symbols there
    container.bind<HttpService>(symbols.httpService, () =>
      new HttpServiceFactory(container.get<LoggerService>(symbols.loggerService)).create(),
    );

    container.bind<UuidService>(symbols.uuidService, () => new UuidServiceImpl());

    container.bind<ConfigProvider>(symbols.configProvider, () => configProvider);

    container.bind<SqliteDatabaseClient>(symbols.sqliteDatabaseClient, () =>
      SqliteDatabaseClientFactory.create({ databasePath: mainDatabasePath }),
    );

    container.bind<SqliteDatabaseClient>(symbols.entityEventsDatabaseClient, () =>
      SqliteDatabaseClientFactory.create({
        databasePath: queuesDatabasePath,
      }),
    );

    container.bind<ApplicationHttpController>(
      symbols.applicationHttpController,
      () => new ApplicationHttpController(container.get<SqliteDatabaseClient>(coreSymbols.sqliteDatabaseClient)),
    );

    container.bind<SendGridService>(symbols.sendGridService, () =>
      new SendGridServiceFactory(container.get<HttpService>(coreSymbols.httpService)).create({
        apiKey: sendGridApiKey,
        senderEmail: sendGridSenderEmail,
      }),
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

    const queueRouter = new QueueRouter(container);

    await server.start();

    await queueRouter.start();

    loggerService.log({
      message: `Application started.`,
      context: {
        source: Application.name,
      },
    });
  }
}
