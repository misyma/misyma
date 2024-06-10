import { beforeEach, afterEach, expect, describe, it } from 'vitest';

import { TestContainer } from '../../../../../../tests/container/testContainer.js';
import { Generator } from '../../../../../../tests/generator.js';
import { RepositoryError } from '../../../../../common/errors/repositoryError.js';
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
    const container = TestContainer.create();

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

      const author = await authorRepository.saveAuthor({
        author: {
          name,
          isApproved,
        },
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
        await authorRepository.saveAuthor({
          author: {
            name: existingAuthor.name,
            isApproved: existingAuthor.isApproved,
          },
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
  });

  describe('findAuthors', () => {
    it('returns an empty array - when no Authors were found', async () => {
      const nonExistentAuthorIds = Array.from({ length: Generator.number(1, 20) }).map(() => Generator.uuid());

      const authors = await authorRepository.findAuthors({
        ids: nonExistentAuthorIds,
        page: 1,
        pageSize: 10,
      });

      expect(authors).toEqual([]);
    });

    it('returns an array of Authors - when all Authors were found', async () => {
      const author1 = await authorTestUtils.createAndPersist();

      const author2 = await authorTestUtils.createAndPersist();

      const author3 = await authorTestUtils.createAndPersist();

      const foundAuthors = await authorRepository.findAuthors({
        ids: [author1.id, author2.id, author3.id],
        page: 1,
        pageSize: 10,
      });

      expect(foundAuthors).toHaveLength(3);

      foundAuthors.forEach((foundAuthor) => {
        expect(foundAuthor.getId()).oneOf([author1.id, author2.id, author3.id]);

        expect(foundAuthor.getName()).oneOf([author1.name, author2.name, author3.name]);
      });
    });

    it('returns no authors when given partial name does not match any author name', async () => {
      await authorTestUtils.createAndPersist({
        input: {
          name: 'Tolkien',
        },
      });

      await authorTestUtils.createAndPersist({
        input: {
          name: 'Tolstoy',
        },
      });

      await authorTestUtils.createAndPersist({
        input: {
          name: 'Rowling',
        },
      });

      const partialName = 'Mar';

      const foundAuthors = await authorRepository.findAuthors({
        name: partialName,
        page: 1,
        pageSize: 10,
      });

      expect(foundAuthors).toHaveLength(0);
    });

    it('returns authors when given partial name that matches author name', async () => {
      const author1 = await authorTestUtils.createAndPersist({
        input: {
          name: 'Tolkien',
        },
      });

      const author2 = await authorTestUtils.createAndPersist({
        input: {
          name: 'Tolstoy',
        },
      });

      await authorTestUtils.createAndPersist({
        input: {
          name: 'Rowling',
        },
      });

      const foundAuthors1 = await authorRepository.findAuthors({
        name: 'tol',
        page: 1,
        pageSize: 10,
      });

      const foundAuthors2 = await authorRepository.findAuthors({
        name: 'Tol',
        page: 1,
        pageSize: 10,
      });

      const foundAuthors3 = await authorRepository.findAuthors({
        name: 'TOL',
        page: 1,
        pageSize: 10,
      });

      expect(foundAuthors1).toHaveLength(2);

      expect(foundAuthors2).toHaveLength(2);

      expect(foundAuthors3).toHaveLength(2);

      [foundAuthors1, foundAuthors2, foundAuthors3].forEach((foundAuthors) => {
        foundAuthors.forEach((foundAuthor) => {
          expect(foundAuthor.getId()).oneOf([author1.id, author2.id]);

          expect(foundAuthor.getName()).oneOf([author1.name, author2.name]);
        });
      });
    });
  });
});
