import { beforeEach, afterEach, expect, describe, it } from 'vitest';

import { type DeleteAuthorCommandHandler } from './deleteAuthorCommandHandler.js';
import { testSymbols } from '../../../../../../tests/symbols.js';
import { TestContainer } from '../../../../../../tests/testContainer.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { type DatabaseClient } from '../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { symbols } from '../../../symbols.js';
import { AuthorTestFactory } from '../../../tests/factories/authorTestFactory/authorTestFactory.js';
import { type AuthorTestUtils } from '../../../tests/utils/authorTestUtils/authorTestUtils.js';

describe('DeleteAuthorCommandHandler', () => {
  let deleteAuthorCommandHandler: DeleteAuthorCommandHandler;

  let databaseClient: DatabaseClient;

  let authorTestUtils: AuthorTestUtils;

  const authorTestFactory = new AuthorTestFactory();

  beforeEach(async () => {
    const container = await TestContainer.create();

    deleteAuthorCommandHandler = container.get<DeleteAuthorCommandHandler>(symbols.deleteAuthorCommandHandler);

    databaseClient = container.get<DatabaseClient>(coreSymbols.databaseClient);

    authorTestUtils = container.get<AuthorTestUtils>(testSymbols.authorTestUtils);

    await authorTestUtils.truncate();
  });

  afterEach(async () => {
    await authorTestUtils.truncate();

    await databaseClient.destroy();
  });

  it('deletes author', async () => {
    const author = await authorTestUtils.createAndPersist();

    await deleteAuthorCommandHandler.execute({ authorId: author.id });

    const foundAuthor = await authorTestUtils.findById({ id: author.id });

    expect(foundAuthor).toBeUndefined();
  });

  it('throws an error if author with given id does not exist', async () => {
    const { id } = authorTestFactory.createRaw();

    try {
      await deleteAuthorCommandHandler.execute({ authorId: id });
    } catch (error) {
      expect(error).toBeInstanceOf(ResourceNotFoundError);

      return;
    }

    expect.fail();
  });
});
