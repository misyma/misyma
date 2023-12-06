import { beforeEach, afterEach, expect, it, describe } from 'vitest';

import { type FindAuthorQueryHandler } from './findAuthorQueryHandler.js';
import { ResourceNotFoundError } from '../../../../../common/errors/common/resourceNotFoundError.js';
import { Application } from '../../../../../core/application.js';
import { type SqliteDatabaseClient } from '../../../../../core/database/sqliteDatabaseClient/sqliteDatabaseClient.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { symbols } from '../../../symbols.js';
import { AuthorTestFactory } from '../../../tests/factories/authorTestFactory/authorTestFactory.js';
import { AuthorTestUtils } from '../../../tests/utils/authorTestUtils/authorTestUtils.js';

describe('FindAuthorQueryHandler', () => {
  let findAuthorQueryHandler: FindAuthorQueryHandler;

  let sqliteDatabaseClient: SqliteDatabaseClient;

  let authorTestUtils: AuthorTestUtils;

  const authorTestFactory = new AuthorTestFactory();

  beforeEach(async () => {
    const container = Application.createContainer();

    findAuthorQueryHandler = container.get<FindAuthorQueryHandler>(symbols.findAuthorQueryHandler);

    sqliteDatabaseClient = container.get<SqliteDatabaseClient>(coreSymbols.sqliteDatabaseClient);

    authorTestUtils = new AuthorTestUtils(sqliteDatabaseClient);

    await authorTestUtils.truncate();
  });

  afterEach(async () => {
    await authorTestUtils.truncate();

    await sqliteDatabaseClient.destroy();
  });

  it('finds author by id', async () => {
    const author = await authorTestUtils.createAndPersist();

    const { author: foundAuthor } = await findAuthorQueryHandler.execute({ authorId: author.id });

    expect(foundAuthor).not.toBeNull();
  });

  it('throws an error if author with given id does not exist', async () => {
    const { id } = authorTestFactory.create();

    try {
      await findAuthorQueryHandler.execute({ authorId: id });
    } catch (error) {
      expect(error).toBeInstanceOf(ResourceNotFoundError);

      return;
    }

    expect.fail();
  });
});
