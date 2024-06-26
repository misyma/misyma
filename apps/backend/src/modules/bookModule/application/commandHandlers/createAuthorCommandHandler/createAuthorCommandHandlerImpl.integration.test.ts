import { beforeEach, afterEach, expect, it, describe } from 'vitest';

import { type CreateAuthorCommandHandler } from './createAuthorCommandHandler.js';
import { testSymbols } from '../../../../../../tests/symbols.js';
import { TestContainer } from '../../../../../../tests/testContainer.js';
import { ResourceAlreadyExistsError } from '../../../../../common/errors/resourceAlreadyExistsError.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { type DatabaseClient } from '../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { symbols } from '../../../symbols.js';
import { AuthorTestFactory } from '../../../tests/factories/authorTestFactory/authorTestFactory.js';
import { type AuthorTestUtils } from '../../../tests/utils/authorTestUtils/authorTestUtils.js';

describe('CreateAuthorCommandHandler', () => {
  let createAuthorCommandHandler: CreateAuthorCommandHandler;

  let databaseClient: DatabaseClient;

  let authorTestUtils: AuthorTestUtils;

  const authorTestFactory = new AuthorTestFactory();

  beforeEach(async () => {
    const container = TestContainer.create();

    createAuthorCommandHandler = container.get<CreateAuthorCommandHandler>(symbols.createAuthorCommandHandler);

    databaseClient = container.get<DatabaseClient>(coreSymbols.databaseClient);

    authorTestUtils = container.get<AuthorTestUtils>(testSymbols.authorTestUtils);

    await authorTestUtils.truncate();
  });

  afterEach(async () => {
    await authorTestUtils.truncate();

    await databaseClient.destroy();
  });

  it('creates a author', async () => {
    const { name, isApproved } = authorTestFactory.createRaw();

    const { author } = await createAuthorCommandHandler.execute({
      name,
      isApproved,
    });

    const foundAuthor = await authorTestUtils.findByName({
      name,
    });

    expect(author.getName()).toEqual(name);

    expect(author.getIsApproved()).toEqual(isApproved);

    expect(foundAuthor?.name).toEqual(name);

    expect(foundAuthor?.isApproved).toEqual(isApproved);
  });

  it('throws an error when author with the same firstName and author already exists', async () => {
    const existingAuthor = await authorTestUtils.createAndPersist();

    try {
      await createAuthorCommandHandler.execute({
        name: existingAuthor.name,
        isApproved: existingAuthor.isApproved,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(ResourceAlreadyExistsError);

      expect((error as ResourceAlreadyExistsError).context).toEqual({
        resource: 'Author',
        id: existingAuthor.id,
        name: existingAuthor.name,
      });

      return;
    }

    expect.fail();
  });
});
