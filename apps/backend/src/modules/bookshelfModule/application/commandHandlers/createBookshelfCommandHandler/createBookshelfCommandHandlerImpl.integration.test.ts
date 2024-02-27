import { beforeEach, describe, expect, it } from 'vitest';

import { Generator } from '@common/tests';

import { type CreateBookshelfCommandHandler } from './createBookshelfCommandHandler.js';
import { testSymbols } from '../../../../../../tests/container/symbols.js';
import { TestContainer } from '../../../../../../tests/container/testContainer.js';
import { ResourceNotFoundError } from '../../../../../common/errors/common/resourceNotFoundError.js';
import { type UserTestUtils } from '../../../../userModule/tests/utils/userTestUtils/userTestUtils.js';
import { Bookshelf } from '../../../domain/entities/bookshelf/bookshelf.js';
import { symbols } from '../../../symbols.js';
import { type BookshelfTestUtils } from '../../../tests/utils/bookshelfTestUtils/bookshelfTestUtils.js';

describe('CreateBookshelfCommandHandlerImpl', () => {
  let commandHandler: CreateBookshelfCommandHandler;

  let userTestUtils: UserTestUtils;

  let bookshelfTestUtils: BookshelfTestUtils;

  beforeEach(() => {
    const container = TestContainer.create();

    commandHandler = container.get<CreateBookshelfCommandHandler>(symbols.createBookshelfCommandHandler);

    userTestUtils = container.get<UserTestUtils>(testSymbols.userTestUtils);

    bookshelfTestUtils = container.get<BookshelfTestUtils>(testSymbols.bookshelfTestUtils);
  });

  it('throws an error - when User does not exist', async () => {
    const nonExistentUserId = Generator.uuid();

    const name = Generator.word();

    expect(
      async () =>
        await commandHandler.execute({
          name,
          userId: nonExistentUserId,
        }),
    ).toThrowErrorInstance({
      instance: ResourceNotFoundError,
      context: {
        name: 'User',
      },
    });
  });

  it('returns a Bookshelf', async () => {
    const user = await userTestUtils.createAndPersist();

    const name = Generator.word();

    const { bookshelf } = await commandHandler.execute({
      name,
      userId: user.id,
    });

    expect(bookshelf).toBeInstanceOf(Bookshelf);

    expect(bookshelf.getState()).toEqual({
      name,
      userId: user.id,
      addressId: null,
    });

    const persistedRawBookshelf = await bookshelfTestUtils.findById({
      id: bookshelf.getId(),
    });

    expect(persistedRawBookshelf).toMatchObject({
      id: bookshelf.getId(),
      name,
      userId: user.id,
      addressId: null,
    });
  });
});
