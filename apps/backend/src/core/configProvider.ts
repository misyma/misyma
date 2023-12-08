import config from 'config';

import { Assert } from '../common/validation/assert.js';
import { LoggerLevel } from '../libs/logger/types/loggerLevel.js';

export class ConfigProvider {
  public getServerHost(): string {
    return '0.0.0.0';
  }

  public getServerPort(): number {
    return 8080;
  }

  public getLoggerLevel(): LoggerLevel {
    const configFieldName = 'logger.level';

    const loggerLever = config.get(configFieldName);

    Assert.isEnum(LoggerLevel, loggerLever, configFieldName);

    return loggerLever;
  }

  public getSqliteDatabasePath(): string {
    const configFieldName = 'database.path';

    const sqliteDatabasePath = config.get(configFieldName);

    Assert.isNotEmptyString(sqliteDatabasePath, configFieldName);

    return sqliteDatabasePath;
  }

  public getJwtSecret(): string {
    const configFieldName = 'auth.jwt.secret';

    const jwtSecret = config.get(configFieldName);

    Assert.isNotEmptyString(jwtSecret, configFieldName);

    return jwtSecret;
  }

  public getJwtExpiresIn(): number {
    const configFieldName = 'auth.jwt.expiresIn';

    const jwtExpiresIn = Number(config.get(configFieldName));

    Assert.isNumberInteger(jwtExpiresIn, configFieldName);

    return jwtExpiresIn;
  }

  public getHashSaltRounds(): number {
    const configFieldName = 'auth.hash.saltRounds';

    const hashSaltRounds = Number(config.get(configFieldName));

    Assert.isNumberInteger(hashSaltRounds, configFieldName);

    return hashSaltRounds;
  }
}
