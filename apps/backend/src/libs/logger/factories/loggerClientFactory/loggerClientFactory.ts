/* eslint-disable import/no-named-as-default */

import { pino, type LoggerOptions } from 'pino';

import { type LoggerClient } from '../../clients/loggerClient/loggerClient.js';
import { type LoggerConfig } from '../../types/loggerConfig.js';

export class LoggerClientFactory {
  public static create(config: LoggerConfig): LoggerClient {
    const loggerClientConfig: LoggerOptions = {
      name: 'Logger',
      level: config.logLevel,
    };

    if (config.prettifyLogs) {
      loggerClientConfig.transport = {
        target: 'pino-pretty',
        options: {
          colorize: true,
        },
      };
    }

    const loggerClient = pino(loggerClientConfig);

    return loggerClient;
  }
}
