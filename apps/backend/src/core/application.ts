import { UserRole } from '@common/contracts';

import { ApplicationHttpController } from './api/httpControllers/applicationHttpController/applicationHttpController.js';
import { type Config, ConfigFactory } from './config.js';
import { HttpServer } from './httpServer/httpServer.js';
import { QueueRouter } from './queueRouter/queueRouter.js';
import { coreSymbols, symbols } from './symbols.js';
import { type DatabaseClient } from '../libs/database/clients/databaseClient/databaseClient.js';
import { DatabaseClientFactory } from '../libs/database/factories/databaseClientFactory/databaseClientFactory.js';
import { DatabaseClientType } from '../libs/database/types/databaseClientType.js';
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
import { BookReadingModule } from '../modules/bookReadingsModule/bookReadingModule.js';
import { BookReadingDatabaseManager } from '../modules/bookReadingsModule/infrastructure/databases/bookReadingsDatabase/bookReadingDatabaseManager.js';
import { BookshelfModule } from '../modules/bookshelfModule/bookshelfModule.js';
import { BookshelfDatabaseManager } from '../modules/bookshelfModule/infrastructure/databases/bookshelvesDatabase/bookshelfDatabaseManager.js';
import { type HashService } from '../modules/userModule/application/services/hashService/hashService.js';
import { type UserRawEntity } from '../modules/userModule/infrastructure/databases/userDatabase/tables/userTable/userRawEntity.js';
import { UserTable } from '../modules/userModule/infrastructure/databases/userDatabase/tables/userTable/userTable.js';
import { UserDatabaseManager } from '../modules/userModule/infrastructure/databases/userDatabase/userDatabaseManager.js';
import { UserEventsDatabaseManager } from '../modules/userModule/infrastructure/databases/userEventsDatabase/userEventsDatabaseManager.js';
import { userSymbols } from '../modules/userModule/symbols.js';
import { UserModule } from '../modules/userModule/userModule.js';

export class Application {
  private static async setupDatabase(container: DependencyInjectionContainer): Promise<void> {
    const coreDatabaseManagers = [
      UserDatabaseManager,
      AuthorDatabaseManager,
      BookDatabaseManager,
      BookshelfDatabaseManager,
      BookReadingDatabaseManager,
    ];

    const eventsDatabaseManagers = [UserEventsDatabaseManager];

    for await (const databaseManager of coreDatabaseManagers) {
      await databaseManager.bootstrapDatabase(container);
    }

    for await (const databaseManager of eventsDatabaseManagers) {
      await databaseManager.bootstrapDatabase(container);
    }

    const databaseClient = container.get<DatabaseClient>(coreSymbols.databaseClient);

    const entityEventsDatabaseClient = container.get<DatabaseClient>(coreSymbols.entityEventsDatabaseClient);

    await databaseClient.raw('PRAGMA journal_mode = WAL');

    await entityEventsDatabaseClient.raw('PRAGMA journal_mode = WAL');
  }

  private static async createAdminUser(container: DependencyInjectionContainer): Promise<void> {
    const databaseClient = container.get<DatabaseClient>(coreSymbols.databaseClient);

    const uuidService = container.get<UuidService>(coreSymbols.uuidService);

    const loggerService = container.get<LoggerService>(coreSymbols.loggerService);

    const hashService = container.get<HashService>(userSymbols.hashService);

    const { email, password } = container.get<Config>(coreSymbols.config).admin;

    const userTable = new UserTable();

    const userExists = await databaseClient<UserRawEntity>(userTable.name).where({ email }).first();

    if (userExists) {
      loggerService.debug({
        message: 'Admin user already exists.',
        email,
      });

      return;
    }

    const hashedPassword = await hashService.hash({ plainData: password });

    await databaseClient<UserRawEntity>(userTable.name).insert({
      id: uuidService.generateUuid(),
      email,
      password: hashedPassword,
      role: UserRole.admin,
    });

    loggerService.debug({
      message: 'Admin user created.',
      email,
    });
  }

  public static createContainer(): DependencyInjectionContainer {
    const modules: DependencyInjectionModule[] = [
      new UserModule(),
      new AuthModule(),
      new BookModule(),
      new AuthorModule(),
      new BookshelfModule(),
      new BookReadingModule(),
    ];

    const container = DependencyInjectionContainerFactory.create({ modules });

    const config = ConfigFactory.create();

    container.bind<LoggerService>(symbols.loggerService, () =>
      LoggerServiceFactory.create({ logLevel: config.logLevel }),
    );

    container.bind<HttpService>(symbols.httpService, () =>
      new HttpServiceFactory(container.get<LoggerService>(symbols.loggerService)).create(),
    );

    container.bind<UuidService>(symbols.uuidService, () => new UuidServiceImpl());

    container.bind<Config>(symbols.config, () => config);

    container.bind<DatabaseClient>(symbols.databaseClient, () =>
      DatabaseClientFactory.create({
        clientType: DatabaseClientType.sqlite,
        filePath: config.databasePath,
        useNullAsDefault: true,
        minPoolConnections: 1,
        maxPoolConnections: 1,
      }),
    );

    container.bind<DatabaseClient>(symbols.entityEventsDatabaseClient, () =>
      DatabaseClientFactory.create({
        clientType: DatabaseClientType.sqlite,
        filePath: config.queueDatabasePath,
        useNullAsDefault: true,
        minPoolConnections: 1,
        maxPoolConnections: 1,
      }),
    );

    container.bind<ApplicationHttpController>(
      symbols.applicationHttpController,
      () => new ApplicationHttpController(container.get<DatabaseClient>(coreSymbols.databaseClient)),
    );

    container.bind<SendGridService>(symbols.sendGridService, () =>
      new SendGridServiceFactory(container.get<HttpService>(coreSymbols.httpService)).create({
        apiKey: config.sendGrid.apiKey,
        senderEmail: config.sendGrid.senderEmail,
      }),
    );

    return container;
  }

  public static async start(): Promise<void> {
    const container = Application.createContainer();

    const loggerService = container.get<LoggerService>(coreSymbols.loggerService);

    await this.setupDatabase(container);

    await this.createAdminUser(container);

    loggerService.info({ message: 'Migrations executed.' });

    const server = new HttpServer(container);

    const queueRouter = new QueueRouter(container);

    await server.start();

    await queueRouter.start();
  }
}
