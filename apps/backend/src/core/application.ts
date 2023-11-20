import { ConfigProvider } from './configProvider.js';
import { type PostgresDatabaseClient } from './database/postgresDatabaseClient/postgresDatabaseClient.js';
import { PostgresDatabaseClientFactory } from './database/postgresDatabaseClient/postgresDatabaseClientFactory.js';
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
import { UserModule } from '../modules/userModule/userModule.js';

export class Application {
  public static createContainer(): DependencyInjectionContainer {
    const configProvider = new ConfigProvider();

    const databaseHost = configProvider.getPostgresDatabaseHost();

    const databaseName = configProvider.getPostgresDatabaseName();

    const databaseUser = configProvider.getPostgresDatabaseUser();

    const databasePassword = configProvider.getPostgresDatabasePassword();

    const loggerLevel = configProvider.getLoggerLevel();

    const modules: DependencyInjectionModule[] = [new UserModule(), new AuthModule(), new BookModule()];

    const container = DependencyInjectionContainerFactory.create({ modules });

    container.bind<LoggerService>(symbols.loggerService, () => LoggerServiceFactory.create({ loggerLevel }));

    container.bind<HttpService>(symbols.httpService, () => HttpServiceFactory.create());

    container.bind<UuidService>(symbols.uuidService, () => new UuidServiceImpl());

    container.bind<ConfigProvider>(symbols.configProvider, () => configProvider);

    container.bind<PostgresDatabaseClient>(symbols.postgresDatabaseClient, () =>
      PostgresDatabaseClientFactory.create({
        databaseHost,
        databaseName,
        databaseUser,
        databasePassword,
      }),
    );

    return container;
  }

  public static async start(): Promise<void> {
    const container = Application.createContainer();

    const configProvider = container.get<ConfigProvider>(coreSymbols.configProvider);

    const serverHost = configProvider.getServerHost();

    const serverPort = configProvider.getServerPort();

    const server = new HttpServer(container);

    await server.start({
      host: serverHost,
      port: serverPort,
    });

    const loggerService = container.get<LoggerService>(coreSymbols.loggerService);

    loggerService.log({
      message: `Application started.`,
      context: {
        source: Application.name,
      },
    });
  }
}
