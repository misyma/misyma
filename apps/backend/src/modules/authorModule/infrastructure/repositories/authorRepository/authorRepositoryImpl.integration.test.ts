import { beforeEach, afterEach, expect, describe, it } from 'vitest';

import { RepositoryError } from '../../../../../common/errors/common/repositoryError.js';
import { ResourceNotFoundError } from '../../../../../common/errors/common/resourceNotFoundError.js';
import { Application } from '../../../../../core/application.js';
import { type PostgresDatabaseClient } from '../../../../../core/database/postgresDatabaseClient/postgresDatabaseClient.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { type AuthorRepository } from '../../../domain/repositories/authorRepository/authorRepository.js';
import { symbols } from '../../../symbols.js';
import { AuthorTestFactory } from '../../../tests/factories/authorTestFactory/authorTestFactory.js';
import { AuthorTestUtils } from '../../../tests/utils/authorTestUtils/authorTestUtils.js';

describe('AuthorRepositoryImpl', () => {
  let authorRepository: AuthorRepository;

  let postgresDatabaseClient: PostgresDatabaseClient;

  let authorTestUtils: AuthorTestUtils;

  const authorTestFactory = new AuthorTestFactory();

  beforeEach(async () => {
    const container = Application.createContainer();

    authorRepository = container.get<AuthorRepository>(symbols.authorRepository);

    postgresDatabaseClient = container.get<PostgresDatabaseClient>(coreSymbols.postgresDatabaseClient);

    authorTestUtils = new AuthorTestUtils(postgresDatabaseClient);

    await authorTestUtils.truncate();
  });

  afterEach(async () => {
    await authorTestUtils.truncate();

    await postgresDatabaseClient.destroy();
  });

  describe('Create', () => {
    it('creates a author', async () => {
      const { firstName, lastName } = authorTestFactory.create();

      const author = await authorRepository.createAuthor({
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
        await authorRepository.createAuthor({
          lastName: existingAuthor.lastName,
          firstName: existingAuthor.firstName,
        });
      } catch (error) {
        expect(error).toBeInstanceOf(RepositoryError);

        return;
      }

      expect.fail();
    });
  });

  describe('Find', () => {
    it('finds author by id', async () => {
      const author = await authorTestUtils.createAndPersist();

      const foundAuthor = await authorRepository.findAuthor({ id: author.id });

      expect(foundAuthor).not.toBeNull();
    });

    it('returns null if author with given id does not exist', async () => {
      const { id } = authorTestFactory.create();

      const author = await authorRepository.findAuthor({ id });

      expect(author).toBeNull();
    });
  });

  describe('Delete', () => {
    it('deletes author', async () => {
      const author = await authorTestUtils.createAndPersist();

      await authorRepository.deleteAuthor({ id: author.id });

      const foundAuthor = await authorTestUtils.findById({ id: author.id });

      expect(foundAuthor).toBeUndefined();
    });

    it('throws an error if author with given id does not exist', async () => {
      const { id } = authorTestFactory.create();

      try {
        await authorRepository.deleteAuthor({ id });
      } catch (error) {
        expect(error).toBeInstanceOf(ResourceNotFoundError);

        return;
      }

      expect.fail();
    });
  });
});
