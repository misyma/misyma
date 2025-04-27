import { beforeEach, afterEach, describe, expect, it } from 'vitest';

import { Generator } from '../../../../../../tests/generator.js';
import { testSymbols } from '../../../../../../tests/symbols.js';
import { TestContainer } from '../../../../../../tests/testContainer.js';
import { type TestUtils } from '../../../../../../tests/testUtils.js';
import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';
import { ResourceAlreadyExistsError } from '../../../../../common/errors/resourceAlreadyExistsError.js';
import { databaseSymbols } from '../../../../databaseModule/symbols.js';
import { type DatabaseClient } from '../../../../databaseModule/types/databaseClient.js';
import { type UserTestUtils } from '../../../../userModule/tests/utils/userTestUtils/userTestUtils.js';
import { symbols } from '../../../symbols.js';
import { type BookshelfTestUtils } from '../../../tests/utils/bookshelfTestUtils/bookshelfTestUtils.js';

import { type UpdateBookshelfCommandHandler } from './updateBookshelfCommandHandler.js';

describe('UpdateBookshelfCommandHandlerImpl', () => {
  let commandHandler: UpdateBookshelfCommandHandler;

  let databaseClient: DatabaseClient;

  let userTestUtils: UserTestUtils;

  let bookshelfTestUtils: BookshelfTestUtils;

  let testUtils: TestUtils[];

  beforeEach(async () => {
    const container = await TestContainer.create();

    commandHandler = container.get<UpdateBookshelfCommandHandler>(symbols.updateBookshelfCommandHandler);

    databaseClient = container.get<DatabaseClient>(databaseSymbols.databaseClient);

    userTestUtils = container.get<UserTestUtils>(testSymbols.userTestUtils);

    bookshelfTestUtils = container.get<BookshelfTestUtils>(testSymbols.bookshelfTestUtils);

    testUtils = [bookshelfTestUtils, userTestUtils];

    for (const testUtil of testUtils) {
      await testUtil.truncate();
    }
  });

  afterEach(async () => {
    for (const testUtil of testUtils) {
      await testUtil.truncate();
    }

    await databaseClient.destroy();
  });

  it('throws an error - when Bookshelf was not found', async () => {
    const bookshelfId = Generator.uuid();

    const userId = Generator.uuid();

    try {
      await commandHandler.execute({
        bookshelfId,
        name: Generator.alphaString(20),
        userId,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(OperationNotValidError);

      expect((error as OperationNotValidError).context).toMatchObject({
        reason: 'Bookshelf does not exist.',
        bookshelfId,
        userId,
      });

      return;
    }

    expect.fail();
  });

  it('throws an error - when User does not have permission to update this Bookshelf', async () => {
    const user = await userTestUtils.createAndPersist();

    const anotherUser = await userTestUtils.createAndPersist();

    const bookshelf = await bookshelfTestUtils.createAndPersist({
      input: {
        userId: anotherUser.id,
      },
    });

    try {
      await commandHandler.execute({
        bookshelfId: bookshelf.id,
        name: Generator.alphaString(20),
        userId: user.id,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(OperationNotValidError);

      expect((error as OperationNotValidError).context).toMatchObject({
        reason: 'User does not have permission to update this bookshelf.',
      });

      return;
    }

    expect.fail();
  });

  it('throws an error - when Bookshelf with this name already exists', async () => {
    const user = await userTestUtils.createAndPersist();

    const bookshelf = await bookshelfTestUtils.createAndPersist({
      input: {
        userId: user.id,
      },
    });

    const anotherBookshelf = await bookshelfTestUtils.createAndPersist({
      input: {
        userId: user.id,
      },
    });

    try {
      await commandHandler.execute({
        bookshelfId: bookshelf.id,
        name: anotherBookshelf.name,
        userId: user.id,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(ResourceAlreadyExistsError);

      return;
    }

    expect.fail();
  });

  it('updates a Bookshelf', async () => {
    const user = await userTestUtils.createAndPersist();

    const bookshelf = await bookshelfTestUtils.createAndPersist({
      input: {
        userId: user.id,
      },
    });

    const newName = Generator.alphaString(30);

    const imageUrl = Generator.imageUrl();

    const { bookshelf: updatedBookshelf } = await commandHandler.execute({
      bookshelfId: bookshelf.id,
      userId: user.id,
      name: newName,
      imageUrl,
    });

    expect(updatedBookshelf.getState()).toMatchObject({
      name: newName,
      userId: user.id,
      type: bookshelf.type,
      imageUrl,
    });

    const persistedUpdatedBookshelf = await bookshelfTestUtils.findById({
      id: bookshelf.id,
    });

    expect(persistedUpdatedBookshelf).toMatchObject({
      id: bookshelf.id,
      name: newName,
      userId: user.id,
      type: bookshelf.type,
      createdAt: expect.any(Date),
      imageUrl,
    });
  });
});
