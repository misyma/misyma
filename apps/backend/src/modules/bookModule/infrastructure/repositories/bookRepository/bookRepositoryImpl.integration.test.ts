import { beforeEach, afterEach, expect, describe, it } from 'vitest';

import { BookFormat, BookStatus } from '@common/contracts';
import { Generator } from '@common/tests';

import { testSymbols } from '../../../../../../tests/container/symbols.js';
import { TestContainer } from '../../../../../../tests/container/testContainer.js';
import { ResourceNotFoundError } from '../../../../../common/errors/common/resourceNotFoundError.js';
import { type SqliteDatabaseClient } from '../../../../../core/database/sqliteDatabaseClient/sqliteDatabaseClient.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { Author } from '../../../../authorModule/domain/entities/author/author.js';
import { type AuthorTestUtils } from '../../../../authorModule/tests/utils/authorTestUtils/authorTestUtils.js';
import { type BookshelfTestUtils } from '../../../../bookshelfModule/tests/utils/bookshelfTestUtils/bookshelfTestUtils.js';
import { type UserTestUtils } from '../../../../userModule/tests/utils/userTestUtils/userTestUtils.js';
import { Book } from '../../../domain/entities/book/book.js';
import { Genre } from '../../../domain/entities/genre/genre.js';
import { type BookRepository } from '../../../domain/repositories/bookRepository/bookRepository.js';
import { symbols } from '../../../symbols.js';
import { BookTestFactory } from '../../../tests/factories/bookTestFactory/bookTestFactory.js';
import { type BookTestUtils } from '../../../tests/utils/bookTestUtils/bookTestUtils.js';
import { type GenreTestUtils } from '../../../tests/utils/genreTestUtils/genreTestUtils.js';

describe('BookRepositoryImpl', () => {
  let bookRepository: BookRepository;

  let sqliteDatabaseClient: SqliteDatabaseClient;

  let bookTestUtils: BookTestUtils;

  let authorTestUtils: AuthorTestUtils;

  let userTestUtils: UserTestUtils;

  let bookshelfTestUtils: BookshelfTestUtils;

  let genreTestUtils: GenreTestUtils;

  const bookTestFactory = new BookTestFactory();

  beforeEach(async () => {
    const container = TestContainer.create();

    bookRepository = container.get<BookRepository>(symbols.bookRepository);

    sqliteDatabaseClient = container.get<SqliteDatabaseClient>(coreSymbols.sqliteDatabaseClient);

    bookTestUtils = container.get<BookTestUtils>(testSymbols.bookTestUtils);

    authorTestUtils = container.get<AuthorTestUtils>(testSymbols.authorTestUtils);

    userTestUtils = container.get<UserTestUtils>(testSymbols.userTestUtils);

    bookshelfTestUtils = container.get<BookshelfTestUtils>(testSymbols.bookshelfTestUtils);

    genreTestUtils = container.get<GenreTestUtils>(testSymbols.genreTestUtils);

    await authorTestUtils.truncate();

    await bookTestUtils.truncate();

    await bookshelfTestUtils.truncate();

    await userTestUtils.truncate();

    await genreTestUtils.truncate();
  });

  afterEach(async () => {
    await authorTestUtils.truncate();

    await bookTestUtils.truncate();

    await bookshelfTestUtils.truncate();

    await userTestUtils.truncate();

    await genreTestUtils.truncate();

    await sqliteDatabaseClient.destroy();
  });

  describe('Save', () => {
    it('creates a book', async () => {
      const user = await userTestUtils.createAndPersist();

      const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

      const author = await authorTestUtils.createAndPersist();

      const createdBook = bookTestFactory.create({
        authors: [new Author(author)],
        bookshelfId: bookshelf.id,
      });

      const book = await bookRepository.saveBook({
        book: {
          title: createdBook.getTitle(),
          isbn: createdBook.getIsbn() as string,
          publisher: createdBook.getPublisher() as string,
          releaseYear: createdBook.getReleaseYear() as number,
          language: createdBook.getLanguage(),
          translator: createdBook.getTranslator() as string,
          format: createdBook.getFormat(),
          pages: createdBook.getPages() as number,
          imageUrl: createdBook.getImageUrl() as string,
          status: createdBook.getStatus(),
          bookshelfId: createdBook.getBookshelfId(),
          authors: [new Author(author)],
          genres: [],
        },
      });

      const foundBook = await bookTestUtils.findByTitleAndAuthor({
        title: createdBook.getTitle(),
        authorId: author.id,
      });

      expect(book.getTitle()).toEqual(createdBook.getTitle());

      expect(foundBook.title).toEqual(createdBook.getTitle());

      expect(foundBook.releaseYear).toEqual(createdBook.getReleaseYear());
    });

    it('removes book Authors', async () => {
      const user = await userTestUtils.createAndPersist();

      const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

      const author1 = await authorTestUtils.createAndPersist();

      const author2 = await authorTestUtils.createAndPersist();

      const author3 = await authorTestUtils.createAndPersist();

      const bookRawEntity = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author1.id, author2.id, author3.id],
          book: {
            bookshelfId: bookshelf.id,
          },
        },
      });

      const book = bookTestFactory.create({
        ...bookRawEntity,
        authors: [new Author(author1), new Author(author2), new Author(author3)],
      });

      book.deleteAuthor(new Author(author1));

      book.deleteAuthor(new Author(author2));

      const updatedBook = await bookRepository.saveBook({
        book,
      });

      const foundBook = await bookRepository.findBook({
        id: book.getId(),
      });

      expect(updatedBook.getAuthors()).toHaveLength(1);

      expect(foundBook?.getAuthors()).toHaveLength(1);

      expect(updatedBook.getAuthors()[0]?.getId()).toEqual(author3.id);

      expect(foundBook?.getAuthors()[0]?.getId()).toEqual(author3.id);

      const updatedBookAuthors = await bookTestUtils.findBookAuthors({
        bookId: book.getId(),
      });

      expect(updatedBookAuthors.length).toEqual(1);
    });

    it('adds book Authors', async () => {
      const user = await userTestUtils.createAndPersist();

      const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

      const author1 = await authorTestUtils.createAndPersist();

      const author2 = await authorTestUtils.createAndPersist();

      const author3 = await authorTestUtils.createAndPersist();

      const author4 = await authorTestUtils.createAndPersist();

      const author5 = await authorTestUtils.createAndPersist();

      const bookRawEntity = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author1.id, author2.id, author3.id],
          book: {
            bookshelfId: bookshelf.id,
          },
        },
      });

      const book = bookTestFactory.create({
        ...bookRawEntity,
        authors: [new Author(author1), new Author(author2), new Author(author3)],
      });

      book.addAuthor(new Author(author4));

      book.addAuthor(new Author(author5));

      const updatedBook = await bookRepository.saveBook({
        book,
      });

      const foundBook = await bookRepository.findBook({
        id: book.getId(),
      });

      [author1.id, author2.id, author3.id, author4.id, author5.id].every((authorId) => {
        expect(updatedBook.getAuthors().some((author) => author.getId() === authorId)).toBeTruthy();

        expect(foundBook?.getAuthors().some((author) => author.getId() === authorId)).toBeTruthy();
      });

      const updatedBookAuthors = await bookTestUtils.findBookAuthors({
        bookId: book.getId(),
      });

      expect(updatedBookAuthors).toHaveLength(5);
    });

    it('updates Book data', async () => {
      const user = await userTestUtils.createAndPersist();

      const bookshelf1 = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

      const bookshelf2 = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

      const author = await authorTestUtils.createAndPersist();

      const bookRawEntity = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author.id],
          book: {
            bookshelfId: bookshelf1.id,
          },
        },
      });

      const book = bookTestFactory.create(bookRawEntity);

      const newTitle = Generator.alphaString(20);

      const newIsbn = Generator.isbn();

      const newPublisher = Generator.word();

      const newReleaseYear = (bookRawEntity.releaseYear as number) + 1;

      const newLanguage = 'english';

      const newTranslator = Generator.fullName();

      const newFormat = BookFormat.ebook;

      const newPages = (bookRawEntity.pages as number) + 10;

      const newImageUrl = Generator.imageUrl();

      const newStatus = BookStatus.finishedReading;

      const newBookshelfId = bookshelf2.id;

      book.setTitle({ title: newTitle });

      book.setIsbn({ isbn: newIsbn });

      book.setPublisher({ publisher: newPublisher });

      book.setReleaseYear({ releaseYear: newReleaseYear });

      book.setLanguage({ language: newLanguage });

      book.setTranslator({ translator: newTranslator });

      book.setFormat({ format: newFormat });

      book.setPages({ pages: newPages });

      book.setImageUrl({ imageUrl: newImageUrl });

      book.setStatus({ status: newStatus });

      book.setBookshelf({ bookshelfId: newBookshelfId });

      const updatedBook = await bookRepository.saveBook({
        book,
      });

      const foundBook = await bookTestUtils.findById({
        id: book.getId(),
      });

      expect(updatedBook.getState()).toEqual({
        title: newTitle,
        isbn: newIsbn,
        publisher: newPublisher,
        releaseYear: newReleaseYear,
        language: newLanguage,
        translator: newTranslator,
        format: newFormat,
        pages: newPages,
        imageUrl: newImageUrl,
        status: newStatus,
        bookshelfId: newBookshelfId,
        authors: [],
        genres: [],
      });

      expect(foundBook).toEqual({
        id: book.getId(),
        title: newTitle,
        isbn: newIsbn,
        publisher: newPublisher,
        releaseYear: newReleaseYear,
        language: newLanguage,
        translator: newTranslator,
        format: newFormat,
        pages: newPages,
        imageUrl: newImageUrl,
        status: newStatus,
        bookshelfId: newBookshelfId,
      });
    });

    it('adds Book Genres', async () => {
      const user = await userTestUtils.createAndPersist();

      const bookshelf = await bookshelfTestUtils.createAndPersist({
        input: {
          userId: user.id,
        },
      });

      const author1 = await authorTestUtils.createAndPersist();

      const author2 = await authorTestUtils.createAndPersist();

      const genre1 = await genreTestUtils.createAndPersist();

      const genre2 = await genreTestUtils.createAndPersist();

      const genre3 = await genreTestUtils.createAndPersist();

      const genre4 = await genreTestUtils.createAndPersist();

      const bookRawEntity = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author1.id, author2.id],
          book: {
            bookshelfId: bookshelf.id,
          },
          genreIds: [genre1.id],
        },
      });

      const initialGenres = await bookTestUtils.findRawBookGenres({
        bookId: bookRawEntity.id,
      });

      expect(initialGenres).toHaveLength(1);

      const book = bookTestFactory.create(bookRawEntity);

      book.setGenres({
        genres: [new Genre(genre1), new Genre(genre2), new Genre(genre3), new Genre(genre4)],
      });

      const updatedBook = await bookRepository.saveBook({
        book,
      });

      const foundBook = await bookRepository.findBook({
        id: book.getId(),
      });

      expect(updatedBook.getGenres()).toHaveLength(4);

      expect(foundBook?.getGenres()).toHaveLength(4);

      const updatedBookGenres = await bookTestUtils.findRawBookGenres({
        bookId: book.getId(),
      });

      expect(updatedBookGenres).toHaveLength(4);

      updatedBookGenres.forEach((updatedBookGenre) => {
        expect(updatedBookGenre.genreId).oneOf([genre1.id, genre2.id, genre3.id, genre4.id]);

        expect(updatedBookGenre.bookId).toEqual(updatedBook.getId());
      });
    });

    it('removes Book Genres', async () => {
      const user = await userTestUtils.createAndPersist();

      const bookshelf = await bookshelfTestUtils.createAndPersist({
        input: {
          userId: user.id,
        },
      });

      const author1 = await authorTestUtils.createAndPersist();

      const author2 = await authorTestUtils.createAndPersist();

      const genre1 = await genreTestUtils.createAndPersist();

      const genre2 = await genreTestUtils.createAndPersist();

      const genre3 = await genreTestUtils.createAndPersist();

      const genre4 = await genreTestUtils.createAndPersist();

      const bookRawEntity = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author1.id, author2.id],
          book: {
            bookshelfId: bookshelf.id,
          },
          genreIds: [genre1.id, genre2.id, genre3.id, genre4.id],
        },
      });

      const book = bookTestFactory.create(bookRawEntity);

      const initialGenres = await bookTestUtils.findRawBookGenres({
        bookId: bookRawEntity.id,
      });

      expect(initialGenres).toHaveLength(4);

      book.setGenres({
        genres: [new Genre(genre1), new Genre(genre2)],
      });

      const updatedBook = await bookRepository.saveBook({
        book,
      });

      const foundBook = await bookRepository.findBook({
        id: book.getId(),
      });

      expect(updatedBook.getGenres()).toHaveLength(2);

      expect(foundBook?.getGenres()).toHaveLength(2);

      const updatedBookGenres = await bookTestUtils.findRawBookGenres({
        bookId: updatedBook.getId(),
      });

      expect(updatedBookGenres).toHaveLength(2);

      updatedBookGenres.forEach((updatedBookGenre) => {
        expect(updatedBookGenre.genreId).oneOf([genre1.id, genre2.id]);

        expect(updatedBookGenre.bookId).toEqual(updatedBook.getId());
      });
    });
  });

  describe('Find', () => {
    it('finds book by id', async () => {
      const user = await userTestUtils.createAndPersist();

      const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

      const author = await authorTestUtils.createAndPersist();

      const book = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author.id],
          book: {
            bookshelfId: bookshelf.id,
          },
        },
      });

      const foundBook = await bookRepository.findBook({ id: book.id });

      expect(foundBook).toBeInstanceOf(Book);

      expect(foundBook?.getAuthors()).toHaveLength(1);
    });

    it('finds a Book without Authors', async () => {
      const user = await userTestUtils.createAndPersist();

      const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

      const book = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [],
          book: {
            bookshelfId: bookshelf.id,
          },
        },
      });

      const foundBook = await bookRepository.findBook({ id: book.id });

      expect(foundBook).toBeInstanceOf(Book);

      expect(foundBook?.getAuthors()).toHaveLength(0);
    });

    it('returns null if book with given id does not exist', async () => {
      const id = Generator.uuid();

      const book = await bookRepository.findBook({ id });

      expect(book).toBeNull();
    });
  });

  describe('Delete', () => {
    it('deletes book', async () => {
      const user = await userTestUtils.createAndPersist();

      const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

      const author = await authorTestUtils.createAndPersist();

      const book = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author.id],
          book: {
            bookshelfId: bookshelf.id,
          },
        },
      });

      await bookRepository.deleteBook({ id: book.id });

      const foundBook = await bookTestUtils.findById({ id: book.id });

      expect(foundBook).toBeUndefined();
    });

    it('throws an error if book with given id does not exist', async () => {
      const id = Generator.uuid();

      await expect(async () => await bookRepository.deleteBook({ id })).toThrowErrorInstance({
        instance: ResourceNotFoundError,
        context: {
          name: 'Book',
          id,
        },
      });
    });
  });
});
