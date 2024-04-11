import { beforeEach, afterEach, expect, describe, it } from 'vitest';

import { Generator } from '@common/tests';

import { RepositoryError } from '../../../../../common/errors/repositoryError.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import { Application } from '../../../../../core/application.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { type DatabaseClient } from '../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { type AuthorRepository } from '../../../domain/repositories/authorRepository/authorRepository.js';
import { symbols } from '../../../symbols.js';
import { AuthorTestFactory } from '../../../tests/factories/authorTestFactory/authorTestFactory.js';
import { AuthorTestUtils } from '../../../tests/utils/authorTestUtils/authorTestUtils.js';

describe('AuthorRepositoryImpl', () => {
  let authorRepository: AuthorRepository;

  let databaseClient: DatabaseClient;

  let authorTestUtils: AuthorTestUtils;

  const authorTestFactory = new AuthorTestFactory();

  beforeEach(async () => {
    const container = Application.createContainer();

    authorRepository = container.get<AuthorRepository>(symbols.authorRepository);

    databaseClient = container.get<DatabaseClient>(coreSymbols.databaseClient);

    authorTestUtils = new AuthorTestUtils(databaseClient);

    await authorTestUtils.truncate();
  });

  afterEach(async () => {
    await authorTestUtils.truncate();

    await databaseClient.destroy();
  });

  describe('Create', () => {
    it('creates a author', async () => {
      const { name, isApproved } = authorTestFactory.createRaw();

      const author = await authorRepository.createAuthor({
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
        await authorRepository.createAuthor({
          name: existingAuthor.name,
          isApproved: existingAuthor.isApproved,
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
      const { id } = authorTestFactory.createRaw();

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
      const { id } = authorTestFactory.createRaw();

      try {
        await authorRepository.deleteAuthor({ id });
      } catch (error) {
        expect(error).toBeInstanceOf(ResourceNotFoundError);

        return;
      }

      expect.fail();
    });
  });

  describe('findAuthorsByIds', () => {
    it('returns an empty array - when no Authors were found', async () => {
      const nonExistentAuthorIds = Array.from({ length: Generator.number(1, 20) }).map(() => Generator.uuid());

      const authors = await authorRepository.findAuthorsByIds({ authorIds: nonExistentAuthorIds });

      expect(authors).toEqual([]);
    });

    it('returns an array of Authors - when all Authors were found', async () => {
      const author1 = await authorTestUtils.createAndPersist();

      const author2 = await authorTestUtils.createAndPersist();

      const author3 = await authorTestUtils.createAndPersist();

      const foundAuthors = await authorRepository.findAuthorsByIds({ authorIds: [author1.id, author2.id, author3.id] });

      expect(foundAuthors).toHaveLength(3);

      foundAuthors.forEach((foundAuthor) => {
        expect(foundAuthor.getId()).oneOf([author1.id, author2.id, author3.id]);

        expect(foundAuthor.getName()).oneOf([author1.name, author2.name, author3.name]);
      });
    });
  });
});
