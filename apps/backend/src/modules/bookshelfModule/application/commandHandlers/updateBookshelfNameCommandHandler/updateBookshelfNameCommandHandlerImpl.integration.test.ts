import { beforeEach, describe, expect, it } from 'vitest';

import { Generator } from '@common/tests';

import { type UpdateBookshelfNameCommandHandler } from './updateBookshelfNameCommandHandler.js';
import { testSymbols } from '../../../../../../tests/container/symbols.js';
import { TestContainer } from '../../../../../../tests/container/testContainer.js';
import { ResourceNotFoundError } from '../../../../../common/errors/common/resourceNotFoundError.js';
import { type UserTestUtils } from '../../../../userModule/tests/utils/userTestUtils/userTestUtils.js';
import { Bookshelf } from '../../../domain/entities/bookshelf/bookshelf.js';
import { symbols } from '../../../symbols.js';
import { type BookshelfTestUtils } from '../../../tests/utils/bookshelfTestUtils/bookshelfTestUtils.js';

describe('UpdateBookshelfNameCommandHandlerImpl', () => {
  let commandHandler: UpdateBookshelfNameCommandHandler;

  let userTestUtils: UserTestUtils;

  let bookshelfTestUtils: BookshelfTestUtils;

  beforeEach(() => {
    const container = TestContainer.create();

    commandHandler = container.get<UpdateBookshelfNameCommandHandler>(symbols.updateBookshelfNameCommandHandler);

    userTestUtils = container.get<UserTestUtils>(testSymbols.userTestUtils);

    bookshelfTestUtils = container.get<BookshelfTestUtils>(testSymbols.bookshelfTestUtils);
  });

  it('throws an error - when Bookshelf was not found', async () => {
    const nonExistentBookshelfId = Generator.uuid();

    expect(
      async () =>
        await commandHandler.execute({
          id: nonExistentBookshelfId,
          name: Generator.alphaString(20),
          userId: Generator.uuid(),
        }),
    ).toThrowErrorInstance({
      instance: ResourceNotFoundError,
      context: {
        name: 'Bookshelf',
      },
    });
  });

  it('updates a Bookshelf name', async () => {
    const user = await userTestUtils.createAndPersist();

    const bookshelf = await bookshelfTestUtils.createAndPersist({
      input: {
        userId: user.id,
      },
    });

    const newBookshelfName = Generator.alphaString(30);

    const { bookshelf: updatedBookshelf } = await commandHandler.execute({
      id: bookshelf.id,
      name: newBookshelfName,
      userId: user.id,
    });

    expect(updatedBookshelf).toBeInstanceOf(Bookshelf);

    expect(updatedBookshelf.getState()).toMatchObject({
      id: bookshelf.id,
      name: newBookshelfName,
      userId: user.id,
    });

    const persistedUpdatedBookshelf = await bookshelfTestUtils.findById({
      id: bookshelf.id,
    });

    expect(persistedUpdatedBookshelf?.id).toEqual(bookshelf.id);

    expect(persistedUpdatedBookshelf?.name).toEqual(newBookshelfName);
  });
});
