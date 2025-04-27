import { type Logger as PinoLogger } from 'pino';

interface LogPayload {
  readonly message: string;
  readonly [key: string]: unknown;
}

export class LoggerService {
  private readonly pinoLogger: PinoLogger;

  public constructor(pinoLogger: PinoLogger) {
    this.pinoLogger = pinoLogger;
  }

  public error(payload: LogPayload): void {
    const { message, ...context } = payload;

    this.pinoLogger.error({ ...context }, message);
  }

  public warn(payload: LogPayload): void {
    const { message, ...context } = payload;

    this.pinoLogger.warn({ ...context }, message);
  }

  public info(payload: LogPayload): void {
    const { message, ...context } = payload;

    this.pinoLogger.info({ ...context }, message);
  }

  public debug(payload: LogPayload): void {
    const { message, ...context } = payload;

    this.pinoLogger.debug({ ...context }, message);
  }
}
