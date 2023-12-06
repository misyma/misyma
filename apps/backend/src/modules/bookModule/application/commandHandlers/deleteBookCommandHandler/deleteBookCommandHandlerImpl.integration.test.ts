import { beforeEach, afterEach, expect, describe, it } from 'vitest';

import { type DeleteBookCommandHandler } from './deleteBookCommandHandler.js';
import { ResourceNotFoundError } from '../../../../../common/errors/common/resourceNotFoundError.js';
import { Application } from '../../../../../core/application.js';
import { type SqliteDatabaseClient } from '../../../../../core/database/sqliteDatabaseClient/sqliteDatabaseClient.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { symbols } from '../../../symbols.js';
import { BookTestFactory } from '../../../tests/factories/bookTestFactory/bookTestFactory.js';
import { BookTestUtils } from '../../../tests/utils/bookTestUtils/bookTestUtils.js';

describe('DeleteBookCommandHandler', () => {
  let deleteBookCommandHandler: DeleteBookCommandHandler;

  let sqliteDatabaseClient: SqliteDatabaseClient;

  let bookTestUtils: BookTestUtils;

  const bookTestFactory = new BookTestFactory();

  beforeEach(async () => {
    const container = Application.createContainer();

    deleteBookCommandHandler = container.get<DeleteBookCommandHandler>(symbols.deleteBookCommandHandler);

    sqliteDatabaseClient = container.get<SqliteDatabaseClient>(coreSymbols.sqliteDatabaseClient);

    bookTestUtils = new BookTestUtils(sqliteDatabaseClient);

    await bookTestUtils.truncate();
  });

  afterEach(async () => {
    await bookTestUtils.truncate();

    await sqliteDatabaseClient.destroy();
  });

  it('deletes book', async () => {
    const book = await bookTestUtils.createAndPersist();

    await deleteBookCommandHandler.execute({ bookId: book.id });

    const foundBook = await bookTestUtils.findById({ id: book.id });

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
