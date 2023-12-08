import config from 'config';

import { OperationNotValidError } from '../common/errors/common/operationNotValidError.js';
import { type LoggerLevel } from '../libs/logger/types/loggerLevel.js';

export class ConfigProvider {
  public getServerHost(): string {
    return '0.0.0.0';
  }

  public getServerPort(): number {
    return 8080;
  }

  public getLoggerLevel(): LoggerLevel {
    return this.getValue<LoggerLevel>('logger.level');
  }

  public getSqliteDatabasePath(): string {
    return this.getValue<string>('database.path');
  }

  public getJwtSecret(): string {
    return this.getValue<string>('auth.jwt.secret');
  }

  public getJwtExpiresIn(): number {
    return this.getValue<number>('auth.jwt.expiresIn');
  }

  public getHashSaltRounds(): number {
    return this.getValue<number>('auth.hash.saltRounds');
  }

  private getValue<T>(key: string): T {
    const value = config.get(key);

    if (value === null) {
      throw new OperationNotValidError({
        reason: 'Invalid config value.',
        value,
        key,
      });
    }

    return value as T;
  }
}
