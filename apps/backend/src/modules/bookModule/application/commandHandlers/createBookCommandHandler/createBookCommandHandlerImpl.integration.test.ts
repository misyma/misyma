import { beforeEach, afterEach, expect, it, describe } from 'vitest';

import { type CreateBookCommandHandler } from './createBookCommandHandler.js';
import { ResourceAlreadyExistsError } from '../../../../../common/errors/common/resourceAlreadyExistsError.js';
import { Application } from '../../../../../core/application.js';
import { type SqliteDatabaseClient } from '../../../../../core/database/sqliteDatabaseClient/sqliteDatabaseClient.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { Author } from '../../../../authorModule/domain/entities/author/author.js';
import { AuthorTestUtils } from '../../../../authorModule/tests/utils/authorTestUtils/authorTestUtils.js';
import { symbols } from '../../../symbols.js';
import { BookTestFactory } from '../../../tests/factories/bookTestFactory/bookTestFactory.js';
import { BookTestUtils } from '../../../tests/utils/bookTestUtils/bookTestUtils.js';

describe('CreateBookCommandHandler', () => {
  let createBookCommandHandler: CreateBookCommandHandler;

  let sqliteDatabaseClient: SqliteDatabaseClient;

  let authorTestUtils: AuthorTestUtils;

  let bookTestUtils: BookTestUtils;

  const bookTestFactory = new BookTestFactory();

  beforeEach(async () => {
    const container = Application.createContainer();

    createBookCommandHandler = container.get<CreateBookCommandHandler>(symbols.createBookCommandHandler);

    sqliteDatabaseClient = container.get<SqliteDatabaseClient>(coreSymbols.sqliteDatabaseClient);

    authorTestUtils = new AuthorTestUtils(sqliteDatabaseClient);

    bookTestUtils = new BookTestUtils(sqliteDatabaseClient);

    await authorTestUtils.truncate();

    await bookTestUtils.truncate();
  });

  afterEach(async () => {
    await authorTestUtils.truncate();

    await bookTestUtils.truncate();

    await sqliteDatabaseClient.destroy();
  });

  it('creates a book', async () => {
    const author = await authorTestUtils.createAndPersist();

    const { title, releaseYear } = bookTestFactory.create({
      authors: [
        new Author({
          firstName: author.firstName,
          lastName: author.lastName,
          id: author.id,
        }),
      ],
    });

    const { book } = await createBookCommandHandler.execute({
      title,
      releaseYear,
      authorsIds: [author.id],
    });

    const foundBook = await bookTestUtils.findByTitleAndAuthor({
      title,
      authorId: author.id,
    });

    expect(book.title).toEqual(title);

    expect(foundBook.title).toEqual(title);
  });

  it('throws an error when book with the same title and authors already exists', async () => {
    const author = await authorTestUtils.createAndPersist();

    const existingBook = await bookTestUtils.createAndPersist({
      input: {
        authorId: author.id,
      },
    });

    try {
      await createBookCommandHandler.execute({
        title: existingBook.title,
        releaseYear: existingBook.releaseYear,
        authorsIds: [author.id],
      });
    } catch (error) {
      expect(error).toBeInstanceOf(ResourceAlreadyExistsError);

      return;
    }

    expect.fail();
  });
});
