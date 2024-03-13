import { beforeEach, afterEach, expect, describe, it } from 'vitest';

import { BookFormat, BookStatus } from '@common/contracts';
import { Generator } from '@common/tests';

import { testSymbols } from '../../../../../../tests/container/symbols.js';
import { TestContainer } from '../../../../../../tests/container/testContainer.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import { type SqliteDatabaseClient } from '../../../../../core/database/sqliteDatabaseClient/sqliteDatabaseClient.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { type AuthorTestUtils } from '../../../../authorModule/tests/utils/authorTestUtils/authorTestUtils.js';
import { type BookshelfTestUtils } from '../../../../bookshelfModule/tests/utils/bookshelfTestUtils/bookshelfTestUtils.js';
import { type UserTestUtils } from '../../../../userModule/tests/utils/userTestUtils/userTestUtils.js';
import { Book } from '../../../domain/entities/book/book.js';
import { type UserBookRepository } from '../../../domain/repositories/userBookRepository/userBookRepository.js';
import { symbols } from '../../../symbols.js';
import { UserBookTestFactory } from '../../../tests/factories/userBookTestFactory/userBookTestFactory.js';
import { type BookTestUtils } from '../../../tests/utils/bookTestUtils/bookTestUtils.js';
import { type GenreTestUtils } from '../../../tests/utils/genreTestUtils/genreTestUtils.js';
import { type UserBookTestUtils } from '../../../tests/utils/userBookTestUtils/userBookTestUtils.js';

describe('UserBookRepositoryImpl', () => {
  let userBookRepository: UserBookRepository;

  let sqliteDatabaseClient: SqliteDatabaseClient;

  let bookTestUtils: BookTestUtils;

  let authorTestUtils: AuthorTestUtils;

  let userTestUtils: UserTestUtils;

  let bookshelfTestUtils: BookshelfTestUtils;

  let genreTestUtils: GenreTestUtils;

  let userBookTestUtils: UserBookTestUtils;

  const userBookTestFactory = new UserBookTestFactory();

  beforeEach(async () => {
    const container = TestContainer.create();

    userBookRepository = container.get<UserBookRepository>(symbols.userBookRepository);

    sqliteDatabaseClient = container.get<SqliteDatabaseClient>(coreSymbols.sqliteDatabaseClient);

    bookTestUtils = container.get<BookTestUtils>(testSymbols.bookTestUtils);

    authorTestUtils = container.get<AuthorTestUtils>(testSymbols.authorTestUtils);

    userTestUtils = container.get<UserTestUtils>(testSymbols.userTestUtils);

    bookshelfTestUtils = container.get<BookshelfTestUtils>(testSymbols.bookshelfTestUtils);

    genreTestUtils = container.get<GenreTestUtils>(testSymbols.genreTestUtils);

    userBookTestUtils = container.get<UserBookTestUtils>(testSymbols.userBookTestUtils);

    await authorTestUtils.truncate();

    await userBookTestUtils.truncate();

    await bookTestUtils.truncate();

    await bookshelfTestUtils.truncate();

    await userTestUtils.truncate();

    await genreTestUtils.truncate();
  });

  afterEach(async () => {
    await authorTestUtils.truncate();

    await userBookTestUtils.truncate();

    await bookTestUtils.truncate();

    await bookshelfTestUtils.truncate();

    await userTestUtils.truncate();

    await genreTestUtils.truncate();

    await sqliteDatabaseClient.destroy();
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
          imageUrl: userBookRawEntity.imageUrl as string,
        },
      });

      const foundUserBook = await userBookTestUtils.findById({
        id: userBook.getBookId(),
      });

      expect(userBook.getState()).toEqual({
        bookId: userBookRawEntity.bookId,
        bookshelfId: userBookRawEntity.bookshelfId,
        status: userBookRawEntity.status,
        imageUrl: userBookRawEntity.imageUrl,
        book: {
          title: book.title,
          isbn: book.isbn,
          publisher: book.publisher,
          releaseYear: book.releaseYear,
          language: book.language,
          translator: book.translator,
          format: book.format,
          pages: book.pages,
          authors: [author],
          genres: [],
        },
      });

      expect(foundUserBook).toEqual(userBookRawEntity);
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

      const userBook = userBookTestFactory.create({
        bookId: book.id,
        bookshelfId: bookshelf1.id,
      });

      const newImageUrl = Generator.imageUrl();

      const newStatus = BookStatus.finishedReading;

      const newBookshelfId = bookshelf2.id;

      userBook.setBookshelfId({ bookshelfId: newBookshelfId });

      const updatedUserBook = await userBookRepository.saveUserBook({
        userBook,
      });

      const foundUserBook = await userBookTestUtils.findById({
        id: userBook.getId(),
      });

      expect(updatedUserBook.getState()).toEqual({
        bookId: userBook.getBookId(),
        bookshelfId: newBookshelfId,
        status: userBook.getStatus(),
        imageUrl: userBook.getImageUrl(),
        book: {
          title: book.title,
          isbn: book.isbn,
          publisher: book.publisher,
          releaseYear: book.releaseYear,
          language: book.language,
          translator: book.translator,
          format: book.format,
          pages: book.pages,
          authors: [author],
          genres: [],
        },
      });

      expect(foundUserBook).toEqual({
        id: userBook.getId(),
        bookId: userBook.getBookId(),
        bookshelfId: newBookshelfId,
        status: userBook.getStatus(),
        imageUrl: userBook.getImageUrl(),
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

      const userBook = userBookTestFactory.create({
        bookId: book.id,
        bookshelfId: bookshelf.id,
      });

      const newStatus = Generator.bookReadingStatus() as BookStatus;

      userBook.setStatus({ status: newStatus });

      const updatedUserBook = await userBookRepository.saveUserBook({
        userBook,
      });

      const foundUserBook = await userBookTestUtils.findById({
        id: userBook.getId(),
      });

      expect(updatedUserBook.getStatus()).toEqual(newStatus);

      expect(foundUserBook.status).toEqual(newStatus);
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

      const userBook = userBookTestFactory.create({
        bookId: book.id,
        bookshelfId: bookshelf.id,
      });

      const newImageUrl = Generator.imageUrl();

      userBook.setImageUrl({ imageUrl: newImageUrl });

      const updatedUserBook = await userBookRepository.saveUserBook({
        userBook,
      });

      const foundUserBook = await userBookTestUtils.findById({
        id: userBook.getId(),
      });

      expect(updatedUserBook.getImageUrl()).toEqual(newImageUrl);

      expect(foundUserBook.imageUrl).toEqual(newImageUrl);
    });
  });

  describe('findUserBook', () => {
    it('finds UserBook by id', async () => {
      const user = await userTestUtils.createAndPersist();

      const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

      const author = await authorTestUtils.createAndPersist();

      const genre = await genreTestUtils.createAndPersist();

      const book = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author.id],
          genreIds: [genre.id],
        },
      });

      const userBook = userBookTestFactory.create({
        bookId: book.id,
        bookshelfId: bookshelf.id,
      });

      const foundUserBook = await userBookRepository.findUserBook({ id: userBook.id });

      expect(foundUserBook?.getId()).toEqual(userBook.getId());

      expect(foundUserBook?.getState()).toEqual({
        bookId: userBook.getBookId(),
        bookshelfId: userBook.getBookId(),
        status: userBook.getStatus(),
        imageUrl: userBook.getImageUrl(),
        book: {
          title: book.title,
          isbn: book.isbn,
          publisher: book.publisher,
          releaseYear: book.releaseYear,
          language: book.language,
          translator: book.translator,
          format: book.format,
          pages: book.pages,
          authors: [author],
          genres: [genre],
        },
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

      const userBooks = await userBookRepository.findUserBooks({
        ids: [],
        bookshelfId: bookshelf2.id,
      });

      expect(userBooks.length).toEqual(2);

      userBooks.forEach((userBook) => {
        expect(userBook.getId()).oneOf([userBook2.id, userBook3.id]);
      });
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

      await userBookRepository.deleteUserBook({ id: userBook.id });

      const foundBookBook = await bookTestUtils.findById({ id: userBook.id });

      expect(foundBookBook).toBeUndefined();
    });

    it('throws an error if UserBook with given id does not exist', async () => {
      const id = Generator.uuid();

      await expect(async () => await userBookRepository.deleteUserBook({ id })).toThrowErrorInstance({
        instance: ResourceNotFoundError,
        context: {
          name: 'UserBook',
          id,
        },
      });
    });
  });
});
