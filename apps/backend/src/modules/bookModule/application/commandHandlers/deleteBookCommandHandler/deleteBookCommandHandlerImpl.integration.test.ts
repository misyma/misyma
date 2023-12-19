import { beforeEach, afterEach, expect, describe, it } from 'vitest';

import { Generator } from '@common/tests';

import { type DeleteBookCommandHandler } from './deleteBookCommandHandler.js';
import { ResourceNotFoundError } from '../../../../../common/errors/common/resourceNotFoundError.js';
import { Application } from '../../../../../core/application.js';
import { type SqliteDatabaseClient } from '../../../../../core/database/sqliteDatabaseClient/sqliteDatabaseClient.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { AuthorTestUtils } from '../../../../authorModule/tests/utils/authorTestUtils/authorTestUtils.js';
import { symbols } from '../../../symbols.js';
import { BookTestFactory } from '../../../tests/factories/bookTestFactory/bookTestFactory.js';
import { BookTestUtils } from '../../../tests/utils/bookTestUtils/bookTestUtils.js';

describe('DeleteBookCommandHandler', () => {
  let deleteBookCommandHandler: DeleteBookCommandHandler;

  let sqliteDatabaseClient: SqliteDatabaseClient;

  let authorTestUtils: AuthorTestUtils;

  let bookTestUtils: BookTestUtils;

  const bookTestFactory = new BookTestFactory();

  beforeEach(async () => {
    const container = Application.createContainer();

    deleteBookCommandHandler = container.get<DeleteBookCommandHandler>(symbols.deleteBookCommandHandler);

    sqliteDatabaseClient = container.get<SqliteDatabaseClient>(coreSymbols.sqliteDatabaseClient);

    authorTestUtils = new AuthorTestUtils(sqliteDatabaseClient);

    bookTestUtils = new BookTestUtils(sqliteDatabaseClient);

    await authorTestUtils.truncate();

    await bookTestUtils.truncate();
  });

  afterEach(async () => {
    await bookTestUtils.truncate();

    await sqliteDatabaseClient.destroy();
  });

  it('deletes book', async () => {
    const author = await authorTestUtils.createAndPersist();

    const bookId = Generator.uuid();

    const book = await bookTestUtils.createAndPersist({
      input: {
        authorId: author.id,
        id: bookId,
      },
    });

    await deleteBookCommandHandler.execute({ bookId: book.id });

    const foundBook = await bookTestUtils.findById({ id: bookId });

    expect(foundBook).toBeUndefined();
  });

  it('throws an error if book with given id does not exist', async () => {
    const { id } = bookTestFactory.create();

    try {
      await deleteBookCommandHandler.execute({ bookId: id });
    } catch (error) {
      expect(error).toBeInstanceOf(ResourceNotFoundError);

      return;
    }

    expect.fail();
  });
});
