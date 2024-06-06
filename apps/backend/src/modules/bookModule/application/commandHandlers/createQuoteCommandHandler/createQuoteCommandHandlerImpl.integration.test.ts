import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { type CreateQuoteCommandHandler } from './createQuoteCommandHandler.js';
import { testSymbols } from '../../../../../../tests/container/symbols.js';
import { TestContainer } from '../../../../../../tests/container/testContainer.js';
import { Generator } from '../../../../../../tests/generator.js';
import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';
import { type BookTestUtils } from '../../../../bookModule/tests/utils/bookTestUtils/bookTestUtils.js';
import { type UserBookTestUtils } from '../../../../bookModule/tests/utils/userBookTestUtils/userBookTestUtils.js';
import { type BookshelfTestUtils } from '../../../../bookshelfModule/tests/utils/bookshelfTestUtils/bookshelfTestUtils.js';
import { type UserTestUtils } from '../../../../userModule/tests/utils/userTestUtils/userTestUtils.js';
import { Quote } from '../../../domain/entities/quote/quote.js';
import { symbols } from '../../../symbols.js';
import { QuoteTestFactory } from '../../../tests/factories/quoteTestFactory/quoteTestFactory.js';
import { type QuoteTestUtils } from '../../../tests/utils/quoteTestUtils/quoteTestUtils.js';

describe('CreateQuoteCommandHandlerImpl', () => {
  let commandHandler: CreateQuoteCommandHandler;

  let quoteTestUtils: QuoteTestUtils;

  let bookTestUtils: BookTestUtils;

  let bookshelfTestUtils: BookshelfTestUtils;

  let userTestUtils: UserTestUtils;

  let userBookTestUtils: UserBookTestUtils;

  const quoteTestFactory = new QuoteTestFactory();

  beforeEach(async () => {
    const container = TestContainer.create();

    commandHandler = container.get<CreateQuoteCommandHandler>(symbols.createQuoteCommandHandler);

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

  it('throws an error - when UserBook does not exist', async () => {
    const nonExistentUserBookId = Generator.uuid();

    const quote = quoteTestFactory.create();

    expect(
      async () =>
        await commandHandler.execute({
          userBookId: nonExistentUserBookId,
          content: quote.getContent(),
          createdAt: quote.getCreatedAt(),
          isFavorite: quote.getIsFavorite(),
          page: quote.getPage() as string,
        }),
    ).toThrowErrorInstance({
      instance: OperationNotValidError,
      context: {
        reason: 'UserBook does not exist.',
        id: nonExistentUserBookId,
      },
    });
  });

  it('returns a Quote', async () => {
    const user = await userTestUtils.createAndPersist();

    const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

    const book = await bookTestUtils.createAndPersist();

    const userBook = await userBookTestUtils.createAndPersist({
      input: {
        bookshelfId: bookshelf.id,
        bookId: book.id,
      },
    });

    const quoteDraft = quoteTestFactory.create({
      userBookId: userBook.id,
    });

    const { quote } = await commandHandler.execute({
      userBookId: quoteDraft.getUserBookId(),
      content: quoteDraft.getContent(),
      createdAt: quoteDraft.getCreatedAt(),
      isFavorite: quoteDraft.getIsFavorite(),
      page: quoteDraft.getPage() as string,
    });

    expect(quote).toBeInstanceOf(Quote);

    expect(quote.getState()).toEqual({
      userBookId: userBook.id,
      content: quoteDraft.getContent(),
      createdAt: quoteDraft.getCreatedAt(),
      isFavorite: quoteDraft.getIsFavorite(),
      page: quoteDraft.getPage(),
    });

    const persistedRawQuote = await quoteTestUtils.findById({
      id: quote.getId(),
    });

    expect(persistedRawQuote).toMatchObject({
      id: quote.getId(),
      userBookId: userBook.id,
      content: quoteDraft.getContent(),
      createdAt: quoteDraft.getCreatedAt(),
      isFavorite: quoteDraft.getIsFavorite(),
      page: quoteDraft.getPage(),
    });
  });
});
