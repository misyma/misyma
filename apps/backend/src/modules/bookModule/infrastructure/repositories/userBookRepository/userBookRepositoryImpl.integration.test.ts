import { beforeEach, afterEach, expect, describe, it } from 'vitest';

import { Generator } from '../../../../../../tests/generator.js';
import { testSymbols } from '../../../../../../tests/symbols.js';
import { TestContainer } from '../../../../../../tests/testContainer.js';
import { type TestUtils } from '../../../../../../tests/testUtils.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { type DatabaseClient } from '../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { type BookshelfTestUtils } from '../../../../bookshelfModule/tests/utils/bookshelfTestUtils/bookshelfTestUtils.js';
import { type UserTestUtils } from '../../../../userModule/tests/utils/userTestUtils/userTestUtils.js';
import { Author } from '../../../domain/entities/author/author.js';
import { BookReading } from '../../../domain/entities/bookReading/bookReading.js';
import { Collection } from '../../../domain/entities/collection/collection.js';
import { UserBook } from '../../../domain/entities/userBook/userBook.js';
import { type UserBookRepository } from '../../../domain/repositories/userBookRepository/userBookRepository.js';
import { symbols } from '../../../symbols.js';
import { UserBookTestFactory } from '../../../tests/factories/userBookTestFactory/userBookTestFactory.js';
import { type AuthorTestUtils } from '../../../tests/utils/authorTestUtils/authorTestUtils.js';
import { type BookReadingTestUtils } from '../../../tests/utils/bookReadingTestUtils/bookReadingTestUtils.js';
import { type BookTestUtils } from '../../../tests/utils/bookTestUtils/bookTestUtils.js';
import { type CollectionTestUtils } from '../../../tests/utils/collectionTestUtils/collectionTestUtils.js';
import { type GenreTestUtils } from '../../../tests/utils/genreTestUtils/genreTestUtils.js';
import { type UserBookTestUtils } from '../../../tests/utils/userBookTestUtils/userBookTestUtils.js';

describe('UserBookRepositoryImpl', () => {
  let userBookRepository: UserBookRepository;

  let databaseClient: DatabaseClient;

  let bookTestUtils: BookTestUtils;

  let authorTestUtils: AuthorTestUtils;

  let userTestUtils: UserTestUtils;

  let bookshelfTestUtils: BookshelfTestUtils;

  let genreTestUtils: GenreTestUtils;

  let userBookTestUtils: UserBookTestUtils;

  let bookReadingTestUtils: BookReadingTestUtils;

  let collectionTestUtils: CollectionTestUtils;

  const userBookTestFactory = new UserBookTestFactory();

  let testUtils: TestUtils[];

  beforeEach(async () => {
    const container = await TestContainer.create();

    userBookRepository = container.get<UserBookRepository>(symbols.userBookRepository);

    databaseClient = container.get<DatabaseClient>(coreSymbols.databaseClient);

    bookTestUtils = container.get<BookTestUtils>(testSymbols.bookTestUtils);

    authorTestUtils = container.get<AuthorTestUtils>(testSymbols.authorTestUtils);

    userTestUtils = container.get<UserTestUtils>(testSymbols.userTestUtils);

    bookshelfTestUtils = container.get<BookshelfTestUtils>(testSymbols.bookshelfTestUtils);

    genreTestUtils = container.get<GenreTestUtils>(testSymbols.genreTestUtils);

    userBookTestUtils = container.get<UserBookTestUtils>(testSymbols.userBookTestUtils);

    bookReadingTestUtils = container.get<BookReadingTestUtils>(testSymbols.bookReadingTestUtils);

    collectionTestUtils = container.get<CollectionTestUtils>(testSymbols.collectionTestUtils);

    testUtils = [
      authorTestUtils,
      bookTestUtils,
      bookshelfTestUtils,
      userTestUtils,
      genreTestUtils,
      userBookTestUtils,
      bookReadingTestUtils,
      collectionTestUtils,
    ];

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

  describe('saveUserBook', () => {
    it('creates UserBook', async () => {
      const user = await userTestUtils.createAndPersist();

      const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

      const author = await authorTestUtils.createAndPersist();

      const book = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author.id],
        },
      });

      const userBookRawEntity = userBookTestFactory.createRaw({
        bookId: book.id,
        bookshelfId: bookshelf.id,
      });

      const userBook = await userBookRepository.saveUserBook({
        userBook: {
          bookId: userBookRawEntity.bookId,
          bookshelfId: userBookRawEntity.bookshelfId,
          status: userBookRawEntity.status,
          isFavorite: userBookRawEntity.isFavorite,
          imageUrl: userBookRawEntity.imageUrl as string,
          createdAt: userBookRawEntity.createdAt,
          readings: [],
          collections: [],
        },
      });

      const foundUserBook = await userBookTestUtils.findById({
        id: userBook.id,
      });

      expect(userBook.getState()).toEqual({
        bookId: userBookRawEntity.bookId,
        bookshelfId: userBookRawEntity.bookshelfId,
        status: userBookRawEntity.status,
        imageUrl: userBookRawEntity.imageUrl,
        isFavorite: userBookRawEntity.isFavorite,
        createdAt: userBookRawEntity.createdAt,
        readings: [],
        collections: [],
        book: {
          id: book.id,
          title: book.title,
          isbn: book.isbn,
          publisher: book.publisher,
          releaseYear: book.releaseYear,
          language: book.language,
          translator: book.translator,
          format: book.format,
          pages: book.pages,
          isApproved: book.isApproved,
          imageUrl: book.imageUrl,
          createdAt: book.createdAt,
          authors: [
            {
              id: author.id,
              state: {
                name: author.name,
                isApproved: author.isApproved,
                createdAt: author.createdAt,
              },
            },
          ],
        },
      });

      expect(foundUserBook).toEqual({
        id: userBook.id,
        bookId: userBookRawEntity.bookId,
        bookshelfId: userBookRawEntity.bookshelfId,
        createdAt: userBookRawEntity.createdAt,
        status: userBookRawEntity.status,
        isFavorite: userBookRawEntity.isFavorite,
        imageUrl: userBookRawEntity.imageUrl,
      });
    });

    it('updates UserBook bookshelf', async () => {
      const user = await userTestUtils.createAndPersist();

      const bookshelf1 = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

      const bookshelf2 = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

      const author = await authorTestUtils.createAndPersist();

      const book = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author.id],
        },
      });

      const userBookRawEntity = await userBookTestUtils.createAndPersist({
        input: {
          bookId: book.id,
          bookshelfId: bookshelf1.id,
        },
      });

      const userBook = userBookTestFactory.create(userBookRawEntity);

      const newBookshelfId = bookshelf2.id;

      userBook.bookshelfId = { bookshelfId: newBookshelfId };

      const updatedUserBook = await userBookRepository.saveUserBook({ userBook });

      const foundUserBook = await userBookTestUtils.findById({
        id: userBook.id,
      });

      expect(updatedUserBook.getState()).toEqual({
        bookId: userBook.bookId,
        bookshelfId: newBookshelfId,
        status: userBook.status,
        isFavorite: userBook.isFavorite,
        imageUrl: userBook.imageUrl,
        createdAt: userBook.createdAt,
        readings: [],
        collections: [],
        book: {
          id: book.id,
          title: book.title,
          isbn: book.isbn,
          publisher: book.publisher,
          releaseYear: book.releaseYear,
          language: book.language,
          translator: book.translator,
          format: book.format,
          pages: book.pages,
          isApproved: book.isApproved,
          imageUrl: book.imageUrl,
          createdAt: book.createdAt,
          authors: [new Author(author)],
        },
      });

      expect(foundUserBook).toEqual({
        id: userBook.id,
        bookId: userBook.bookId,
        bookshelfId: newBookshelfId,
        status: userBook.status,
        isFavorite: userBook.isFavorite,
        imageUrl: userBook.imageUrl,
        createdAt: userBook.createdAt,
      });
    });

    it('updates UserBook status', async () => {
      const user = await userTestUtils.createAndPersist();

      const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

      const author = await authorTestUtils.createAndPersist();

      const book = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author.id],
        },
      });

      const userBookRawEntity = await userBookTestUtils.createAndPersist({
        input: {
          bookId: book.id,
          bookshelfId: bookshelf.id,
        },
      });

      const userBook = userBookTestFactory.create(userBookRawEntity);

      const newStatus = Generator.readingStatus();

      userBook.status = { status: newStatus };

      const updatedUserBook = await userBookRepository.saveUserBook({
        userBook,
      });

      const foundUserBook = await userBookTestUtils.findById({
        id: userBook.id,
      });

      expect(updatedUserBook.status).toEqual(newStatus);

      expect(foundUserBook?.status).toEqual(newStatus);
    });

    it('updates UserBook image', async () => {
      const user = await userTestUtils.createAndPersist();

      const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

      const author = await authorTestUtils.createAndPersist();

      const book = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author.id],
        },
      });

      const userBookRawEntity = await userBookTestUtils.createAndPersist({
        input: {
          bookId: book.id,
          bookshelfId: bookshelf.id,
        },
      });

      const userBook = userBookTestFactory.create(userBookRawEntity);

      const newImageUrl = Generator.imageUrl();

      userBook.imageUrl = { imageUrl: newImageUrl };

      const updatedUserBook = await userBookRepository.saveUserBook({
        userBook,
      });

      const foundUserBook = await userBookTestUtils.findById({
        id: userBook.id,
      });

      expect(updatedUserBook.imageUrl).toEqual(newImageUrl);

      expect(foundUserBook?.imageUrl).toEqual(newImageUrl);
    });

    it('deletes UserBook image', async () => {
      const user = await userTestUtils.createAndPersist();

      const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

      const author = await authorTestUtils.createAndPersist();

      const book = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author.id],
        },
      });

      const userBookRawEntity = await userBookTestUtils.createAndPersist({
        input: {
          bookId: book.id,
          bookshelfId: bookshelf.id,
        },
      });

      const userBook = userBookTestFactory.create(userBookRawEntity);

      const newImageUrl = null;

      userBook.imageUrl = { imageUrl: newImageUrl };

      const updatedUserBook = await userBookRepository.saveUserBook({
        userBook,
      });

      const foundUserBook = await userBookTestUtils.findById({
        id: userBook.id,
      });

      expect(updatedUserBook.imageUrl).toBeUndefined();

      expect(foundUserBook?.imageUrl).toBeNull();
    });

    it('updates UserBook favorite status', async () => {
      const user = await userTestUtils.createAndPersist();

      const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

      const author = await authorTestUtils.createAndPersist();

      const book = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author.id],
        },
      });

      const userBookRawEntity = await userBookTestUtils.createAndPersist({
        input: {
          bookId: book.id,
          bookshelfId: bookshelf.id,
        },
      });

      const userBook = userBookTestFactory.create(userBookRawEntity);

      const newIsFavorite = Generator.boolean();

      userBook.isFavorite = { isFavorite: newIsFavorite };

      const updatedUserBook = await userBookRepository.saveUserBook({
        userBook,
      });

      const foundUserBook = await userBookTestUtils.findById({
        id: userBook.id,
      });

      expect(updatedUserBook.isFavorite).toEqual(newIsFavorite);

      expect(foundUserBook?.isFavorite).toEqual(newIsFavorite);
    });
  });

  describe('saveUserBooks', () => {
    it('updates UserBooks bookshelves', async () => {
      const user = await userTestUtils.createAndPersist();

      const bookshelf1 = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

      const bookshelf2 = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

      const author = await authorTestUtils.createAndPersist();

      const book1 = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author.id],
        },
      });

      const book2 = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author.id],
        },
      });

      const userBookRawEntity1 = await userBookTestUtils.createAndPersist({
        input: {
          bookId: book1.id,
          bookshelfId: bookshelf1.id,
        },
      });

      const userBookRawEntity2 = await userBookTestUtils.createAndPersist({
        input: {
          bookId: book2.id,
          bookshelfId: bookshelf1.id,
        },
      });

      const userBook1 = new UserBook({
        ...userBookRawEntity1,
        readings: [],
        collections: [],
      });

      const userBook2 = new UserBook({
        ...userBookRawEntity2,
        readings: [],
        collections: [],
      });

      userBook1.bookshelfId ={ bookshelfId: bookshelf2.id };

      userBook2.bookshelfId = { bookshelfId: bookshelf2.id };

      await userBookRepository.saveUserBooks({
        userBooks: [userBook1, userBook2],
      });

      const foundUserBooks = await userBookTestUtils.findByIds({ ids: [userBook1.id, userBook2.id] });

      expect(foundUserBooks.length).toEqual(2);

      foundUserBooks.forEach((foundUserBook) => {
        expect(foundUserBook.bookshelfId).toEqual(bookshelf2.id);
      });
    });
  });

  describe('findUserBook', () => {
    it('finds UserBook by id', async () => {
      const user = await userTestUtils.createAndPersist();

      const collection = await collectionTestUtils.createAndPersist({ input: { userId: user.id } });

      const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

      const author = await authorTestUtils.createAndPersist();

      const book = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author.id],
        },
      });

      const userBookRawEntity = await userBookTestUtils.createAndPersist({
        input: {
          bookId: book.id,
          bookshelfId: bookshelf.id,
        },
        collectionIds: [collection.id],
      });

      const userBook = userBookTestFactory.create(userBookRawEntity);

      const bookReading = await bookReadingTestUtils.createAndPersist({
        input: {
          userBookId: userBook.id,
        },
      });

      const foundUserBook = await userBookRepository.findUserBook({ id: userBook.id });

      expect(foundUserBook?.id).toEqual(userBook.id);

      expect(foundUserBook?.getState()).toEqual({
        bookId: userBook.bookId,
        bookshelfId: userBook.bookshelfId,
        status: userBook.status,
        isFavorite: userBook.isFavorite,
        imageUrl: userBook.imageUrl,
        createdAt: userBook.createdAt,
        collections: [new Collection(collection)],
        readings: [new BookReading(bookReading)],
        book: {
          id: book.id,
          title: book.title,
          isbn: book.isbn,
          publisher: book.publisher,
          releaseYear: book.releaseYear,
          language: book.language,
          translator: book.translator,
          format: book.format,
          pages: book.pages,
          isApproved: book.isApproved,
          imageUrl: book.imageUrl,
          createdAt: book.createdAt,
          authors: [new Author(author)],
        },
        latestRating: bookReading.rating,
      });
    });

    it('returns null if UserBook with given id does not exist', async () => {
      const id = Generator.uuid();

      const userBook = await userBookRepository.findUserBook({ id });

      expect(userBook).toBeNull();
    });
  });

  describe('findUserBooks', () => {
    it('returns UserBooks from a given Bookshelf', async () => {
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

      const author1 = await authorTestUtils.createAndPersist();

      const author2 = await authorTestUtils.createAndPersist();

      const book1 = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author1.id],
        },
      });

      const book2 = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author2.id],
        },
      });

      await userBookTestUtils.createAndPersist({
        input: {
          bookId: book1.id,
          bookshelfId: bookshelf1.id,
        },
      });

      const userBook2 = await userBookTestUtils.createAndPersist({
        input: {
          bookId: book1.id,
          bookshelfId: bookshelf2.id,
        },
      });

      const userBook3 = await userBookTestUtils.createAndPersist({
        input: {
          bookId: book2.id,
          bookshelfId: bookshelf2.id,
        },
      });

      const bookReading1 = await bookReadingTestUtils.createAndPersist({
        input: {
          userBookId: userBook2.id,
          endedAt: new Date('2023-01-01'),
        },
      });

      await bookReadingTestUtils.createAndPersist({
        input: {
          userBookId: userBook2.id,
          endedAt: new Date('2022-01-01'),
        },
      });

      const bookReading2 = await bookReadingTestUtils.createAndPersist({
        input: {
          userBookId: userBook3.id,
          endedAt: new Date('2025-01-22'),
        },
      });

      await bookReadingTestUtils.createAndPersist({
        input: {
          userBookId: userBook3.id,
          endedAt: new Date('2025-01-21'),
        },
      });

      const userBooks = await userBookRepository.findUserBooks({
        bookshelfId: bookshelf2.id,
        page: 1,
        pageSize: 10,
      });

      expect(userBooks.length).toEqual(2);

      userBooks.forEach((userBook) => {
        expect(userBook.id).oneOf([userBook2.id, userBook3.id]);

        expect(userBook.latestReading).toEqual(
          userBook.id === userBook2.id ? bookReading1.rating : bookReading2.rating,
        );
      });
    });

    it('returns UserBooks from a given Collection', async () => {
      const user = await userTestUtils.createAndPersist();

      const collection1 = await collectionTestUtils.createAndPersist({
        input: {
          userId: user.id,
        },
      });

      const collection2 = await collectionTestUtils.createAndPersist({
        input: {
          userId: user.id,
        },
      });

      const bookshelf = await bookshelfTestUtils.createAndPersist({
        input: {
          userId: user.id,
        },
      });

      const author1 = await authorTestUtils.createAndPersist();

      const author2 = await authorTestUtils.createAndPersist();

      const book1 = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author1.id],
        },
      });

      const book2 = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author2.id],
        },
      });

      await userBookTestUtils.createAndPersist({
        input: {
          bookId: book1.id,
          bookshelfId: bookshelf.id,
        },
      });

      const userBook2 = await userBookTestUtils.createAndPersist({
        input: {
          bookId: book1.id,
          bookshelfId: bookshelf.id,
        },
        collectionIds: [collection1.id],
      });

      await userBookTestUtils.createAndPersist({
        input: {
          bookId: book2.id,
          bookshelfId: bookshelf.id,
        },
        collectionIds: [collection2.id],
      });

      const userBooks = await userBookRepository.findUserBooks({
        collectionId: collection1.id,
        page: 1,
        pageSize: 10,
      });

      expect(userBooks.length).toEqual(1);

      expect(userBooks[0]?.id).toEqual(userBook2.id);
    });

    it('returns UserBooks by ISBN', async () => {
      const user = await userTestUtils.createAndPersist();

      const bookshelf = await bookshelfTestUtils.createAndPersist({
        input: {
          userId: user.id,
        },
      });

      const author1 = await authorTestUtils.createAndPersist();

      const author2 = await authorTestUtils.createAndPersist();

      const book1 = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author1.id],
        },
      });

      const book2 = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author2.id],
        },
      });

      await userBookTestUtils.createAndPersist({
        input: {
          bookId: book1.id,
          bookshelfId: bookshelf.id,
        },
      });

      const userBook2 = await userBookTestUtils.createAndPersist({
        input: {
          bookId: book2.id,
          bookshelfId: bookshelf.id,
        },
      });

      const userBooks = await userBookRepository.findUserBooks({
        isbn: book2.isbn as string,
        page: 1,
        pageSize: 10,
      });

      expect(userBooks.length).toEqual(1);

      expect(userBooks[0]?.id).toEqual(userBook2.id);
    });

    it('returns UserBooks by User', async () => {
      const user1 = await userTestUtils.createAndPersist();

      const user2 = await userTestUtils.createAndPersist();

      const bookshelf1 = await bookshelfTestUtils.createAndPersist({
        input: {
          userId: user1.id,
        },
      });

      const bookshelf2 = await bookshelfTestUtils.createAndPersist({
        input: {
          userId: user2.id,
        },
      });

      const author1 = await authorTestUtils.createAndPersist();

      const author2 = await authorTestUtils.createAndPersist();

      const book1 = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author1.id],
        },
      });

      const book2 = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author2.id],
        },
      });

      await userBookTestUtils.createAndPersist({
        input: {
          bookId: book1.id,
          bookshelfId: bookshelf1.id,
        },
      });

      const userBook2 = await userBookTestUtils.createAndPersist({
        input: {
          bookId: book1.id,
          bookshelfId: bookshelf2.id,
        },
      });

      const userBook3 = await userBookTestUtils.createAndPersist({
        input: {
          bookId: book2.id,
          bookshelfId: bookshelf2.id,
        },
      });

      const userBooks = await userBookRepository.findUserBooks({
        userId: user2.id,
        page: 1,
        pageSize: 10,
      });

      expect(userBooks.length).toEqual(2);

      userBooks.forEach((userBook) => {
        expect(userBook.id).oneOf([userBook2.id, userBook3.id]);
      });
    });

    it('returns UserBooks by a given User and Book', async () => {
      const user = await userTestUtils.createAndPersist();

      const author = await authorTestUtils.createAndPersist();

      const book1 = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author.id],
        },
      });

      const book2 = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author.id],
        },
      });

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

      await userBookTestUtils.createAndPersist({
        input: {
          bookId: book1.id,
          bookshelfId: bookshelf1.id,
        },
      });

      await userBookTestUtils.createAndPersist({
        input: {
          bookId: book1.id,
          bookshelfId: bookshelf2.id,
        },
      });

      const userBook = await userBookTestUtils.createAndPersist({
        input: {
          bookId: book2.id,
          bookshelfId: bookshelf2.id,
        },
      });

      const userBooks = await userBookRepository.findUserBooks({
        userId: user.id,
        bookId: book2.id,
        page: 1,
        pageSize: 10,
      });

      expect(userBooks.length).toEqual(1);

      expect(userBooks[0]?.id).toEqual(userBook.id);
    });

    it('returns UserBooks by User and ISBN', async () => {
      const user = await userTestUtils.createAndPersist();

      const author = await authorTestUtils.createAndPersist();

      const book1 = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author.id],
        },
      });

      const book2 = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author.id],
        },
      });

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

      await userBookTestUtils.createAndPersist({
        input: {
          bookId: book1.id,
          bookshelfId: bookshelf1.id,
        },
      });

      await userBookTestUtils.createAndPersist({
        input: {
          bookId: book1.id,
          bookshelfId: bookshelf2.id,
        },
      });

      const userBook = await userBookTestUtils.createAndPersist({
        input: {
          bookId: book2.id,
          bookshelfId: bookshelf2.id,
        },
      });

      const userBooks = await userBookRepository.findUserBooks({
        userId: user.id,
        bookId: book2.id,
        isbn: book2.isbn as string,
        page: 1,
        pageSize: 10,
      });

      expect(userBooks.length).toEqual(1);

      expect(userBooks[0]?.id).toEqual(userBook.id);
    });

    it('returns UserBooks by User and title', async () => {
      const user1 = await userTestUtils.createAndPersist();

      const user2 = await userTestUtils.createAndPersist();

      const author = await authorTestUtils.createAndPersist();

      const book1 = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author.id],
          book: {
            title: 'Lord of the Rings',
          },
        },
      });

      const book2 = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author.id],
          book: {
            title: 'Lord of the Flies',
          },
        },
      });

      const bookshelf1 = await bookshelfTestUtils.createAndPersist({
        input: {
          userId: user1.id,
        },
      });

      const bookshelf2 = await bookshelfTestUtils.createAndPersist({
        input: {
          userId: user2.id,
        },
      });

      const userBook = await userBookTestUtils.createAndPersist({
        input: {
          bookId: book1.id,
          bookshelfId: bookshelf1.id,
        },
      });

      await userBookTestUtils.createAndPersist({
        input: {
          bookId: book1.id,
          bookshelfId: bookshelf2.id,
        },
      });

      await userBookTestUtils.createAndPersist({
        input: {
          bookId: book2.id,
          bookshelfId: bookshelf2.id,
        },
      });

      const userBooks = await userBookRepository.findUserBooks({
        userId: user1.id,
        title: 'lord',
        page: 1,
        pageSize: 10,
      });

      expect(userBooks.length).toEqual(1);

      expect(userBooks[0]?.id).toEqual(userBook.id);
    });

    it('returns UserBooks by author id', async () => {
      const user = await userTestUtils.createAndPersist();

      const author1 = await authorTestUtils.createAndPersist();

      const author2 = await authorTestUtils.createAndPersist();

      const book1 = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author1.id],
        },
      });

      const book2 = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author2.id],
        },
      });

      const bookshelf = await bookshelfTestUtils.createAndPersist({
        input: {
          userId: user.id,
        },
      });

      await userBookTestUtils.createAndPersist({
        input: {
          bookId: book1.id,
          bookshelfId: bookshelf.id,
        },
      });

      await userBookTestUtils.createAndPersist({
        input: {
          bookId: book1.id,
          bookshelfId: bookshelf.id,
        },
      });

      const userBook3 = await userBookTestUtils.createAndPersist({
        input: {
          bookId: book2.id,
          bookshelfId: bookshelf.id,
        },
      });

      const userBooks = await userBookRepository.findUserBooks({
        userId: user.id,
        authorId: author2.id,
        page: 1,
        pageSize: 10,
      });

      expect(userBooks.length).toEqual(1);

      userBooks.forEach((userBook) => {
        expect(userBook.id).toEqual(userBook3.id);
      });
    });
  });

  describe('countUserBooks', () => {
    it('returns number of UserBooks from a given Bookshelf', async () => {
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

      const author1 = await authorTestUtils.createAndPersist();

      const author2 = await authorTestUtils.createAndPersist();

      const book1 = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author1.id],
        },
      });

      const book2 = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author2.id],
        },
      });

      await userBookTestUtils.createAndPersist({
        input: {
          bookId: book1.id,
          bookshelfId: bookshelf1.id,
        },
      });

      await userBookTestUtils.createAndPersist({
        input: {
          bookId: book1.id,
          bookshelfId: bookshelf2.id,
        },
      });

      await userBookTestUtils.createAndPersist({
        input: {
          bookId: book2.id,
          bookshelfId: bookshelf2.id,
        },
      });

      const count = await userBookRepository.countUserBooks({
        bookshelfId: bookshelf2.id,
      });

      expect(count).toEqual(2);
    });

    it('returns number of UserBooks from a given Collection', async () => {
      const user = await userTestUtils.createAndPersist();

      const collection1 = await collectionTestUtils.createAndPersist({
        input: {
          userId: user.id,
        },
      });

      const collection2 = await collectionTestUtils.createAndPersist({
        input: {
          userId: user.id,
        },
      });

      const bookshelf = await bookshelfTestUtils.createAndPersist({
        input: {
          userId: user.id,
        },
      });

      const author1 = await authorTestUtils.createAndPersist();

      const author2 = await authorTestUtils.createAndPersist();

      const book1 = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author1.id],
        },
      });

      const book2 = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author2.id],
        },
      });

      await userBookTestUtils.createAndPersist({
        input: {
          bookId: book1.id,
          bookshelfId: bookshelf.id,
        },
      });

      await userBookTestUtils.createAndPersist({
        input: {
          bookId: book1.id,
          bookshelfId: bookshelf.id,
        },
        collectionIds: [collection1.id],
      });

      await userBookTestUtils.createAndPersist({
        input: {
          bookId: book2.id,
          bookshelfId: bookshelf.id,
        },
        collectionIds: [collection2.id],
      });

      const count = await userBookRepository.countUserBooks({
        collectionId: collection1.id,
      });

      expect(count).toEqual(1);
    });

    it('returns number of UserBooks by author id', async () => {
      const user = await userTestUtils.createAndPersist();

      const author1 = await authorTestUtils.createAndPersist();

      const author2 = await authorTestUtils.createAndPersist();

      const book1 = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author1.id],
        },
      });

      const book2 = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author2.id],
        },
      });

      const bookshelf = await bookshelfTestUtils.createAndPersist({
        input: {
          userId: user.id,
        },
      });

      await userBookTestUtils.createAndPersist({
        input: {
          bookId: book1.id,
          bookshelfId: bookshelf.id,
        },
      });

      await userBookTestUtils.createAndPersist({
        input: {
          bookId: book1.id,
          bookshelfId: bookshelf.id,
        },
      });

      await userBookTestUtils.createAndPersist({
        input: {
          bookId: book2.id,
          bookshelfId: bookshelf.id,
        },
      });

      const count = await userBookRepository.countUserBooks({
        userId: user.id,
        authorId: author1.id,
      });

      expect(count).toEqual(2);
    });

    it('sorts UserBooks by default order', async () => {
      const user = await userTestUtils.createAndPersist();

      const bookshelf = await bookshelfTestUtils.createAndPersist({
        input: {
          userId: user.id,
        },
      });

      const author = await authorTestUtils.createAndPersist();

      const book1 = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author.id],
        },
      });

      const book2 = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author.id],
        },
      });

      const userBook1 = await userBookTestUtils.createAndPersist({
        input: {
          bookId: book1.id,
          bookshelfId: bookshelf.id,
        },
      });

      const userBook2 = await userBookTestUtils.createAndPersist({
        input: {
          bookId: book2.id,
          bookshelfId: bookshelf.id,
        },
      });

      const userBooks = await userBookRepository.findUserBooks({
        userId: user.id,
        page: 1,
        pageSize: 10,
      });

      expect(userBooks.length).toEqual(2);

      expect(userBooks[0]?.id).toEqual(userBook2.id);

      expect(userBooks[1]?.id).toEqual(userBook1.id);
    });

    it('sorts UserBooks by createdAt', async () => {
      const user = await userTestUtils.createAndPersist();

      const bookshelf = await bookshelfTestUtils.createAndPersist({
        input: {
          userId: user.id,
        },
      });

      const author = await authorTestUtils.createAndPersist();

      const book1 = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author.id],
        },
      });

      const book2 = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author.id],
        },
      });

      const userBook1 = await userBookTestUtils.createAndPersist({
        input: {
          bookId: book1.id,
          bookshelfId: bookshelf.id,
        },
      });

      const userBook2 = await userBookTestUtils.createAndPersist({
        input: {
          bookId: book2.id,
          bookshelfId: bookshelf.id,
        },
      });

      const userBooks1 = await userBookRepository.findUserBooks({
        userId: user.id,
        page: 1,
        pageSize: 10,
        sortField: 'createdAt',
        sortOrder: 'desc',
      });

      expect(userBooks1.length).toEqual(2);

      expect(userBooks1[0]?.id).toEqual(userBook2.id);

      expect(userBooks1[1]?.id).toEqual(userBook1.id);

      const userBooks2 = await userBookRepository.findUserBooks({
        userId: user.id,
        page: 1,
        pageSize: 10,
        sortField: 'createdAt',
        sortOrder: 'asc',
      });

      expect(userBooks2.length).toEqual(2);

      expect(userBooks2[0]?.id).toEqual(userBook1.id);

      expect(userBooks2[1]?.id).toEqual(userBook2.id);
    });

    it('sorts UserBooks by releaseYear', async () => {
      const user = await userTestUtils.createAndPersist();

      const bookshelf = await bookshelfTestUtils.createAndPersist({
        input: {
          userId: user.id,
        },
      });

      const author = await authorTestUtils.createAndPersist();

      const book1 = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author.id],
          book: {
            releaseYear: 2000,
          },
        },
      });

      const book2 = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author.id],
          book: {
            releaseYear: 2005,
          },
        },
      });

      const userBook1 = await userBookTestUtils.createAndPersist({
        input: {
          bookId: book1.id,
          bookshelfId: bookshelf.id,
        },
      });

      const userBook2 = await userBookTestUtils.createAndPersist({
        input: {
          bookId: book2.id,
          bookshelfId: bookshelf.id,
        },
      });

      const userBooks1 = await userBookRepository.findUserBooks({
        userId: user.id,
        page: 1,
        pageSize: 10,
        sortField: 'releaseYear',
        sortOrder: 'desc',
      });

      expect(userBooks1.length).toEqual(2);

      expect(userBooks1[0]?.id).toEqual(userBook2.id);

      expect(userBooks1[1]?.id).toEqual(userBook1.id);

      const userBooks2 = await userBookRepository.findUserBooks({
        userId: user.id,
        page: 1,
        pageSize: 10,
        sortField: 'releaseYear',
        sortOrder: 'asc',
      });

      expect(userBooks2.length).toEqual(2);

      expect(userBooks2[0]?.id).toEqual(userBook1.id);

      expect(userBooks2[1]?.id).toEqual(userBook2.id);
    });

    it('sorts UserBooks by latest reading date', async () => {
      const user = await userTestUtils.createAndPersist();

      const bookshelf = await bookshelfTestUtils.createAndPersist({
        input: {
          userId: user.id,
        },
      });

      const author = await authorTestUtils.createAndPersist();

      const book1 = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author.id],
        },
      });

      const book2 = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author.id],
        },
      });

      const userBook1 = await userBookTestUtils.createAndPersist({
        input: {
          bookId: book1.id,
          bookshelfId: bookshelf.id,
        },
      });

      const userBook2 = await userBookTestUtils.createAndPersist({
        input: {
          bookId: book2.id,
          bookshelfId: bookshelf.id,
        },
      });

      await bookReadingTestUtils.createAndPersist({
        input: {
          userBookId: userBook1.id,
          endedAt: new Date('2023-01-01'),
        },
      });

      await bookReadingTestUtils.createAndPersist({
        input: {
          userBookId: userBook2.id,
          endedAt: new Date('2025-01-22'),
        },
      });

      await userBookRepository.findUserBooks({
        userId: user.id,
        page: 1,
        pageSize: 10,
        sortField: 'readingDate',
        sortOrder: 'desc',
      })

      const userBooks = await userBookRepository.findUserBooks({
        userId: user.id,
        page: 1,
        pageSize: 10,
        sortField: 'readingDate',
        sortOrder: 'desc',
      });

      expect(userBooks.length).toEqual(2);

      expect(userBooks[0]?.id).toEqual(userBook2.id);

      expect(userBooks[1]?.id).toEqual(userBook1.id);

      const userBooks2 = await userBookRepository.findUserBooks({
        userId: user.id,
        page: 1,
        pageSize: 10,
        sortField: 'readingDate',
        sortOrder: 'asc',
      });

      expect(userBooks2.length).toEqual(2);

      expect(userBooks2[0]?.id).toEqual(userBook1.id);

      expect(userBooks2[1]?.id).toEqual(userBook2.id);
    });

    it('sorts UserBooks by latest rating', async () => {
      const user = await userTestUtils.createAndPersist();

      const bookshelf = await bookshelfTestUtils.createAndPersist({
        input: {
          userId: user.id,
        },
      });

      const author = await authorTestUtils.createAndPersist();

      const book1 = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author.id],
        },
      });

      const book2 = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author.id],
        },
      });

      const userBook1 = await userBookTestUtils.createAndPersist({
        input: {
          bookId: book1.id,
          bookshelfId: bookshelf.id,
        },
      });

      const userBook2 = await userBookTestUtils.createAndPersist({
        input: {
          bookId: book2.id,
          bookshelfId: bookshelf.id,
        },
      });

      await bookReadingTestUtils.createAndPersist({
        input: {
          userBookId: userBook1.id,
          endedAt: new Date('2023-01-01'),
          rating: 5,
        },
      });

      await bookReadingTestUtils.createAndPersist({
        input: {
          userBookId: userBook1.id,
          endedAt: new Date('2023-02-05'),
          rating: 7,
        },
      });

      await bookReadingTestUtils.createAndPersist({
        input: {
          userBookId: userBook2.id,
          endedAt: new Date('2023-02-02'),
          rating: 3,
        },
      });

      await bookReadingTestUtils.createAndPersist({
        input: {
          userBookId: userBook2.id,
          endedAt: new Date('2023-02-07'),
          rating: 2,
        },
      });

      const userBooks1 = await userBookRepository.findUserBooks({
        userId: user.id,
        page: 1,
        pageSize: 10,
        sortField: 'rating',
        sortOrder: 'desc',
      });

      expect(userBooks1.length).toEqual(2);

      expect(userBooks1[0]?.id).toEqual(userBook1.id);

      expect(userBooks1[0]?.latestReading).toEqual(7);

      expect(userBooks1[1]?.id).toEqual(userBook2.id);

      expect(userBooks1[1]?.latestReading).toEqual(2);

      const userBooks2 = await userBookRepository.findUserBooks({
        userId: user.id,
        page: 1,
        pageSize: 10,
        sortField: 'rating',
        sortOrder: 'asc',
      });

      expect(userBooks2.length).toEqual(2);

      expect(userBooks2[0]?.id).toEqual(userBook2.id);

      expect(userBooks2[0]?.latestReading).toEqual(2);

      expect(userBooks2[1]?.id).toEqual(userBook1.id);

      expect(userBooks2[1]?.latestReading).toEqual(7);
    });
  });

  describe('findUserBookOwner', () => {
    it('returns UserBook owner', async () => {
      const user = await userTestUtils.createAndPersist();

      const bookshelf = await bookshelfTestUtils.createAndPersist({
        input: {
          userId: user.id,
        },
      });

      const author = await authorTestUtils.createAndPersist();

      const book = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author.id],
        },
      });

      const userBook = await userBookTestUtils.createAndPersist({
        input: {
          bookId: book.id,
          bookshelfId: bookshelf.id,
        },
      });

      const { userId } = await userBookRepository.findUserBookOwner({
        id: userBook.id,
      });

      expect(userId).toEqual(user.id);
    });

    it('returns undefined if UserBook with given id does not exist', async () => {
      const id = Generator.uuid();

      const foundUserBookOwner = await userBookRepository.findUserBookOwner({
        id,
      });

      expect(foundUserBookOwner.userId).toBeUndefined();
    });
  });

  describe('deleteUserBook', () => {
    it('deletes UserBook', async () => {
      const user = await userTestUtils.createAndPersist();

      const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

      const author = await authorTestUtils.createAndPersist();

      const book = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author.id],
        },
      });

      const userBook = await userBookTestUtils.createAndPersist({
        input: {
          bookId: book.id,
          bookshelfId: bookshelf.id,
        },
      });

      await userBookRepository.deleteUserBooks({ ids: [userBook.id] });

      const foundUserBook = await bookTestUtils.findById({ id: userBook.id });

      expect(foundUserBook).toBeUndefined();
    });
  });
});
