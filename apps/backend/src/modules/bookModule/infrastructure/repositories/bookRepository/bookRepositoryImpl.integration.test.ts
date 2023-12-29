import { beforeEach, afterEach, expect, describe, it } from 'vitest';

import { Generator } from '@common/tests';

import { RepositoryError } from '../../../../../common/errors/common/repositoryError.js';
import { ResourceNotFoundError } from '../../../../../common/errors/common/resourceNotFoundError.js';
import { Application } from '../../../../../core/application.js';
import { type SqliteDatabaseClient } from '../../../../../core/database/sqliteDatabaseClient/sqliteDatabaseClient.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { type Author } from '../../../../authorModule/domain/entities/author/author.js';
import { AuthorTestUtils } from '../../../../authorModule/tests/utils/authorTestUtils/authorTestUtils.js';
import { Book } from '../../../domain/entities/book/book.js';
import { type BookRepository } from '../../../domain/repositories/bookRepository/bookRepository.js';
import { symbols } from '../../../symbols.js';
import { BookTestFactory } from '../../../tests/factories/bookTestFactory/bookTestFactory.js';
import { BookTestUtils } from '../../../tests/utils/bookTestUtils/bookTestUtils.js';

describe('BookRepositoryImpl', () => {
  let bookRepository: BookRepository;

  let sqliteDatabaseClient: SqliteDatabaseClient;

  let bookTestUtils: BookTestUtils;

  let authorTestUtils: AuthorTestUtils;

  const bookTestFactory = new BookTestFactory();

  beforeEach(async () => {
    const container = Application.createContainer();

    bookRepository = container.get<BookRepository>(symbols.bookRepository);

    sqliteDatabaseClient = container.get<SqliteDatabaseClient>(coreSymbols.sqliteDatabaseClient);

    bookTestUtils = new BookTestUtils(sqliteDatabaseClient);

    authorTestUtils = new AuthorTestUtils(sqliteDatabaseClient);

    await authorTestUtils.truncate();

    await bookTestUtils.truncate();
  });

  afterEach(async () => {
    await authorTestUtils.truncate();

    await bookTestUtils.truncate();

    await sqliteDatabaseClient.destroy();
  });

  describe('Create', () => {
    it('creates a book', async () => {
      const author = await authorTestUtils.createAndPersist();

      const createdBook = bookTestFactory.create({ authors: [author] });

      const book = await bookRepository.createBook({
        releaseYear: createdBook.getReleaseYear(),
        title: createdBook.getTitle(),
        authors: [author],
      });

      const foundBook = await bookTestUtils.findByTitleAndAuthor({
        title: createdBook.getTitle(),
        authorId: author.id,
      });

      expect(book.getTitle()).toEqual(createdBook.getTitle());

      expect(foundBook.title).toEqual(createdBook.getTitle());

      expect(foundBook.releaseYear).toEqual(createdBook.getReleaseYear());
    });

    it('throws an error when book with the same title and author already exists', async () => {
      const author = await authorTestUtils.createAndPersist();

      const existingBook = await bookTestUtils.createAndPersist({ input: { authorIds: [author.id] } });

      try {
        await bookRepository.createBook({
          releaseYear: existingBook.releaseYear,
          title: existingBook.title,
          authors: [author],
        });
      } catch (error) {
        expect(error).toBeInstanceOf(RepositoryError);

        return;
      }

      expect.fail();
    });
  });

  describe('Find', () => {
    it('finds book by id', async () => {
      const author = await authorTestUtils.createAndPersist();

      const book = await bookTestUtils.createAndPersist({ input: { authorIds: [author.id] } });

      const foundBook = await bookRepository.findBook({ id: book.id });

      expect(foundBook).toBeInstanceOf(Book);

      expect(foundBook?.getAuthors()).toHaveLength(1);
    });

    it('returns null if book with given id does not exist', async () => {
      const id = bookTestFactory.create().getId();

      const book = await bookRepository.findBook({ id });

      expect(book).toBeNull();
    });
  });

  describe('Update', () => {
    it('removes book Authors', async () => {
      const author1 = await authorTestUtils.createAndPersist();

      const author2 = await authorTestUtils.createAndPersist();

      const author3 = await authorTestUtils.createAndPersist();

      const bookId = Generator.uuid();

      await bookTestUtils.createAndPersist({
        input: {
          id: bookId,
          authorIds: [author1.id, author2.id, author3.id],
        },
      });

      const createdBook = await bookRepository.findBook({
        id: bookId,
      });

      createdBook?.addDeleteAuthorDomainAction(author1);

      createdBook?.addDeleteAuthorDomainAction(author2);

      const updatedBook = await bookRepository.updateBook({
        book: createdBook as Book,
      });

      expect(updatedBook.getAuthors()).toHaveLength(1);

      const remainingAuthor = updatedBook.getAuthors()[0] as Author;

      expect(remainingAuthor.id).toEqual(author3.id);

      const updatedBookAuthors = await bookTestUtils.findRawBookAuthorsById({
        id: createdBook?.getId() as string,
      });

      expect(updatedBookAuthors.length).toEqual(1);
    });

    it('adds book Authors', async () => {
      const author1 = await authorTestUtils.createAndPersist();

      const author2 = await authorTestUtils.createAndPersist();

      const author3 = await authorTestUtils.createAndPersist();

      const author4 = await authorTestUtils.createAndPersist();

      const author5 = await authorTestUtils.createAndPersist();

      const book = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author1.id, author2.id, author3.id],
        },
      });

      const createdBook = await bookRepository.findBook({
        id: book.id,
      });

      createdBook?.addAddAuthorDomainAction(author4);

      createdBook?.addAddAuthorDomainAction(author5);

      const updatedBook = await bookRepository.updateBook({
        book: createdBook as Book,
      });

      expect(updatedBook.getAuthors()).toHaveLength(5);

      const remainingAuthor = updatedBook.getAuthors()[4] as Author;

      expect(remainingAuthor.id).toEqual(author5.id);

      const remainingAuthor2 = updatedBook.getAuthors()[3] as Author;

      expect(remainingAuthor2.id).toEqual(author4.id);

      const updatedBookAuthors = await bookTestUtils.findRawBookAuthorsById({
        id: createdBook?.getId() as string,
      });

      expect(updatedBookAuthors).toHaveLength(5);
    });

    it('changes Book title', async () => {
      const author = await authorTestUtils.createAndPersist();

      const book = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author.id],
        },
      });

      const newTitle = Generator.alphanumericString(20);

      const createdBook = await bookRepository.findBook({
        id: book.id,
      });

      createdBook?.addChangeTitleDomainAction({
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

    it('changes Book ReleaseYear', async () => {
      const author = await authorTestUtils.createAndPersist();

      const bookId = Generator.uuid();

      const book = await bookTestUtils.createAndPersist({
        input: {
          id: bookId,
          authorIds: [author.id],
        },
      });

      const newReleaseYear = Generator.number(1000, 3000);

      const createdBook = await bookRepository.findBook({
        id: book.id,
      });

      createdBook?.addChangeReleaseYearDomainAction({
        releaseYear: newReleaseYear,
      });

      const updatedBook = await bookRepository.updateBook({
        book: createdBook as Book,
      });

      expect(updatedBook.getReleaseYear()).toEqual(newReleaseYear);

      const persistedUpdatedBook = await bookTestUtils.findById({
        id: bookId,
      });

      expect(persistedUpdatedBook.releaseYear).toEqual(newReleaseYear);
    });

    it('updates all Book fields correctly', async () => {
      const author1 = await authorTestUtils.createAndPersist();

      const author2 = await authorTestUtils.createAndPersist();

      const author3 = await authorTestUtils.createAndPersist();

      const bookId = Generator.uuid();

      await bookTestUtils.createAndPersist({
        input: {
          id: bookId,
          authorIds: [author1.id, author2.id],
        },
      });

      const createdBook = await bookRepository.findBook({
        id: bookId,
      });

      const newTitle = Generator.alphanumericString(20);

      const newReleaseYear = Generator.number(1000, 3000);

      createdBook?.addChangeTitleDomainAction({
        title: newTitle,
      });

      createdBook?.addChangeReleaseYearDomainAction({
        releaseYear: newReleaseYear,
      });

      createdBook?.addAddAuthorDomainAction(author3);

      createdBook?.addDeleteAuthorDomainAction(author2);

      const updatedBook = await bookRepository.updateBook({
        book: createdBook as Book,
      });

      expect(updatedBook.getTitle()).toEqual(newTitle);

      expect(updatedBook.getReleaseYear()).toEqual(newReleaseYear);

      expect(updatedBook.getAuthors()).toHaveLength(2);

      const updatedBookAuthors = updatedBook.getAuthors();

      expect(updatedBookAuthors[0]?.id).toEqual(author1.id);

      expect(updatedBookAuthors[1]?.id).toEqual(author3.id);

      const persistedUpdatedBook = await bookTestUtils.findById({
        id: bookId,
      });

      expect(persistedUpdatedBook.title).toEqual(newTitle);

      expect(persistedUpdatedBook.releaseYear).toEqual(newReleaseYear);

      const persistedBookAuthors = await bookTestUtils.findRawBookAuthorsById({
        id: bookId,
      });

      expect(persistedBookAuthors).toHaveLength(2);

      expect(persistedBookAuthors[0]?.authorId).toEqual(author1.id);

      expect(persistedBookAuthors[1]?.authorId).toEqual(author3.id);
    });
  });

  describe('Delete', () => {
    it('deletes book', async () => {
      const author = await authorTestUtils.createAndPersist();

      const bookId = Generator.uuid();

      const book = await bookTestUtils.createAndPersist({
        input: {
          authorIds: [author.id],
          id: bookId,
        },
      });

      await bookRepository.deleteBook({ id: book.id });

      const foundBook = await bookTestUtils.findById({ id: bookId });

      expect(foundBook).toBeUndefined();
    });

    it('throws an error if book with given id does not exist', async () => {
      const id = bookTestFactory.create().getId();

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
