import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { type FindQuotesQueryHandler } from './findQuotesQueryHandler.js';
import { Generator } from '../../../../../../tests/generator.js';
import { testSymbols } from '../../../../../../tests/symbols.js';
import { TestContainer } from '../../../../../../tests/testContainer.js';
import { type TestUtils } from '../../../../../../tests/testUtils.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { type DatabaseClient } from '../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { type BookshelfTestUtils } from '../../../../bookshelfModule/tests/utils/bookshelfTestUtils/bookshelfTestUtils.js';
import { type UserTestUtils } from '../../../../userModule/tests/utils/userTestUtils/userTestUtils.js';
import { symbols } from '../../../symbols.js';
import { type BookTestUtils } from '../../../tests/utils/bookTestUtils/bookTestUtils.js';
import { type QuoteTestUtils } from '../../../tests/utils/quoteTestUtils/quoteTestUtils.js';
import { type UserBookTestUtils } from '../../../tests/utils/userBookTestUtils/userBookTestUtils.js';

describe('FindQuotesQueryHandlerImpl', () => {
  let queryHandler: FindQuotesQueryHandler;

  let databaseClient: DatabaseClient;

  let quoteTestUtils: QuoteTestUtils;

  let bookTestUtils: BookTestUtils;

  let bookshelfTestUtils: BookshelfTestUtils;

  let userTestUtils: UserTestUtils;

  let userBookTestUtils: UserBookTestUtils;

  let testUtils: TestUtils[];

  beforeEach(async () => {
    const container = TestContainer.create();

    queryHandler = container.get<FindQuotesQueryHandler>(symbols.findQuotesQueryHandler);

    databaseClient = container.get<DatabaseClient>(coreSymbols.databaseClient);

    quoteTestUtils = container.get<QuoteTestUtils>(testSymbols.quoteTestUtils);

    userTestUtils = container.get<UserTestUtils>(testSymbols.userTestUtils);

    bookTestUtils = container.get<BookTestUtils>(testSymbols.bookTestUtils);

    bookshelfTestUtils = container.get<BookshelfTestUtils>(testSymbols.bookshelfTestUtils);

    userBookTestUtils = container.get<UserBookTestUtils>(testSymbols.userBookTestUtils);

    testUtils = [bookTestUtils, bookshelfTestUtils, userTestUtils, quoteTestUtils, userBookTestUtils];

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

  it('throws an error - when UserBook was not found', async () => {
    const nonExistentUserBookId = Generator.uuid();

    try {
      await queryHandler.execute({
        userBookId: nonExistentUserBookId,
        page: 1,
        pageSize: 10,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(ResourceNotFoundError);

      expect((error as ResourceNotFoundError).context).toMatchObject({
        resource: 'UserBook',
        id: nonExistentUserBookId,
      });

      return;
    }

    expect.fail();
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
