import { bookshelfTypes } from '@common/contracts';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { Generator } from '../../../../../../tests/generator.js';
import { testSymbols } from '../../../../../../tests/symbols.js';
import { TestContainer } from '../../../../../../tests/testContainer.js';
import { type TestUtils } from '../../../../../../tests/testUtils.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { type DatabaseClient } from '../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { type BookRawEntity } from '../../../../bookModule/infrastructure/databases/bookDatabase/tables/bookTable/bookRawEntity.js';
import { type UserBookRawEntity } from '../../../../bookModule/infrastructure/databases/bookDatabase/tables/userBookTable/userBookRawEntity.js';
import { type AuthorTestUtils } from '../../../../bookModule/tests/utils/authorTestUtils/authorTestUtils.js';
import { type BookTestUtils } from '../../../../bookModule/tests/utils/bookTestUtils/bookTestUtils.js';
import { type GenreTestUtils } from '../../../../bookModule/tests/utils/genreTestUtils/genreTestUtils.js';
import { type UserBookTestUtils } from '../../../../bookModule/tests/utils/userBookTestUtils/userBookTestUtils.js';
import { type UserTestUtils } from '../../../../userModule/tests/utils/userTestUtils/userTestUtils.js';
import { Bookshelf } from '../../../domain/entities/bookshelf/bookshelf.js';
import { type BookshelfRepository } from '../../../domain/repositories/bookshelfRepository/bookshelfRepository.js';
import { symbols } from '../../../symbols.js';
import { BookshelfTestFactory } from '../../../tests/factories/bookshelfTestFactory/bookshelfTestFactory.js';
import { type BookshelfTestUtils } from '../../../tests/utils/bookshelfTestUtils/bookshelfTestUtils.js';

describe('BookshelfRepositoryImpl', () => {
  let repository: BookshelfRepository;

  let bookTestUtils: BookTestUtils;

  let authorTestUtils: AuthorTestUtils;

  let genreTestUtils: GenreTestUtils;

  let bookshelfTestUtils: BookshelfTestUtils;

  let userTestUtils: UserTestUtils;

  let userBookTestUtils: UserBookTestUtils;

  let databaseClient: DatabaseClient;

  const bookshelfTestFactory = new BookshelfTestFactory();

  const testUserId = Generator.uuid();

  let testUtils: TestUtils[];

  beforeEach(async () => {
    const container = await TestContainer.create();

    databaseClient = container.get<DatabaseClient>(coreSymbols.databaseClient);

    repository = container.get<BookshelfRepository>(symbols.bookshelfRepository);

    bookTestUtils = container.get<BookTestUtils>(testSymbols.bookTestUtils);

    authorTestUtils = container.get<AuthorTestUtils>(testSymbols.authorTestUtils);

    genreTestUtils = container.get<GenreTestUtils>(testSymbols.genreTestUtils);

    userBookTestUtils = container.get<UserBookTestUtils>(testSymbols.userBookTestUtils);

    bookshelfTestUtils = container.get<BookshelfTestUtils>(testSymbols.bookshelfTestUtils);

    userTestUtils = container.get<UserTestUtils>(testSymbols.userTestUtils);

    testUtils = [authorTestUtils, bookTestUtils, genreTestUtils, userTestUtils, bookshelfTestUtils, userBookTestUtils];

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

  async function createBook(): Promise<BookRawEntity> {
    const [author, genre] = await Promise.all([authorTestUtils.createAndPersist(), genreTestUtils.createAndPersist()]);

    return await bookTestUtils.createAndPersist({
      input: {
        authorIds: [author.id],
        book: {
          genreId: genre.id,
        },
      },
    });
  }

  async function createUserBook(bookshelfId: string): Promise<UserBookRawEntity> {
    const book = await createBook();

    return await userBookTestUtils.createAndPersist({
      input: {
        bookId: book.id,
        bookshelfId,
      },
    });
  }

  describe('find', () => {
    it('returns null - when Bookshelf was not found', async () => {
      const nonExistentBookshelfId = Generator.uuid();

      const result = await repository.findBookshelf({
        where: {
          id: nonExistentBookshelfId,
        },
      });

      expect(result).toBeNull();
    });

    it('finds by id', async () => {
      const bookshelf = await bookshelfTestUtils.createAndPersist({
        input: {
          userId: testUserId,
        },
      });

      await createUserBook(bookshelf.id);

      await createUserBook(bookshelf.id);

      const result = await repository.findBookshelf({
        where: {
          id: bookshelf.id,
        },
      });

      expect(result?.getState()).toEqual({
        name: bookshelf.name,
        userId: bookshelf.userId,
        type: bookshelf.type,
        createdAt: bookshelf.createdAt,
        imageUrl: bookshelf.imageUrl,
        bookCount: 2,
      });
    });

    it('finds by userId and name', async () => {
      const bookshelf = await bookshelfTestUtils.createAndPersist({
        input: {
          userId: testUserId,
        },
      });

      await createUserBook(bookshelf.id);

      const result = await repository.findBookshelf({
        where: {
          userId: testUserId,
          name: bookshelf.name,
        },
      });

      expect(result?.getState()).toEqual({
        name: bookshelf.name,
        userId: bookshelf.userId,
        type: bookshelf.type,
        createdAt: bookshelf.createdAt,
        imageUrl: bookshelf.imageUrl,
        bookCount: 1,
      });
    });
  });

  describe('findMany', () => {
    it('returns empty array - when no Bookshelves were found', async () => {
      const result = await repository.findBookshelves({
        userId: testUserId,
        page: 1,
        pageSize: 10,
      });

      expect(result).toEqual([]);
    });

    it(`finds all user's bookshelves`, async () => {
      const bookshelf1 = await bookshelfTestUtils.createAndPersist({
        input: {
          userId: testUserId,
        },
      });

      const bookshelf2 = await bookshelfTestUtils.createAndPersist({
        input: {
          userId: testUserId,
        },
      });

      await createUserBook(bookshelf1.id);

      await createUserBook(bookshelf1.id);

      await createUserBook(bookshelf2.id);

      const bookshelves = await repository.findBookshelves({
        userId: testUserId,
        page: 1,
        pageSize: 10,
      });

      expect(bookshelves).toHaveLength(2);

      [bookshelf1, bookshelf2].forEach((bookshelf) => {
        const foundBookshelf = bookshelves.find((b) => b.getId() === bookshelf.id);

        expect(foundBookshelf?.getState()).toEqual({
          name: bookshelf.name,
          userId: bookshelf.userId,
          type: bookshelf.type,
          createdAt: bookshelf.createdAt,
          imageUrl: bookshelf.imageUrl,
          bookCount: bookshelf.id === bookshelf1.id ? 2 : 1,
        });
      });
    });

    it(`finds all user's bookshelves by name`, async () => {
      const bookshelf1 = await bookshelfTestUtils.createAndPersist({
        input: {
          userId: testUserId,
          name: 'Harry Potter',
        },
      });

      await bookshelfTestUtils.createAndPersist({
        input: {
          userId: testUserId,
          name: 'Lord of the Rings',
        },
      });

      const result = await repository.findBookshelves({
        userId: testUserId,
        name: 'harry',
        page: 1,
        pageSize: 10,
      });

      expect(result).toHaveLength(1);

      expect(result[0]?.getState()).toEqual({
        name: bookshelf1.name,
        userId: bookshelf1.userId,
        type: bookshelf1.type,
        createdAt: bookshelf1.createdAt,
        imageUrl: bookshelf1.imageUrl,
        bookCount: 0,
      });
    });

    it(`finds all user's bookshelves by type`, async () => {
      const bookshelf1 = await bookshelfTestUtils.createAndPersist({
        input: {
          userId: testUserId,
          type: bookshelfTypes.borrowing,
        },
      });

      await bookshelfTestUtils.createAndPersist({
        input: {
          userId: testUserId,
          type: bookshelfTypes.standard,
        },
      });

      await bookshelfTestUtils.createAndPersist({
        input: {
          userId: testUserId,
          type: bookshelfTypes.archive,
        },
      });

      const result = await repository.findBookshelves({
        userId: testUserId,
        type: bookshelfTypes.borrowing,
        page: 1,
        pageSize: 10,
      });

      expect(result).toHaveLength(1);

      expect(result[0]?.getState()).toEqual({
        name: bookshelf1.name,
        userId: bookshelf1.userId,
        type: bookshelf1.type,
        createdAt: bookshelf1.createdAt,
        imageUrl: bookshelf1.imageUrl,
        bookCount: 0,
      });
    });

    it('paginates results', async () => {
      await bookshelfTestUtils.createAndPersist({
        input: {
          userId: testUserId,
        },
      });

      await bookshelfTestUtils.createAndPersist({
        input: {
          userId: testUserId,
        },
      });

      const result = await repository.findBookshelves({
        userId: testUserId,
        page: 1,
        pageSize: 1,
      });

      expect(result).toHaveLength(1);
    });

    it('sorts by date', async () => {
      const bookshelf1 = await bookshelfTestUtils.createAndPersist({
        input: {
          userId: testUserId,
          createdAt: new Date('2024-08-10'),
        },
      });

      const bookshelf2 = await bookshelfTestUtils.createAndPersist({
        input: {
          userId: testUserId,
          createdAt: new Date('2024-09-02'),
        },
      });

      const result = await repository.findBookshelves({
        userId: testUserId,
        page: 1,
        pageSize: 10,
        sortDate: 'desc',
      });

      expect(result).toHaveLength(2);

      expect(result[0]?.getId()).toBe(bookshelf2.id);

      expect(result[1]?.getId()).toBe(bookshelf1.id);
    });
  });

  describe('save', () => {
    it('creates a new Bookshelf - given BookshelfDraft', async () => {
      const bookshelfDraft = bookshelfTestFactory.create({
        userId: testUserId,
      });

      const result = await repository.saveBookshelf({
        bookshelf: bookshelfDraft.getState(),
      });

      expect(result).toBeInstanceOf(Bookshelf);

      expect(result.getId()).toBeDefined();

      expect(result.getState()).toEqual({
        name: bookshelfDraft.getName(),
        userId: bookshelfDraft.getUserId(),
        type: bookshelfDraft.getType(),
        createdAt: bookshelfDraft.getCreatedAt(),
        imageUrl: bookshelfDraft.getImageUrl(),
      });
    });

    it('updates a Bookshelf - given a Bookshelf', async () => {
      const bookshelfRawEntity = await bookshelfTestUtils.createAndPersist({
        input: {
          userId: testUserId,
        },
      });

      const bookshelf = bookshelfTestFactory.create(bookshelfRawEntity);

      const newName = Generator.alphaString(20);

      bookshelf.setName({ name: newName });

      const result = await repository.saveBookshelf({
        bookshelf,
      });

      const foundBookshelf = await bookshelfTestUtils.findById({
        id: bookshelf.getId(),
      });

      expect(result.getName()).toEqual(newName);

      expect(foundBookshelf?.name).toEqual(newName);
    });
  });

  describe('delete', () => {
    it('deletes a Bookshelf', async () => {
      const bookshelf = await bookshelfTestUtils.createAndPersist({
        input: {
          userId: testUserId,
        },
      });

      await repository.deleteBookshelf({
        id: bookshelf.id,
      });

      const result = await bookshelfTestUtils.findById({
        id: bookshelf.id,
      });

      expect(result).toBeNull();
    });
  });

  describe('count', () => {
    it('returns 0 - when no Bookshelves were found', async () => {
      const result = await repository.countBookshelves({
        userId: testUserId,
      });

      expect(result).toBe(0);
    });

    it('returns the number of Bookshelves', async () => {
      await bookshelfTestUtils.createAndPersist({
        input: {
          userId: testUserId,
        },
      });

      await bookshelfTestUtils.createAndPersist({
        input: {
          userId: testUserId,
        },
      });

      const result = await repository.countBookshelves({
        userId: testUserId,
      });

      expect(result).toBe(2);
    });
  });
});
