import { BookshelfType, UserRole } from '@common/contracts';

import { ApplicationHttpController } from './api/httpControllers/applicationHttpController/applicationHttpController.js';
import { type Config, ConfigFactory } from './config.js';
import { HttpServer } from './httpServer.js';
import { QueueRouter } from './queueRouter.js';
import { coreSymbols, symbols } from './symbols.js';
import { type DatabaseClient } from '../libs/database/clients/databaseClient/databaseClient.js';
import { DatabaseClientFactory } from '../libs/database/factories/databaseClientFactory/databaseClientFactory.js';
import { type DependencyInjectionContainer } from '../libs/dependencyInjection/dependencyInjectionContainer.js';
import { DependencyInjectionContainerFactory } from '../libs/dependencyInjection/dependencyInjectionContainerFactory.js';
import { type DependencyInjectionModule } from '../libs/dependencyInjection/dependencyInjectionModule.js';
import { HttpServiceFactory } from '../libs/httpService/factories/httpServiceFactory/httpServiceFactory.js';
import { type HttpService } from '../libs/httpService/services/httpService/httpService.js';
import { LoggerServiceFactory } from '../libs/logger/factories/loggerServiceFactory/loggerServiceFactory.js';
import { type LoggerService } from '../libs/logger/services/loggerService/loggerService.js';
import { type S3Client } from '../libs/s3/clients/s3Client/s3Client.js';
import { S3ClientFactory, type S3Config } from '../libs/s3/factories/s3ClientFactory/s3ClientFactory.js';
import { S3Service } from '../libs/s3/services/s3Service/s3Service.js';
import { SendGridServiceFactory } from '../libs/sendGrid/factories/sendGridServiceFactory/sendGridServiceFactory.js';
import { type SendGridService } from '../libs/sendGrid/services/sendGridService/sendGridService.js';
import { type UuidService } from '../libs/uuid/services/uuidService/uuidService.js';
import { UuidServiceImpl } from '../libs/uuid/services/uuidService/uuidServiceImpl.js';
import { AuthModule } from '../modules/authModule/authModule.js';
import { BookModule } from '../modules/bookModule/bookModule.js';
import { BookDatabaseManager } from '../modules/bookModule/infrastructure/databases/bookDatabase/bookDatabaseManager.js';
import { type GenreRawEntity } from '../modules/bookModule/infrastructure/databases/bookDatabase/tables/genreTable/genreRawEntity.js';
import { genreTable } from '../modules/bookModule/infrastructure/databases/bookDatabase/tables/genreTable/genreTable.js';
import { BookshelfModule } from '../modules/bookshelfModule/bookshelfModule.js';
import { BookshelfDatabaseManager } from '../modules/bookshelfModule/infrastructure/databases/bookshelvesDatabase/bookshelfDatabaseManager.js';
import { type BookshelfRawEntity } from '../modules/bookshelfModule/infrastructure/databases/bookshelvesDatabase/tables/bookshelfTable/bookshelfRawEntity.js';
import { bookshelfTable } from '../modules/bookshelfModule/infrastructure/databases/bookshelvesDatabase/tables/bookshelfTable/bookshelfTable.js';
import { type HashService } from '../modules/userModule/application/services/hashService/hashService.js';
import { type UserRawEntity } from '../modules/userModule/infrastructure/databases/userDatabase/tables/userTable/userRawEntity.js';
import { userTable } from '../modules/userModule/infrastructure/databases/userDatabase/tables/userTable/userTable.js';
import { UserDatabaseManager } from '../modules/userModule/infrastructure/databases/userDatabase/userDatabaseManager.js';
import { userSymbols } from '../modules/userModule/symbols.js';
import { UserModule } from '../modules/userModule/userModule.js';

export class Application {
  private static async setupDatabase(container: DependencyInjectionContainer): Promise<void> {
    const coreDatabaseManagers = [UserDatabaseManager, BookshelfDatabaseManager, BookDatabaseManager];

    for await (const databaseManager of coreDatabaseManagers) {
      await databaseManager.bootstrapDatabase(container);
    }
  }

  private static async createAdminUser(container: DependencyInjectionContainer): Promise<void> {
    const databaseClient = container.get<DatabaseClient>(coreSymbols.databaseClient);

    const uuidService = container.get<UuidService>(coreSymbols.uuidService);

    const loggerService = container.get<LoggerService>(coreSymbols.loggerService);

    const hashService = container.get<HashService>(userSymbols.hashService);

    const { email, password } = container.get<Config>(coreSymbols.config).admin;

    const userExists = await databaseClient<UserRawEntity>(userTable).where({ email }).first();

    if (userExists) {
      loggerService.debug({
        message: 'Admin user already exists.',
        email,
      });

      return;
    }

    const hashedPassword = await hashService.hash({ plainData: password });

    const userId = uuidService.generateUuid();

    await databaseClient<UserRawEntity>(userTable).insert({
      id: userId,
      name: 'Admin',
      email,
      password: hashedPassword,
      isEmailVerified: true,
      role: UserRole.admin,
    });

    await databaseClient<BookshelfRawEntity>(bookshelfTable).insert({
      id: uuidService.generateUuid(),
      userId,
      name: 'Wypożyczalnia',
      type: BookshelfType.borrowing,
    });

    await databaseClient<BookshelfRawEntity>(bookshelfTable).insert({
      id: uuidService.generateUuid(),
      userId,
      name: 'Archiwum',
      type: BookshelfType.archive,
    });

    loggerService.debug({
      message: 'Admin user created.',
      email,
    });
  }

  private static async createGenres(container: DependencyInjectionContainer): Promise<void> {
    const databaseClient = container.get<DatabaseClient>(coreSymbols.databaseClient);

    const config = container.get<Config>(coreSymbols.config);

    const uuidService = container.get<UuidService>(coreSymbols.uuidService);

    const loggerService = container.get<LoggerService>(coreSymbols.loggerService);

    const existingGenres = await databaseClient<GenreRawEntity>(genreTable).select('*');

    if (existingGenres.length > 0) {
      loggerService.debug({ message: 'Genres already exist.' });

      return;
    }

    const genreNames = config.genres;

    await databaseClient<GenreRawEntity>(genreTable).insert(
      genreNames.map((name) => ({
        id: uuidService.generateUuid(),
        name,
      })),
    );

    loggerService.debug({ message: 'Genres created.' });
  }

  public static createContainer(): DependencyInjectionContainer {
    const modules: DependencyInjectionModule[] = [
      new UserModule(),
      new AuthModule(),
      new BookModule(),
      new BookshelfModule(),
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
        host: config.database.host,
        port: config.database.port,
        databaseName: config.database.name,
        user: config.database.username,
        password: config.database.password,
        useNullAsDefault: true,
        minPoolConnections: 1,
        maxPoolConnections: 10,
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

    const s3Config: S3Config = {
      accessKeyId: config.aws.accessKeyId,
      secretAccessKey: config.aws.secretAccessKey,
      region: config.aws.region,
      endpoint: config.aws.endpoint ?? undefined,
    };

    container.bind<S3Client>(symbols.s3Client, () => S3ClientFactory.create(s3Config));

    container.bind<S3Service>(symbols.s3Service, () => new S3Service(container.get<S3Client>(coreSymbols.s3Client)));

    return container;
  }

  public static async start(): Promise<void> {
    const container = Application.createContainer();

    const loggerService = container.get<LoggerService>(coreSymbols.loggerService);

    await this.setupDatabase(container);

    await this.createAdminUser(container);

    await this.createGenres(container);

    loggerService.info({ message: 'Migrations executed.' });

    const server = new HttpServer(container);

    const queueRouter = new QueueRouter(container);

    await server.start();

    await queueRouter.start();
  }
}
