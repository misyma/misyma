import { beforeEach, afterEach, expect, it, describe } from 'vitest';

import { type CreateAuthorCommandHandler } from './createAuthorCommandHandler.js';
import { ResourceAlreadyExistsError } from '../../../../../common/errors/common/resourceAlreadyExistsError.js';
import { Application } from '../../../../../core/application.js';
import { type SqliteDatabaseClient } from '../../../../../core/database/sqliteDatabaseClient/sqliteDatabaseClient.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { symbols } from '../../../symbols.js';
import { AuthorTestFactory } from '../../../tests/factories/authorTestFactory/authorTestFactory.js';
import { AuthorTestUtils } from '../../../tests/utils/authorTestUtils/authorTestUtils.js';

describe('CreateAuthorCommandHandler', () => {
  let createAuthorCommandHandler: CreateAuthorCommandHandler;

  let sqliteDatabaseClient: SqliteDatabaseClient;

  let authorTestUtils: AuthorTestUtils;

  const authorTestFactory = new AuthorTestFactory();

  beforeEach(async () => {
    const container = Application.createContainer();

    createAuthorCommandHandler = container.get<CreateAuthorCommandHandler>(symbols.createAuthorCommandHandler);

    sqliteDatabaseClient = container.get<SqliteDatabaseClient>(coreSymbols.sqliteDatabaseClient);

    authorTestUtils = new AuthorTestUtils(sqliteDatabaseClient);

    await authorTestUtils.truncate();
  });

  afterEach(async () => {
    await authorTestUtils.truncate();

    await sqliteDatabaseClient.destroy();
  });

  it('creates a author', async () => {
    const { firstName, lastName } = authorTestFactory.createRaw();

    const { author } = await createAuthorCommandHandler.execute({
      firstName,
      lastName,
    });

    const foundAuthor = await authorTestUtils.findByName({
      firstName,
      lastName,
    });

    expect(author.getFirstName()).toEqual(firstName);

    expect(author.getLastName()).toEqual(lastName);

    expect(foundAuthor.firstName).toEqual(firstName);

    expect(foundAuthor.lastName).toEqual(lastName);
  });

  it('throws an error when author with the same firstName and author already exists', async () => {
    const existingAuthor = await authorTestUtils.createAndPersist();

    await expect(
      async () =>
        await createAuthorCommandHandler.execute({
          firstName: existingAuthor.firstName,
          lastName: existingAuthor.lastName,
        }),
    ).toThrowErrorInstance({
      instance: ResourceAlreadyExistsError,
      context: {
        name: 'Author',
        id: existingAuthor.id,
        firstName: existingAuthor.firstName,
        lastName: existingAuthor.lastName,
      },
    });
  });
});
