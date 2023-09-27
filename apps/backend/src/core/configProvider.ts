import { Assert } from '../common/validation/assert.js';
import { Validator } from '../common/validation/validator.js';
import { EnvParser } from '../libs/envParser/envParser.js';
import { LoggerLevel } from '../libs/logger/types/loggerLevel.js';

export class ConfigProvider {
  private static getStringEnvVariable(envVariableName: string): string {
    const value = EnvParser.parseString({ name: envVariableName });

    Assert.isNotEmptyString(value);

    return value;
  }

  private static getIntegerEnvVariable(envVariableName: string): number {
    const value = EnvParser.parseNumber({ name: envVariableName });

    Assert.isNumberInteger(value);

    return value;
  }

  private static getEnumEnvVariable<T extends Record<string, string>>(
    enumType: T,
    envVariableName: string,
  ): T[keyof T] {
    const value = EnvParser.parseString({ name: envVariableName });

    Assert.isEnum(enumType, value);

    return value as T[keyof T];
  }

  public static getLoggerLevel(): LoggerLevel {
    return this.getEnumEnvVariable(LoggerLevel, 'LOGGER_LEVEL');
  }

  public static getServerHost(): string {
    return EnvParser.parseString({ name: 'SERVER_HOST' }) || '0.0.0.0';
  }

  public static getServerPort(): number {
    const envVariable = 'SERVER_PORT';

    const serverPort = EnvParser.parseNumber({ name: envVariable });

    if (!Validator.isNumber(serverPort)) {
      return 8080;
    }

    return serverPort;
  }

  public static getPostgresDatabaseHost(): string {
    return this.getStringEnvVariable('POSTGRES_DATABASE_HOST');
  }

  public static getPostgresDatabaseName(): string {
    return this.getStringEnvVariable('POSTGRES_DATABASE_NAME');
  }

  public static getPostgresDatabaseUser(): string {
    return this.getStringEnvVariable('POSTGRES_DATABASE_USER');
  }

  public static getPostgresDatabasePassword(): string {
    return this.getStringEnvVariable('POSTGRES_DATABASE_PASSWORD');
  }

  public static getJwtSecret(): string {
    return this.getStringEnvVariable('JWT_SECRET');
  }

  public static getJwtExpiresIn(): string {
    return this.getStringEnvVariable('JWT_EXPIRES_IN');
  }

  public static getHashSaltRounds(): number {
    return this.getIntegerEnvVariable('HASH_SALT_ROUNDS');
  }
}
