import { type Logger } from 'pino';

import { type LogPayload, type LoggerService } from './loggerService.js';

export class LoggerServiceImpl implements LoggerService {
  public constructor(private readonly loggerClient: Logger) {}

  public debug(payload: LogPayload): void {
    const { message, ...context } = payload;

    this.loggerClient.debug({ ...context }, message);
  }

  public info(payload: LogPayload): void {
    const { message, ...context } = payload;

    this.loggerClient.info({ ...context }, message);
  }

  public warn(payload: LogPayload): void {
    const { message, ...context } = payload;

    this.loggerClient.warn({ ...context }, message);
  }

  public error(payload: LogPayload): void {
    const { message, ...context } = payload;

    this.loggerClient.error({ ...context }, message);
  }
}
