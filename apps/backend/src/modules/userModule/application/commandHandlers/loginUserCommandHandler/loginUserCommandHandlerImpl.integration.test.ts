import { beforeEach, afterEach, expect, it, describe } from 'vitest';

import { type LoginUserCommandHandler } from './loginUserCommandHandler.js';
import { ResourceNotFoundError } from '../../../../../common/errors/common/resourceNotFoundError.js';
import { Application } from '../../../../../core/application.js';
import { type PostgresDatabaseClient } from '../../../../../core/database/postgresDatabaseClient/postgresDatabaseClient.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { type TokenService } from '../../../../authModule/application/services/tokenService/tokenService.js';
import { authSymbols } from '../../../../authModule/symbols.js';
import { symbols } from '../../../symbols.js';
import { UserRawEntityTestFactory } from '../../../tests/factories/userRawEntityTestFactory/userRawEntityTestFactory.js';
import { UserTestUtils } from '../../../tests/utils/userTestUtils/userTestUtils.js';
import { type HashService } from '../../services/hashService/hashService.js';

describe('LoginUserCommandHandler', () => {
  let loginUserCommandHandler: LoginUserCommandHandler;

  let postgresDatabaseClient: PostgresDatabaseClient;

  let userTestUtils: UserTestUtils;

  let tokenService: TokenService;

  let hashService: HashService;

  const userEntityTestFactory = new UserRawEntityTestFactory();

  beforeEach(async () => {
    const container = Application.createContainer();

    loginUserCommandHandler = container.get<LoginUserCommandHandler>(symbols.loginUserCommandHandler);

    tokenService = container.get<TokenService>(authSymbols.tokenService);

    hashService = container.get<HashService>(symbols.hashService);

    postgresDatabaseClient = container.get<PostgresDatabaseClient>(coreSymbols.postgresDatabaseClient);

    userTestUtils = new UserTestUtils(postgresDatabaseClient);

    await userTestUtils.truncate();
  });

  afterEach(async () => {
    await userTestUtils.truncate();

    await postgresDatabaseClient.destroy();
  });

  it('returns access token', async () => {
    const { id, email, password } = userEntityTestFactory.create();

    const hashedPassword = await hashService.hash(password);

    await userTestUtils.persist({
      user: {
        id,
        email,
        password: hashedPassword,
      },
    });

    const { accessToken } = await loginUserCommandHandler.execute({
      email,
      password,
    });

    const tokenPayload = tokenService.verifyToken(accessToken);

    expect(tokenPayload['userId']).toBe(id);
  });

  it('throws an error if user with given email does not exist', async () => {
    const { email, password } = userEntityTestFactory.create();

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

  it('throws an error if user password does not match stored password', async () => {
    const { id, email, password } = userEntityTestFactory.create();

    await userTestUtils.persist({
      user: {
        id,
        email,
        password,
      },
    });

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
