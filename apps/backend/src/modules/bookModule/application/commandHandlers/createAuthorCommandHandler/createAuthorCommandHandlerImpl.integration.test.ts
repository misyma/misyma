import { beforeEach, afterEach, expect, it, describe } from 'vitest';

import { type CreateAuthorCommandHandler } from './createAuthorCommandHandler.js';
import { ResourceAlreadyExistsError } from '../../../../../common/errors/common/resourceAlreadyExistsError.js';
import { Application } from '../../../../../core/application.js';
import { type PostgresDatabaseClient } from '../../../../../core/database/postgresDatabaseClient/postgresDatabaseClient.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { symbols } from '../../../symbols.js';
import { AuthorTestFactory } from '../../../tests/factories/authorTestFactory/authorTestFactory.js';
import { AuthorTestUtils } from '../../../tests/utils/authorTestUtils/authorTestUtils.js';

describe('CreateAuthorCommandHandler', () => {
  let createAuthorCommandHandler: CreateAuthorCommandHandler;

  let postgresDatabaseClient: PostgresDatabaseClient;

  let authorTestUtils: AuthorTestUtils;

  const authorTestFactory = new AuthorTestFactory();

  beforeEach(async () => {
    const container = Application.createContainer();

    createAuthorCommandHandler = container.get<CreateAuthorCommandHandler>(symbols.createAuthorCommandHandler);

    postgresDatabaseClient = container.get<PostgresDatabaseClient>(coreSymbols.postgresDatabaseClient);

    authorTestUtils = new AuthorTestUtils(postgresDatabaseClient);

    await authorTestUtils.truncate();
  });

  afterEach(async () => {
    await authorTestUtils.truncate();

    await postgresDatabaseClient.destroy();
  });

  it('creates a author', async () => {
    const { firstName, lastName } = authorTestFactory.create();

    const { author } = await createAuthorCommandHandler.execute({
      firstName,
      lastName,
    });

    const foundAuthor = await authorTestUtils.findByName({
      firstName,
      lastName,
    });

    expect(author.firstName).toEqual(firstName);

    expect(author.lastName).toEqual(lastName);

    expect(foundAuthor.firstName).toEqual(firstName);

    expect(foundAuthor.lastName).toEqual(lastName);
  });

  it('throws an error when author with the same firstName and author already exists', async () => {
    const existingAuthor = await authorTestUtils.createAndPersist();

    try {
      await createAuthorCommandHandler.execute({
        firstName: existingAuthor.firstName,
        lastName: existingAuthor.lastName,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(ResourceAlreadyExistsError);

      return;
    }

    expect.fail();
  });
});
