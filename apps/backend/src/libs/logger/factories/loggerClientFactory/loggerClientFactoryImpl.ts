import { createLogger } from 'bunyan';

import { type LoggerClientFactory } from './loggerClientFactory.js';
import { Injectable, Inject } from '../../../dependencyInjection/decorators.js';
import { type LoggerClient } from '../../clients/loggerClient/loggerClient.js';
import { type LoggerModuleConfig } from '../../loggerModuleConfig.js';
import { symbols } from '../../symbols.js';

@Injectable()
export class LoggerClientFactoryImpl implements LoggerClientFactory {
  public constructor(
    @Inject(symbols.loggerModuleConfig)
    private readonly config: LoggerModuleConfig,
  ) {}

  public create(): LoggerClient {
    const loggerClient = createLogger({
      name: 'logger',
      level: this.config.logLevel,
    });

    return loggerClient;
  }
}
