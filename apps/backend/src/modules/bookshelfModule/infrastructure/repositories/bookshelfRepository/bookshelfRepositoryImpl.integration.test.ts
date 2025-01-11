import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { BookshelfType } from '@common/contracts';

import { Generator } from '../../../../../../tests/generator.js';
import { testSymbols } from '../../../../../../tests/symbols.js';
import { TestContainer } from '../../../../../../tests/testContainer.js';
import { type TestUtils } from '../../../../../../tests/testUtils.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { type DatabaseClient } from '../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { type UserTestUtils } from '../../../../userModule/tests/utils/userTestUtils/userTestUtils.js';
import { Bookshelf } from '../../../domain/entities/bookshelf/bookshelf.js';
import { type BookshelfRepository } from '../../../domain/repositories/bookshelfRepository/bookshelfRepository.js';
import { symbols } from '../../../symbols.js';
import { BookshelfTestFactory } from '../../../tests/factories/bookshelfTestFactory/bookshelfTestFactory.js';
import { type BookshelfTestUtils } from '../../../tests/utils/bookshelfTestUtils/bookshelfTestUtils.js';

describe('BookshelfRepositoryImpl', () => {
  let repository: BookshelfRepository;

  let bookshelfTestUtils: BookshelfTestUtils;

  let userTestUtils: UserTestUtils;

  let databaseClient: DatabaseClient;

  const bookshelfTestFactory = new BookshelfTestFactory();

  let testUtils: TestUtils[];

  beforeEach(async () => {
    const container = TestContainer.create();

    databaseClient = container.get<DatabaseClient>(coreSymbols.databaseClient);

    repository = container.get<BookshelfRepository>(symbols.bookshelfRepository);

    bookshelfTestUtils = container.get<BookshelfTestUtils>(testSymbols.bookshelfTestUtils);

    userTestUtils = container.get<UserTestUtils>(testSymbols.userTestUtils);

    testUtils = [userTestUtils, bookshelfTestUtils];

    for (const testUtil of testUtils) {
      await testUtil.truncate();
    }
  });

  afterEach(async () => {
    for (const testUtil of testUtils) {
      await testUtil.truncate();
    }

    await databaseClient.destroy();
  });

  describe('find', () => {
    it('returns null - when Bookshelf was not found', async () => {
      const nonExistentBookshelfId = Generator.uuid();

      const result = await repository.findBookshelf({
        where: {
          id: nonExistentBookshelfId,
        },
      });

      expect(result).toBeNull();
    });

    it('finds by id', async () => {
      const user = await userTestUtils.createAndPersist();

      const bookshelf = await bookshelfTestUtils.createAndPersist({
        input: {
          userId: user.id,
        },
      });

      const result = await repository.findBookshelf({
        where: {
          id: bookshelf.id,
        },
      });

      expect(result?.getState()).toEqual({
        name: bookshelf.name,
        userId: bookshelf.userId,
        type: bookshelf.type,
        createdAt: bookshelf.createdAt,
        imageUrl: bookshelf.imageUrl,
      });
    });

    it('finds by userId and name', async () => {
      const user = await userTestUtils.createAndPersist();

      const bookshelf = await bookshelfTestUtils.createAndPersist({
        input: {
          userId: user.id,
        },
      });

      const result = await repository.findBookshelf({
        where: {
          userId: user.id,
          name: bookshelf.name,
        },
      });

      expect(result?.getState()).toEqual({
        name: bookshelf.name,
        userId: bookshelf.userId,
        type: bookshelf.type,
        createdAt: bookshelf.createdAt,
        imageUrl: bookshelf.imageUrl,
      });
    });
  });

  describe('findMany', () => {
    it('returns empty array - when no Bookshelves were found', async () => {
      const user = await userTestUtils.createAndPersist();

      const result = await repository.findBookshelves({
        userId: user.id,
        page: 1,
        pageSize: 10,
      });

      expect(result).toEqual([]);
    });

    it(`finds all user's bookshelves`, async () => {
      const user = await userTestUtils.createAndPersist();

      const bookshelf1 = await bookshelfTestUtils.createAndPersist({
        input: {
          userId: user.id,
        },
      });

      const bookshelf2 = await bookshelfTestUtils.createAndPersist({
        input: {
          userId: user.id,
        },
      });

      const bookshelves = await repository.findBookshelves({
        userId: user.id,
        page: 1,
        pageSize: 10,
      });

      expect(bookshelves).toHaveLength(2);

      [bookshelf1, bookshelf2].forEach((bookshelf) => {
        const foundBookshelf = bookshelves.find((b) => b.getId() === bookshelf.id);

        expect(foundBookshelf?.getState()).toEqual({
          name: bookshelf.name,
          userId: bookshelf.userId,
          type: bookshelf.type,
          createdAt: bookshelf.createdAt,
          imageUrl: bookshelf.imageUrl,
        });
      });
    });

    it(`finds all user's bookshelves by name`, async () => {
      const user = await userTestUtils.createAndPersist();

      const bookshelf1 = await bookshelfTestUtils.createAndPersist({
        input: {
          userId: user.id,
          name: 'Harry Potter',
        },
      });

      await bookshelfTestUtils.createAndPersist({
        input: {
          userId: user.id,
          name: 'Lord of the Rings',
        },
      });

      const result = await repository.findBookshelves({
        userId: user.id,
        name: 'harry',
        page: 1,
        pageSize: 10,
      });

      expect(result).toHaveLength(1);

      expect(result[0]?.getState()).toEqual({
        name: bookshelf1.name,
        userId: bookshelf1.userId,
        type: bookshelf1.type,
        createdAt: bookshelf1.createdAt,
        imageUrl: bookshelf1.imageUrl,
      });
    });

    it(`finds all user's bookshelves by type`, async () => {
      const user = await userTestUtils.createAndPersist();

      const bookshelf1 = await bookshelfTestUtils.createAndPersist({
        input: {
          userId: user.id,
          type: BookshelfType.borrowing,
        },
      });

      await bookshelfTestUtils.createAndPersist({
        input: {
          userId: user.id,
          type: BookshelfType.standard,
        },
      });

      await bookshelfTestUtils.createAndPersist({
        input: {
          userId: user.id,
          type: BookshelfType.archive,
        },
      });

      const result = await repository.findBookshelves({
        userId: user.id,
        type: BookshelfType.borrowing,
        page: 1,
        pageSize: 10,
      });

      expect(result).toHaveLength(1);

      expect(result[0]?.getState()).toEqual({
        name: bookshelf1.name,
        userId: bookshelf1.userId,
        type: bookshelf1.type,
        createdAt: bookshelf1.createdAt,
        imageUrl: bookshelf1.imageUrl,
      });
    });

    it('paginates results', async () => {
      const user = await userTestUtils.createAndPersist();

      await bookshelfTestUtils.createAndPersist({
        input: {
          userId: user.id,
        },
      });

      await bookshelfTestUtils.createAndPersist({
        input: {
          userId: user.id,
        },
      });

      const result = await repository.findBookshelves({
        userId: user.id,
        page: 1,
        pageSize: 1,
      });

      expect(result).toHaveLength(1);
    });

    it('sorts by date', async () => {
      const user = await userTestUtils.createAndPersist();

      const bookshelf1 = await bookshelfTestUtils.createAndPersist({
        input: {
          userId: user.id,
          createdAt: new Date('2024-08-10'),
        },
      });

      const bookshelf2 = await bookshelfTestUtils.createAndPersist({
        input: {
          userId: user.id,
          createdAt: new Date('2024-09-02'),
        },
      });

      const result = await repository.findBookshelves({
        userId: user.id,
        page: 1,
        pageSize: 10,
        sortDate: 'desc',
      });

      expect(result).toHaveLength(2);

      expect(result[0]?.getId()).toBe(bookshelf2.id);

      expect(result[1]?.getId()).toBe(bookshelf1.id);
    });
  });

  describe('save', () => {
    it('creates a new Bookshelf - given BookshelfDraft', async () => {
      const user = await userTestUtils.createAndPersist();

      const bookshelfDraft = bookshelfTestFactory.create({
        userId: user.id,
      });

      const result = await repository.saveBookshelf({
        bookshelf: bookshelfDraft.getState(),
      });

      expect(result).toBeInstanceOf(Bookshelf);

      expect(result.getId()).toBeDefined();

      expect(result.getState()).toEqual({
        name: bookshelfDraft.getName(),
        userId: bookshelfDraft.getUserId(),
        type: bookshelfDraft.getType(),
        createdAt: bookshelfDraft.getCreatedAt(),
        imageUrl: bookshelfDraft.getImageUrl(),
      });
    });

    it('updates a Bookshelf - given a Bookshelf', async () => {
      const user = await userTestUtils.createAndPersist();

      const bookshelfRawEntity = await bookshelfTestUtils.createAndPersist({
        input: {
          userId: user.id,
        },
      });

      const bookshelf = bookshelfTestFactory.create(bookshelfRawEntity);

      const newName = Generator.alphaString(20);

      bookshelf.setName({ name: newName });

      const result = await repository.saveBookshelf({
        bookshelf,
      });

      const foundBookshelf = await bookshelfTestUtils.findById({
        id: bookshelf.getId(),
      });

      expect(result.getName()).toEqual(newName);

      expect(foundBookshelf?.name).toEqual(newName);
    });
  });

  describe('delete', () => {
    it('deletes a Bookshelf', async () => {
      const user = await userTestUtils.createAndPersist();

      const bookshelf = await bookshelfTestUtils.createAndPersist({
        input: {
          userId: user.id,
        },
      });

      await repository.deleteBookshelf({
        id: bookshelf.id,
      });

      const result = await bookshelfTestUtils.findById({
        id: bookshelf.id,
      });

      expect(result).toBeNull();
    });
  });

  describe('count', () => {
    it('returns 0 - when no Bookshelves were found', async () => {
      const user = await userTestUtils.createAndPersist();

      const result = await repository.countBookshelves({
        userId: user.id,
      });

      expect(result).toBe(0);
    });

    it('returns the number of Bookshelves', async () => {
      const user = await userTestUtils.createAndPersist();

      await bookshelfTestUtils.createAndPersist({
        input: {
          userId: user.id,
        },
      });

      await bookshelfTestUtils.createAndPersist({
        input: {
          userId: user.id,
        },
      });

      const result = await repository.countBookshelves({
        userId: user.id,
      });

      expect(result).toBe(2);
    });
  });
});
