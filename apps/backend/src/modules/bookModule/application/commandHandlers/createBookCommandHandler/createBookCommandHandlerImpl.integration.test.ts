import { beforeEach, afterEach, expect, it, describe } from 'vitest';

import { type CreateBookCommandHandler } from './createBookCommandHandler.js';
import { ResourceAlreadyExistsError } from '../../../../../common/errors/common/resourceAlreadyExistsError.js';
import { Application } from '../../../../../core/application.js';
import { type SqliteDatabaseClient } from '../../../../../core/database/sqliteDatabaseClient/sqliteDatabaseClient.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { symbols } from '../../../symbols.js';
import { BookTestFactory } from '../../../tests/factories/bookTestFactory/bookTestFactory.js';
import { BookTestUtils } from '../../../tests/utils/bookTestUtils/bookTestUtils.js';

describe('CreateBookCommandHandler', () => {
  let createBookCommandHandler: CreateBookCommandHandler;

  let sqliteDatabaseClient: SqliteDatabaseClient;

  let bookTestUtils: BookTestUtils;

  const bookTestFactory = new BookTestFactory();

  beforeEach(async () => {
    const container = Application.createContainer();

    createBookCommandHandler = container.get<CreateBookCommandHandler>(symbols.createBookCommandHandler);

    sqliteDatabaseClient = container.get<SqliteDatabaseClient>(coreSymbols.sqliteDatabaseClient);

    bookTestUtils = new BookTestUtils(sqliteDatabaseClient);

    await bookTestUtils.truncate();
  });

  afterEach(async () => {
    await bookTestUtils.truncate();

    await sqliteDatabaseClient.destroy();
  });

  it('creates a book', async () => {
    const { title, releaseYear, authorId } = bookTestFactory.create();

    const { book } = await createBookCommandHandler.execute({
      title,
      releaseYear,
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
      await createBookCommandHandler.execute({
        title: existingBook.title,
        releaseYear: existingBook.releaseYear,
        authorId: existingBook.authorId,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(ResourceAlreadyExistsError);

      return;
    }

    expect.fail();
  });
});
