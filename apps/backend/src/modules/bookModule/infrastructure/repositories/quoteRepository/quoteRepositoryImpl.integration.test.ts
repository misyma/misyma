import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { Generator } from '../../../../../../tests/generator.js';
import { testSymbols } from '../../../../../../tests/symbols.js';
import { TestContainer } from '../../../../../../tests/testContainer.js';
import { type TestUtils } from '../../../../../../tests/testUtils.js';
import { type BookshelfTestUtils } from '../../../../bookshelfModule/tests/utils/bookshelfTestUtils/bookshelfTestUtils.js';
import { type BookshelfRawEntity } from '../../../../databaseModule/infrastructure/tables/bookshelvesTable/bookshelfRawEntity.js';
import { type BookRawEntity } from '../../../../databaseModule/infrastructure/tables/booksTable/bookRawEntity.js';
import { type UserBookRawEntity } from '../../../../databaseModule/infrastructure/tables/usersBooksTable/userBookRawEntity.js';
import { databaseSymbols } from '../../../../databaseModule/symbols.js';
import { type DatabaseClient } from '../../../../databaseModule/types/databaseClient.js';
import { type UserTestUtils } from '../../../../userModule/tests/utils/userTestUtils/userTestUtils.js';
import { Quote } from '../../../domain/entities/quote/quote.js';
import { type QuoteRepository } from '../../../domain/repositories/quoteRepository/quoteRepository.js';
import { symbols } from '../../../symbols.js';
import { QuoteTestFactory } from '../../../tests/factories/quoteTestFactory/quoteTestFactory.js';
import { type AuthorTestUtils } from '../../../tests/utils/authorTestUtils/authorTestUtils.js';
import { type BookTestUtils } from '../../../tests/utils/bookTestUtils/bookTestUtils.js';
import { type CategoryTestUtils } from '../../../tests/utils/categoryTestUtils/categoryTestUtils.js';
import { type QuoteTestUtils } from '../../../tests/utils/quoteTestUtils/quoteTestUtils.js';
import { type UserBookTestUtils } from '../../../tests/utils/userBookTestUtils/userBookTestUtils.js';

describe('QuoteRepositoryImpl', () => {
  let repository: QuoteRepository;

  let databaseClient: DatabaseClient;

  let quoteTestUtils: QuoteTestUtils;

  let authorTestUtils: AuthorTestUtils;

  let bookTestUtils: BookTestUtils;

  let bookshelfTestUtils: BookshelfTestUtils;

  let userTestUtils: UserTestUtils;

  let userBookTestUtils: UserBookTestUtils;

  let categoryTestUtils: CategoryTestUtils;

  const quoteTestFactory = new QuoteTestFactory();

  const testUserId = Generator.uuid();

  let testUtils: TestUtils[];

  beforeEach(async () => {
    const container = await TestContainer.create();

    repository = container.get<QuoteRepository>(symbols.quoteRepository);

    databaseClient = container.get<DatabaseClient>(databaseSymbols.databaseClient);

    quoteTestUtils = container.get<QuoteTestUtils>(testSymbols.quoteTestUtils);

    userTestUtils = container.get<UserTestUtils>(testSymbols.userTestUtils);

    bookTestUtils = container.get<BookTestUtils>(testSymbols.bookTestUtils);

    authorTestUtils = container.get<AuthorTestUtils>(testSymbols.authorTestUtils);

    bookshelfTestUtils = container.get<BookshelfTestUtils>(testSymbols.bookshelfTestUtils);

    userBookTestUtils = container.get<UserBookTestUtils>(testSymbols.userBookTestUtils);

    categoryTestUtils = container.get<CategoryTestUtils>(testSymbols.categoryTestUtils);

    testUtils = [
      authorTestUtils,
      categoryTestUtils,
      bookTestUtils,
      bookshelfTestUtils,
      userTestUtils,
      quoteTestUtils,
      userBookTestUtils,
    ];

    for (const testUtil of testUtils) {
      await testUtil.truncate();
    }

    await userTestUtils.createAndPersist({
      input: {
        id: testUserId,
      },
    });
  });

  afterEach(async () => {
    for (const testUtil of testUtils) {
      await testUtil.truncate();
    }

    await databaseClient.destroy();
  });

  async function createBookshelf(userId?: string): Promise<BookshelfRawEntity> {
    let id = testUserId;
    if (userId) {
      await userTestUtils.createAndPersist({
        input: {
          id: userId,
        },
      });

      id = userId;
    }

    return await bookshelfTestUtils.createAndPersist({ input: { user_id: id } });
  }

  async function createBook(authorIds?: string[]): Promise<BookRawEntity> {
    const category = await categoryTestUtils.createAndPersist();

    return await bookTestUtils.createAndPersist({
      input: {
        authorIds,
        book: {
          category_id: category.id,
        },
      },
    });
  }

  async function createUserBook(userId?: string): Promise<UserBookRawEntity> {
    const [bookshelf, book] = await Promise.all([createBookshelf(userId), createBook()]);
    return await userBookTestUtils.createAndPersist({
      input: {
        bookshelf_id: bookshelf.id,
        book_id: book.id,
      },
    });
  }

  describe('findById', () => {
    it('returns null - when Quote was not found', async () => {
      const nonExistentQuoteId = Generator.uuid();

      const result = await repository.findQuote({
        id: nonExistentQuoteId,
      });

      expect(result).toBeNull();
    });

    it('returns a Quote', async () => {
      const userBook = await createUserBook();

      const quote = await quoteTestUtils.createAndPersist({
        input: {
          user_book_id: userBook.id,
        },
      });

      const result = await repository.findQuote({
        id: quote.id,
      });

      expect(result).toBeInstanceOf(Quote);

      expect(result?.getState()).toEqual({
        userBookId: userBook.id,
        content: quote.content,
        isFavorite: quote.is_favorite,
        page: quote.page,
        createdAt: quote.created_at,
      });
    });
  });

  describe('findQuotes', () => {
    it('returns an empty array - when Quotes were not found', async () => {
      const result = await repository.findQuotes({
        userId: testUserId,
        page: 1,
        pageSize: 10,
      });

      expect(result).toHaveLength(0);
    });

    it('returns an array of Quotes by UserBook', async () => {
      const userBook1 = await createUserBook();

      const userBook2 = await createUserBook();

      const quote1 = await quoteTestUtils.createAndPersist({
        input: {
          user_book_id: userBook1.id,
        },
      });

      const quote2 = await quoteTestUtils.createAndPersist({
        input: {
          user_book_id: userBook1.id,
        },
      });

      await quoteTestUtils.createAndPersist({
        input: {
          user_book_id: userBook2.id,
        },
      });

      const result = await repository.findQuotes({
        userId: testUserId,
        userBookId: userBook1.id,
        page: 1,
        pageSize: 10,
      });

      expect(result).toHaveLength(2);

      result.forEach((quote) => {
        expect(quote).toBeInstanceOf(Quote);

        expect(quote.getId()).oneOf([quote1.id, quote2.id]);

        expect(quote.getUserBookId()).toEqual(userBook1.id);
      });
    });

    it('returns an array of Quotes by User', async () => {
      const bookshelf1 = await createBookshelf();

      const author = await authorTestUtils.createAndPersist();

      const book1 = await createBook([author.id]);

      const userBook1 = await userBookTestUtils.createAndPersist({
        input: {
          bookshelf_id: bookshelf1.id,
          book_id: book1.id,
        },
      });

      const userBook2 = await createUserBook(Generator.uuid());

      const quote = await quoteTestUtils.createAndPersist({
        input: {
          user_book_id: userBook1.id,
        },
      });

      await quoteTestUtils.createAndPersist({
        input: {
          user_book_id: userBook2.id,
        },
      });

      const result = await repository.findQuotes({
        userId: testUserId,
        page: 1,
        pageSize: 10,
      });

      expect(result).toHaveLength(1);

      expect(result[0]?.getId()).toEqual(quote.id);

      expect(result[0]?.getState()).toEqual({
        userBookId: userBook1.id,
        content: quote.content,
        isFavorite: quote.is_favorite,
        page: quote.page,
        createdAt: quote.created_at,
        bookTitle: book1.title,
        authors: [author.name],
      });
    });

    it('returns an array of Quotes by Author', async () => {
      const bookshelf = await createBookshelf();

      const author1 = await authorTestUtils.createAndPersist();

      const author2 = await authorTestUtils.createAndPersist();

      const book1 = await createBook([author1.id]);

      const book2 = await createBook([author2.id]);

      const userBook1 = await userBookTestUtils.createAndPersist({
        input: {
          bookshelf_id: bookshelf.id,
          book_id: book1.id,
        },
      });

      const userBook2 = await userBookTestUtils.createAndPersist({
        input: {
          bookshelf_id: bookshelf.id,
          book_id: book2.id,
        },
      });

      const quote = await quoteTestUtils.createAndPersist({
        input: {
          user_book_id: userBook1.id,
        },
      });

      await quoteTestUtils.createAndPersist({
        input: {
          user_book_id: userBook2.id,
        },
      });

      await quoteTestUtils.createAndPersist({
        input: {
          user_book_id: userBook2.id,
        },
      });

      const result = await repository.findQuotes({
        userId: testUserId,
        authorId: author1.id,
        page: 1,
        pageSize: 10,
      });

      expect(result).toHaveLength(1);

      expect(result[0]?.getId()).toEqual(quote.id);
    });

    it('returns an array of Quotes by Favorite', async () => {
      const userBook = await createUserBook();

      const quote1 = await quoteTestUtils.createAndPersist({
        input: {
          user_book_id: userBook.id,
          is_favorite: true,
        },
      });

      await quoteTestUtils.createAndPersist({
        input: {
          user_book_id: userBook.id,
          is_favorite: false,
        },
      });

      await quoteTestUtils.createAndPersist({
        input: {
          user_book_id: userBook.id,
          is_favorite: false,
        },
      });

      const result = await repository.findQuotes({
        userId: testUserId,
        isFavorite: true,
        page: 1,
        pageSize: 10,
      });

      expect(result).toHaveLength(1);

      expect(result[0]?.getId()).toEqual(quote1.id);
    });
  });

  describe('save', () => {
    it('creates a new Quote - given QuoteDraft', async () => {
      const userBook = await createUserBook();

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
      const userBook = await createUserBook();

      const quoteRawEntity = await quoteTestUtils.createAndPersist({
        input: {
          user_book_id: userBook.id,
        },
      });

      const quote = new Quote({
        id: quoteRawEntity.id,
        userBookId: quoteRawEntity.user_book_id,
        content: quoteRawEntity.content,
        createdAt: quoteRawEntity.created_at,
        isFavorite: quoteRawEntity.is_favorite,
        page: quoteRawEntity.page,
      });

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
      const userBook = await createUserBook();

      const quote = await quoteTestUtils.createAndPersist({
        input: {
          user_book_id: userBook.id,
        },
      });

      await repository.deleteQuote({ id: quote.id });

      const result = await repository.findQuote({ id: quote.id });

      expect(result).toBeNull();
    });
  });
});
