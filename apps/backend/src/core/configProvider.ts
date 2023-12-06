import { Assert } from '../common/validation/assert.js';
import { Validator } from '../common/validation/validator.js';
import { EnvParser } from '../libs/envParser/envParser.js';
import { LoggerLevel } from '../libs/logger/types/loggerLevel.js';

export class ConfigProvider {
  private getStringEnvVariable(envVariableName: string): string {
    const value = EnvParser.parseString({ name: envVariableName });

    Assert.isNotEmptyString(value);

    return value;
  }

  private getIntegerEnvVariable(envVariableName: string): number {
    const value = EnvParser.parseNumber({ name: envVariableName });

    Assert.isNumberInteger(value);

    return value;
  }

  private getEnumEnvVariable<T extends Record<string, string>>(enumType: T, envVariableName: string): T[keyof T] {
    const value = EnvParser.parseString({ name: envVariableName });

    Assert.isEnum(enumType, value);

    return value as T[keyof T];
  }

  public getLoggerLevel(): LoggerLevel {
    return this.getEnumEnvVariable(LoggerLevel, 'LOGGER_LEVEL');
  }

  public getServerHost(): string {
    return EnvParser.parseString({ name: 'SERVER_HOST' }) || '0.0.0.0';
  }

  public getServerPort(): number {
    const envVariable = 'SERVER_PORT';

    const serverPort = EnvParser.parseNumber({ name: envVariable });

    if (!Validator.isNumber(serverPort)) {
      return 8080;
    }

    return serverPort;
  }

  public getSqliteDatabasePath(): string {
    return this.getStringEnvVariable('SQLITE_DATABASE_PATH');
  }

  public getJwtSecret(): string {
    return this.getStringEnvVariable('JWT_SECRET');
  }

  public getJwtExpiresIn(): string {
    return this.getStringEnvVariable('JWT_EXPIRES_IN');
  }

  public getHashSaltRounds(): number {
    return this.getIntegerEnvVariable('HASH_SALT_ROUNDS');
  }
}
