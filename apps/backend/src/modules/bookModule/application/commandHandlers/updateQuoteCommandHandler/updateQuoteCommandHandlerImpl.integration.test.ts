import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { type UpdateQuoteCommandHandler } from './updateQuoteCommandHandler.js';
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
import { type QuoteTestUtils } from '../../../tests/utils/quoteTestUtils/quoteTestUtils.js';

describe('UpdateQuoteCommandHandlerImpl', () => {
  let commandHandler: UpdateQuoteCommandHandler;

  let databaseClient: DatabaseClient;

  let quoteTestUtils: QuoteTestUtils;

  let bookTestUtils: BookTestUtils;

  let bookshelfTestUtils: BookshelfTestUtils;

  let userTestUtils: UserTestUtils;

  let userBookTestUtils: UserBookTestUtils;

  let testUtils: TestUtils[];

  beforeEach(async () => {
    const container = TestContainer.create();

    commandHandler = container.get<UpdateQuoteCommandHandler>(symbols.updateQuoteCommandHandler);

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

  it('throws an error - when Quote was not found', async () => {
    const nonExistentQuoteId = Generator.uuid();

    try {
      await commandHandler.execute({
        id: nonExistentQuoteId,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(OperationNotValidError);

      expect((error as OperationNotValidError).context).toMatchObject({
        reason: 'Quote does not exist.',
        id: nonExistentQuoteId,
      });

      return;
    }

    expect.fail();
  });

  it('updates a Quote', async () => {
    const user = await userTestUtils.createAndPersist();

    const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

    const book = await bookTestUtils.createAndPersist();

    const userBook = await userBookTestUtils.createAndPersist({
      input: {
        bookshelfId: bookshelf.id,
        bookId: book.id,
      },
    });

    const quote = await quoteTestUtils.createAndPersist({
      input: {
        userBookId: userBook.id,
      },
    });

    const newContent = Generator.alphaString(20);

    const newFavorite = Generator.boolean();

    const newPage = Generator.number(1, 1000).toString();

    const { quote: updatedQuote } = await commandHandler.execute({
      id: quote.id,
      content: newContent,
      isFavorite: newFavorite,
      page: newPage,
    });

    expect(updatedQuote).toBeInstanceOf(Quote);

    expect(updatedQuote.getState()).toMatchObject({
      userBookId: userBook.id,
      content: newContent,
      isFavorite: newFavorite,
      createdAt: quote.createdAt,
      page: newPage,
    });

    const persistedUpdatedQuote = await quoteTestUtils.findById({
      id: quote.id,
    });

    expect(persistedUpdatedQuote?.content).toEqual(newContent);

    expect(persistedUpdatedQuote?.isFavorite).toEqual(newFavorite);

    expect(persistedUpdatedQuote?.page).toEqual(newPage);
  });
});
