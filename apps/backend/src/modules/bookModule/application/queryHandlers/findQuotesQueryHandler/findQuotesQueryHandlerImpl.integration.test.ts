import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { type FindQuotesQueryHandler } from './findQuotesQueryHandler.js';
import { testSymbols } from '../../../../../../tests/container/symbols.js';
import { TestContainer } from '../../../../../../tests/container/testContainer.js';
import { Generator } from '../../../../../../tests/generator.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import { type BookshelfTestUtils } from '../../../../bookshelfModule/tests/utils/bookshelfTestUtils/bookshelfTestUtils.js';
import { type UserTestUtils } from '../../../../userModule/tests/utils/userTestUtils/userTestUtils.js';
import { symbols } from '../../../symbols.js';
import { type BookTestUtils } from '../../../tests/utils/bookTestUtils/bookTestUtils.js';
import { type QuoteTestUtils } from '../../../tests/utils/quoteTestUtils/quoteTestUtils.js';
import { type UserBookTestUtils } from '../../../tests/utils/userBookTestUtils/userBookTestUtils.js';

describe('FindQuotesQueryHandlerImpl', () => {
  let queryHandler: FindQuotesQueryHandler;

  let quoteTestUtils: QuoteTestUtils;

  let bookTestUtils: BookTestUtils;

  let bookshelfTestUtils: BookshelfTestUtils;

  let userTestUtils: UserTestUtils;

  let userBookTestUtils: UserBookTestUtils;

  beforeEach(async () => {
    const container = TestContainer.create();

    queryHandler = container.get<FindQuotesQueryHandler>(symbols.findQuotesQueryHandler);

    quoteTestUtils = container.get<QuoteTestUtils>(testSymbols.quoteTestUtils);

    userTestUtils = container.get<UserTestUtils>(testSymbols.userTestUtils);

    bookTestUtils = container.get<BookTestUtils>(testSymbols.bookTestUtils);

    bookshelfTestUtils = container.get<BookshelfTestUtils>(testSymbols.bookshelfTestUtils);

    userBookTestUtils = container.get<UserBookTestUtils>(testSymbols.userBookTestUtils);

    await bookTestUtils.truncate();

    await bookshelfTestUtils.truncate();

    await userTestUtils.truncate();

    await quoteTestUtils.truncate();

    await userBookTestUtils.truncate();
  });

  afterEach(async () => {
    await bookTestUtils.truncate();

    await bookshelfTestUtils.truncate();

    await userTestUtils.truncate();

    await quoteTestUtils.truncate();

    await userBookTestUtils.truncate();
  });

  it('throws an error - when UserBook was not found', async () => {
    const nonExistentUserBookId = Generator.uuid();

    expect(
      async () =>
        await queryHandler.execute({
          userBookId: nonExistentUserBookId,
          page: 1,
          pageSize: 10,
        }),
    ).toThrowErrorInstance({
      instance: ResourceNotFoundError,
      context: {
        resource: 'UserBook',
        id: nonExistentUserBookId,
      },
    });
  });

  it('returns an empty array - when UserBook has no Quotes', async () => {
    const user = await userTestUtils.createAndPersist();

    const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

    const book = await bookTestUtils.createAndPersist();

    const userBook = await userBookTestUtils.createAndPersist({
      input: {
        bookId: book.id,
        bookshelfId: bookshelf.id,
      },
    });

    const { quotes, total } = await queryHandler.execute({
      userBookId: userBook.id,
      page: 1,
      pageSize: 10,
    });

    expect(quotes.length).toEqual(0);

    expect(total).toEqual(0);
  });

  it('returns Book Quotes', async () => {
    const user = await userTestUtils.createAndPersist();

    const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

    const book = await bookTestUtils.createAndPersist();

    const userBook = await userBookTestUtils.createAndPersist({
      input: {
        bookId: book.id,
        bookshelfId: bookshelf.id,
      },
    });

    const quote1 = await quoteTestUtils.createAndPersist({
      input: {
        userBookId: userBook.id,
      },
    });

    const quote2 = await quoteTestUtils.createAndPersist({
      input: {
        userBookId: userBook.id,
      },
    });

    const { quotes, total } = await queryHandler.execute({
      userBookId: userBook.id,
      page: 1,
      pageSize: 10,
    });

    expect(quotes.length).toEqual(2);

    expect(quotes[0]?.getState()).toEqual({
      userBookId: userBook.id,
      content: quote1.content,
      createdAt: quote1.createdAt,
      isFavorite: quote1.isFavorite,
      page: quote1.page,
    });

    expect(quotes[1]?.getState()).toEqual({
      userBookId: userBook.id,
      content: quote2.content,
      createdAt: quote2.createdAt,
      isFavorite: quote2.isFavorite,
      page: quote2.page,
    });

    expect(total).toEqual(2);
  });
});
