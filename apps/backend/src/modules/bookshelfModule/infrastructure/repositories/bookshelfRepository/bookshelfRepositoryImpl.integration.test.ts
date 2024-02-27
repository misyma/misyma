import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { Generator } from '@common/tests';

import { testSymbols } from '../../../../../../tests/container/symbols.js';
import { TestContainer } from '../../../../../../tests/container/testContainer.js';
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

  const bookshelfTestFactory = BookshelfTestFactory.createFactory();

  beforeEach(() => {
    const container = TestContainer.create();

    repository = container.get<BookshelfRepository>(symbols.bookshelfRepository);

    bookshelfTestUtils = container.get<BookshelfTestUtils>(testSymbols.bookshelfTestUtils);

    userTestUtils = container.get<UserTestUtils>(testSymbols.userTestUtils);
  });

  afterEach(async () => {
    await bookshelfTestUtils.truncate();

    await userTestUtils.truncate();
  });

  describe('findById', () => {
    it('returns null - when Bookshelf was not found', async () => {
      const nonExistentBookshelfId = Generator.uuid();

      const result = await repository.findBookshelf({
        id: nonExistentBookshelfId,
      });

      expect(result).toBeNull();
    });

    it('returns a Bookshelf', async () => {
      const user = await userTestUtils.createAndPersist();

      const bookshelf = await bookshelfTestUtils.createAndPersist({
        input: {
          userId: user.id,
        },
      });

      const result = await repository.findBookshelf({
        id: bookshelf.id,
      });

      expect(result).toBeInstanceOf(Bookshelf);

      expect(result?.getState()).toEqual({
        name: bookshelf.name,
        userId: bookshelf.userId,
        addressId: bookshelf.addressId,
      });
    });
  });

  describe('findByIdAndUserId', () => {
    it('returns null - when Bookshelf does not exist', async () => {
      const nonExistentBookshelfId = Generator.uuid();

      const result = await repository.findBookshelf({
        id: nonExistentBookshelfId,
        userId: Generator.uuid(),
      });

      expect(result).toBeNull();
    });

    it('returns null - when Bookshelf exists but does not belong to User', async () => {
      const user = await userTestUtils.createAndPersist();

      const bookshelf = await bookshelfTestUtils.createAndPersist({
        input: {
          userId: user.id,
        },
      });

      const nonExistentUserId = Generator.uuid();

      const result = await repository.findBookshelf({
        id: bookshelf.id,
        userId: nonExistentUserId,
      });

      expect(result).toBeNull();
    });

    it('returns a Bookshelf', async () => {
      const user = await userTestUtils.createAndPersist();

      const bookshelf = await bookshelfTestUtils.createAndPersist({
        input: {
          userId: user.id,
        },
      });

      const result = await repository.findBookshelf({
        id: bookshelf.id,
        userId: user.id,
      });

      expect(result).toBeInstanceOf(Bookshelf);

      expect(result?.getState()).toEqual({
        name: bookshelf.name,
        userId: bookshelf.userId,
        addressId: bookshelf.addressId,
      });
    });
  });

  describe('findByUserId', () => {
    it('returns an empty array - when Bookshelves were not found', async () => {
      const nonExistentUserId = Generator.uuid();

      const result = await repository.findBookshelves({
        userId: nonExistentUserId,
      });

      expect(result).toHaveLength(0);
    });

    it('returns an array of Bookshelves', async () => {
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

      const result = await repository.findBookshelves({
        userId: user.id,
      });

      expect(result).toHaveLength(2);

      result.forEach((bookshelf) => {
        expect(bookshelf).toBeInstanceOf(Bookshelf);

        expect(bookshelf.getId()).oneOf([bookshelf1.id, bookshelf2.id]);

        expect(bookshelf.getUserId()).toEqual(user.id);

        expect(bookshelf.getName()).oneOf([bookshelf1.name, bookshelf2.name]);

        expect(bookshelf.getAddressId()).oneOf([bookshelf1.addressId, bookshelf2.addressId]);
      });
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

      expect(result.getUserId()).toEqual(user.id);

      expect(result.getName()).toEqual(bookshelfDraft.getName());

      expect(result.getAddressId()).toBeNull();
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

      bookshelf.setName({
        name: newName,
      });

      const result = await repository.saveBookshelf({
        bookshelf,
      });

      expect(result).toBeInstanceOf(Bookshelf);
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

      const result = await repository.findBookshelf({
        id: bookshelf.id,
      });

      expect(result).toBeNull();
    });
  });
});
