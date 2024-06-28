import { pino } from 'pino';

import { LoggerService } from './loggerService.js';
import { type LogLevel } from './logLevel.js';

export interface LoggerConfig {
  readonly logLevel: LogLevel;
}

export class LoggerServiceFactory {
  public static create(config: LoggerConfig): LoggerService {
    const loggerClient = pino({
      name: 'Logger',
      level: config.logLevel,
    });

    return new LoggerService(loggerClient);
  }
}
