import { beforeEach, afterEach, expect, it, describe } from 'vitest';

import { type FindBookQueryHandler } from './findBookQueryHandler.js';
import { ResourceNotFoundError } from '../../../../../common/errors/common/resourceNotFoundError.js';
import { Application } from '../../../../../core/application.js';
import { type SqliteDatabaseClient } from '../../../../../core/database/sqliteDatabaseClient/sqliteDatabaseClient.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { symbols } from '../../../symbols.js';
import { BookTestFactory } from '../../../tests/factories/bookTestFactory/bookTestFactory.js';
import { BookTestUtils } from '../../../tests/utils/bookTestUtils/bookTestUtils.js';

describe('FindBookQueryHandler', () => {
  let findBookQueryHandler: FindBookQueryHandler;

  let sqliteDatabaseClient: SqliteDatabaseClient;

  let bookTestUtils: BookTestUtils;

  const bookTestFactory = new BookTestFactory();

  beforeEach(async () => {
    const container = Application.createContainer();

    findBookQueryHandler = container.get<FindBookQueryHandler>(symbols.findBookQueryHandler);

    sqliteDatabaseClient = container.get<SqliteDatabaseClient>(coreSymbols.sqliteDatabaseClient);

    bookTestUtils = new BookTestUtils(sqliteDatabaseClient);

    await bookTestUtils.truncate();
  });

  afterEach(async () => {
    await bookTestUtils.truncate();

    await sqliteDatabaseClient.destroy();
  });

  it('finds book by id', async () => {
    const book = await bookTestUtils.createAndPersist();

    const { book: foundBook } = await findBookQueryHandler.execute({ bookId: book.id });

    expect(foundBook).not.toBeNull();
  });

  it('throws an error if book with given id does not exist', async () => {
    const { id } = bookTestFactory.create();

    try {
      await findBookQueryHandler.execute({ bookId: id });
    } catch (error) {
      expect(error).toBeInstanceOf(ResourceNotFoundError);

      return;
    }

    expect.fail();
  });
});
