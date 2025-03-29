import { beforeEach, describe, expect, it, afterEach } from 'vitest';

import { type UpdateUserCommandHandler } from './updateUserCommandHandler.js';
import { Generator } from '../../../../../../tests/generator.js';
import { testSymbols } from '../../../../../../tests/symbols.js';
import { TestContainer } from '../../../../../../tests/testContainer.js';
import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { type DatabaseClient } from '../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { symbols } from '../../../symbols.js';
import { type UserTestUtils } from '../../../tests/utils/userTestUtils/userTestUtils.js';

describe('ChangeUserPasswordCommandHandlerImpl', () => {
  let commandHandler: UpdateUserCommandHandler;

  let databaseClient: DatabaseClient;

  let userTestUtils: UserTestUtils;

  beforeEach(async () => {
    const container = await TestContainer.create();

    commandHandler = container.get<UpdateUserCommandHandler>(symbols.updateUserCommandHandler);

    databaseClient = container.get<DatabaseClient>(coreSymbols.databaseClient);

    userTestUtils = container.get<UserTestUtils>(testSymbols.userTestUtils);

    await userTestUtils.truncate();
  });

  afterEach(async () => {
    await userTestUtils.truncate();

    await databaseClient.destroy();
  });

  it('updates user name', async () => {
    const user = await userTestUtils.createAndPersist();

    const newName = Generator.fullName();

    await commandHandler.execute({
      id: user.id,
      name: newName,
    });

    const updatedUser = await userTestUtils.findById({ id: user.id });

    expect(updatedUser?.name).toBe(newName);
  });

  it('throws an error - when a User with given id not found', async () => {
    const userId = Generator.uuid();

    const newName = Generator.fullName();

    try {
      await commandHandler.execute({
        id: userId,
        name: newName,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(OperationNotValidError);

      expect((error as OperationNotValidError).context).toMatchObject({
        reason: 'User not found.',
        userId,
      });

      return;
    }

    expect.fail();
  });
});
