import { beforeEach, afterEach, expect, describe, it } from 'vitest';

import { Generator } from '@common/tests';

import { RepositoryError } from '../../../../../common/errors/common/repositoryError.js';
import { ResourceNotFoundError } from '../../../../../common/errors/common/resourceNotFoundError.js';
import { Application } from '../../../../../core/application.js';
import { type SqliteDatabaseClient } from '../../../../../core/database/sqliteDatabaseClient/sqliteDatabaseClient.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { AuthorTestUtils } from '../../../../authorModule/tests/utils/authorTestUtils/authorTestUtils.js';
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

      const { releaseYear, title } = bookTestFactory.create({ authors: [author] });

      const book = await bookRepository.createBook({
        releaseYear,
        title,
        authorsIds: [author.id],
      });

      const foundBook = await bookTestUtils.findByTitleAndAuthor({
        title,
        authorId: author.id,
      });

      expect(book.title).toEqual(title);

      expect(foundBook.title).toEqual(title);
    });

    it('throws an error when book with the same title and author already exists', async () => {
      const author = await authorTestUtils.createAndPersist();

      const existingBook = await bookTestUtils.createAndPersist({ input: { authorId: author.id } });

      try {
        await bookRepository.createBook({
          releaseYear: existingBook.releaseYear,
          title: existingBook.title,
          authorsIds: [author.id],
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

      const book = await bookTestUtils.createAndPersist({ input: { authorId: author.id } });

      const foundBook = await bookRepository.findBook({ id: book.id });

      expect(foundBook).not.toBeNull();
    });

    it('returns null if book with given id does not exist', async () => {
      const { id } = bookTestFactory.create();

      const book = await bookRepository.findBook({ id });

      expect(book).toBeNull();
    });
  });

  describe('Delete', () => {
    it('deletes book', async () => {
      const author = await authorTestUtils.createAndPersist();

      const bookId = Generator.uuid();

      const book = await bookTestUtils.createAndPersist({
        input: {
          authorId: author.id,
          id: bookId,
        },
      });

      await bookRepository.deleteBook({ id: book.id });

      const foundBook = await bookTestUtils.findById({ id: bookId });

      expect(foundBook).toBeUndefined();
    });

    it('throws an error if book with given id does not exist', async () => {
      const { id } = bookTestFactory.create();

      try {
        await bookRepository.deleteBook({ id });
      } catch (error) {
        expect(error).toBeInstanceOf(ResourceNotFoundError);

        return;
      }

      expect.fail();
    });
  });
});
