import { beforeEach, expect, it, describe, afterEach } from 'vitest';

import { Generator } from '../../../../../../tests/generator.js';
import { testSymbols } from '../../../../../../tests/symbols.js';
import { TestContainer } from '../../../../../../tests/testContainer.js';
import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';
import { tokenTypes } from '../../../../../common/types/tokenType.js';
import { type Config } from '../../../../../core/config.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { type TokenService } from '../../../../authModule/application/services/tokenService/tokenService.js';
import { authSymbols } from '../../../../authModule/symbols.js';
import { databaseSymbols } from '../../../../databaseModule/symbols.js';
import { type DatabaseClient } from '../../../../databaseModule/types/databaseClient.js';
import { symbols } from '../../../symbols.js';
import { type BlacklistTokenTestUtils } from '../../../tests/utils/blacklistTokenTestUtils/blacklistTokenTestUtils.js';
import { type UserTestUtils } from '../../../tests/utils/userTestUtils/userTestUtils.js';

import { type RefreshUserTokensCommandHandler } from './refreshUserTokensCommandHandler.js';

describe('RefreshUserTokensCommandHandler', () => {
  let refreshUserTokensCommandHandler: RefreshUserTokensCommandHandler;

  let databaseClient: DatabaseClient;

  let userTestUtils: UserTestUtils;

  let blacklistTokenTestUtils: BlacklistTokenTestUtils;

  let tokenService: TokenService;

  let config: Config;

  beforeEach(async () => {
    const container = await TestContainer.create();

    refreshUserTokensCommandHandler = container.get<RefreshUserTokensCommandHandler>(
      symbols.refreshUserTokensCommandHandler,
    );

    tokenService = container.get<TokenService>(authSymbols.tokenService);

    config = container.get<Config>(coreSymbols.config);

    databaseClient = container.get<DatabaseClient>(databaseSymbols.databaseClient);

    userTestUtils = container.get<UserTestUtils>(testSymbols.userTestUtils);

    blacklistTokenTestUtils = container.get<BlacklistTokenTestUtils>(testSymbols.blacklistTokenTestUtils);

    await userTestUtils.truncate();

    await blacklistTokenTestUtils.truncate();
  });

  afterEach(async () => {
    await userTestUtils.truncate();

    await blacklistTokenTestUtils.truncate();

    await databaseClient.destroy();
  });

  it('returns new access token', async () => {
    const user = await userTestUtils.createAndPersist();

    const refreshToken = tokenService.createToken({
      data: {
        userId: user.id,
        type: tokenTypes.refreshToken,
      },
      expiresIn: Generator.number(10000, 100000),
    });

    const result = await refreshUserTokensCommandHandler.execute({
      refreshToken,
    });

    const accessTokenPayload = tokenService.verifyToken({ token: result.accessToken });

    const refreshTokenPayload = tokenService.verifyToken({ token: result.refreshToken });

    expect(accessTokenPayload['userId']).toBe(user.id);

    expect(accessTokenPayload['role']).toBe(user.role);

    expect(refreshTokenPayload['userId']).toBe(user.id);

    expect(result.accessTokenExpiresIn).toBe(config.token.access.expiresIn);
  });

  it('throws an error if User does not exist', async () => {
    const userId = Generator.uuid();

    const refreshToken = tokenService.createToken({
      data: {
        userId,
        type: tokenTypes.refreshToken,
      },
      expiresIn: Generator.number(10000, 100000),
    });

    try {
      await refreshUserTokensCommandHandler.execute({
        refreshToken,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(OperationNotValidError);

      expect((error as OperationNotValidError).context).toEqual({
        reason: 'User not found.',
        userId,
      });

      return;
    }

    expect.fail();
  });

  it('throws an error - when token has a different purpose', async () => {
    const user = await userTestUtils.createAndPersist();

    const refreshToken = tokenService.createToken({
      data: {
        userId: user.id,
        type: tokenTypes.passwordReset,
      },
      expiresIn: Generator.number(10000, 100000),
    });

    try {
      await refreshUserTokensCommandHandler.execute({
        refreshToken,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(OperationNotValidError);

      expect((error as OperationNotValidError).context).toEqual({
        reason: 'Token type is not refresh token.',
      });

      return;
    }

    expect.fail();
  });

  it('throws an error if refresh token does not contain userId', async () => {
    const refreshToken = tokenService.createToken({
      data: {
        type: tokenTypes.refreshToken,
      },
      expiresIn: Generator.number(10000, 100000),
    });

    try {
      await refreshUserTokensCommandHandler.execute({
        refreshToken,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(OperationNotValidError);

      expect((error as OperationNotValidError).context).toEqual({
        reason: 'Refresh token does not contain userId.',
      });

      return;
    }

    expect.fail();
  });

  it('throws an error if refresh token is blacklisted', async () => {
    const user = await userTestUtils.createAndPersist();

    const refreshToken = tokenService.createToken({
      data: { userId: user.id },
      expiresIn: Generator.number(10000, 100000),
    });

    await blacklistTokenTestUtils.createAndPersist({ input: { token: refreshToken } });

    try {
      await refreshUserTokensCommandHandler.execute({
        refreshToken,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(OperationNotValidError);

      expect((error as OperationNotValidError).context).toEqual({
        reason: 'Refresh token is blacklisted.',
      });

      return;
    }

    expect.fail();
  });
});
