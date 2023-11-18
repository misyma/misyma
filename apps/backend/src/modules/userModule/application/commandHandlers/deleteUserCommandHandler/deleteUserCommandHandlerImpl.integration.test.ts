import { beforeEach, afterEach, expect, describe, it } from 'vitest';

import { type DeleteUserCommandHandler } from './deleteUserCommandHandler.js';
import { ResourceNotFoundError } from '../../../../../common/errors/common/resourceNotFoundError.js';
import { Application } from '../../../../../core/application.js';
import { type PostgresDatabaseClient } from '../../../../../core/database/postgresDatabaseClient/postgresDatabaseClient.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { symbols } from '../../../symbols.js';
import { UserTestFactory } from '../../../tests/factories/userTestFactory/userTestFactory.js';
import { UserTestUtils } from '../../../tests/utils/userTestUtils/userTestUtils.js';

describe('DeleteUserCommandHandler', () => {
  let deleteUserCommandHandler: DeleteUserCommandHandler;

  let postgresDatabaseClient: PostgresDatabaseClient;

  let userTestUtils: UserTestUtils;

  const userTestFactory = new UserTestFactory();

  beforeEach(async () => {
    const container = Application.createContainer();

    deleteUserCommandHandler = container.get<DeleteUserCommandHandler>(symbols.deleteUserCommandHandler);

    postgresDatabaseClient = container.get<PostgresDatabaseClient>(coreSymbols.postgresDatabaseClient);

    userTestUtils = new UserTestUtils(postgresDatabaseClient);

    await userTestUtils.truncate();
  });

  afterEach(async () => {
    await userTestUtils.truncate();

    await postgresDatabaseClient.destroy();
  });

  it('deletes user', async () => {
    const user = await userTestUtils.createAndPersist();

    await deleteUserCommandHandler.execute({ userId: user.id });

    const foundUser = await userTestUtils.findById({ id: user.id });

    expect(foundUser).toBeUndefined();
  });

  it('throws an error if user with given id does not exist', async () => {
    const { id } = userTestFactory.create();

    try {
      await deleteUserCommandHandler.execute({ userId: id });
    } catch (error) {
      expect(error).toBeInstanceOf(ResourceNotFoundError);

      return;
    }

    expect.fail();
  });
});
