import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { Generator } from '../../../../../../tests/generator.js';
import { testSymbols } from '../../../../../../tests/symbols.js';
import { TestContainer } from '../../../../../../tests/testContainer.js';
import { type TestUtils } from '../../../../../../tests/testUtils.js';
import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { type DatabaseClient } from '../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { type BookTestUtils } from '../../../../bookModule/tests/utils/bookTestUtils/bookTestUtils.js';
import { type UserBookTestUtils } from '../../../../bookModule/tests/utils/userBookTestUtils/userBookTestUtils.js';
import { type BookshelfTestUtils } from '../../../../bookshelfModule/tests/utils/bookshelfTestUtils/bookshelfTestUtils.js';
import { type UserTestUtils } from '../../../../userModule/tests/utils/userTestUtils/userTestUtils.js';
import { Quote } from '../../../domain/entities/quote/quote.js';
import { symbols } from '../../../symbols.js';
import { QuoteTestFactory } from '../../../tests/factories/quoteTestFactory/quoteTestFactory.js';
import { type GenreTestUtils } from '../../../tests/utils/genreTestUtils/genreTestUtils.js';
import { type QuoteTestUtils } from '../../../tests/utils/quoteTestUtils/quoteTestUtils.js';

import { type CreateQuoteCommandHandler } from './createQuoteCommandHandler.js';

describe('CreateQuoteCommandHandlerImpl', () => {
  let commandHandler: CreateQuoteCommandHandler;

  let databaseClient: DatabaseClient;

  let quoteTestUtils: QuoteTestUtils;

  let bookTestUtils: BookTestUtils;

  let bookshelfTestUtils: BookshelfTestUtils;

  let userTestUtils: UserTestUtils;

  let genreTestUtils: GenreTestUtils;

  let userBookTestUtils: UserBookTestUtils;

  const quoteTestFactory = new QuoteTestFactory();

  let testUtils: TestUtils[];

  beforeEach(async () => {
    const container = await TestContainer.create();

    commandHandler = container.get<CreateQuoteCommandHandler>(symbols.createQuoteCommandHandler);

    databaseClient = container.get<DatabaseClient>(coreSymbols.databaseClient);

    quoteTestUtils = container.get<QuoteTestUtils>(testSymbols.quoteTestUtils);

    userTestUtils = container.get<UserTestUtils>(testSymbols.userTestUtils);

    bookTestUtils = container.get<BookTestUtils>(testSymbols.bookTestUtils);

    bookshelfTestUtils = container.get<BookshelfTestUtils>(testSymbols.bookshelfTestUtils);

    userBookTestUtils = container.get<UserBookTestUtils>(testSymbols.userBookTestUtils);

    genreTestUtils = container.get<GenreTestUtils>(testSymbols.genreTestUtils);

    testUtils = [genreTestUtils, bookTestUtils, bookshelfTestUtils, userTestUtils, quoteTestUtils, userBookTestUtils];

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

  it('throws an error - when UserBook does not exist', async () => {
    const user = await userTestUtils.createAndPersist();

    const nonExistentUserBookId = Generator.uuid();

    const quote = quoteTestFactory.create();

    try {
      await commandHandler.execute({
        userId: user.id,
        userBookId: nonExistentUserBookId,
        content: quote.getContent(),
        createdAt: quote.getCreatedAt(),
        isFavorite: quote.getIsFavorite(),
        page: quote.getPage() as string,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(OperationNotValidError);

      expect((error as OperationNotValidError).context).toMatchObject({
        reason: 'UserBook does not exist.',
        id: nonExistentUserBookId,
      });

      return;
    }

    expect.fail();
  });

  it('returns a Quote', async () => {
    const user = await userTestUtils.createAndPersist();

    const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

    const book = await bookTestUtils.createAndPersist();

    const genre = await genreTestUtils.createAndPersist();

    const userBook = await userBookTestUtils.createAndPersist({
      input: {
        bookshelfId: bookshelf.id,
        bookId: book.id,
        genreId: genre.id,
      },
    });

    const quoteDraft = quoteTestFactory.create({
      userBookId: userBook.id,
    });

    const { quote } = await commandHandler.execute({
      userId: user.id,
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
