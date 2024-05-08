import { beforeEach, describe, expect, it } from 'vitest';

import { type UpdateBookshelfCommandHandler } from './updateBookshelfCommandHandler.js';
import { testSymbols } from '../../../../../../tests/container/symbols.js';
import { TestContainer } from '../../../../../../tests/container/testContainer.js';
import { Generator } from '../../../../../../tests/generator.js';
import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import { type UserTestUtils } from '../../../../userModule/tests/utils/userTestUtils/userTestUtils.js';
import { symbols } from '../../../symbols.js';
import { type BookshelfTestUtils } from '../../../tests/utils/bookshelfTestUtils/bookshelfTestUtils.js';

describe('UpdateBookshelfCommandHandlerImpl', () => {
  let commandHandler: UpdateBookshelfCommandHandler;

  let userTestUtils: UserTestUtils;

  let bookshelfTestUtils: BookshelfTestUtils;

  beforeEach(() => {
    const container = TestContainer.create();

    commandHandler = container.get<UpdateBookshelfCommandHandler>(symbols.updateBookshelfCommandHandler);

    userTestUtils = container.get<UserTestUtils>(testSymbols.userTestUtils);

    bookshelfTestUtils = container.get<BookshelfTestUtils>(testSymbols.bookshelfTestUtils);
  });

  it('throws an error - when Bookshelf was not found', async () => {
    const nonExistentBookshelfId = Generator.uuid();

    expect(
      async () =>
        await commandHandler.execute({
          bookshelfId: nonExistentBookshelfId,
          name: Generator.alphaString(20),
          userId: Generator.uuid(),
        }),
    ).toThrowErrorInstance({
      instance: ResourceNotFoundError,
      context: {
        resource: 'Bookshelf',
      },
    });
  });

  it('throws an error - when User does not have permission to update this Bookshelf', async () => {
    const user = await userTestUtils.createAndPersist();

    const anotherUser = await userTestUtils.createAndPersist();

    const bookshelf = await bookshelfTestUtils.createAndPersist({
      input: {
        userId: anotherUser.id,
      },
    });

    expect(
      async () =>
        await commandHandler.execute({
          bookshelfId: bookshelf.id,
          name: Generator.alphaString(20),
          userId: user.id,
        }),
    ).toThrowErrorInstance({
      instance: OperationNotValidError,
      context: {
        reason: 'User does not have permission to update this bookshelf.',
      },
    });
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

    expect(
      async () =>
        await commandHandler.execute({
          bookshelfId: bookshelf.id,
          name: anotherBookshelf.name,
          userId: user.id,
        }),
    ).toThrowErrorInstance({
      instance: OperationNotValidError,
      context: {
        reason: 'Bookshelf with this name already exists.',
      },
    });
  });

  it('updates a Bookshelf', async () => {
    const user = await userTestUtils.createAndPersist();

    const bookshelf = await bookshelfTestUtils.createAndPersist({
      input: {
        userId: user.id,
      },
    });

    const newName = Generator.alphaString(30);

    const { bookshelf: updatedBookshelf } = await commandHandler.execute({
      bookshelfId: bookshelf.id,
      userId: user.id,
      name: newName,
    });

    expect(updatedBookshelf.getState()).toMatchObject({
      name: newName,
      userId: user.id,
      type: bookshelf.type,
    });

    const persistedUpdatedBookshelf = await bookshelfTestUtils.findById({
      id: bookshelf.id,
    });

    expect(persistedUpdatedBookshelf).toMatchObject({
      id: bookshelf.id,
      name: newName,
      userId: user.id,
      type: bookshelf.type,
    });
  });
});
