import { describe, it, beforeEach, expect, afterEach } from 'vitest';

import { type FindQuoteByIdQueryHandler } from './findQuoteByIdQueryHandler.js';
import { testSymbols } from '../../../../../../tests/container/symbols.js';
import { TestContainer } from '../../../../../../tests/container/testContainer.js';
import { Generator } from '../../../../../../tests/generator.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import { type BookshelfTestUtils } from '../../../../bookshelfModule/tests/utils/bookshelfTestUtils/bookshelfTestUtils.js';
import { type UserTestUtils } from '../../../../userModule/tests/utils/userTestUtils/userTestUtils.js';
import { Quote } from '../../../domain/entities/quote/quote.js';
import { symbols } from '../../../symbols.js';
import { type BookTestUtils } from '../../../tests/utils/bookTestUtils/bookTestUtils.js';
import { type QuoteTestUtils } from '../../../tests/utils/quoteTestUtils/quoteTestUtils.js';
import { type UserBookTestUtils } from '../../../tests/utils/userBookTestUtils/userBookTestUtils.js';

describe('FindQuoteByIdQueryHandler', () => {
  let queryHandler: FindQuoteByIdQueryHandler;

  let quoteTestUtils: QuoteTestUtils;

  let bookTestUtils: BookTestUtils;

  let bookshelfTestUtils: BookshelfTestUtils;

  let userTestUtils: UserTestUtils;

  let userBookTestUtils: UserBookTestUtils;

  beforeEach(async () => {
    const container = TestContainer.create();

    queryHandler = container.get<FindQuoteByIdQueryHandler>(symbols.findQuoteByIdQueryHandler);

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

  it('throws an error - when Quote was not found', async () => {
    const nonExistentQuoteId = Generator.uuid();

    expect(
      async () =>
        await queryHandler.execute({
          id: nonExistentQuoteId,
        }),
    ).toThrowErrorInstance({
      instance: ResourceNotFoundError,
      context: {
        resource: 'Quote',
      },
    });
  });

  it('returns a Quote', async () => {
    const user = await userTestUtils.createAndPersist();

    const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

    const book = await bookTestUtils.createAndPersist();

    const userBook = await userBookTestUtils.createAndPersist({
      input: {
        bookId: book.id,
        bookshelfId: bookshelf.id,
      },
    });

    const createdQuote = await quoteTestUtils.createAndPersist({
      input: {
        userBookId: userBook.id,
      },
    });

    const { quote } = await queryHandler.execute({
      id: createdQuote.id,
    });

    expect(quote).toBeInstanceOf(Quote);

    expect(quote?.getId()).toEqual(createdQuote.id);

    expect(quote?.getState()).toEqual({
      userBookId: userBook.id,
      content: createdQuote.content,
      createdAt: createdQuote.createdAt,
      isFavorite: createdQuote.isFavorite,
    });
  });
});
