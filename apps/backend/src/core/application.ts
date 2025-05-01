import { bookshelfTypes, userRoles } from '@common/contracts';

import { type DependencyInjectionContainer } from '../libs/dependencyInjection/dependencyInjectionContainer.js';
import { DependencyInjectionContainerFactory } from '../libs/dependencyInjection/dependencyInjectionContainerFactory.js';
import { type DependencyInjectionModule } from '../libs/dependencyInjection/dependencyInjectionModule.js';
import { type EmailService } from '../libs/emailService/emailService.js';
import { EmailServiceImpl } from '../libs/emailService/emailServiceImpl.js';
import { type HttpService } from '../libs/httpService/httpService.js';
import { HttpServiceImpl } from '../libs/httpService/httpServiceImpl.js';
import { type LoggerService } from '../libs/logger/loggerService.js';
import { LoggerServiceFactory } from '../libs/logger/loggerServiceFactory.js';
import { type S3Client } from '../libs/s3/s3Client.js';
import { S3ClientFactory, type S3Config } from '../libs/s3/s3ClientFactory.js';
import { S3Service } from '../libs/s3/s3Service.js';
import { UuidService } from '../libs/uuid/uuidService.js';
import { AuthModule } from '../modules/authModule/authModule.js';
import { BookModule } from '../modules/bookModule/bookModule.js';
import { BookshelfModule } from '../modules/bookshelfModule/bookshelfModule.js';
import { DatabaseModule } from '../modules/databaseModule/databaseModule.js';
import { type DatabaseManager } from '../modules/databaseModule/infrastructure/databaseManager.js';
import { type BookshelfRawEntity } from '../modules/databaseModule/infrastructure/tables/bookshelfTable/bookshelfRawEntity.js';
import { bookshelvesTable } from '../modules/databaseModule/infrastructure/tables/bookshelfTable/bookshelfTable.js';
import { categoriesTable } from '../modules/databaseModule/infrastructure/tables/categoriesTable/categoriesTable.js';
import { type CategoryRawEntity } from '../modules/databaseModule/infrastructure/tables/categoriesTable/categoryRawEntity.js';
import { type UserRawEntity } from '../modules/databaseModule/infrastructure/tables/userTable/userRawEntity.js';
import { usersTable } from '../modules/databaseModule/infrastructure/tables/userTable/userTable.js';
import { databaseSymbols } from '../modules/databaseModule/symbols.js';
import { type DatabaseClient } from '../modules/databaseModule/types/databaseClient.js';
import { type HashService } from '../modules/userModule/application/services/hashService/hashService.js';
import { userSymbols } from '../modules/userModule/symbols.js';
import { UserModule } from '../modules/userModule/userModule.js';

import { ApplicationHttpController } from './api/httpControllers/applicationHttpController/applicationHttpController.js';
import { type Config, createConfig } from './config.js';
import { HttpServer } from './httpServer.js';
import { QueueRouter } from './queueRouter.js';
import { coreSymbols, symbols } from './symbols.js';

export class Application {
  private static container: DependencyInjectionContainer | undefined;
  private static server: HttpServer | undefined;

  public static async start(): Promise<void> {
    Application.container = Application.createContainer();

    await this.setupDatabase(Application.container);

    Application.server = new HttpServer(Application.container);

    const queueRouter = new QueueRouter(Application.container);

    await Application.server.start();

    await queueRouter.start();
  }

  public static async stop(): Promise<void> {
    await Application.server?.stop();

    const dbClient = Application.container?.get<DatabaseClient>(databaseSymbols.databaseClient);

    await dbClient?.destroy();
  }

  public static createContainer(): DependencyInjectionContainer {
    const modules: DependencyInjectionModule[] = [
      new DatabaseModule(),
      new UserModule(),
      new AuthModule(),
      new BookModule(),
      new BookshelfModule(),
    ];

    const container = DependencyInjectionContainerFactory.create({ modules });

    const config = createConfig();

    container.bind<LoggerService>(symbols.loggerService, () =>
      LoggerServiceFactory.create({ logLevel: config.logLevel }),
    );

    container.bind<HttpService>(symbols.httpService, () => new HttpServiceImpl());

    container.bind<UuidService>(symbols.uuidService, () => new UuidService());

    container.bind<Config>(symbols.config, () => config);

    container.bind<ApplicationHttpController>(
      symbols.applicationHttpController,
      () => new ApplicationHttpController(container.get<DatabaseClient>(databaseSymbols.databaseClient)),
    );

    container.bind<EmailService>(
      symbols.emailService,
      () => new EmailServiceImpl(container.get<HttpService>(coreSymbols.httpService), config),
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

  private static async setupDatabase(container: DependencyInjectionContainer): Promise<void> {
    const databaseManager = container.get<DatabaseManager>(databaseSymbols.databaseManager);

    await databaseManager.setupDatabase();

    await this.createAdminUser(container);

    await this.createCategories(container);
  }

  private static async createAdminUser(container: DependencyInjectionContainer): Promise<void> {
    const databaseClient = container.get<DatabaseClient>(databaseSymbols.databaseClient);

    const uuidService = container.get<UuidService>(coreSymbols.uuidService);

    const loggerService = container.get<LoggerService>(coreSymbols.loggerService);

    const hashService = container.get<HashService>(userSymbols.hashService);

    const { email, password } = container.get<Config>(coreSymbols.config).admin;

    const userExists = await databaseClient<UserRawEntity>(usersTable).where({ email }).first();

    if (userExists) {
      loggerService.debug({
        message: 'Admin user already exists.',
        email,
      });

      return;
    }

    const hashedPassword = await hashService.hash({ plainData: password });

    const userId = uuidService.generateUuid();

    await databaseClient<UserRawEntity>(usersTable).insert({
      id: userId,
      name: 'Admin',
      email,
      password: hashedPassword,
      is_email_verified: true,
      role: userRoles.admin,
    });

    await databaseClient<BookshelfRawEntity>(bookshelvesTable).insert({
      id: uuidService.generateUuid(),
      name: 'Archiwum',
      user_id: userId,
      type: bookshelfTypes.archive,
    });

    await databaseClient<BookshelfRawEntity>(bookshelvesTable).insert({
      id: uuidService.generateUuid(),
      name: 'Wypożyczalnia',
      user_id: userId,
      type: bookshelfTypes.borrowing,
    });

    loggerService.debug({
      message: 'Admin user created.',
      email,
    });
  }

  private static async createCategories(container: DependencyInjectionContainer): Promise<void> {
    const databaseClient = container.get<DatabaseClient>(databaseSymbols.databaseClient);

    const config = container.get<Config>(coreSymbols.config);

    const uuidService = container.get<UuidService>(coreSymbols.uuidService);

    const loggerService = container.get<LoggerService>(coreSymbols.loggerService);

    const existingCategories = await databaseClient<CategoryRawEntity>(categoriesTable).select('*');

    if (existingCategories.length > 0) {
      loggerService.debug({ message: 'Categories already exist.' });

      return;
    }

    await databaseClient<CategoryRawEntity>(categoriesTable).insert(
      config.categories.map((name) => ({
        id: uuidService.generateUuid(),
        name,
      })),
    );

    loggerService.debug({ message: 'Categories created.' });
  }
}
