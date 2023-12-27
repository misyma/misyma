import { beforeEach, afterEach, expect, it, describe } from 'vitest';

import { type LoginUserCommandHandler } from './loginUserCommandHandler.js';
import { ResourceNotFoundError } from '../../../../../common/errors/common/resourceNotFoundError.js';
import { Application } from '../../../../../core/application.js';
import { type SqliteDatabaseClient } from '../../../../../core/database/sqliteDatabaseClient/sqliteDatabaseClient.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { type TokenService } from '../../../../authModule/application/services/tokenService/tokenService.js';
import { authSymbols } from '../../../../authModule/symbols.js';
import { symbols } from '../../../symbols.js';
import { UserTestFactory } from '../../../tests/factories/userTestFactory/userTestFactory.js';
import { UserTestUtils } from '../../../tests/utils/userTestUtils/userTestUtils.js';
import { type HashService } from '../../services/hashService/hashService.js';

describe('LoginUserCommandHandler', () => {
  let loginUserCommandHandler: LoginUserCommandHandler;

  let sqliteDatabaseClient: SqliteDatabaseClient;

  let userTestUtils: UserTestUtils;

  let tokenService: TokenService;

  let hashService: HashService;

  const userTestFactory = new UserTestFactory();

  beforeEach(async () => {
    const container = Application.createContainer();

    loginUserCommandHandler = container.get<LoginUserCommandHandler>(symbols.loginUserCommandHandler);

    tokenService = container.get<TokenService>(authSymbols.tokenService);

    hashService = container.get<HashService>(symbols.hashService);

    sqliteDatabaseClient = container.get<SqliteDatabaseClient>(coreSymbols.sqliteDatabaseClient);

    userTestUtils = new UserTestUtils(sqliteDatabaseClient);

    await userTestUtils.truncate();
  });

  afterEach(async () => {
    await userTestUtils.truncate();

    await sqliteDatabaseClient.destroy();
  });

  it('returns tokens', async () => {
    const createdUser = userTestFactory.create();

    const hashedPassword = await hashService.hash(createdUser.getPassword());

    await userTestUtils.persist({
      user: {
        id: createdUser.getId(),
        email: createdUser.getEmail(),
        password: hashedPassword,
        firstName: createdUser.getFirstName(),
        lastName: createdUser.getLastName(),
        isEmailVerified: createdUser.getIsEmailVerified(),
      },
    });

    const { accessToken, refreshToken } = await loginUserCommandHandler.execute({
      email: createdUser.getEmail(),
      password: createdUser.getPassword(),
    });

    const accessTokenPayload = tokenService.verifyToken({ token: accessToken });

    const refreshTokenPayload = tokenService.verifyToken({ token: refreshToken });

    expect(accessTokenPayload['userId']).toBe(createdUser.getId());

    expect(refreshTokenPayload['userId']).toBe(createdUser.getId());

    const userTokens = await userTestUtils.findUserTokensByUserId({
      id: createdUser.getId(),
    });

    expect(userTokens.refreshToken).toEqual(refreshToken);
  });

  it('throws an error if a User with given email does not exist', async () => {
    const nonExistentUser = userTestFactory.create();

    try {
      await loginUserCommandHandler.execute({
        email: nonExistentUser.getEmail(),
        password: nonExistentUser.getPassword(),
      });
    } catch (error) {
      expect(error).toBeInstanceOf(ResourceNotFoundError);

      return;
    }

    expect.fail();
  });

  it(`throws an error if User's password does not match stored password`, async () => {
    const { email, password } = await userTestUtils.createAndPersist();

    try {
      await loginUserCommandHandler.execute({
        email,
        password,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(ResourceNotFoundError);

      return;
    }

    expect.fail();
  });
});
