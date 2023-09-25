import { Assert } from '../common/validation/assert.js';
import { Validator } from '../common/validation/validator.js';
import { EnvParser } from '../libs/envParser/envParser.js';
import { LoggerLevel } from '../libs/logger/types/loggerLevel.js';

export class ConfigProvider {
  private static getStringEnvVariable(name: string): string {
    const envVariable = name;

    const value = EnvParser.parseString({ name: envVariable });

    Assert.isNotEmptyString(value);

    return value;
  }

  private static getEnumEnvVariable<T extends Record<string, string>>(enumType: T, name: string): T[keyof T] {
    const envVariable = name;

    const value = EnvParser.parseString({ name: envVariable });

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
}
