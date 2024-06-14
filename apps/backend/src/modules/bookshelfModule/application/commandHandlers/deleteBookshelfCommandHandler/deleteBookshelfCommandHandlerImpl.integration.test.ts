import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { type DeleteBookshelfCommandHandler } from './deleteBookshelfCommandHandler.js';
import { Generator } from '../../../../../../tests/generator.js';
import { testSymbols } from '../../../../../../tests/symbols.js';
import { TestContainer } from '../../../../../../tests/testContainer.js';
import { type TestUtils } from '../../../../../../tests/testUtils.js';
import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import { type UserTestUtils } from '../../../../userModule/tests/utils/userTestUtils/userTestUtils.js';
import { symbols } from '../../../symbols.js';
import { type BookshelfTestUtils } from '../../../tests/utils/bookshelfTestUtils/bookshelfTestUtils.js';

describe('DeleteBookshelfCommandHandlerImpl', () => {
  let commandHandler: DeleteBookshelfCommandHandler;

  let userTestUtils: UserTestUtils;

  let bookshelfTestUtils: BookshelfTestUtils;

  let testUtils: TestUtils[];

  beforeEach(async () => {
    const container = TestContainer.create();

    commandHandler = container.get<DeleteBookshelfCommandHandler>(symbols.deleteBookshelfCommandHandler);

    userTestUtils = container.get<UserTestUtils>(testSymbols.userTestUtils);

    bookshelfTestUtils = container.get<BookshelfTestUtils>(testSymbols.bookshelfTestUtils);

    testUtils = [userTestUtils, bookshelfTestUtils];

    for (const testUtil of testUtils) {
      await testUtil.truncate();
    }
  });

  afterEach(async () => {
    for (const testUtil of testUtils) {
      await testUtil.truncate();
    }
  });

  it('throws an error - when Bookshelf was not found', async () => {
    const nonExistentBookshelfId = Generator.uuid();

    expect(
      async () =>
        await commandHandler.execute({
          bookshelfId: nonExistentBookshelfId,
          userId: Generator.uuid(),
        }),
    ).toThrowErrorInstance({
      instance: ResourceNotFoundError,
      context: {
        resource: 'Bookshelf',
      },
    });
  });

  it('throws an error - when User does not have permission to delete this Bookshelf', async () => {
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
          userId: user.id,
        }),
    ).toThrowErrorInstance({
      instance: OperationNotValidError,
      context: {
        reason: 'User does not have permission to delete this bookshelf.',
      },
    });
  });

  it('deletes a Bookshelf', async () => {
    const user = await userTestUtils.createAndPersist();

    const bookshelf = await bookshelfTestUtils.createAndPersist({
      input: {
        userId: user.id,
      },
    });

    await commandHandler.execute({
      bookshelfId: bookshelf.id,
      userId: user.id,
    });

    const foundBookshelf = await bookshelfTestUtils.findById({
      id: bookshelf.id,
    });

    expect(foundBookshelf).toBeNull();
  });
});
