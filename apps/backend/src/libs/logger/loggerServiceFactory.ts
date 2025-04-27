import { pino } from 'pino';

import { type LogLevel } from '../../common/types/logLevel.js';

import { LoggerService } from './loggerService.js';

interface LoggerServiceConfig {
  readonly logLevel: LogLevel;
}

export class LoggerServiceFactory {
  public static create(config: LoggerServiceConfig): LoggerService {
    const { req, res, err } = pino.stdSerializers;

    const logger = pino({
      level: config.logLevel,
      serializers: {
        req,
        res,
        err,
      },
    });

    return new LoggerService(logger);
  }
}
