import { createLogger } from 'bunyan';

import { type LoggerClient } from '../../clients/loggerClient/loggerClient.js';
import { type LoggerConfig } from '../../types/loggerConfig.js';

export class LoggerClientFactory {
  public static create(config: LoggerConfig): LoggerClient {
    const loggerClient = createLogger({
      name: 'logger',
      level: config.loggerLevel,
    });

    return loggerClient;
  }
}
