import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { Generator } from '../../../../../../tests/generator.js';
import { testSymbols } from '../../../../../../tests/symbols.js';
import { TestContainer } from '../../../../../../tests/testContainer.js';
import { type TestUtils } from '../../../../../../tests/testUtils.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { type DatabaseClient } from '../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { type BookshelfTestUtils } from '../../../../bookshelfModule/tests/utils/bookshelfTestUtils/bookshelfTestUtils.js';
import { type UserTestUtils } from '../../../../userModule/tests/utils/userTestUtils/userTestUtils.js';
import { BookReading } from '../../../domain/entities/bookReading/bookReading.js';
import { type BookReadingRepository } from '../../../domain/repositories/bookReadingRepository/bookReadingRepository.js';
import { symbols } from '../../../symbols.js';
import { BookReadingTestFactory } from '../../../tests/factories/bookReadingTestFactory/bookReadingTestFactory.js';
import { type BookReadingTestUtils } from '../../../tests/utils/bookReadingTestUtils/bookReadingTestUtils.js';
import { type BookTestUtils } from '../../../tests/utils/bookTestUtils/bookTestUtils.js';
import { type UserBookTestUtils } from '../../../tests/utils/userBookTestUtils/userBookTestUtils.js';

describe('BookReadingRepositoryImpl', () => {
  let repository: BookReadingRepository;

  let databaseClient: DatabaseClient;

  let bookReadingTestUtils: BookReadingTestUtils;

  let bookTestUtils: BookTestUtils;

  let bookshelfTestUtils: BookshelfTestUtils;

  let userTestUtils: UserTestUtils;

  let userBookTestUtils: UserBookTestUtils;

  const bookReadingTestFactory = new BookReadingTestFactory();

  let testUtils: TestUtils[];

  beforeEach(async () => {
    const container = TestContainer.create();

    repository = container.get<BookReadingRepository>(symbols.bookReadingRepository);

    databaseClient = container.get<DatabaseClient>(coreSymbols.databaseClient);

    bookReadingTestUtils = container.get<BookReadingTestUtils>(testSymbols.bookReadingTestUtils);

    userTestUtils = container.get<UserTestUtils>(testSymbols.userTestUtils);

    bookTestUtils = container.get<BookTestUtils>(testSymbols.bookTestUtils);

    bookshelfTestUtils = container.get<BookshelfTestUtils>(testSymbols.bookshelfTestUtils);

    userBookTestUtils = container.get<UserBookTestUtils>(testSymbols.userBookTestUtils);

    testUtils = [bookTestUtils, bookshelfTestUtils, userTestUtils, bookReadingTestUtils, userBookTestUtils];

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

  describe('findById', () => {
    it('returns null - when BookReading was not found', async () => {
      const nonExistentBookReadingId = Generator.uuid();

      const result = await repository.findBookReading({
        id: nonExistentBookReadingId,
      });

      expect(result).toBeNull();
    });

    it('returns a BookReading', async () => {
      const user = await userTestUtils.createAndPersist();

      const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

      const book = await bookTestUtils.createAndPersist();

      const userBook = await userBookTestUtils.createAndPersist({
        input: {
          bookshelfId: bookshelf.id,
          bookId: book.id,
        },
      });

      const bookReading = await bookReadingTestUtils.createAndPersist({
        input: {
          userBookId: userBook.id,
        },
      });

      const result = await repository.findBookReading({
        id: bookReading.id,
      });

      expect(result).toBeInstanceOf(BookReading);

      expect(result?.getState()).toEqual({
        userBookId: userBook.id,
        comment: bookReading.comment,
        rating: bookReading.rating,
        startedAt: bookReading.startedAt,
        endedAt: bookReading.endedAt,
      });
    });
  });

  describe('findBookReadings', () => {
    it('returns an empty array - when BookReadings were not found', async () => {
      const userBookId = Generator.uuid();

      const result = await repository.findBookReadings({
        userBookId,
        page: 1,
        pageSize: 10,
      });

      expect(result).toHaveLength(0);
    });

    it('returns an array of BookReadings', async () => {
      const user = await userTestUtils.createAndPersist();

      const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

      const book = await bookTestUtils.createAndPersist();

      const userBook = await userBookTestUtils.createAndPersist({
        input: {
          bookshelfId: bookshelf.id,
          bookId: book.id,
        },
      });

      const bookReading1 = await bookReadingTestUtils.createAndPersist({
        input: {
          userBookId: userBook.id,
        },
      });

      const bookReading2 = await bookReadingTestUtils.createAndPersist({
        input: {
          userBookId: userBook.id,
        },
      });

      const result = await repository.findBookReadings({
        userBookId: userBook.id,
        page: 1,
        pageSize: 10,
      });

      expect(result).toHaveLength(2);

      result.forEach((bookReading) => {
        expect(bookReading).toBeInstanceOf(BookReading);

        expect(bookReading.getId()).oneOf([bookReading1.id, bookReading2.id]);

        expect(bookReading.getUserBookId()).toEqual(userBook.id);
      });
    });

    it('returns an array of BookReadings - with pagination', async () => {
      const user = await userTestUtils.createAndPersist();

      const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

      const book = await bookTestUtils.createAndPersist();

      const userBook = await userBookTestUtils.createAndPersist({
        input: {
          bookshelfId: bookshelf.id,
          bookId: book.id,
        },
      });

      const bookReading1 = await bookReadingTestUtils.createAndPersist({
        input: {
          userBookId: userBook.id,
        },
      });

      await bookReadingTestUtils.createAndPersist({
        input: {
          userBookId: userBook.id,
        },
      });

      const result = await repository.findBookReadings({
        userBookId: userBook.id,
        page: 1,
        pageSize: 1,
      });

      expect(result).toHaveLength(1);

      expect(result[0]?.getId()).toEqual(bookReading1.id);
    });

    it('returns an array of BookReadings - with sorting by descending date', async () => {
      const user = await userTestUtils.createAndPersist();

      const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

      const book = await bookTestUtils.createAndPersist();

      const userBook = await userBookTestUtils.createAndPersist({
        input: {
          bookshelfId: bookshelf.id,
          bookId: book.id,
        },
      });

      const bookReading1 = await bookReadingTestUtils.createAndPersist({
        input: {
          userBookId: userBook.id,
          startedAt: Generator.pastDate(),
          endedAt: Generator.pastDate(),
        },
      });

      const bookReading2 = await bookReadingTestUtils.createAndPersist({
        input: {
          userBookId: userBook.id,
          startedAt: Generator.pastDate(),
          endedAt: new Date(),
        },
      });

      const result = await repository.findBookReadings({
        userBookId: userBook.id,
        page: 1,
        pageSize: 10,
        sortDate: 'desc',
      });

      expect(result).toHaveLength(2);

      expect(result[0]?.getId()).toEqual(bookReading2.id);

      expect(result[1]?.getId()).toEqual(bookReading1.id);
    });

    it('returns an array of BookReadings - with sorting by ascending date', async () => {
      const user = await userTestUtils.createAndPersist();

      const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

      const book = await bookTestUtils.createAndPersist();

      const userBook = await userBookTestUtils.createAndPersist({
        input: {
          bookshelfId: bookshelf.id,
          bookId: book.id,
        },
      });

      const bookReading1 = await bookReadingTestUtils.createAndPersist({
        input: {
          userBookId: userBook.id,
          startedAt: Generator.pastDate(),
          endedAt: Generator.pastDate(),
        },
      });

      const bookReading2 = await bookReadingTestUtils.createAndPersist({
        input: {
          userBookId: userBook.id,
          startedAt: Generator.pastDate(),
          endedAt: new Date(),
        },
      });

      const result = await repository.findBookReadings({
        userBookId: userBook.id,
        page: 1,
        pageSize: 10,
        sortDate: 'asc',
      });

      expect(result).toHaveLength(2);

      expect(result[0]?.getId()).toEqual(bookReading1.id);

      expect(result[1]?.getId()).toEqual(bookReading2.id);
    });
  });

  describe('save', () => {
    it('creates a new BookReading - given BookReadingDraft', async () => {
      const user = await userTestUtils.createAndPersist();

      const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

      const book = await bookTestUtils.createAndPersist();

      const userBook = await userBookTestUtils.createAndPersist({
        input: {
          bookshelfId: bookshelf.id,
          bookId: book.id,
        },
      });

      const bookReading = bookReadingTestFactory.create({
        userBookId: userBook.id,
      });

      const result = await repository.saveBookReading({
        bookReading: bookReading.getState(),
      });

      expect(result).toBeInstanceOf(BookReading);

      expect(result.getUserBookId()).toEqual(userBook.id);

      expect(result.getComment()).toEqual(bookReading.getComment());

      expect(result.getRating()).toEqual(bookReading.getRating());
    });

    it('updates a BookReading - given a BookReading', async () => {
      const user = await userTestUtils.createAndPersist();

      const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

      const book = await bookTestUtils.createAndPersist();

      const userBook = await userBookTestUtils.createAndPersist({
        input: {
          bookshelfId: bookshelf.id,
          bookId: book.id,
        },
      });

      const bookReadingRawEntity = await bookReadingTestUtils.createAndPersist({
        input: {
          userBookId: userBook.id,
        },
      });

      const bookReading = new BookReading(bookReadingRawEntity);

      const newComment = Generator.alphaString(20);

      const newRating = Generator.number(5);

      const newStartedAt = Generator.pastDate();

      const newEndedAt = Generator.futureDate();

      bookReading.setComment({
        comment: newComment,
      });

      bookReading.setRating({
        rating: newRating,
      });

      bookReading.setStartedAtDate({
        startedAt: newStartedAt,
      });

      bookReading.setEndedAtDate({
        endedAt: newEndedAt,
      });

      const result = await repository.saveBookReading({
        bookReading,
      });

      expect(result).toBeInstanceOf(BookReading);

      const updatedBookReading = await repository.findBookReading({
        id: bookReading.getId(),
      });

      expect(updatedBookReading?.getComment()).toEqual(newComment);

      expect(updatedBookReading?.getRating()).toEqual(newRating);

      expect(updatedBookReading?.getStartedAt()).toEqual(newStartedAt);

      expect(updatedBookReading?.getEndedAt()).toEqual(newEndedAt);
    });
  });

  describe('delete', () => {
    it('deletes a BookReading', async () => {
      const user = await userTestUtils.createAndPersist();

      const bookshelf = await bookshelfTestUtils.createAndPersist({ input: { userId: user.id } });

      const book = await bookTestUtils.createAndPersist();

      const userBook = await userBookTestUtils.createAndPersist({
        input: {
          bookshelfId: bookshelf.id,
          bookId: book.id,
        },
      });

      const bookReadingRawEntity = await bookReadingTestUtils.createAndPersist({
        input: {
          userBookId: userBook.id,
        },
      });

      const bookReading = new BookReading({
        id: bookReadingRawEntity.id,
        userBookId: userBook.id,
        comment: bookReadingRawEntity.comment,
        rating: bookReadingRawEntity.rating,
        startedAt: bookReadingRawEntity.startedAt,
        endedAt: bookReadingRawEntity.endedAt,
      });

      await repository.deleteBookReading({
        id: bookReading.getId(),
      });

      const result = await repository.findBookReading({
        id: bookReading.getId(),
      });

      expect(result).toBeNull();
    });
  });
});
