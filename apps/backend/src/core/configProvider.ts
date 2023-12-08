import config from 'config';

import { Assert } from '../common/validation/assert.js';
import { LoggerLevel } from '../libs/logger/types/loggerLevel.js';

export class ConfigProvider {
  public getLoggerLevel(): LoggerLevel {
    const loggerLever = config.get('logger.level');

    Assert.isEnum(LoggerLevel, loggerLever);

    return loggerLever;
  }

  public getServerHost(): string {
    const serverHost = config.get('server.host');

    Assert.isNotEmptyString(serverHost);

    return serverHost;
  }

  public getServerPort(): number {
    const serverPort = Number(config.get('server.port'));

    Assert.isNumberInteger(serverPort);

    return serverPort;
  }

  public getSqliteDatabasePath(): string {
    const sqliteDatabasePath = config.get('database.path');

    Assert.isNotEmptyString(sqliteDatabasePath);

    return sqliteDatabasePath;
  }

  public getJwtSecret(): string {
    const jwtSecret = config.get('auth.jwt.secret');

    Assert.isNotEmptyString(jwtSecret);

    return jwtSecret;
  }

  public getJwtExpiresIn(): string {
    const jwtExpiresIn = config.get('auth.jwt.expiresIn');

    Assert.isNotEmptyString(jwtExpiresIn);

    return jwtExpiresIn;
  }

  public getHashSaltRounds(): number {
    const hashSaltRounds = Number(config.get('auth.hash.saltRounds'));

    Assert.isNumberInteger(hashSaltRounds);

    return hashSaltRounds;
  }
}
