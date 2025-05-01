import { beforeEach, afterEach, expect, it, describe } from 'vitest';

import { testSymbols } from '../../../../../../tests/symbols.js';
import { TestContainer } from '../../../../../../tests/testContainer.js';
import { ResourceAlreadyExistsError } from '../../../../../common/errors/resourceAlreadyExistsError.js';
import { databaseSymbols } from '../../../../databaseModule/symbols.js';
import { type DatabaseClient } from '../../../../databaseModule/types/databaseClient.js';
import { symbols } from '../../../symbols.js';
import { AuthorTestFactory } from '../../../tests/factories/authorTestFactory/authorTestFactory.js';
import { type AuthorTestUtils } from '../../../tests/utils/authorTestUtils/authorTestUtils.js';

import { type CreateAuthorCommandHandler } from './createAuthorCommandHandler.js';

describe('CreateAuthorCommandHandler', () => {
  let createAuthorCommandHandler: CreateAuthorCommandHandler;

  let databaseClient: DatabaseClient;

  let authorTestUtils: AuthorTestUtils;

  const authorTestFactory = new AuthorTestFactory();

  beforeEach(async () => {
    const container = await TestContainer.create();

    createAuthorCommandHandler = container.get<CreateAuthorCommandHandler>(symbols.createAuthorCommandHandler);

    databaseClient = container.get<DatabaseClient>(databaseSymbols.databaseClient);

    authorTestUtils = container.get<AuthorTestUtils>(testSymbols.authorTestUtils);

    await authorTestUtils.truncate();
  });

  afterEach(async () => {
    await authorTestUtils.truncate();

    await databaseClient.destroy();
  });

  it('creates a author', async () => {
    const { name, is_approved } = authorTestFactory.createRaw();

    const { author } = await createAuthorCommandHandler.execute({
      name,
      isApproved: is_approved,
    });

    const foundAuthor = await authorTestUtils.findByName({
      name,
    });

    expect(author.getName()).toEqual(name);

    expect(author.getIsApproved()).toEqual(is_approved);

    expect(foundAuthor?.name).toEqual(name);

    expect(foundAuthor?.is_approved).toEqual(is_approved);
  });

  it('throws an error when author with the same firstName and author already exists', async () => {
    const existingAuthor = await authorTestUtils.createAndPersist();

    try {
      await createAuthorCommandHandler.execute({
        name: existingAuthor.name,
        isApproved: existingAuthor.is_approved,
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
