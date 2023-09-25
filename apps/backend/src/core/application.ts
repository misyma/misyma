import { ConfigProvider } from './configProvider.js';
import { HttpServer } from './httpServer/httpServer.js';
import { coreSymbols, symbols } from './symbols.js';
import { type DependencyInjectionContainer } from '../libs/dependencyInjection/dependencyInjectionContainer.js';
import { DependencyInjectionContainerFactory } from '../libs/dependencyInjection/dependencyInjectionContainerFactory.js';
import { HttpServiceFactory } from '../libs/httpService/factories/httpServiceFactory/httpServiceFactory.js';
import { type HttpService } from '../libs/httpService/services/httpService/httpService.js';
import { LoggerServiceFactory } from '../libs/logger/factories/loggerServiceFactory/loggerServiceFactory.js';
import { type LoggerService } from '../libs/logger/services/loggerService/loggerService.js';

export class Application {
  public static createContainer(): DependencyInjectionContainer {
    const databaseHost = ConfigProvider.getPostgresDatabaseHost();

    const databasePort = ConfigProvider.getPostgresDatabasePort();

    const databaseName = ConfigProvider.getPostgresDatabaseName();

    const databaseUser = ConfigProvider.getPostgresDatabaseUser();

    const databasePassword = ConfigProvider.getPostgresDatabasePassword();

    const jwtSecret = ConfigProvider.getJwtSecret();

    const jwtExpiresIn = ConfigProvider.getJwtExpiresIn();

    const hashSaltRounds = ConfigProvider.getHashSaltRounds();

    const loggerLevel = ConfigProvider.getLoggerLevel();

    console.log({
      databaseHost,
      databasePort,
      databaseName,
      databaseUser,
      databasePassword,
      jwtSecret,
      jwtExpiresIn,
      hashSaltRounds,
      loggerLevel,
    });

    const container = DependencyInjectionContainerFactory.create({
      modules: [],
    });

    container.bind<LoggerService>(symbols.loggerService, () => LoggerServiceFactory.create({ loggerLevel }));

    container.bind<HttpService>(symbols.httpService, () => HttpServiceFactory.create());

    return container;
  }

  public static async start(): Promise<void> {
    const container = Application.createContainer();

    const serverHost = ConfigProvider.getServerHost();

    const serverPort = ConfigProvider.getServerPort();

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
