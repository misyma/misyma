import { beforeEach, afterEach, expect, describe, it } from 'vitest';

import { RepositoryError } from '../../../../../common/errors/common/repositoryError.js';
import { ResourceNotFoundError } from '../../../../../common/errors/common/resourceNotFoundError.js';
import { Application } from '../../../../../core/application.js';
import { type PostgresDatabaseClient } from '../../../../../core/database/postgresDatabaseClient/postgresDatabaseClient.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { type BookRepository } from '../../../domain/repositories/bookRepository/bookRepository.js';
import { symbols } from '../../../symbols.js';
import { BookTestFactory } from '../../../tests/factories/bookTestFactory/bookTestFactory.js';
import { BookTestUtils } from '../../../tests/utils/bookTestUtils/bookTestUtils.js';

describe('BookRepositoryImpl', () => {
  let bookRepository: BookRepository;

  let postgresDatabaseClient: PostgresDatabaseClient;

  let bookTestUtils: BookTestUtils;

  const bookTestFactory = new BookTestFactory();

  beforeEach(async () => {
    const container = Application.createContainer();

    bookRepository = container.get<BookRepository>(symbols.bookRepository);

    postgresDatabaseClient = container.get<PostgresDatabaseClient>(coreSymbols.postgresDatabaseClient);

    bookTestUtils = new BookTestUtils(postgresDatabaseClient);

    await bookTestUtils.truncate();
  });

  afterEach(async () => {
    await bookTestUtils.truncate();

    await postgresDatabaseClient.destroy();
  });

  describe('Create', () => {
    it('creates a book', async () => {
      const { releaseYear, title, authorId } = bookTestFactory.create();

      const book = await bookRepository.createBook({
        releaseYear,
        title,
        authorId,
      });

      const foundBook = await bookTestUtils.findByTitleAndAuthor({
        title,
        authorId,
      });

      expect(book.title).toEqual(title);

      expect(book.authorId).toEqual(authorId);

      expect(foundBook.title).toEqual(title);

      expect(foundBook.authorId).toEqual(authorId);
    });

    it('throws an error when book with the same title and author already exists', async () => {
      const existingBook = await bookTestUtils.createAndPersist();

      try {
        await bookRepository.createBook({
          releaseYear: existingBook.releaseYear,
          title: existingBook.title,
          authorId: existingBook.authorId,
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
      const book = await bookTestUtils.createAndPersist();

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
      const book = await bookTestUtils.createAndPersist();

      await bookRepository.deleteBook({ id: book.id });

      const foundBook = await bookTestUtils.findById({ id: book.id });

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
