import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { Generator } from '@common/tests';

import { type FindBookshelvesByUserIdQueryHandler } from './findBookshelvesByUserIdQueryHandler.js';
import { testSymbols } from '../../../../../../tests/container/symbols.js';
import { TestContainer } from '../../../../../../tests/container/testContainer.js';
import { ResourceNotFoundError } from '../../../../../common/errors/common/resourceNotFoundError.js';
import { type UserTestUtils } from '../../../../userModule/tests/utils/userTestUtils/userTestUtils.js';
import { symbols } from '../../../symbols.js';
import { type BookshelfTestUtils } from '../../../tests/utils/bookshelfTestUtils/bookshelfTestUtils.js';

describe('FindBookshelvesByUserIdQueryHandlerImpl', () => {
  let queryHandler: FindBookshelvesByUserIdQueryHandler;

  let userTestUtils: UserTestUtils;

  let bookshelfTestUtils: BookshelfTestUtils;

  beforeEach(() => {
    const container = TestContainer.create();

    queryHandler = container.get<FindBookshelvesByUserIdQueryHandler>(symbols.findBookshelvesByUserIdQueryHandler);

    userTestUtils = container.get<UserTestUtils>(testSymbols.userTestUtils);

    bookshelfTestUtils = container.get<BookshelfTestUtils>(testSymbols.bookshelfTestUtils);
  });

  afterEach(async () => {
    await userTestUtils.truncate();
  });

  it('throws an error - when User was not found', async () => {
    const nonExistentUserId = Generator.uuid();

    expect(
      async () =>
        await queryHandler.execute({
          userId: nonExistentUserId,
        }),
    ).toThrowErrorInstance({
      instance: ResourceNotFoundError,
      context: {
        name: 'User',
      },
    });
  });

  it('returns an empty array - when User has no Bookshelves', async () => {
    const user = await userTestUtils.createAndPersist();

    const result = await queryHandler.execute({
      userId: user.id,
    });

    expect(result.bookshelves.length).toEqual(0);
  });

  it('returns User Bookshelves', async () => {
    const user = await userTestUtils.createAndPersist();

    const bookshelf1 = await bookshelfTestUtils.createAndPersist({
      input: {
        userId: user.id,
      },
    });

    const bookshelf2 = await bookshelfTestUtils.createAndPersist({
      input: {
        userId: user.id,
      },
    });

    const result = await queryHandler.execute({
      userId: user.id,
    });

    expect(result.bookshelves.length).toEqual(2);

    expect(result.bookshelves[0]?.getState()).toEqual({
      id: bookshelf1.id,
      name: bookshelf1.name,
      addressId: bookshelf1.addressId,
      userId: bookshelf1.userId,
    });

    expect(result.bookshelves[1]?.getState()).toEqual({
      id: bookshelf2.id,
      name: bookshelf2.name,
      addressId: bookshelf2.addressId,
      userId: bookshelf2.userId,
    });
  });
});
