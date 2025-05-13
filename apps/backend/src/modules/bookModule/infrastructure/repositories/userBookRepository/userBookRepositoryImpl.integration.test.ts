import { beforeEach, afterEach, expect, describe, it } from 'vitest';

import { Generator } from '../../../../../../tests/generator.js';
import { testSymbols } from '../../../../../../tests/symbols.js';
import { TestContainer } from '../../../../../../tests/testContainer.js';
import { type TestUtils } from '../../../../../../tests/testUtils.js';
import { type BookshelfTestUtils } from '../../../../bookshelfModule/tests/utils/bookshelfTestUtils/bookshelfTestUtils.js';
import { databaseSymbols } from '../../../../databaseModule/symbols.js';
import { type DatabaseClient } from '../../../../databaseModule/types/databaseClient.js';
import { type UserTestUtils } from '../../../../userModule/tests/utils/userTestUtils/userTestUtils.js';
import { Author } from '../../../domain/entities/author/author.js';
import { BookReading } from '../../../domain/entities/bookReading/bookReading.js';
import { Category } from '../../../domain/entities/category/category.js';
import { UserBook } from '../../../domain/entities/userBook/userBook.js';
import { type UserBookRepository } from '../../../domain/repositories/userBookRepository/userBookRepository.js';
import { symbols } from '../../../symbols.js';
import { UserBookTestFactory } from '../../../tests/factories/userBookTestFactory/userBookTestFactory.js';
import { type AuthorTestUtils } from '../../../tests/utils/authorTestUtils/authorTestUtils.js';
import { type BookReadingTestUtils } from '../../../tests/utils/bookReadingTestUtils/bookReadingTestUtils.js';
import { type BookTestUtils } from '../../../tests/utils/bookTestUtils/bookTestUtils.js';
import { type CategoryTestUtils } from '../../../tests/utils/categoryTestUtils/categoryTestUtils.js';
import { type TestDataOrchestrator } from '../../../tests/utils/testDataOrchestrator/testDataOrchestrator.js';
import { type UserBookTestUtils } from '../../../tests/utils/userBookTestUtils/userBookTestUtils.js';

describe('UserBookRepositoryImpl', () => {
  let userBookRepository: UserBookRepository;

  let databaseClient: DatabaseClient;

  let bookTestUtils: BookTestUtils;

  let authorTestUtils: AuthorTestUtils;

  let userTestUtils: UserTestUtils;

  let bookshelfTestUtils: BookshelfTestUtils;

  let categoryTestUtils: CategoryTestUtils;

  let userBookTestUtils: UserBookTestUtils;

  let bookReadingTestUtils: BookReadingTestUtils;

  const userBookTestFactory = new UserBookTestFactory();

  let testDataOrchestrator: TestDataOrchestrator;

  const testUserId = Generator.uuid();

  let testUtils: TestUtils[];

  beforeEach(async () => {
    const container = await TestContainer.create();

    userBookRepository = container.get<UserBookRepository>(symbols.userBookRepository);

    databaseClient = container.get<DatabaseClient>(databaseSymbols.databaseClient);

    bookTestUtils = container.get<BookTestUtils>(testSymbols.bookTestUtils);

    authorTestUtils = container.get<AuthorTestUtils>(testSymbols.authorTestUtils);

    userTestUtils = container.get<UserTestUtils>(testSymbols.userTestUtils);

    bookshelfTestUtils = container.get<BookshelfTestUtils>(testSymbols.bookshelfTestUtils);

    categoryTestUtils = container.get<CategoryTestUtils>(testSymbols.categoryTestUtils);

    userBookTestUtils = container.get<UserBookTestUtils>(testSymbols.userBookTestUtils);

    bookReadingTestUtils = container.get<BookReadingTestUtils>(testSymbols.bookReadingTestUtils);

    testDataOrchestrator = container.get<TestDataOrchestrator>(testSymbols.testDataOrchestrator);

    testUtils = [
      authorTestUtils,
      bookTestUtils,
      bookshelfTestUtils,
      userTestUtils,
      categoryTestUtils,
      userBookTestUtils,
      bookReadingTestUtils,
    ];

    for (const testUtil of testUtils) {
      await testUtil.truncate();
    }

    await testDataOrchestrator.cleanup();

    await userTestUtils.createAndPersist({
      input: {
        id: testUserId,
      },
    });

    testDataOrchestrator.userId = testUserId;
  });

  afterEach(async () => {
    for (const testUtil of testUtils) {
      await testUtil.truncate();
    }

    await databaseClient.destroy();
  });

  describe('saveUserBook', () => {
    it('creates UserBook', async () => {
      const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { user_id: testUserId } });

      const author = await authorTestUtils.createAndPersist();

      const book = await testDataOrchestrator.createBook(author.id);

      const userBookRawEntity = userBookTestFactory.createRaw({
        book_id: book.id,
        bookshelf_id: bookshelf.id,
      });

      const userBook = await userBookRepository.saveUserBook({
        userBook: {
          bookId: userBookRawEntity.book_id,
          bookshelfId: userBookRawEntity.bookshelf_id,
          status: userBookRawEntity.status,
          isFavorite: userBookRawEntity.is_favorite,
          imageUrl: userBookRawEntity.image_url as string,
          createdAt: userBookRawEntity.created_at,
        },
      });

      const foundUserBook = await userBookTestUtils.findById({
        id: userBook.id,
      });

      expect(userBook.getState()).toEqual({
        bookId: userBookRawEntity.book_id,
        bookshelfId: userBookRawEntity.bookshelf_id,
        status: userBookRawEntity.status,
        imageUrl: userBookRawEntity.image_url,
        isFavorite: userBookRawEntity.is_favorite,
        createdAt: userBookRawEntity.created_at,
        book: {
          id: book.id,
          title: book.title,
          isbn: book.isbn,
          publisher: book.publisher,
          releaseYear: book.release_year,
          language: book.language,
          translator: book.translator,
          format: book.format,
          pages: book.pages,
          isApproved: book.is_approved,
          imageUrl: book.image_url,
          categoryId: expect.any(String),
          category: new Category({
            id: expect.any(String),
            name: expect.any(String),
          }),
          authors: [new Author({ id: author.id, name: author.name, isApproved: author.is_approved })],
        },
      });

      expect(foundUserBook).toEqual({
        id: userBook.id,
        book_id: userBookRawEntity.book_id,
        bookshelf_id: userBookRawEntity.bookshelf_id,
        created_at: userBookRawEntity.created_at,
        status: userBookRawEntity.status,
        is_favorite: userBookRawEntity.is_favorite,
        image_url: userBookRawEntity.image_url,
      });
    });

    it('updates UserBook bookshelf', async () => {
      const bookshelf1 = await bookshelfTestUtils.createAndPersist({ input: { user_id: testUserId } });

      const bookshelf2 = await bookshelfTestUtils.createAndPersist({ input: { user_id: testUserId } });

      const author = await authorTestUtils.createAndPersist();

      const book = await testDataOrchestrator.createBook(author.id);

      const userBookRawEntity = await userBookTestUtils.createAndPersist({
        input: {
          book_id: book.id,
          bookshelf_id: bookshelf1.id,
        },
      });

      const userBook = userBookTestFactory.create({
        id: userBookRawEntity.id,
        bookId: userBookRawEntity.book_id,
        bookshelfId: userBookRawEntity.bookshelf_id,
        createdAt: userBookRawEntity.created_at,
        isFavorite: userBookRawEntity.is_favorite,
        status: userBookRawEntity.status,
        imageUrl: userBookRawEntity.image_url,
      });

      const newBookshelfId = bookshelf2.id;

      userBook.bookshelfId = { bookshelfId: newBookshelfId };

      const updatedUserBook = await userBookRepository.saveUserBook({ userBook });

      const foundUserBook = await userBookTestUtils.findById({ id: userBook.id });

      expect(updatedUserBook.getState()).toEqual({
        bookId: userBook.bookId,
        bookshelfId: newBookshelfId,
        status: userBook.status,
        isFavorite: userBook.isFavorite,
        imageUrl: userBook.imageUrl,
        createdAt: userBook.createdAt,
        book: {
          id: book.id,
          title: book.title,
          isbn: book.isbn,
          category: new Category({
            id: expect.any(String),
            name: expect.any(String),
          }),
          categoryId: expect.any(String),
          publisher: book.publisher,
          releaseYear: book.release_year,
          language: book.language,
          translator: book.translator,
          format: book.format,
          pages: book.pages,
          isApproved: book.is_approved,
          imageUrl: book.image_url,
          authors: [
            new Author({
              id: author.id,
              name: author.name,
              isApproved: author.is_approved,
            }),
          ],
        },
      });

      expect(foundUserBook).toEqual({
        id: userBook.id,
        book_id: userBook.bookId,
        bookshelf_id: newBookshelfId,
        status: userBook.status,
        is_favorite: userBook.isFavorite,
        image_url: userBook.imageUrl,
        created_at: userBook.createdAt,
      });
    });

    it('updates UserBook status', async () => {
      const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { user_id: testUserId } });

      const author = await authorTestUtils.createAndPersist();

      const book = await testDataOrchestrator.createBook(author.id);

      const userBookRawEntity = await userBookTestUtils.createAndPersist({
        input: {
          book_id: book.id,
          bookshelf_id: bookshelf.id,
        },
      });

      const userBook = userBookTestFactory.create({
        id: userBookRawEntity.id,
        bookId: userBookRawEntity.book_id,
        bookshelfId: userBookRawEntity.bookshelf_id,
        createdAt: userBookRawEntity.created_at,
        isFavorite: userBookRawEntity.is_favorite,
        status: userBookRawEntity.status,
        imageUrl: userBookRawEntity.image_url,
      });

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
      const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { user_id: testUserId } });

      const author = await authorTestUtils.createAndPersist();

      const book = await testDataOrchestrator.createBook(author.id);

      const userBookRawEntity = await userBookTestUtils.createAndPersist({
        input: {
          book_id: book.id,
          bookshelf_id: bookshelf.id,
        },
      });

      const userBook = userBookTestFactory.create({
        id: userBookRawEntity.id,
        bookId: userBookRawEntity.book_id,
        bookshelfId: userBookRawEntity.bookshelf_id,
        createdAt: userBookRawEntity.created_at,
        isFavorite: userBookRawEntity.is_favorite,
        status: userBookRawEntity.status,
        imageUrl: userBookRawEntity.image_url,
      });

      const newImageUrl = Generator.imageUrl();

      userBook.imageUrl = { imageUrl: newImageUrl };

      const updatedUserBook = await userBookRepository.saveUserBook({
        userBook,
      });

      const foundUserBook = await userBookTestUtils.findById({
        id: userBook.id,
      });

      expect(updatedUserBook.imageUrl).toEqual(newImageUrl);

      expect(foundUserBook?.image_url).toEqual(newImageUrl);
    });

    it('deletes UserBook image', async () => {
      const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { user_id: testUserId } });

      const author = await authorTestUtils.createAndPersist();

      const book = await testDataOrchestrator.createBook(author.id);

      const userBookRawEntity = await userBookTestUtils.createAndPersist({
        input: {
          book_id: book.id,
          bookshelf_id: bookshelf.id,
        },
      });

      const userBook = userBookTestFactory.create({
        id: userBookRawEntity.id,
        bookId: userBookRawEntity.book_id,
        bookshelfId: userBookRawEntity.bookshelf_id,
        createdAt: userBookRawEntity.created_at,
        isFavorite: userBookRawEntity.is_favorite,
        status: userBookRawEntity.status,
        imageUrl: userBookRawEntity.image_url,
      });

      const newImageUrl = null;

      userBook.imageUrl = { imageUrl: newImageUrl };

      const updatedUserBook = await userBookRepository.saveUserBook({
        userBook,
      });

      const foundUserBook = await userBookTestUtils.findById({
        id: userBook.id,
      });

      expect(updatedUserBook.imageUrl).toBeUndefined();

      expect(foundUserBook?.image_url).toBeNull();
    });

    it('updates UserBook favorite status', async () => {
      const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { user_id: testUserId } });

      const author = await authorTestUtils.createAndPersist();

      const book = await testDataOrchestrator.createBook(author.id);

      const userBookRawEntity = await userBookTestUtils.createAndPersist({
        input: {
          book_id: book.id,
          bookshelf_id: bookshelf.id,
        },
      });

      const userBook = userBookTestFactory.create({
        id: userBookRawEntity.id,
        bookId: userBookRawEntity.book_id,
        bookshelfId: userBookRawEntity.bookshelf_id,
        createdAt: userBookRawEntity.created_at,
        isFavorite: userBookRawEntity.is_favorite,
        status: userBookRawEntity.status,
        imageUrl: userBookRawEntity.image_url,
      });

      const newIsFavorite = Generator.boolean();

      userBook.isFavorite = { isFavorite: newIsFavorite };

      const updatedUserBook = await userBookRepository.saveUserBook({
        userBook,
      });

      const foundUserBook = await userBookTestUtils.findById({
        id: userBook.id,
      });

      expect(updatedUserBook.isFavorite).toEqual(newIsFavorite);

      expect(foundUserBook?.is_favorite).toEqual(newIsFavorite);
    });
  });

  describe('saveUserBooks', () => {
    it('updates UserBooks bookshelves', async () => {
      const bookshelf1 = await bookshelfTestUtils.createAndPersist({ input: { user_id: testUserId } });

      const bookshelf2 = await bookshelfTestUtils.createAndPersist({ input: { user_id: testUserId } });

      const author = await authorTestUtils.createAndPersist();

      const book1 = await testDataOrchestrator.createBook(author.id);

      const book2 = await testDataOrchestrator.createBook(author.id);

      const userBookRawEntity1 = await userBookTestUtils.createAndPersist({
        input: {
          book_id: book1.id,
          bookshelf_id: bookshelf1.id,
        },
      });

      const userBookRawEntity2 = await userBookTestUtils.createAndPersist({
        input: {
          book_id: book2.id,
          bookshelf_id: bookshelf1.id,
        },
      });

      const userBook1 = new UserBook({
        id: userBookRawEntity1.id,
        bookId: userBookRawEntity1.book_id,
        bookshelfId: userBookRawEntity1.bookshelf_id,
        createdAt: userBookRawEntity1.created_at,
        isFavorite: userBookRawEntity1.is_favorite,
        status: userBookRawEntity1.status,
        imageUrl: userBookRawEntity1.image_url,
      });

      const userBook2 = new UserBook({
        id: userBookRawEntity2.id,
        bookId: userBookRawEntity2.book_id,
        bookshelfId: userBookRawEntity2.bookshelf_id,
        createdAt: userBookRawEntity2.created_at,
        isFavorite: userBookRawEntity2.is_favorite,
        status: userBookRawEntity2.status,
        imageUrl: userBookRawEntity2.image_url,
      });

      userBook1.bookshelfId = { bookshelfId: bookshelf2.id };

      userBook2.bookshelfId = { bookshelfId: bookshelf2.id };

      await userBookRepository.saveUserBooks({
        userBooks: [userBook1, userBook2],
      });

      const foundUserBooks = await userBookTestUtils.findByIds({ ids: [userBook1.id, userBook2.id] });

      expect(foundUserBooks.length).toEqual(2);

      foundUserBooks.forEach((foundUserBook) => {
        expect(foundUserBook.bookshelf_id).toEqual(bookshelf2.id);
      });
    });
  });

  describe('findUserBook', () => {
    it('finds UserBook by id', async () => {
      const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { user_id: testUserId } });

      const author = await authorTestUtils.createAndPersist();

      const book = await testDataOrchestrator.createBook(author.id);

      const userBookRawEntity = await userBookTestUtils.createAndPersist({
        input: {
          book_id: book.id,
          bookshelf_id: bookshelf.id,
        },
      });

      const userBook = userBookTestFactory.create({
        id: userBookRawEntity.id,
        bookId: userBookRawEntity.book_id,
        bookshelfId: userBookRawEntity.bookshelf_id,
        createdAt: userBookRawEntity.created_at,
        isFavorite: userBookRawEntity.is_favorite,
        status: userBookRawEntity.status,
        imageUrl: userBookRawEntity.image_url,
      });

      const bookReading = await bookReadingTestUtils.createAndPersist({
        input: {
          user_book_id: userBook.id,
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
        book: {
          id: book.id,
          title: book.title,
          isbn: book.isbn,
          category: new Category({
            id: expect.any(String),
            name: expect.any(String),
          }),
          categoryId: expect.any(String),
          publisher: book.publisher,
          releaseYear: book.release_year,
          language: book.language,
          translator: book.translator,
          format: book.format,
          pages: book.pages,
          isApproved: book.is_approved,
          imageUrl: book.image_url,
          authors: [
            new Author({
              id: author.id,
              name: author.name,
              isApproved: author.is_approved,
            }),
          ],
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
      const bookshelf1 = await bookshelfTestUtils.createAndPersist({
        input: {
          user_id: testUserId,
        },
      });

      const bookshelf2 = await bookshelfTestUtils.createAndPersist({
        input: {
          user_id: testUserId,
        },
      });

      const author1 = await authorTestUtils.createAndPersist();

      const author2 = await authorTestUtils.createAndPersist();

      const book1 = await testDataOrchestrator.createBook(author1.id);

      const book2 = await testDataOrchestrator.createBook(author2.id);

      await userBookTestUtils.createAndPersist({
        input: {
          book_id: book1.id,
          bookshelf_id: bookshelf1.id,
        },
      });

      const userBook2 = await userBookTestUtils.createAndPersist({
        input: {
          book_id: book1.id,
          bookshelf_id: bookshelf2.id,
        },
      });

      const userBook3 = await userBookTestUtils.createAndPersist({
        input: {
          book_id: book2.id,
          bookshelf_id: bookshelf2.id,
        },
      });

      const bookReading1 = await bookReadingTestUtils.createAndPersist({
        input: {
          user_book_id: userBook2.id,
          ended_at: new Date('2023-01-01'),
        },
      });

      await bookReadingTestUtils.createAndPersist({
        input: {
          user_book_id: userBook2.id,
          ended_at: new Date('2022-01-01'),
        },
      });

      const bookReading2 = await bookReadingTestUtils.createAndPersist({
        input: {
          user_book_id: userBook3.id,
          ended_at: new Date('2025-01-22'),
        },
      });

      await bookReadingTestUtils.createAndPersist({
        input: {
          user_book_id: userBook3.id,
          ended_at: new Date('2025-01-21'),
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

    it('returns UserBooks by ISBN', async () => {
      const bookshelf = await bookshelfTestUtils.createAndPersist({
        input: {
          user_id: testUserId,
        },
      });

      const author1 = await authorTestUtils.createAndPersist();

      const author2 = await authorTestUtils.createAndPersist();

      const book1 = await testDataOrchestrator.createBook(author1.id);

      const book2 = await testDataOrchestrator.createBook(author2.id);

      await userBookTestUtils.createAndPersist({
        input: {
          book_id: book1.id,
          bookshelf_id: bookshelf.id,
        },
      });

      const userBook2 = await userBookTestUtils.createAndPersist({
        input: {
          book_id: book2.id,
          bookshelf_id: bookshelf.id,
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
      const user2 = await userTestUtils.createAndPersist();

      const bookshelf1 = await bookshelfTestUtils.createAndPersist({
        input: {
          user_id: testUserId,
        },
      });

      const bookshelf2 = await bookshelfTestUtils.createAndPersist({
        input: {
          user_id: user2.id,
        },
      });

      const author1 = await authorTestUtils.createAndPersist();

      const author2 = await authorTestUtils.createAndPersist();

      const book1 = await testDataOrchestrator.createBook(author1.id);

      const book2 = await testDataOrchestrator.createBook(author2.id);

      await userBookTestUtils.createAndPersist({
        input: {
          book_id: book1.id,
          bookshelf_id: bookshelf1.id,
        },
      });

      const userBook2 = await userBookTestUtils.createAndPersist({
        input: {
          book_id: book1.id,
          bookshelf_id: bookshelf2.id,
        },
      });

      const userBook3 = await userBookTestUtils.createAndPersist({
        input: {
          book_id: book2.id,
          bookshelf_id: bookshelf2.id,
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
      const author = await authorTestUtils.createAndPersist();

      const book1 = await testDataOrchestrator.createBook(author.id);

      const book2 = await testDataOrchestrator.createBook(author.id);

      const bookshelf1 = await bookshelfTestUtils.createAndPersist({
        input: {
          user_id: testUserId,
        },
      });

      const bookshelf2 = await bookshelfTestUtils.createAndPersist({
        input: {
          user_id: testUserId,
        },
      });

      await userBookTestUtils.createAndPersist({
        input: {
          book_id: book1.id,
          bookshelf_id: bookshelf1.id,
        },
      });

      await userBookTestUtils.createAndPersist({
        input: {
          book_id: book1.id,
          bookshelf_id: bookshelf2.id,
        },
      });

      const userBook = await userBookTestUtils.createAndPersist({
        input: {
          book_id: book2.id,
          bookshelf_id: bookshelf2.id,
        },
      });

      const userBooks = await userBookRepository.findUserBooks({
        userId: testUserId,
        bookId: book2.id,
        page: 1,
        pageSize: 10,
      });

      expect(userBooks.length).toEqual(1);

      expect(userBooks[0]?.id).toEqual(userBook.id);
    });

    it('returns UserBooks by User and ISBN', async () => {
      const bookId = Generator.uuid();

      const isbn = Generator.isbn();

      await testDataOrchestrator.createUserBook();

      const createdUserBook = await testDataOrchestrator.createUserBook({
        book: {
          book: {
            id: bookId,
            isbn,
          },
        },
      });

      await testDataOrchestrator.createUserBook();

      const userBooks = await userBookRepository.findUserBooks({
        userId: testUserId,
        bookId,
        isbn,
        page: 1,
        pageSize: 10,
      });

      expect(userBooks.length).toEqual(1);

      expect(userBooks[0]?.id).toEqual(createdUserBook.id);
    });

    it('returns UserBooks by User and title', async () => {
      const user2 = await userTestUtils.createAndPersist();

      const author = await authorTestUtils.createAndPersist();

      await testDataOrchestrator.createUserBook({
        book: {
          authorIds: [author.id],
          book: {
            title: 'Lord of the Rings',
          },
        },
        bookshelf: {
          input: {
            user_id: user2.id,
          },
        },
      });

      const userBook = await testDataOrchestrator.createUserBook({
        book: {
          authorIds: [author.id],
          book: {
            title: 'Lord of the Flies',
          },
        },
      });

      const userBooks = await userBookRepository.findUserBooks({
        userId: testUserId,
        title: 'lord',
        page: 1,
        pageSize: 10,
      });

      expect(userBooks.length).toEqual(1);

      expect(userBooks[0]?.id).toEqual(userBook.id);
    });

    it('returns UserBooks by author id', async () => {
      const author1 = await authorTestUtils.createAndPersist();

      const author2 = await authorTestUtils.createAndPersist();

      await testDataOrchestrator.createUserBook({
        book: {
          authorIds: [author1.id],
        },
      });

      await testDataOrchestrator.createUserBook({
        book: {
          authorIds: [author1.id],
        },
      });

      const userBook3 = await testDataOrchestrator.createUserBook({
        book: {
          authorIds: [author2.id],
        },
      });

      const userBooks = await userBookRepository.findUserBooks({
        userId: testUserId,
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
      const bookshelfId = Generator.uuid();

      await bookshelfTestUtils.createAndPersist({
        input: {
          user_id: testUserId,
        },
      });

      await testDataOrchestrator.createUserBook({
        bookshelf: {
          input: {
            id: bookshelfId,
          },
        },
      });

      await testDataOrchestrator.createUserBook({
        bookshelf: {
          input: {
            id: bookshelfId,
          },
        },
      });

      await testDataOrchestrator.createUserBook();

      const count = await userBookRepository.countUserBooks({
        bookshelfId,
      });

      expect(count).toEqual(2);
    });

    it('returns number of UserBooks by author id', async () => {
      const author1 = await authorTestUtils.createAndPersist();

      const author2 = await authorTestUtils.createAndPersist();

      await testDataOrchestrator.createUserBook({
        book: {
          authorIds: [author1.id],
        },
      });

      await testDataOrchestrator.createUserBook({
        book: {
          authorIds: [author1.id],
        },
      });

      await testDataOrchestrator.createUserBook({
        book: {
          authorIds: [author2.id],
        },
      });

      const count = await userBookRepository.countUserBooks({
        userId: testUserId,
        authorId: author1.id,
      });

      expect(count).toEqual(2);
    });

    it('sorts UserBooks by default order', async () => {
      const userBook1 = await testDataOrchestrator.createUserBook();

      const userBook2 = await testDataOrchestrator.createUserBook();

      const userBooks = await userBookRepository.findUserBooks({
        userId: testUserId,
        page: 1,
        pageSize: 10,
      });

      expect(userBooks.length).toEqual(2);

      expect(userBooks[0]?.id).toEqual(userBook2.id);

      expect(userBooks[1]?.id).toEqual(userBook1.id);
    });

    it('sorts UserBooks by createdAt', async () => {
      const userBook1 = await testDataOrchestrator.createUserBook();

      const userBook2 = await testDataOrchestrator.createUserBook();

      const userBooks1 = await userBookRepository.findUserBooks({
        userId: testUserId,
        page: 1,
        pageSize: 10,
        sortField: 'createdAt',
        sortOrder: 'desc',
      });

      expect(userBooks1.length).toEqual(2);

      expect(userBooks1[0]?.id).toEqual(userBook2.id);

      expect(userBooks1[1]?.id).toEqual(userBook1.id);

      const userBooks2 = await userBookRepository.findUserBooks({
        userId: testUserId,
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
      const userBook1 = await testDataOrchestrator.createUserBook({
        book: {
          book: {
            release_year: 2000,
          },
        },
      });

      const userBook2 = await testDataOrchestrator.createUserBook({
        book: {
          book: {
            release_year: 2005,
          },
        },
      });

      const userBooks1 = await userBookRepository.findUserBooks({
        userId: testUserId,
        page: 1,
        pageSize: 10,
        sortField: 'releaseYear',
        sortOrder: 'desc',
      });

      expect(userBooks1.length).toEqual(2);

      expect(userBooks1[0]?.id).toEqual(userBook2.id);

      expect(userBooks1[1]?.id).toEqual(userBook1.id);

      const userBooks2 = await userBookRepository.findUserBooks({
        userId: testUserId,
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
      const userBook1 = await testDataOrchestrator.createUserBook();

      const userBook2 = await testDataOrchestrator.createUserBook();

      await bookReadingTestUtils.createAndPersist({
        input: {
          user_book_id: userBook1.id,
          ended_at: new Date('2023-01-01'),
        },
      });

      await bookReadingTestUtils.createAndPersist({
        input: {
          user_book_id: userBook2.id,
          ended_at: new Date('2025-01-22'),
        },
      });

      await userBookRepository.findUserBooks({
        userId: testUserId,
        page: 1,
        pageSize: 10,
        sortField: 'readingDate',
        sortOrder: 'desc',
      });

      const userBooks = await userBookRepository.findUserBooks({
        userId: testUserId,
        page: 1,
        pageSize: 10,
        sortField: 'readingDate',
        sortOrder: 'desc',
      });

      expect(userBooks.length).toEqual(2);

      expect(userBooks[0]?.id).toEqual(userBook2.id);

      expect(userBooks[1]?.id).toEqual(userBook1.id);

      const userBooks2 = await userBookRepository.findUserBooks({
        userId: testUserId,
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
      const userBook1 = await testDataOrchestrator.createUserBook();

      const userBook2 = await testDataOrchestrator.createUserBook();

      await bookReadingTestUtils.createAndPersist({
        input: {
          user_book_id: userBook1.id,
          ended_at: new Date('2023-01-01'),
          rating: 5,
        },
      });

      await bookReadingTestUtils.createAndPersist({
        input: {
          user_book_id: userBook1.id,
          ended_at: new Date('2023-02-05'),
          rating: 7,
        },
      });

      await bookReadingTestUtils.createAndPersist({
        input: {
          user_book_id: userBook2.id,
          ended_at: new Date('2023-02-02'),
          rating: 3,
        },
      });

      await bookReadingTestUtils.createAndPersist({
        input: {
          user_book_id: userBook2.id,
          ended_at: new Date('2023-02-07'),
          rating: 2,
        },
      });

      const userBooks1 = await userBookRepository.findUserBooks({
        userId: testUserId,
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
        userId: testUserId,
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
      const userBook = await testDataOrchestrator.createUserBook();

      const { userId } = await userBookRepository.findUserBookOwner({
        id: userBook.id,
      });

      expect(userId).toEqual(testUserId);
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
      const userBook = await testDataOrchestrator.createUserBook();

      await userBookRepository.deleteUserBooks({ ids: [userBook.id] });

      const foundUserBook = await bookTestUtils.findById({ id: userBook.id });

      expect(foundUserBook).toBeUndefined();
    });
  });
});
