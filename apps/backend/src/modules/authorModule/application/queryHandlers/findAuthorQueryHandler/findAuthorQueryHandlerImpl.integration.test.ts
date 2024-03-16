import { beforeEach, afterEach, expect, it, describe } from 'vitest';

import { type FindAuthorQueryHandler } from './findAuthorQueryHandler.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import { Application } from '../../../../../core/application.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { type DatabaseClient } from '../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { symbols } from '../../../symbols.js';
import { AuthorTestFactory } from '../../../tests/factories/authorTestFactory/authorTestFactory.js';
import { AuthorTestUtils } from '../../../tests/utils/authorTestUtils/authorTestUtils.js';

describe('FindAuthorQueryHandler', () => {
  let findAuthorQueryHandler: FindAuthorQueryHandler;

  let databaseClient: DatabaseClient;

  let authorTestUtils: AuthorTestUtils;

  const authorTestFactory = new AuthorTestFactory();

  beforeEach(async () => {
    const container = Application.createContainer();

    findAuthorQueryHandler = container.get<FindAuthorQueryHandler>(symbols.findAuthorQueryHandler);

    databaseClient = container.get<DatabaseClient>(coreSymbols.databaseClient);

    authorTestUtils = new AuthorTestUtils(databaseClient);

    await authorTestUtils.truncate();
  });

  afterEach(async () => {
    await authorTestUtils.truncate();

    await databaseClient.destroy();
  });

  it('finds author by id', async () => {
    const author = await authorTestUtils.createAndPersist();

    const { author: foundAuthor } = await findAuthorQueryHandler.execute({ authorId: author.id });

    expect(foundAuthor).not.toBeNull();
  });

  it('throws an error if author with given id does not exist', async () => {
    const { id } = authorTestFactory.createRaw();

    try {
      await findAuthorQueryHandler.execute({ authorId: id });
    } catch (error) {
      expect(error).toBeInstanceOf(ResourceNotFoundError);

      return;
    }

    expect.fail();
  });
});
