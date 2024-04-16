import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { testSymbols } from '../../../../../../tests/container/symbols.js';
import { TestContainer } from '../../../../../../tests/container/testContainer.js';
import { Generator } from '../../../../../../tests/generator.js';
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

  const bookshelfTestFactory = new BookshelfTestFactory();

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
        address: bookshelf.address,
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
        address: bookshelf.address,
        imageUrl: bookshelf.imageUrl,
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

      expect(result.getState()).toEqual({
        name: bookshelfDraft.getName(),
        userId: bookshelfDraft.getUserId(),
        address: bookshelfDraft.getAddress(),
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

      const newImageUrl = Generator.imageUrl();

      const newAddress = Generator.streetAddress();

      bookshelf.setName({ name: newName });

      bookshelf.setImageUrl({ imageUrl: newImageUrl });

      bookshelf.setAddress({ address: newAddress });

      const result = await repository.saveBookshelf({
        bookshelf,
      });

      const foundBookshelf = await bookshelfTestUtils.findById({
        id: bookshelf.getId(),
      });

      expect(result.getName()).toEqual(newName);

      expect(result.getImageUrl()).toEqual(newImageUrl);

      expect(result.getAddress()).toEqual(newAddress);

      expect(foundBookshelf?.name).toEqual(newName);

      expect(foundBookshelf?.imageUrl).toEqual(newImageUrl);

      expect(foundBookshelf?.imageUrl).toEqual(newImageUrl);

      expect(foundBookshelf?.address).toEqual(newAddress);
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
});
