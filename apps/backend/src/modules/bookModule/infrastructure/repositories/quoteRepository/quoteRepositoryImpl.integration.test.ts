import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { Generator } from '../../../../../../tests/generator.js';
import { testSymbols } from '../../../../../../tests/symbols.js';
import { TestContainer } from '../../../../../../tests/testContainer.js';
import { type TestUtils } from '../../../../../../tests/testUtils.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { type DatabaseClient } from '../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { type BookshelfTestUtils } from '../../../../bookshelfModule/tests/utils/bookshelfTestUtils/bookshelfTestUtils.js';
import { type UserTestUtils } from '../../../../userModule/tests/utils/userTestUtils/userTestUtils.js';
import { Quote } from '../../../domain/entities/quote/quote.js';
import { type QuoteRepository } from '../../../domain/repositories/quoteRepository/quoteRepository.js';
import { symbols } from '../../../symbols.js';
import { QuoteTestFactory } from '../../../tests/factories/quoteTestFactory/quoteTestFactory.js';
import { type BookTestUtils } from '../../../tests/utils/bookTestUtils/bookTestUtils.js';
import { type QuoteTestUtils } from '../../../tests/utils/quoteTestUtils/quoteTestUtils.js';
import { type UserBookTestUtils } from '../../../tests/utils/userBookTestUtils/userBookTestUtils.js';

describe('QuoteRepositoryImpl', () => {
  let repository: QuoteRepository;

  let databaseClient: DatabaseClient;

  let quoteTestUtils: QuoteTestUtils;

  let bookTestUtils: BookTestUtils;

  let bookshelfTestUtils: BookshelfTestUtils;

  let userTestUtils: UserTestUtils;

  let userBookTestUtils: UserBookTestUtils;

  const quoteTestFactory = new QuoteTestFactory();

  let testUtils: TestUtils[];

  beforeEach(async () => {
    const container = TestContainer.create();

    repository = container.get<QuoteRepository>(symbols.quoteRepository);

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

  describe('findById', () => {
    it('returns null - when Quote was not found', async () => {
      const nonExistentQuoteId = Generator.uuid();

      const result = await repository.findQuote({
        id: nonExistentQuoteId,
      });

      expect(result).toBeNull();
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

      const quote = await quoteTestUtils.createAndPersist({
        input: {
          userBookId: userBook.id,
        },
      });

      const result = await repository.findQuote({
        id: quote.id,
      });

      expect(result).toBeInstanceOf(Quote);

      expect(result?.getState()).toEqual({
        userBookId: userBook.id,
        content: quote.content,
        isFavorite: quote.isFavorite,
        page: quote.page,
        createdAt: quote.createdAt,
      });
    });
  });

  describe('findQuotes', () => {
    it('returns an empty array - when Quotes were not found', async () => {
      const userBookId = Generator.uuid();

      const result = await repository.findQuotes({
        userBookId,
        page: 1,
        pageSize: 10,
      });

      expect(result).toHaveLength(0);
    });

    it('returns an array of Quotes', async () => {
      const user = await userTestUtils.createAndPersist();

      const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

      const book = await bookTestUtils.createAndPersist();

      const userBook = await userBookTestUtils.createAndPersist({
        input: {
          bookshelfId: bookshelf.id,
          bookId: book.id,
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

      const result = await repository.findQuotes({
        userBookId: userBook.id,
        page: 1,
        pageSize: 10,
      });

      expect(result).toHaveLength(2);

      result.forEach((quote) => {
        expect(quote).toBeInstanceOf(Quote);

        expect(quote.getId()).oneOf([quote1.id, quote2.id]);

        expect(quote.getUserBookId()).toEqual(userBook.id);
      });
    });
  });

  describe('save', () => {
    it('creates a new Quote - given QuoteDraft', async () => {
      const user = await userTestUtils.createAndPersist();

      const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

      const book = await bookTestUtils.createAndPersist();

      const userBook = await userBookTestUtils.createAndPersist({
        input: {
          bookshelfId: bookshelf.id,
          bookId: book.id,
        },
      });

      const quote = quoteTestFactory.create({
        userBookId: userBook.id,
      });

      const result = await repository.saveQuote({
        quote: quote.getState(),
      });

      expect(result).toBeInstanceOf(Quote);

      expect(result.getUserBookId()).toEqual(userBook.id);

      expect(result.getContent()).toEqual(quote.getContent());

      expect(result.getIsFavorite()).toEqual(quote.getIsFavorite());

      expect(result.getCreatedAt()).toEqual(quote.getCreatedAt());
    });

    it('updates a Quote - given a Quote', async () => {
      const user = await userTestUtils.createAndPersist();

      const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

      const book = await bookTestUtils.createAndPersist();

      const userBook = await userBookTestUtils.createAndPersist({
        input: {
          bookshelfId: bookshelf.id,
          bookId: book.id,
        },
      });

      const quoteRawEntity = await quoteTestUtils.createAndPersist({
        input: {
          userBookId: userBook.id,
        },
      });

      const quote = new Quote(quoteRawEntity);

      const newContent = Generator.alphaString(20);

      const newFavorite = Generator.boolean();

      const newPage = Generator.number(1, 1000).toString();

      quote.setContent({ content: newContent });

      quote.setIsFavorite({ isFavorite: newFavorite });

      quote.setPage({ page: newPage });

      const result = await repository.saveQuote({
        quote,
      });

      expect(result).toBeInstanceOf(Quote);

      const updatedQuote = await repository.findQuote({
        id: quote.getId(),
      });

      expect(updatedQuote?.getContent()).toEqual(newContent);

      expect(updatedQuote?.getIsFavorite()).toEqual(newFavorite);

      expect(updatedQuote?.getPage()).toEqual(newPage);
    });
  });

  describe('delete', () => {
    it('deletes a Quote', async () => {
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

      await repository.deleteQuote({ id: quote.id });

      const result = await repository.findQuote({ id: quote.id });

      expect(result).toBeNull();
    });
  });
});
