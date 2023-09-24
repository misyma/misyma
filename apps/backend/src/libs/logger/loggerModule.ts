import { type LoggerClient } from './clients/loggerClient/loggerClient.js';
import { type LoggerClientFactory } from './factories/loggerClientFactory/loggerClientFactory.js';
import { LoggerClientFactoryImpl } from './factories/loggerClientFactory/loggerClientFactoryImpl.js';
import { type LoggerModuleConfig } from './loggerModuleConfig.js';
import { type LoggerService } from './services/loggerService/loggerService.js';
import { LoggerServiceImpl } from './services/loggerService/loggerServiceImpl.js';
import { symbols } from './symbols.js';
import { type DependencyInjectionContainer } from '../dependencyInjection/dependencyInjectionContainer.js';
import { type DependencyInjectionModule } from '../dependencyInjection/dependencyInjectionModule.js';

export class LoggerModule implements DependencyInjectionModule {
  public constructor(private readonly config: LoggerModuleConfig) {}

  public async declareBindings(container: DependencyInjectionContainer): Promise<void> {
    container.bindToValue<LoggerModuleConfig>(symbols.loggerModuleConfig, this.config);

    container.bindToConstructor<LoggerClientFactory>(symbols.loggerClientFactory, LoggerClientFactoryImpl);

    container.bindToDynamicValue<LoggerClient>(symbols.loggerClient, ({ container }) => {
      const loggerClientFactory = container.get<LoggerClientFactory>(symbols.loggerClientFactory);

      return loggerClientFactory.create();
    });

    container.bindToConstructor<LoggerService>(symbols.loggerService, LoggerServiceImpl);
  }
}
