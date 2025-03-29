export interface LogPayload {
  readonly message: string;
  readonly [key: string]: unknown;
}

export interface LoggerService {
  debug(payload: LogPayload): void;
  info(payload: LogPayload): void;
  warn(payload: LogPayload): void;
  error(payload: LogPayload): void;
}
