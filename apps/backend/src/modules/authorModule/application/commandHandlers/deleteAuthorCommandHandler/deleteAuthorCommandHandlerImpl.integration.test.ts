import { beforeEach, afterEach, expect, describe, it } from 'vitest';

import { type DeleteAuthorCommandHandler } from './deleteAuthorCommandHandler.js';
import { ResourceNotFoundError } from '../../../../../common/errors/common/resourceNotFoundError.js';
import { Application } from '../../../../../core/application.js';
import { type PostgresDatabaseClient } from '../../../../../core/database/postgresDatabaseClient/postgresDatabaseClient.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { symbols } from '../../../symbols.js';
import { AuthorTestFactory } from '../../../tests/factories/authorTestFactory/authorTestFactory.js';
import { AuthorTestUtils } from '../../../tests/utils/authorTestUtils/authorTestUtils.js';

describe('DeleteAuthorCommandHandler', () => {
  let deleteAuthorCommandHandler: DeleteAuthorCommandHandler;

  let postgresDatabaseClient: PostgresDatabaseClient;

  let authorTestUtils: AuthorTestUtils;

  const authorTestFactory = new AuthorTestFactory();

  beforeEach(async () => {
    const container = Application.createContainer();

    deleteAuthorCommandHandler = container.get<DeleteAuthorCommandHandler>(symbols.deleteAuthorCommandHandler);

    postgresDatabaseClient = container.get<PostgresDatabaseClient>(coreSymbols.postgresDatabaseClient);

    authorTestUtils = new AuthorTestUtils(postgresDatabaseClient);

    await authorTestUtils.truncate();
  });

  afterEach(async () => {
    await authorTestUtils.truncate();

    await postgresDatabaseClient.destroy();
  });

  it('deletes author', async () => {
    const author = await authorTestUtils.createAndPersist();

    await deleteAuthorCommandHandler.execute({ authorId: author.id });

    const foundAuthor = await authorTestUtils.findById({ id: author.id });

    expect(foundAuthor).toBeUndefined();
  });

  it('throws an error if author with given id does not exist', async () => {
    const { id } = authorTestFactory.create();

    try {
      await deleteAuthorCommandHandler.execute({ authorId: id });
    } catch (error) {
      expect(error).toBeInstanceOf(ResourceNotFoundError);

      return;
    }

    expect.fail();
  });
});
