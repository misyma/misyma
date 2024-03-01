import config from 'config';

import { OperationNotValidError } from '../common/errors/common/operationNotValidError.js';
import { type LogLevel } from '../libs/logger/types/logLevel.js';

export class ConfigProvider {
  public getServerHost(): string {
    return '0.0.0.0';
  }

  public getServerPort(): number {
    return 5000;
  }

  public getLogLevel(): LogLevel {
    return this.getValue<LogLevel>('logger.level');
  }

  public getSqliteDatabasePath(): string {
    return this.getValue<string>('database.path');
  }

  public getJwtSecret(): string {
    return this.getValue<string>('auth.jwt.secret');
  }

  public getQueuesDatabasePath(): string {
    return this.getValue<string>('queues.database.path');
  }

  public getFrontendUrl(): string {
    return this.getValue<string>('frontend.url');
  }

  public getAccessTokenExpiresIn(): number {
    return this.getValue<number>('auth.accessToken.expiresIn');
  }

  public getRefreshTokenExpiresIn(): number {
    return this.getValue<number>('auth.refreshToken.expiresIn');
  }

  public getEmailVerificationTokenExpiresIn(): number {
    return this.getValue<number>('auth.emailVerificationToken.expiresIn');
  }

  public getResetPasswordTokenExpiresIn(): number {
    return this.getValue<number>('auth.resetPasswordToken.expiresIn');
  }

  public getHashSaltRounds(): number {
    return Number(this.getValue<number>('auth.hash.saltRounds'));
  }

  public getSendGridApiKey(): string {
    return this.getValue<string>('sendGrid.apiKey');
  }

  public getSendGridSenderEmail(): string {
    return this.getValue<string>('sendGrid.senderEmail');
  }

  public getAdminUsername(): string {
    return this.getValue<string>('admin.username');
  }

  public getAdminPassword(): string {
    return this.getValue<string>('admin.password');
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
