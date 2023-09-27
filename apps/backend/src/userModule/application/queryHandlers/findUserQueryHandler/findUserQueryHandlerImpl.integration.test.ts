import { beforeEach, afterEach, expect, it, describe } from 'vitest';

import { type FindUserQueryHandler } from './findUserQueryHandler.js';
import { ResourceNotFoundError } from '../../../../common/validation/errors/common/resourceNotFoundError.js';
import { Application } from '../../../../core/application.js';
import { type PostgresDatabaseClient } from '../../../../core/database/postgresDatabaseClient/postgresDatabaseClient.js';
import { coreSymbols } from '../../../../core/symbols.js';
import { symbols } from '../../../symbols.js';
import { UserRawEntityTestFactory } from '../../../tests/factories/userRawEntityTestFactory/userRawEntityTestFactory.js';
import { UserTestUtils } from '../../../tests/utils/userTestUtils/userTestUtils.js';

describe('FindUserQueryHandler', () => {
  let findUserQueryHandler: FindUserQueryHandler;

  let postgresDatabaseClient: PostgresDatabaseClient;

  let userTestUtils: UserTestUtils;

  const userEntityTestFactory = new UserRawEntityTestFactory();

  beforeEach(async () => {
    const container = Application.createContainer();

    findUserQueryHandler = container.get<FindUserQueryHandler>(symbols.findUserQueryHandler);

    postgresDatabaseClient = container.get<PostgresDatabaseClient>(coreSymbols.postgresDatabaseClient);

    userTestUtils = new UserTestUtils(postgresDatabaseClient);

    await userTestUtils.truncate();
  });

  afterEach(async () => {
    await userTestUtils.truncate();

    await postgresDatabaseClient.destroy();
  });

  it('finds user by id', async () => {
    const user = userEntityTestFactory.create();

    await userTestUtils.persist({ user });

    const { user: foundUser } = await findUserQueryHandler.execute({ userId: user.id });

    expect(foundUser).not.toBeNull();
  });

  it('throws an error if user with given id does not exist', async () => {
    const { id } = userEntityTestFactory.create();

    try {
      await findUserQueryHandler.execute({ userId: id });
    } catch (error) {
      expect(error).toBeInstanceOf(ResourceNotFoundError);

      return;
    }

    expect.fail();
  });
});
