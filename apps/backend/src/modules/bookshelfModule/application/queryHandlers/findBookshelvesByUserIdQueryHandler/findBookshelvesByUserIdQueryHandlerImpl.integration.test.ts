import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { type FindBookshelvesByUserIdQueryHandler } from './findBookshelvesByUserIdQueryHandler.js';
import { testSymbols } from '../../../../../../tests/container/symbols.js';
import { TestContainer } from '../../../../../../tests/container/testContainer.js';
import { Generator } from '../../../../../../tests/generator.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import { type UserTestUtils } from '../../../../userModule/tests/utils/userTestUtils/userTestUtils.js';
import { symbols } from '../../../symbols.js';
import { type BookshelfTestUtils } from '../../../tests/utils/bookshelfTestUtils/bookshelfTestUtils.js';

describe('FindBookshelvesByUserIdQueryHandlerImpl', () => {
  let queryHandler: FindBookshelvesByUserIdQueryHandler;

  let userTestUtils: UserTestUtils;

  let bookshelfTestUtils: BookshelfTestUtils;

  beforeEach(async () => {
    const container = TestContainer.create();

    queryHandler = container.get<FindBookshelvesByUserIdQueryHandler>(symbols.findBookshelvesByUserIdQueryHandler);

    userTestUtils = container.get<UserTestUtils>(testSymbols.userTestUtils);

    bookshelfTestUtils = container.get<BookshelfTestUtils>(testSymbols.bookshelfTestUtils);

    await userTestUtils.truncate();

    await bookshelfTestUtils.truncate();
  });

  afterEach(async () => {
    await bookshelfTestUtils.truncate();

    await userTestUtils.truncate();
  });

  it('throws an error - when User was not found', async () => {
    const nonExistentUserId = Generator.uuid();

    expect(
      async () =>
        await queryHandler.execute({
          userId: nonExistentUserId,
          page: 1,
          pageSize: 10,
        }),
    ).toThrowErrorInstance({
      instance: ResourceNotFoundError,
      context: {
        resource: 'User',
      },
    });
  });

  it('returns an empty array - when User has no Bookshelves', async () => {
    const user = await userTestUtils.createAndPersist();

    const { bookshelves, total } = await queryHandler.execute({
      userId: user.id,
      page: 1,
      pageSize: 10,
    });

    expect(bookshelves.length).toEqual(0);

    expect(total).toEqual(0);
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

    const { bookshelves, total } = await queryHandler.execute({
      userId: user.id,
      page: 1,
      pageSize: 10,
    });

    expect(bookshelves.length).toEqual(2);

    expect(bookshelves.find((bookshelf) => bookshelf.getId() === bookshelf1.id)?.getState()).toEqual({
      name: bookshelf1.name,
      userId: bookshelf1.userId,
      type: bookshelf1.type,
    });

    expect(bookshelves.find((bookshelf) => bookshelf.getId() === bookshelf2.id)?.getState()).toEqual({
      name: bookshelf2.name,
      userId: bookshelf2.userId,
      type: bookshelf2.type,
    });

    expect(total).toEqual(2);
  });
});
