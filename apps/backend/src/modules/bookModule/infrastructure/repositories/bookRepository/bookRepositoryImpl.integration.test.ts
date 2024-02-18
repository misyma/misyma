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

  describe('Create', () => {
    it('creates a book', async () => {
      const user = await userTestUtils.createAndPersist();

      const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

      const author = await authorTestUtils.createAndPersist();

      const createdBook = bookTestFactory.create({
        authors: [new Author(author)],
        bookshelfId: bookshelf.id,
      });

      const book = await bookRepository.createBook({
        title: createdBook.getTitle(),
        isbn: createdBook.getIsbn() as string,
        publisher: createdBook.getPublisher() as string,
        releaseYear: createdBook.getReleaseYear() as number,
        language: createdBook.getLanguage(),
        translator: createdBook.getTranslator() as string,
        format: createdBook.getFormat(),
        pages: createdBook.getPages() as number,
        frontCoverImageUrl: createdBook.getFrontCoverImageUrl() as string,
        backCoverImageUrl: createdBook.getBackCoverImageUrl() as string,
        status: createdBook.getStatus(),
        bookshelfId: createdBook.getBookshelfId(),
        authors: [new Author(author)],
      });

      const foundBook = await bookTestUtils.findByTitleAndAuthor({
        title: createdBook.getTitle(),
        authorId: author.id,
      });

      expect(book.getTitle()).toEqual(createdBook.getTitle());

      expect(foundBook.title).toEqual(createdBook.getTitle());

      expect(foundBook.releaseYear).toEqual(createdBook.getReleaseYear());
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

  describe('Update', () => {
    it('removes book Authors', async () => {
      const user = await userTestUtils.createAndPersist();

      const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

      const author1 = await authorTestUtils.createAndPersist();

      const author2 = await authorTestUtils.createAndPersist();

      const author3 = await authorTestUtils.createAndPersist();

      const book = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author1.id, author2.id, author3.id],
          book: {
            bookshelfId: bookshelf.id,
          },
        },
      });

      const createdBook = await bookRepository.findBook({
        id: book.id,
      });

      createdBook?.addDeleteAuthorDomainAction(new Author(author1));

      createdBook?.addDeleteAuthorDomainAction(new Author(author2));

      const updatedBook = await bookRepository.updateBook({
        book: createdBook as Book,
      });

      expect(updatedBook.getAuthors()).toHaveLength(1);

      const remainingAuthor = updatedBook.getAuthors()[0] as Author;

      expect(remainingAuthor.getId()).toEqual(author3.id);

      const updatedBookAuthors = await bookTestUtils.findRawBookAuthorsById({
        id: createdBook?.getId() as string,
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

      const book = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author1.id, author2.id, author3.id],
          book: {
            bookshelfId: bookshelf.id,
          },
        },
      });

      const createdBook = await bookRepository.findBook({
        id: book.id,
      });

      createdBook?.addAddAuthorDomainAction(new Author(author4));

      createdBook?.addAddAuthorDomainAction(new Author(author5));

      const updatedBook = await bookRepository.updateBook({
        book: createdBook as Book,
      });

      expect(updatedBook.getAuthors()).toHaveLength(5);

      const remainingAuthor = updatedBook.getAuthors()[4] as Author;

      expect(remainingAuthor.getId()).toEqual(author5.id);

      const remainingAuthor2 = updatedBook.getAuthors()[3] as Author;

      expect(remainingAuthor2.getId()).toEqual(author4.id);

      const updatedBookAuthors = await bookTestUtils.findRawBookAuthorsById({
        id: createdBook?.getId() as string,
      });

      expect(updatedBookAuthors).toHaveLength(5);
    });

    it('updates Book title', async () => {
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

      const newTitle = Generator.alphaString(20);

      const createdBook = await bookRepository.findBook({
        id: book.id,
      });

      createdBook?.addUpdateTitleDomainAction({
        title: newTitle,
      });

      const updatedBook = await bookRepository.updateBook({
        book: createdBook as Book,
      });

      expect(updatedBook.getTitle()).toEqual(newTitle);

      const persistedUpdatedBook = await bookTestUtils.findById({
        id: createdBook?.getId() as string,
      });

      expect(persistedUpdatedBook.title).toEqual(newTitle);
    });

    it('updates Book ISBN', async () => {
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

      const newIsbn = Generator.isbn();

      const createdBook = await bookRepository.findBook({
        id: book.id,
      });

      createdBook?.addUpdateIsbnDomainAction({
        isbn: newIsbn,
      });

      const updatedBook = await bookRepository.updateBook({
        book: createdBook as Book,
      });

      expect(updatedBook.getIsbn()).toEqual(newIsbn);

      const persistedUpdatedBook = await bookTestUtils.findById({
        id: createdBook?.getId() as string,
      });

      expect(persistedUpdatedBook.isbn).toEqual(newIsbn);
    });

    it('updates Book Publisher', async () => {
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

      const newPublisher = Generator.word();

      const createdBook = await bookRepository.findBook({
        id: book.id,
      });

      createdBook?.addUpdatePublisherDomainAction({
        publisher: newPublisher,
      });

      const updatedBook = await bookRepository.updateBook({
        book: createdBook as Book,
      });

      expect(updatedBook.getPublisher()).toEqual(newPublisher);

      const persistedUpdatedBook = await bookTestUtils.findById({
        id: createdBook?.getId() as string,
      });

      expect(persistedUpdatedBook.publisher).toEqual(newPublisher);
    });

    it('updates Book ReleaseYear', async () => {
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

      const newReleaseYear = (book.releaseYear as number) + 1;

      const createdBook = await bookRepository.findBook({
        id: book.id,
      });

      createdBook?.addUpdateReleaseYearDomainAction({
        releaseYear: newReleaseYear,
      });

      const updatedBook = await bookRepository.updateBook({
        book: createdBook as Book,
      });

      expect(updatedBook.getReleaseYear()).toEqual(newReleaseYear);

      const persistedUpdatedBook = await bookTestUtils.findById({
        id: book.id,
      });

      expect(persistedUpdatedBook.releaseYear).toEqual(newReleaseYear);
    });

    it('updates Book Language', async () => {
      const user = await userTestUtils.createAndPersist();

      const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

      const author = await authorTestUtils.createAndPersist();

      const book = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author.id],
          book: {
            bookshelfId: bookshelf.id,
            language: 'polish',
          },
        },
      });

      const newLanguage = 'english';

      const createdBook = await bookRepository.findBook({
        id: book.id,
      });

      createdBook?.addUpdateLanguageDomainAction({
        language: newLanguage,
      });

      const updatedBook = await bookRepository.updateBook({
        book: createdBook as Book,
      });

      expect(updatedBook.getLanguage()).toEqual(newLanguage);

      const persistedUpdatedBook = await bookTestUtils.findById({
        id: createdBook?.getId() as string,
      });

      expect(persistedUpdatedBook.language).toEqual(newLanguage);
    });

    it('updates Book Translator', async () => {
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

      const newTranslator = Generator.fullName();

      const createdBook = await bookRepository.findBook({
        id: book.id,
      });

      createdBook?.addUpdateTranslatorDomainAction({
        translator: newTranslator,
      });

      const updatedBook = await bookRepository.updateBook({
        book: createdBook as Book,
      });

      expect(updatedBook.getTranslator()).toEqual(newTranslator);

      const persistedUpdatedBook = await bookTestUtils.findById({
        id: createdBook?.getId() as string,
      });

      expect(persistedUpdatedBook.translator).toEqual(newTranslator);
    });

    it('updates Book Format', async () => {
      const user = await userTestUtils.createAndPersist();

      const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

      const author = await authorTestUtils.createAndPersist();

      const book = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author.id],
          book: {
            bookshelfId: bookshelf.id,
            format: BookFormat.hardcover,
          },
        },
      });

      const newFormat = BookFormat.ebook;

      const createdBook = await bookRepository.findBook({
        id: book.id,
      });

      createdBook?.addUpdateFormatDomainAction({
        format: newFormat,
      });

      const updatedBook = await bookRepository.updateBook({
        book: createdBook as Book,
      });

      expect(updatedBook.getFormat()).toEqual(newFormat);

      const persistedUpdatedBook = await bookTestUtils.findById({
        id: createdBook?.getId() as string,
      });

      expect(persistedUpdatedBook.format).toEqual(newFormat);
    });

    it('updates Book Pages', async () => {
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

      const newPages = (book.pages as number) + 10;

      const createdBook = await bookRepository.findBook({
        id: book.id,
      });

      createdBook?.addUpdatePagesDomainAction({
        pages: newPages,
      });

      const updatedBook = await bookRepository.updateBook({
        book: createdBook as Book,
      });

      expect(updatedBook.getPages()).toEqual(newPages);

      const persistedUpdatedBook = await bookTestUtils.findById({
        id: createdBook?.getId() as string,
      });

      expect(persistedUpdatedBook.pages).toEqual(newPages);
    });

    it('updates Book FrontCoverImageUrl', async () => {
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

      const newFrontCoverImageUrl = Generator.imageUrl();

      const createdBook = await bookRepository.findBook({
        id: book.id,
      });

      createdBook?.addUpdateFrontCoverImageUrlDomainAction({
        frontCoverImageUrl: newFrontCoverImageUrl,
      });

      const updatedBook = await bookRepository.updateBook({
        book: createdBook as Book,
      });

      expect(updatedBook.getFrontCoverImageUrl()).toEqual(newFrontCoverImageUrl);

      const persistedUpdatedBook = await bookTestUtils.findById({
        id: createdBook?.getId() as string,
      });

      expect(persistedUpdatedBook.frontCoverImageUrl).toEqual(newFrontCoverImageUrl);
    });

    it('updates Book BackCoverImageUrl', async () => {
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

      const newBackCoverImageUrl = Generator.imageUrl();

      const createdBook = await bookRepository.findBook({
        id: book.id,
      });

      createdBook?.addUpdateBackCoverImageUrlDomainAction({
        backCoverImageUrl: newBackCoverImageUrl,
      });

      const updatedBook = await bookRepository.updateBook({
        book: createdBook as Book,
      });

      expect(updatedBook.getBackCoverImageUrl()).toEqual(newBackCoverImageUrl);

      const persistedUpdatedBook = await bookTestUtils.findById({
        id: createdBook?.getId() as string,
      });

      expect(persistedUpdatedBook.backCoverImageUrl).toEqual(newBackCoverImageUrl);
    });

    it('updates Book Status', async () => {
      const user = await userTestUtils.createAndPersist();

      const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

      const author = await authorTestUtils.createAndPersist();

      const book = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author.id],
          book: {
            bookshelfId: bookshelf.id,
            status: BookStatus.readingInProgress,
          },
        },
      });

      const newStatus = BookStatus.finishedReading;

      const createdBook = await bookRepository.findBook({
        id: book.id,
      });

      createdBook?.addUpdateStatusDomainAction({
        status: newStatus,
      });

      const updatedBook = await bookRepository.updateBook({
        book: createdBook as Book,
      });

      expect(updatedBook.getStatus()).toEqual(newStatus);

      const persistedUpdatedBook = await bookTestUtils.findById({
        id: book.id,
      });

      expect(persistedUpdatedBook.status).toEqual(newStatus);
    });

    it('updates Book Bookshelf', async () => {
      const user = await userTestUtils.createAndPersist();

      const bookshelf1 = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

      const bookshelf2 = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

      const author = await authorTestUtils.createAndPersist();

      const book = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author.id],
          book: {
            bookshelfId: bookshelf1.id,
          },
        },
      });

      const createdBook = await bookRepository.findBook({
        id: book.id,
      });

      createdBook?.addUpdateBookshelfDomainAction({
        bookshelfId: bookshelf2.id,
      });

      const updatedBook = await bookRepository.updateBook({
        book: createdBook as Book,
      });

      expect(updatedBook.getBookshelfId()).toEqual(bookshelf2.id);

      const persistedUpdatedBook = await bookTestUtils.findById({
        id: book.id,
      });

      expect(persistedUpdatedBook.bookshelfId).toEqual(bookshelf2.id);
    });

    it('updates Book Genres', async () => {
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

      const book = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author1.id, author2.id],
          book: {
            bookshelfId: bookshelf.id,
          },
          genreIds: [genre1.id],
        },
      });

      const initialGenres = await bookTestUtils.findRawBookGenres({
        bookId: book.id,
      });

      expect(initialGenres).toHaveLength(1);

      const createdBook = await bookRepository.findBook({
        id: book.id,
      });

      createdBook?.addUpdateBookGenresAction({
        genres: [new Genre(genre1), new Genre(genre2), new Genre(genre3), new Genre(genre4)],
      });

      const updatedBook = await bookRepository.updateBook({
        book: createdBook as Book,
      });

      expect(updatedBook.getGenres()).toHaveLength(4);

      const updatedBookGenres = await bookTestUtils.findRawBookGenres({
        bookId: updatedBook.getId(),
      });

      expect(updatedBookGenres).toHaveLength(4);

      updatedBookGenres.forEach((updatedBookGenre) => {
        expect(updatedBookGenre.genreId).oneOf([genre1.id, genre2.id, genre3.id, genre4.id]);

        expect(updatedBookGenre.bookId).toEqual(updatedBook.getId());
      });
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
