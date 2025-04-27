import { beforeEach, afterEach, expect, it, describe } from 'vitest';

import { TestContainer } from '../../../../../../tests/testContainer.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import { databaseSymbols } from '../../../../databaseModule/symbols.js';
import { type DatabaseClient } from '../../../../databaseModule/types/databaseClient.js';
import { symbols } from '../../../symbols.js';
import { UserTestFactory } from '../../../tests/factories/userTestFactory/userTestFactory.js';
import { UserTestUtils } from '../../../tests/utils/userTestUtils/userTestUtils.js';

import { type FindUserQueryHandler } from './findUserQueryHandler.js';

describe('FindUserQueryHandler', () => {
  let findUserQueryHandler: FindUserQueryHandler;

  let databaseClient: DatabaseClient;

  let userTestUtils: UserTestUtils;

  const userTestFactory = new UserTestFactory();

  beforeEach(async () => {
    const container = await TestContainer.create();

    findUserQueryHandler = container.get<FindUserQueryHandler>(symbols.findUserQueryHandler);

    databaseClient = container.get<DatabaseClient>(databaseSymbols.databaseClient);

    userTestUtils = new UserTestUtils(databaseClient);

    await userTestUtils.truncate();
  });

  afterEach(async () => {
    await userTestUtils.truncate();

    await databaseClient.destroy();
  });

  it('finds a User by id', async () => {
    const user = await userTestUtils.createAndPersist();

    const { user: foundUser } = await findUserQueryHandler.execute({ userId: user.id });

    expect(foundUser).not.toBeNull();
  });

  it('throws an error if a User with given id does not exist', async () => {
    const nonExistentUser = userTestFactory.create();

    try {
      await findUserQueryHandler.execute({ userId: nonExistentUser.getId() });
    } catch (error) {
      expect(error).toBeInstanceOf(ResourceNotFoundError);

      return;
    }

    expect.fail();
  });
});
