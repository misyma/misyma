import { beforeEach, afterEach, expect, it, describe } from 'vitest';

import { type RegisterUserCommandHandler } from './registerUserCommandHandler.js';
import { ResourceAlreadyExistsError } from '../../../../../common/errors/common/resourceAlreadyExistsError.js';
import { Application } from '../../../../../core/application.js';
import { type PostgresDatabaseClient } from '../../../../../core/database/postgresDatabaseClient/postgresDatabaseClient.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { symbols } from '../../../symbols.js';
import { UserTestFactory } from '../../../tests/factories/userTestFactory/userTestFactory.js';
import { UserTestUtils } from '../../../tests/utils/userTestUtils/userTestUtils.js';

describe('RegisterUserCommandHandler', () => {
  let registerUserCommandHandler: RegisterUserCommandHandler;

  let postgresDatabaseClient: PostgresDatabaseClient;

  let userTestUtils: UserTestUtils;

  const userTestFactory = new UserTestFactory();

  beforeEach(async () => {
    const container = Application.createContainer();

    registerUserCommandHandler = container.get<RegisterUserCommandHandler>(symbols.registerUserCommandHandler);

    postgresDatabaseClient = container.get<PostgresDatabaseClient>(coreSymbols.postgresDatabaseClient);

    userTestUtils = new UserTestUtils(postgresDatabaseClient);

    await userTestUtils.truncate();
  });

  afterEach(async () => {
    await userTestUtils.truncate();

    await postgresDatabaseClient.destroy();
  });

  it('creates a user', async () => {
    const { email, password } = userTestFactory.create();

    const { user } = await registerUserCommandHandler.execute({
      email,
      password,
    });

    const foundUser = await userTestUtils.findByEmail({ email });

    expect(user.email).toEqual(email);

    expect(foundUser).toBeDefined();
  });

  it('throws an error when user with the same email already exists', async () => {
    const existingUser = await userTestUtils.createAndPersist();

    try {
      await registerUserCommandHandler.execute({
        email: existingUser.email,
        password: existingUser.password,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(ResourceAlreadyExistsError);

      return;
    }

    expect.fail();
  });
});
